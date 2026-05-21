<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $request->validate([
            'booking_acceptance_percentage' => 'sometimes|numeric|min:0|max:100',
            'admin_bank_account' => 'sometimes|string',
            'admin_bank_holder' => 'sometimes|string',
        ]);

        foreach ($request->all() as $key => $value) {
            if (in_array($key, ['booking_acceptance_percentage', 'admin_bank_account', 'admin_bank_holder'])) {
                Setting::updateOrCreate(['key' => $key], ['value' => $value]);
            }
        }

        return response()->json(['message' => 'Settings updated successfully.']);
    }
}
