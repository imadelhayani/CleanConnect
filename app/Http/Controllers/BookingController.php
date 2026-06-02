<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Support\Facades\Log;
use App\Models\PointTransaction;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use App\Notifications\BookingStatusUpdated;
use Illuminate\Support\Facades\Notification;

class BookingController extends Controller
{
    /**
     * Fetch all bookings
     */
public function index(Request $request)
{
    $relationships = [
        'user',
        'address',
        'bookingServices.service',
        'bookingServices.selectedOptions.option',
        'bookingServices.selectedExtras.extra',
        'review',
        'sweepstar'
    ];

    $query = Booking::with($relationships)->orderBy('created_at', 'desc');

    if ($request->user()->role === 'client') {
        $query->where('user_id', $request->user()->id);
    }

    // Get stats BEFORE pagination
    $stats = [
        'total' => (clone $query)->count(),
        'pending' => (clone $query)->where('status', 'pending')->count(),
        'confirmed' => (clone $query)->where('status', 'confirmed')->count(),
        'completed' => (clone $query)->where('status', 'completed')->count(),
        'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
    ];

    $bookings = $query->paginate(15);

    // Merge stats into the response
    return response()->json([
        'data' => $bookings->items(),
        'stats' => $stats,
        'current_page' => $bookings->currentPage(),
        'last_page' => $bookings->lastPage(),
        'per_page' => $bookings->perPage(),
        'total' => $bookings->total(),
    ]);
}

public function show(Request $request, Booking $booking)
{
    if ($request->user()->role !== 'admin' &&
        $request->user()->role !== 'sweepstar' &&
        $request->user()->id !== $booking->user_id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    return response()->json($booking->load([
        'user',
        'address',
        'sweepstar',  
        'bookingServices.service',
        'bookingServices.selectedOptions.option',
        'bookingServices.selectedExtras.extra'
    ]));
}


    /**
     * Store a new Single-Service Booking
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'address_id'   => 'required|exists:addresses,id',
        'scheduled_at' => 'required|date|after:now',
        'service_id'   => 'required|exists:services,id',
        'options'      => 'required|array',
        'extras'       => 'nullable|array',
        'final_price'  => 'required|numeric',
        'notes'        => 'nullable|string',
    ]);

    return DB::transaction(function () use ($request, $validated) {
        $service = Service::with(['options', 'extras'])->findOrFail($validated['service_id']);

        $systemPrice = 0;
        $totalDuration = 0;

        // 1. Calculate Price from Options (1 per group)
        $availableOptions = $service->options->groupBy('option_group_name');
        $selectedOptionIds = $validated['options'];

        foreach ($availableOptions as $groupName => $optionsInGroup) {
            $intersect = array_intersect($optionsInGroup->pluck('id')->toArray(), $selectedOptionIds);

            if (count($intersect) !== 1) {
                throw ValidationException::withMessages([
                    "options" => "Please select exactly one choice for {$groupName}."
                ]);
            }

            $option = $optionsInGroup->whereIn('id', $intersect)->first();
            $systemPrice += $option->option_price;
            $totalDuration += $option->duration_minutes;
        }

        // 2. Add Extras
        if (!empty($validated['extras'])) {
            foreach ($validated['extras'] as $extraId) {
                $extra = $service->extras->find($extraId);
                if ($extra) {
                    $systemPrice += $extra->extra_price;
                    $totalDuration += $extra->duration_minutes;
                }
            }
        }

        // 3. SECURITY CHECK: final price must be within ±50% of server-calculated price
        $minAllowed = $systemPrice * 0.50;   // changed from 0.90 to 0.50 for wider range
        $maxAllowed = $systemPrice * 1.50;

        if ($validated['final_price'] < $minAllowed || $validated['final_price'] > $maxAllowed) {
            // Log the tampering attempt (too far outside allowed range)
            Log::warning('Price tampering attempt (outside allowed range)', [
                'user_id' => $request->user()->id,
                'service_id' => $service->id,
                'calculated_price' => $systemPrice,
                'submitted_price' => $validated['final_price'],
                'min_allowed' => $minAllowed,
                'max_allowed' => $maxAllowed,
            ]);
            return response()->json([
                'message' => "Invalid price. Limit is between $minAllowed and $maxAllowed DH."
            ], 422);
        }

        // 4. LOG ANOMALY if price deviates more than 20% (but still within allowed range)
        $deviation = abs($validated['final_price'] - $systemPrice) / $systemPrice;
        if ($deviation > 0.20) {
            Log::notice('Significant price deviation detected', [
                'user_id' => $request->user()->id,
                'booking_id' => null, // will be created after this check
                'calculated_price' => $systemPrice,
                'submitted_price' => $validated['final_price'],
                'deviation_percent' => round($deviation * 100, 2),
            ]);
        }

        // 5. Create Booking
        $booking = Booking::create([
            'user_id'          => $request->user()->id,
            'address_id'       => $validated['address_id'],
            'scheduled_at'     => $validated['scheduled_at'],
            'status'           => 'pending',
            'notes'            => $validated['notes'],
            'original_price'   => $systemPrice,
            'total_price'      => $validated['final_price'],
            'duration_minutes' => $totalDuration,
        ]);

        // 6. Create Snapshot
        $bookingService = $booking->bookingServices()->create([
            'service_id'             => $service->id,
            'total_price'            => $systemPrice,
            'total_duration_minutes' => $totalDuration,
        ]);

        // 7. Sync Options
        foreach ($selectedOptionIds as $optId) {
            $bookingService->selectedOptions()->create(['service_option_id' => $optId]);
        }

        // 8. Sync Extras
        if (!empty($validated['extras'])) {
            foreach ($validated['extras'] as $extraId) {
                $bookingService->selectedExtras()->create(['service_extra_id' => $extraId]);
            }
        }

        // 9. NOTIFY SWEEPSTARS
        $sweepstars = User::where('role', 'sweepstar')->get();
        Notification::send($sweepstars, new BookingStatusUpdated(
            "New job available in " . $booking->address->city,
            $booking, 'new_booking'
        ));

        return response()->json(
            $booking->load([
                'user',
                'address',
                'bookingServices.service',
                'bookingServices.selectedOptions.option',
                'bookingServices.selectedExtras.extra',
                'review',
                'sweepstar',
            ]),
            201
        );
    });
}

    /**
     * Update booking details (including status for admin/owner)
     */
   public function update(Request $request, Booking $booking)
{
    if ($request->user()->role !== 'admin' && $request->user()->id !== $booking->user_id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    if (in_array($booking->status, ['completed', 'cancelled'])) {
        return response()->json(['message' => 'Cannot edit a finalized booking.'], 400);
    }

    $validated = $request->validate([
        'scheduled_at' => 'sometimes|date|after:now',
        'address_id'   => 'sometimes|exists:addresses,id',
        'notes'        => 'nullable|string',
        'service_id'   => 'sometimes|exists:services,id',
        'options'      => 'required_with:service_id|array',
        'extras'       => 'nullable|array',
        'final_price'  => 'required_with:service_id|numeric',
        'status'       => 'sometimes|in:cancelled',
    ]);

    return DB::transaction(function () use ($request, $validated, $booking) {
        // Handle cancellation (status change to cancelled)
        if (isset($validated['status']) && $validated['status'] === 'cancelled') {
            if ($booking->status === 'cancelled') {
                return response()->json(['message' => 'Booking already cancelled.'], 400);
            }
            $this->refundPointsForBooking($booking);
            $booking->status = 'cancelled';
            $booking->cancellation_reason = $request->input('cancellation_reason', 'Cancelled by ' . $request->user()->role);
            $booking->save();
            return response()->json(['message' => 'Booking cancelled and points refunded.']);
        }

        // Normal field updates
        $booking->fill($request->only(['scheduled_at', 'address_id', 'notes']));

        if ($request->has('service_id')) {
            $service = Service::with(['options', 'extras'])->findOrFail($validated['service_id']);
            $systemPrice = 0;
            $totalDuration = 0;

            $availableOptions = $service->options->groupBy('option_group_name');
            $selectedOptionIds = $validated['options'];

            foreach ($availableOptions as $groupName => $optionsInGroup) {
                $intersect = array_intersect($optionsInGroup->pluck('id')->toArray(), $selectedOptionIds);
                if (count($intersect) !== 1) {
                    throw ValidationException::withMessages(["options" => "Invalid options selected for {$groupName}."]);
                }
                $option = $optionsInGroup->whereIn('id', $intersect)->first();
                $systemPrice += $option->option_price;
                $totalDuration += $option->duration_minutes;
            }

            if (!empty($validated['extras'])) {
                foreach ($validated['extras'] as $extraId) {
                    $extra = $service->extras->find($extraId);
                    if ($extra) {
                        $systemPrice += $extra->extra_price;
                        $totalDuration += $extra->duration_minutes;
                    }
                }
            }

            $minAllowed = $systemPrice * 0.50;
            $maxAllowed = $systemPrice * 1.50;

            if ($validated['final_price'] < $minAllowed || $validated['final_price'] > $maxAllowed) {
                Log::warning('Price tampering attempt (update, outside allowed range)', [
                    'user_id' => $request->user()->id,
                    'booking_id' => $booking->id,
                    'calculated_price' => $systemPrice,
                    'submitted_price' => $validated['final_price'],
                    'min_allowed' => $minAllowed,
                    'max_allowed' => $maxAllowed,
                ]);
                throw ValidationException::withMessages([
                    'final_price' => "New price must be between $minAllowed and $maxAllowed DH."
                ]);
            }

            // Log anomaly for significant deviation (≥20%)
            $deviation = abs($validated['final_price'] - $systemPrice) / $systemPrice;
            if ($deviation > 0.20) {
                Log::notice('Significant price deviation during update', [
                    'user_id' => $request->user()->id,
                    'booking_id' => $booking->id,
                    'calculated_price' => $systemPrice,
                    'submitted_price' => $validated['final_price'],
                    'deviation_percent' => round($deviation * 100, 2),
                ]);
            }

            $booking->original_price = $systemPrice;
            $booking->total_price = $validated['final_price'];
            $booking->duration_minutes = $totalDuration;

            // Remove old snapshot
            $booking->bookingServices()->delete();

            // Create new snapshot
            $bookingService = $booking->bookingServices()->create([
                'service_id'             => $service->id,
                'total_price'            => $systemPrice,
                'total_duration_minutes' => $totalDuration,
            ]);

            // Sync options
            foreach ($selectedOptionIds as $optId) {
                $bookingService->selectedOptions()->create(['service_option_id' => $optId]);
            }

            // Sync extras
            if (!empty($validated['extras'])) {
                foreach ($validated['extras'] as $extraId) {
                    $bookingService->selectedExtras()->create(['service_extra_id' => $extraId]);
                }
            }
        }

        $booking->save();

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking->load([
                'user',
                'address',
                'bookingServices.service',
                'bookingServices.selectedOptions.option',
                'bookingServices.selectedExtras.extra',
                'review',
                'sweepstar',
            ])
        ]);
    });
}



