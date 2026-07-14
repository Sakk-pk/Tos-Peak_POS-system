<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Invitation;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')
            ->where('is_team_member', true)
            ->orderBy('name')
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone ?? '',
                    'role' => $u->roles->first()?->name ?? 'Unassigned',
                    'status' => $u->status ?? 'Active',
                    'created_at' => $u->created_at->toDateTimeString(),
                ];
            });

        // Auto-update expired invitations before listing them
        Invitation::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);

        $invitations = Invitation::with('invitedBy')
            ->latest()
            ->get()
            ->map(function ($inv) {
                return [
                    'id' => $inv->id,
                    'email' => $inv->email,
                    'role' => $inv->role ?? 'Manager',
                    'status' => $inv->status,
                    'expires_at' => $inv->expires_at->toDateTimeString(),
                    'accepted_at' => $inv->accepted_at ? $inv->accepted_at->toDateTimeString() : null,
                    'invited_by' => $inv->invitedBy?->name ?? 'System',
                    'created_at' => $inv->created_at->toDateTimeString(),
                ];
            });

        $roles = Role::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Users/UserListPage', [
            'users' => $users,
            'invitations' => $invitations,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role'     => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'phone'          => $validated['phone'] ?? null,
            'password'       => Hash::make($validated['password']),
            'is_team_member' => true,
            'status'         => 'Active',
        ]);

        $user->assignRole($validated['role']);

        Log::info("New staff member {$user->email} created directly by admin ID " . Auth::id());

        return to_route('users.index')->with('success', 'Team member added successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        // Defense-in-depth: Only Admin users can assign the Admin role.
        // This prevents privilege escalation even if middleware is misconfigured.
        if ($validated['role'] === 'Admin' && !Auth::user()->hasRole('Admin')) {
            abort(403, 'Only an Admin can assign the Admin role.');
        }

        $oldRole = $user->roles->first()?->name ?? 'None';
        $user->syncRoles([$validated['role']]);

        Log::info("Staff role updated for {$user->email} from {$oldRole} to {$validated['role']} by admin ID " . Auth::id());

        return to_route('users.index')->with("success", "Staff role updated successfully");
    }


    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent self-deletion
        if (Auth::id() == $user->id) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $email = $user->email;
        $user->delete();

        Log::info("Staff member {$email} deleted by admin ID " . Auth::id());

        return to_route('users.index')->with("success", "Staff member deleted successfully");
    }

    public function deactivate($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent self-deactivation
        if (Auth::id() == $user->id) {
            return back()->withErrors(['error' => 'You cannot deactivate your own account.']);
        }

        $user->update(['status' => 'Inactive']);

        Log::info("Staff member {$user->email} deactivated by admin ID " . Auth::id());

        return to_route('users.index')->with('success', 'Staff member deactivated successfully.');
    }

    public function reactivate($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'Active']);

        Log::info("Staff member {$user->email} reactivated by admin ID " . Auth::id());

        return to_route('users.index')->with('success', 'Staff member reactivated successfully.');
    }
}

