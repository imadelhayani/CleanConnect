<?php

namespace App\Http\Controllers;

use App\Models\PointTransaction;
use Illuminate\Http\Request;

class PointTransactionController extends Controller
{
    /**
     * Display a listing of the authenticated sweepstar's point transactions.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Ensure user is a sweepstar (already handled by route middleware, but double-check)
        if ($user->role !== 'sweepstar') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $transactions = PointTransaction::where('sweepstar_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }
}