    public function destroy(Request $request, Booking $booking)
    {
        if ($request->user()->role !== 'admin' && $request->user()->id !== $booking->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $booking->delete();
        return response()->json(['message' => 'Booking deleted successfully']);
    }

     public function availableMissions(Request $request)
    {
        $relationships = [
            'user',
            'address',
            'bookingServices.service',
            'bookingServices.selectedOptions.option',
            'bookingServices.selectedExtras.extra',
            'review',
            'sweepstar',
        ];

        $jobs = Booking::whereNull('sweepstar_id')
            ->where('status', 'pending')
            ->with($relationships)
            ->orderBy('scheduled_at', 'asc')
            ->paginate(15);

        return response()->json($jobs);
    }


public function missionsHistory(Request $request)
{
    $relationships = [
        'user',
        'address',
        'bookingServices.service',
        'bookingServices.selectedOptions.option',
        'bookingServices.selectedExtras.extra',
        'review',
        'sweepstar',
    ];

    $query = Booking::where('sweepstar_id', $request->user()->id);

    // If 'archived' parameter is true, return only completed/cancelled
    if ($request->boolean('archived')) {
        $query->whereIn('status', ['completed', 'cancelled']);
    }

    // Global counts (for header)
    $completedCount = Booking::where('sweepstar_id', $request->user()->id)
        ->where('status', 'completed')->count();
    $archivedCount = Booking::where('sweepstar_id', $request->user()->id)
        ->whereIn('status', ['completed', 'cancelled'])->count();

    $jobs = $query->with($relationships)
        ->orderBy('scheduled_at', 'desc')
        ->paginate(15);

    $response = $jobs->toArray();
    $response['completed_count'] = $completedCount;
    $response['archived_count'] = $archivedCount;

    return response()->json($response);
}




      public function acceptMission(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            // Lock the row for update to prevent concurrent modifications
            $booking = Booking::lockForUpdate()->findOrFail($id);

            // Double-check: the booking must be pending and have no sweepstar assigned
            if ($booking->status !== 'pending' || $booking->sweepstar_id !== null) {
                return response()->json(['message' => 'This mission is no longer available.'], 409);
            }

            $sweepstar = $request->user();
            $profile = $sweepstar->sweepstarProfile;

            if (!$profile) {
                return response()->json(['message' => 'Sweepstar profile not found.'], 404);
            }

            $percentage = Setting::where('key', 'booking_acceptance_percentage')->value('value') ?? 10;
            $requiredPoints = $booking->total_price * ($percentage / 100);

            if ($profile->points_balance < $requiredPoints) {
                return response()->json([
                    'message' => "Insufficient points. You need {$requiredPoints} points (balance: {$profile->points_balance})."
                ], 403);
            }

            // Deduct points
            $profile->points_balance -= $requiredPoints;
            $profile->save();

            // Record transaction
            PointTransaction::create([
                'sweepstar_id' => $sweepstar->id,
                'type' => 'debit',
                'amount' => $requiredPoints,
                'description' => 'Points deducted for accepting booking #' . $booking->id,
                'reference_type' => Booking::class,
                'reference_id' => $booking->id,
            ]);

            // Assign sweepstar and update status
            $booking->update([
                'sweepstar_id' => $sweepstar->id,
                'status' => 'confirmed'
            ]);

            // Notify client
            $booking->user->notify(new BookingStatusUpdated(
                "Your booking has been accepted by " . $sweepstar->name,
                $booking, 'booking_accepted'
            ));

            return response()->json(['message' => 'Job accepted!']);
        });
    }

    public function completeMission(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->sweepstar_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $booking->update(['status' => 'completed']);

        $booking->user->notify(new BookingStatusUpdated(
            "Your cleaning is complete! Please review your Sweepstar.",
            $booking, 'booking_completed'
        ));

        return response()->json(['message' => 'Job marked as completed!']);
    }

    /**
     * Cancel a booking (client or admin) and refund points if applicable.
     */
    public function cancel(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($request->user()->id !== $booking->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate(['reason' => 'required|string|min:5']);

        return DB::transaction(function () use ($request, $booking, $validated) {
            // Refund points if the booking was already accepted (has a sweepstar and status confirmed)
            $this->refundPointsForBooking($booking);

            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => $validated['reason']
            ]);

            return response()->json(['message' => 'Booking cancelled.']);
        });
    }

    /**
     * Private helper: refund points to the sweepstar if points were previously deducted.
     */
    private function refundPointsForBooking(Booking $booking)
    {
        if (!$booking->sweepstar_id || $booking->status !== 'confirmed') {
            return;
        }

        // Find the debit transaction that was created when the sweepstar accepted this booking
        $debitTransaction = PointTransaction::where('reference_type', Booking::class)
            ->where('reference_id', $booking->id)
            ->where('type', 'debit')
            ->first();

        if (!$debitTransaction) {
            return; // No points were deducted, nothing to refund
        }

        $sweepstarProfile = $booking->sweepstar->sweepstarProfile;
        if (!$sweepstarProfile) {
            return;
        }

        // Refund the same amount
        $sweepstarProfile->points_balance += $debitTransaction->amount;
        $sweepstarProfile->save();

        // Create a credit transaction for the refund
        PointTransaction::create([
            'sweepstar_id' => $booking->sweepstar_id,
            'type' => 'credit',
            'amount' => $debitTransaction->amount,
            'description' => 'Points refunded for cancelled booking #' . $booking->id,
            'reference_type' => Booking::class,
            'reference_id' => $booking->id,
        ]);
    }
}
