<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\EditProfileUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use App\Notifications\AccountStatusChanged;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     * Accessible only by Admin.
     */
public function index(Request $request)
{
    if ($request->user()->role !== 'admin') {
        abort(403, 'Unauthorized');
    }

    $query = User::withTrashed();

    $stats = [
        'total' => (clone $query)->count(),
        'active' => (clone $query)->where('status', 'active')->count(),
        'suspended' => (clone $query)->where('status', 'suspended')->count(),
        'deleted' => (clone $query)->whereNotNull('deleted_at')->count(),
    ];

    $users = $query->paginate(15);

    return response()->json([
        'data' => $users->items(),
        'stats' => $stats,
        'current_page' => $users->currentPage(),
        'last_page' => $users->lastPage(),
        'per_page' => $users->perPage(),
        'total' => $users->total(),
    ]);
}

    /**
     * Display the specified resource.
     * Includes Bookings, Reviews, and Profile details.
     */
   public function show(string $id)
{
    $user = User::findOrFail($id);

    if ($user->role === 'sweepstar') {
        $user->load([
            'sweepstarProfile',
            'sweepstarBookings.user',
            'sweepstarBookings.address',
            'sweepstarBookings.bookingServices.service',    // ✅ correct
            'reviewsReceived.reviewer'
        ]);
    } elseif ($user->role === 'client') {
        $user->load([
            'clientBookings.sweepstar',
            'clientBookings.bookingServices.service',       // ✅ correct
            'reviewsWritten.target'
        ]);
    }

    return response()->json($user);
}

    /**
     * Update User Profile (Self or Admin)
     */
   public function update(Request $request, string $id)
{
    $targetUser = User::findOrFail($id);
    $currentUser = $request->user();

    // 1. AUTHORIZATION
    if ($currentUser->id !== $targetUser->id && $currentUser->role !== 'admin') {
        return response()->json(['message' => 'Unauthorized access.'], 403);
    }

    // 2. SECURITY VERIFICATION
    $request->validate([
        'current_password' => 'required|string',
    ]);

    if (!Hash::check($request->current_password, $currentUser->password)) {
        return response()->json([
            'message' => 'Security Check Failed.',
            'errors' => ['current_password' => ['Incorrect password. Action denied.']]
        ], 422);
    }

    // 3. VALIDATION
    $request->validate([
        'name'     => 'required|string|max:255',
        'phone'    => 'nullable|string|max:20',
        'email'    => ['required', 'email', Rule::unique('users')->ignore($targetUser->id)],
        'password' => 'nullable|string|min:8',
        'role'     => 'nullable|in:client,sweepstar,admin',
    ]);

    // 4. CAPTURE ORIGINAL DATA (For "Old vs New" notification)
    $oldData = $targetUser->getRawOriginal();

    // 5. PREPARE DATA
    $data = [
        'name'  => $request->name,
        'phone' => $request->phone,
    ];

    // Only Admin can change email or role
    if ($currentUser->role === 'admin') {
        $data['email'] = $request->email;
        if ($request->filled('role')) {
            $data['role'] = $request->role;
        }
    }

    if ($request->filled('password')) {
        $data['password'] = Hash::make($request->password);
    }

    // 6. UPDATE AND DETECT CHANGES
    $targetUser->fill($data);

    if ($targetUser->isDirty()) {
        $changes = [];

        // Loop through everything that actually changed
        foreach ($targetUser->getDirty() as $field => $newValue) {
            // Don't include password in the notification for security
            if ($field === 'password') continue;

            $changes[$field] = [
                'old' => $oldData[$field] ?? 'N/A',
                'new' => $newValue
            ];
        }

        $targetUser->save();

        // 7. NOTIFY ADMINS
        // Only notify if changes were made to important fields (excluding password)
        if (!empty($changes)) {
            $admins = User::where('role', 'admin')->get();
            $message = "Profile update for user: " . $targetUser->name;

            Notification::send($admins, new EditProfileUpdate($message, $changes, $targetUser));
        }
    }

    return response()->json([
        'message' => 'User updated successfully.',
        'user' => $targetUser
    ]);
}
    public function updateAvatar(Request $request)
        {
            // 1. Validate the image
            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
            ]);

            $user = $request->user();

            // 2. Delete old avatar if it exists (Optional but Professional)
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // 3. Store the new file
            // This saves to storage/app/public/avatars and returns the path
            $path = $request->file('avatar')->store('avatars', 'public');

            // 4. Update Database
            $user->avatar = $path;
            $user->save();

            // 5. Return the full URL for the frontend
            return response()->json([
                'message' => 'Avatar updated successfully',
                'avatar_url' => asset('storage/' . $path)
            ]);
        }

    public function toggleStatus(Request $request)
    {
        $user = $request->user();

        // 1. Admins are always active
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admins cannot disable their account.'], 403);
        }

        // 2. Prevent suspended users from re-activating themselves
        if ($user->status === 'suspended') {
            return response()->json(['message' => 'Account is suspended.'], 403);
        }

        // 3. Toggle logic
        $user->status = ($user->status === 'active') ? 'disabled' : 'active';
        $user->save();

        return response()->json(['status' => $user->status]);
    }

    /**
     * User deletes their own account
     * Requires: Password + Reason
     * SECURITY: Admins cannot delete themselves here.
     */
    public function destroySelf(Request $request)
    {
        $user = $request->user();

        // 1. Admin Protection
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admins cannot delete their own account.'], 403);
        }

        // 2. Validate Input
        $request->validate([
            'password' => 'required|string',
            'reason'   => 'required|string|min:5',
        ]);

        // 3. Verify Password
        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Incorrect password.'],
            ]);
        }

        // 4. Save Reason & Soft Delete
        $user->delete_reason = $request->reason;
        $user->status = 'deleted';
        $user->save();
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully.']);
    }

    /**
     * Admin Changes User Status (Suspend/Activate)
     * SECURITY: Cannot suspend other Admins or themselves.
     */
public function adminUpdateStatus(Request $request, $id)
{
    $request->validate(['status' => 'required|in:active,suspended,disabled']);

    $targetUser = User::findOrFail($id);

    if ($targetUser->role === 'admin') {
        return response()->json(['message' => 'You cannot change the status of an Admin.'], 403);
    }

    $oldStatus = $targetUser->status;
    $targetUser->status = $request->status;
    $targetUser->save();

    // Notify the user only if status changed to suspended or from suspended to active
    if ($oldStatus !== $targetUser->status && in_array($targetUser->status, ['suspended', 'active'])) {
        $targetUser->notify(new AccountStatusChanged($targetUser->status, $request->reason ?? null));
    }

    return response()->json(['message' => "User status updated to {$targetUser->status}"]);
}

    /**
     * Admin deletes a user
     * Requires: Admin Password
     * SECURITY: Cannot delete themselves.
     */
    public function adminDestroyUser(Request $request, $id)
    {
        $admin = $request->user();

        // 1. Validate Admin Password
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $admin->password)) {
             throw ValidationException::withMessages([
                'password' => ['Incorrect admin password.'],
            ]);
        }

        $targetUser = User::findOrFail($id);

        // 2. SECURITY: Prevent deleting self
        if ($targetUser->id === $admin->id) {
            return response()->json(['message' => 'You cannot delete your own account here.'], 403);
        }

        // 3. Perform Delete
        $targetUser->status = 'deleted';
        $targetUser->save();
        $targetUser->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

}
