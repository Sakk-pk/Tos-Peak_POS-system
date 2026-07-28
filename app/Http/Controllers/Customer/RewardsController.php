<?php

namespace App\Http\Controllers\Customer;
use App\Http\Controllers\Controller;

use App\Models\Customer\RewardTransaction;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RewardsController extends Controller
{
    /**
     * Get points balance, redeemed vouchers list, and recent reward transaction logs.
     */
    public function getRewards()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $transactions = RewardTransaction::where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'points' => intval($user->points),
            'redeemed_vouchers' => $user->redeemed_vouchers ?: [],
            'transactions' => $transactions,
        ]);
    }

    /**
     * Redeem a voucher: deduct points, append voucher ID to users table, and log points transaction.
     */
    public function redeemVoucher(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'voucher_id' => 'required|string',
            'points_cost' => 'required|integer|min:1',
            'description' => 'required|string',
        ]);

        $voucherId = $validated['voucher_id'];
        $pointsCost = $validated['points_cost'];
        $description = $validated['description'];

        if ($user->points < $pointsCost) {
            return response()->json(['success' => false, 'message' => 'Insufficient points balance'], 400);
        }

        // Deduct points and append voucher
        $user->points = $user->points - $pointsCost;
        
        $vouchers = $user->redeemed_vouchers ?: [];
        if (!in_array($voucherId, $vouchers)) {
            $vouchers[] = $voucherId;
        }
        $user->redeemed_vouchers = $vouchers;
        $user->save();

        // Log transaction
        RewardTransaction::create([
            'user_id' => $user->id,
            'type' => 'redeem',
            'points' => -$pointsCost,
            'description' => $description,
            'reference_id' => $voucherId,
        ]);

        return $this->getRewards();
    }
}
