<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{

public function index(Request $request)
{
    $addresses = $request->user()->addresses()->paginate(15);
    return response()->json($addresses);
}

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Matches your Model: 'street_address'
            'street_address' => 'required|string|max:255',
            'city'           => 'required|string|max:100',
            'postal_code'    => 'nullable|string|max:20',

            // Optional coordinates if you implement a map picker later
            'latitude'       => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
        ]);

        $address = $request->user()->addresses()->create($validated);

        return response()->json([
            'message' => 'Address saved successfully',
            'address' => $address
        ], 201);
    }
    /**
     * Update the specified address.
     */
    public function update(Request $request, Address $address)
    {
        // 1. Security: Ensure the user owns this address
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // 2. Validate the incoming data
        // We use 'sometimes' so the user can update just the city if they want,
        // or update everything at once.
        $validated = $request->validate([
            'street_address' => 'sometimes|required|string|max:255',
            'city'           => 'sometimes|required|string|max:100',
            'postal_code'    => 'nullable|string|max:20',
            'latitude'       => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
        ]);

        // 3. Update the address
        $address->update($validated);

        return response()->json([
            'message' => 'Address updated successfully',
            'address' => $address
        ]);
    }

    public function destroy(Request $request, Address $address)
    {
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $address->delete(); // This will perform a Soft Delete now

        return response()->json(['message' => 'Address deleted']);
    }
}
