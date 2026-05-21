<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use App\Models\Address;
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

        return response()->json(['bookings' => $query->get()]);
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
            $availableOptions = $service->options->groupBy('option_group_name'); // FIXED: use correct column
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

            // 2. Add Extras (NOW JUST ARRAY OF IDs)
            if (!empty($validated['extras'])) {
                foreach ($validated['extras'] as $extraId) {
                    $extra = $service->extras->find($extraId);
                    if ($extra) {
                        $systemPrice += $extra->extra_price;
                        $totalDuration += $extra->duration_minutes;
                    }
                }
            }

            // 3. SECURITY CHECK
            $minAllowed = $systemPrice * 0.90;
            $maxAllowed = $systemPrice * 1.50;

            if ($validated['final_price'] < $minAllowed || $validated['final_price'] > $maxAllowed) {
                return response()->json([
                    'message' => "Invalid price. Limit is between $minAllowed and $maxAllowed DH."
                ], 422);
            }

            // 4. Create Booking
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

            // 5. Create Snapshot
            $bookingService = $booking->bookingServices()->create([
                'service_id'             => $service->id,
                'total_price'            => $systemPrice,
                'total_duration_minutes' => $totalDuration,
            ]);

            // 6. Sync Options (IDs only)
            foreach ($selectedOptionIds as $optId) {
                $bookingService->selectedOptions()->create(['service_option_id' => $optId]);
            }

            // 7. Sync Extras (IDs only – NO QUANTITY)
            if (!empty($validated['extras'])) {
                foreach ($validated['extras'] as $extraId) {
                    $bookingService->selectedExtras()->create(['service_extra_id' => $extraId]);
                }
            }

            // 8. NOTIFY SWEEPSTARS
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
        ]);

        return DB::transaction(function () use ($request, $validated, $booking) {
            $booking->fill($request->only(['scheduled_at', 'address_id', 'notes']));

            if ($request->has('service_id')) {
                $service = Service::with(['options', 'extras'])->findOrFail($validated['service_id']);
                $systemPrice = 0;
                $totalDuration = 0;

                $availableOptions = $service->options->groupBy('option_group_name'); // FIXED
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

                // Extras – IDs only
                if (!empty($validated['extras'])) {
                    foreach ($validated['extras'] as $extraId) {
                        $extra = $service->extras->find($extraId);
                        if ($extra) {
                            $systemPrice += $extra->extra_price;
                            $totalDuration += $extra->duration_minutes;
                        }
                    }
                }

                $minAllowed = $systemPrice * 0.90;
                $maxAllowed = $systemPrice * 1.50;

                if ($validated['final_price'] < $minAllowed || $validated['final_price'] > $maxAllowed) {
                    throw ValidationException::withMessages([
                        'final_price' => "New price must be between $minAllowed and $maxAllowed DH."
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

                // Sync extras – NO QUANTITY
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

    public function show(Request $request, Booking $booking)
    {
        if ($request->user()->role !== 'admin' &&
            $request->user()->role !== 'sweepstar' &&
            $request->user()->id !== $booking->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($booking->load(['user', 'address', 'bookingServices.service', 'bookingServices.selectedOptions.option', 'bookingServices.selectedExtras.extra']));
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
        ->get();

    return response()->json(['jobs' => $jobs]);
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

    $jobs = Booking::where('sweepstar_id', $request->user()->id)
        ->with($relationships)
        ->orderBy('scheduled_at', 'desc')
        ->get();

    return response()->json(['jobs' => $jobs]);
}




public function acceptMission(Request $request, $id)
{
    return DB::transaction(function () use ($request, $id) {
        $booking = Booking::lockForUpdate()->findOrFail($id);

        if ($booking->sweepstar_id) {
            return response()->json(['message' => 'Job already taken.'], 409);
        }

        $sweepstar = $request->user();
        $profile = $sweepstar->sweepstarProfile;

        if (!$profile) {
            return response()->json(['message' => 'Sweepstar profile not found.'], 404);
        }

        // Get current percentage from settings
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

        // Record transaction (optional)
        if (class_exists('App\Models\PointTransaction')) {
            PointTransaction::create([
                'sweepstar_id' => $sweepstar->id,
                'type' => 'debit',
                'amount' => $requiredPoints,
                'description' => 'Points deducted for accepting booking #' . $booking->id,
                'reference_type' => Booking::class,
                'reference_id' => $booking->id,
            ]);
        }

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

    public function cancel(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($request->user()->id !== $booking->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate(['reason' => 'required|string|min:5']);

        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['reason']
        ]);

        return response()->json(['message' => 'Booking cancelled.']);
    }
}
