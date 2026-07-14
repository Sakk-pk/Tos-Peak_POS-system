<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(): Response
    {
        $customers = User::where('is_team_member', false)
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                // Sum up orders matching this user's email address
                $lifetime = Order::where('customer_email', $user->email)->sum('total_amount');

                // Fallback phone lookup from orders if missing on user profile
                $phone = $user->phone;
                if (!$phone) {
                    $latestOrder = Order::where('customer_email', $user->email)
                        ->whereNotNull('customer_phone')
                        ->latest()
                        ->first();
                    $phone = $latestOrder ? $latestOrder->customer_phone : 'N/A';
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $phone,
                    'visits' => $user->visits,
                    'lifetime' => (float) $lifetime,
                ];
            });

        return Inertia::render('Admin/Customers/CustomersPage', [
            'customers' => $customers,
        ]);
    }
}
