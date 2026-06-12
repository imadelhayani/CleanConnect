<?php

namespace App\Http\Controllers;

use App\Models\PaymentVerification;
use App\Models\Setting;
use App\Models\PointTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Notifications\PaymentVerified;

class PaymentVerificationController extends Controller
{
    /**
     * 1. Generate unique code and return admin bank details.
     */
    public function requestCode(Request $request)
    {
        $user = $request->user();

        if (!$user->sweepstarProfile) {
            return response()->json(['message' => 'Sweepstar profile not found.'], 404);
        }

        // Generate unique code
        do {
            $code = 'SWP-' . strtoupper(uniqid());
        } while (PaymentVerification::where('code', $code)->exists());

        $payment = PaymentVerification::create([
            'sweepstar_id' => $user->id,
            'code' => $code,
            'status' => 'pending',
        ]);

        $adminAccount = Setting::where('key', 'admin_bank_account')->value('value');
        $adminHolder = Setting::where('key', 'admin_bank_holder')->value('value');

        return response()->json([
            'code' => $code,
            'admin_bank_account' => $adminAccount,
            'admin_bank_holder' => $adminHolder,
            'message' => 'Use this code as the payment motif.'
        ]);
    }

    /**
     * 2. Submit payment with screenshot and details.
     */
    public function submit(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'code' => 'required|string|exists:payment_verifications,code,sweepstar_id,' . $user->id,
            'amount' => 'required|numeric|min:0.01',
            'sender_account_number' => 'required|string|max:50',
            'sender_account_name' => 'required|string|max:255',
            'screenshot' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $payment = PaymentVerification::where('code', $validated['code'])
            ->where('sweepstar_id', $user->id)
            ->firstOrFail();

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'This code has already been used.'], 400);
        }

        $path = $request->file('screenshot')->store('payment-screenshots', 'public');

        $payment->update([
            'amount' => $validated['amount'],
            'sender_account_number' => $validated['sender_account_number'],
            'sender_account_name' => $validated['sender_account_name'],
            'screenshot_path' => $path,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Payment submitted successfully. Awaiting admin verification.',
            'payment' => $payment
        ]);
    }

    /**
     * Admin: List all payment verifications (filter by status).
     */
   public function index(Request $request)
{
    $status = $request->get('status', 'pending');
    $verifications = PaymentVerification::with('sweepstar')
        ->where('status', $status)
        ->orderBy('created_at', 'desc')
        ->paginate(15);

    return response()->json($verifications);
}

    /**
     * Admin: Approve a payment and credit points.
     */
    public function approve(Request $request, $id)
    {
        $request->validate(['admin_notes' => 'nullable|string']);

        $payment = PaymentVerification::with('sweepstar.sweepstarProfile')
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        DB::transaction(function () use ($request, $payment) {
            $sweepstar = $payment->sweepstar;
            $profile = $sweepstar->sweepstarProfile;
            if (!$profile) {
                $profile = $sweepstar->sweepstarProfile()->create([
                    'points_balance' => 0
                ]);
            }

            $points = $payment->amount;
            $profile->points_balance += $points;
            $profile->save();

            PointTransaction::create([
                'sweepstar_id' => $sweepstar->id,
                'type' => 'credit',
                'amount' => $points,
                'description' => 'Points from payment ' . $payment->code,
                'reference_type' => PaymentVerification::class,
                'reference_id' => $payment->id,
            ]);

            $payment->status = 'approved';
            $payment->admin_notes = $request->admin_notes;
            $payment->save();
        });
        $payment->sweepstar->notify(new PaymentVerified($payment, 'approved'));

        return response()->json(['message' => 'Payment approved. Points credited.']);
    }

    /**
     * Admin: Reject a payment. If the payment was already approved, reverse the points.
     */
    public function reject(Request $request, $id)
    {
        $request->validate(['admin_notes' => 'required|string']);

        $payment = PaymentVerification::where('id', $id)
            ->whereIn('status', ['pending', 'approved'])
            ->firstOrFail();

        DB::transaction(function () use ($request, $payment) {
            // If the payment was already approved, we need to reverse the points
            if ($payment->status === 'approved') {
                $this->reversePointsForPayment($payment);
            }

            $payment->update([
                'status' => 'rejected',
                'admin_notes' => $request->admin_notes,
            ]);
        });
        $payment->sweepstar->notify(new PaymentVerified($payment, 'rejected'));

        return response()->json(['message' => 'Payment rejected.']);
    }

    /**
     * Private helper: reverse points that were credited from an approved payment.
     */
    private function reversePointsForPayment(PaymentVerification $payment)
    {
        // Find the credit transaction that was created when this payment was approved
        $creditTransaction = PointTransaction::where('reference_type', PaymentVerification::class)
            ->where('reference_id', $payment->id)
            ->where('type', 'credit')
            ->first();

        if (!$creditTransaction) {
            return;
        }

        $sweepstarProfile = $payment->sweepstar->sweepstarProfile;
        if (!$sweepstarProfile) {
            return;
        }

        // Deduct the points (reverse the credit)
        $sweepstarProfile->points_balance -= $creditTransaction->amount;
        $sweepstarProfile->save();

        // Create a debit transaction to record the reversal
        PointTransaction::create([
            'sweepstar_id' => $payment->sweepstar_id,
            'type' => 'debit',
            'amount' => $creditTransaction->amount,
            'description' => 'Points reversed for rejected payment #' . $payment->id,
            'reference_type' => PaymentVerification::class,
            'reference_id' => $payment->id,
        ]);
    }
}
