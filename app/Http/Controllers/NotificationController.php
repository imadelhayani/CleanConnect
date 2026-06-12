<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Get paginated notifications
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $notifications = $request->user()->notifications()->paginate($perPage);

        return response()->json($notifications);
    }

    // Mark specific notification as read
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }
        return response()->json(['message' => 'Marked as read']);
    }

    // Mark all as read
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All marked as read']);
    }
}
