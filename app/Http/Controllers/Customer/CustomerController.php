<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use App\Models\Order\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
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
                $userOrdersQuery = Order::where('customer_email', $user->email);
                $lifetime = (float) (clone $userOrdersQuery)->sum('total_amount');
                $ordersCount = (clone $userOrdersQuery)->count();
                $latestOrder = (clone $userOrdersQuery)->latest()->first();

                // Fallback phone lookup from orders if missing on user profile
                $phone = $user->phone;
                if (!$phone && $latestOrder && $latestOrder->customer_phone) {
                    $phone = $latestOrder->customer_phone;
                }

                return [
                    'id'                => $user->id,
                    'name'              => $user->name,
                    'email'             => $user->email,
                    'phone'             => $phone ?? '',
                    'visits'            => (int) ($user->visits ?? 0),
                    'points'            => (int) ($user->points ?? 0),
                    'status'            => $user->status ?? 'Active',
                    'lifetime'          => $lifetime,
                    'orders_count'      => $ordersCount,
                    'latest_order_date' => $latestOrder ? $latestOrder->created_at->toDateTimeString() : null,
                    'created_at'        => $user->created_at ? $user->created_at->toDateTimeString() : null,
                ];
            });

        return Inertia::render('Admin/Customers/CustomersPage', [
            'customers' => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8'],
            'status'   => ['nullable', 'string', Rule::in(['Active', 'Inactive'])],
        ]);

        $customer = User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'phone'             => $validated['phone'] ?? null,
            'password'          => Hash::make($validated['password']),
            'is_team_member'    => false,
            'status'            => $validated['status'] ?? 'Active',
            'email_verified_at' => now(),
        ]);

        Log::info("New customer account {$customer->email} created by admin ID " . Auth::id());

        return to_route('customers.index')->with('success', 'Customer account created successfully.');
    }

    public function update(Request $request, $id)
    {
        $customer = User::where('is_team_member', false)->findOrFail($id);

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($customer->id)],
            'phone'    => ['nullable', 'string', 'max:20'],
            'status'   => ['required', 'string', Rule::in(['Active', 'Inactive'])],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $updateData = [
            'name'   => $validated['name'],
            'email'  => $validated['email'],
            'phone'  => $validated['phone'] ?? null,
            'status' => $validated['status'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $customer->update($updateData);

        Log::info("Customer account {$customer->email} updated by admin ID " . Auth::id());

        return to_route('customers.index')->with('success', 'Customer updated successfully.');
    }

    public function destroy($id)
    {
        $customer = User::where('is_team_member', false)->findOrFail($id);
        $email = $customer->email;
        $customer->delete();

        Log::info("Customer account {$email} deleted by admin ID " . Auth::id());

        return to_route('customers.index')->with('success', 'Customer deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $customer = User::where('is_team_member', false)->findOrFail($id);
        $newStatus = ($customer->status === 'Inactive') ? 'Active' : 'Inactive';
        $customer->update(['status' => $newStatus]);

        Log::info("Customer {$customer->email} status changed to {$newStatus} by admin ID " . Auth::id());

        return to_route('customers.index')->with('success', "Customer status changed to {$newStatus}.");
    }
}
