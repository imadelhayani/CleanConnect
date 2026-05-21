<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SweepstarProfileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentVerificationController;
use App\Http\Controllers\PointTransactionController;
use App\Http\Controllers\SettingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/



// 1. Public Routes
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login');
Route::post('/register', [RegisteredUserController::class, 'store'])->name('register');

// 2. Protected Routes (Must be logged in AND Active)
// Added 'active_user' middleware to enforce suspension/disabling logic
Route::middleware(['auth:sanctum', 'active_user'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/check-application', [SweepstarProfileController::class, 'checkApplicationStatus']);
    Route::post('/user/avatar', [UserController::class, 'updateAvatar']);
    // --- A. Core User Data ---
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Update Profile
    Route::put('/users/{id}', [UserController::class, 'update']);

    // Dashboard Stats (Client)
    Route::get('/user/dashboard-stats', [DashboardController::class, 'clientStats']);

    // Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    // 1. Toggle Status (Active <-> Disabled)
    Route::post('/user/toggle-status', [UserController::class, 'toggleStatus']);

    // 2. Delete Account (Self)
    Route::delete('/user/delete', [UserController::class, 'destroySelf']);

    // --- B. Reviews ---
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // --- C. General Resources ---

    // Services (READ ONLY for standard users)
    Route::get('/services', [ServiceController::class, 'index']);

    // Addresses (CRUD)
    Route::apiResource('addresses', AddressController::class);

    // Bookings (Standard CRUD)
    Route::apiResource('bookings', BookingController::class);

    // Specific Booking Action (Cancel)
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // --- D. User Actions ---
    Route::post('/sweepstar/apply', [SweepstarProfileController::class, 'apply']);


    // --- E. ADMIN Routes (Role: Admin) ---
    Route::middleware(['role:admin'])->group(function () {
        // 1. Dashboard & Users
        Route::get('/admin/dashboard-stats', [DashboardController::class, 'adminStats']);

        // User Management
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::get('/admin/users/{id}', [UserController::class, 'show']);

        // Admin Actions on Users
        Route::put('/admin/users/{id}/status', [UserController::class, 'adminUpdateStatus']);
        Route::delete('/admin/users/{id}', [UserController::class, 'adminDestroyUser']);

        // NEW: Restore Deleted User
        Route::post('/admin/users/{id}/restore', [UserController::class, 'restoreUser']);

        // 2. Service Management (Admin Create/Update/Delete)
        Route::put('/services/{id}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

        // 3. Sweepstar Applications Management
        Route::get('/admin/applications', [SweepstarProfileController::class, 'pendingApplications']);
        Route::post('/admin/applications/{id}/approve', [SweepstarProfileController::class, 'approve']);
        Route::delete('/admin/applications/{id}/reject', [SweepstarProfileController::class, 'reject']);

        Route::get('/admin/payment-verifications', [PaymentVerificationController::class, 'index']);
        Route::post('/admin/payment-verifications/{id}/approve', [PaymentVerificationController::class, 'approve']);
        Route::post('/admin/payment-verifications/{id}/reject', [PaymentVerificationController::class, 'reject']);

        // Settings (admin)
        Route::get('/admin/settings', [SettingController::class, 'index']);
        Route::put('/admin/settings', [SettingController::class, 'update']);
    });


    // --- F. SWEEPSTAR Routes (Role: Sweepstar) ---
    Route::middleware(['role:sweepstar'])->group(function () {
        // Dashboard Stats
        Route::get('/sweepstar/dashboard-stats', [DashboardController::class, 'sweepstarJobs']);

        // Availability Toggle
        Route::post('/sweepstar/availability', [SweepstarProfileController::class, 'toggleAvailability']);

        // Mission Operations
        Route::get('/sweepstar/available-missions', [BookingController::class, 'availableMissions']);
        Route::get('/sweepstar/missions-history', [BookingController::class, 'missionsHistory']);

        // Mission Actions
        Route::post('/bookings/{id}/accept', [BookingController::class, 'acceptMission']);
        Route::post('/bookings/{id}/complete', [BookingController::class, 'completeMission']);
        Route::post('/sweepstar/request-payment-code', [PaymentVerificationController::class, 'requestCode']);
        Route::post('/sweepstar/submit-payment', [PaymentVerificationController::class, 'submit']);
        Route::get('/sweepstar/point-transactions', [PointTransactionController::class, 'index']);
    });

});

require __DIR__.'/auth.php';
