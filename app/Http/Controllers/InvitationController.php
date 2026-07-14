<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\User;
use App\Mail\TeamInvitation;
use App\Notifications\InvitationSentNotification;
use App\Notifications\InvitationAcceptedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    /**
     * Store a newly created invitation and send invitation email.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->where('is_team_member', true),
            ],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        // Delete any existing expired or pending invitations for this email to clean up
        Invitation::where('email', $validated['email'])
            ->whereNull('accepted_at')
            ->delete();

        // Generate a secure random plain token
        $plainToken = Str::random(40);

        // Create invitation with SHA-256 hashed token
        $invitation = Invitation::create([
            'email' => $validated['email'],
            'role' => $validated['role'],
            'status' => 'pending',
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(7),
            'invited_by' => Auth::id(),
        ]);

        // Attach plain token temporarily to invitation object for the email construction
        $invitation->plain_token = $plainToken;

        try {
            Mail::to($invitation->email)->send(new TeamInvitation($invitation));
            Log::info("Staff invitation sent to {$invitation->email} with role {$invitation->role} by admin ID " . Auth::id());
        } catch (\Exception $e) {
            // Log the error but continue if mail is not fully configured (useful in dev)
            Log::error('Failed to send team member invitation email: ' . $e->getMessage());
        }

        // Notify the sending admin via database notification
        Auth::user()->notify(new InvitationSentNotification($invitation->email, $invitation->role));

        return back()->with('success', 'Invitation sent to ' . $invitation->email . ' successfully.');
    }

    /**
     * Show the acceptance form.
     */
    public function acceptView(string $token): mixed
    {
        $hashedToken = hash('sha256', $token);
        $invitation = Invitation::where('token', $hashedToken)->first();

        if (!$invitation) {
            return redirect()->route('login')->withErrors(['email' => 'Invalid invitation link.']);
        }

        if ($invitation->isExpired()) {
            return redirect()->route('login')->withErrors(['email' => 'Invitation link has expired.']);
        }

        if ($invitation->accepted_at || $invitation->status === 'accepted') {
            return redirect()->route('login')->withErrors(['email' => 'Invitation has already been accepted.']);
        }

        if ($invitation->status === 'cancelled') {
            return redirect()->route('login')->withErrors(['email' => 'This invitation has been cancelled.']);
        }

        return Inertia::render('Auth/AcceptInvitation', [
            'email' => $invitation->email,
            'token' => $token,
        ]);
    }

    /**
     * Process invitation acceptance and register the team member.
     */
    public function accept(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $hashedToken = hash('sha256', $validated['token']);
        $invitation = Invitation::where('token', $hashedToken)->first();

        if (!$invitation || $invitation->isExpired() || $invitation->accepted_at || $invitation->status !== 'pending') {
            return redirect()->route('login')->withErrors(['email' => 'Invitation link is invalid, expired, or cancelled.']);
        }

        // Check if the user already exists
        $user = User::where('email', $invitation->email)->first();

        if ($user) {
            // If they are already a team member, they cannot accept the invitation again
            if ($user->is_team_member) {
                return redirect()->route('login')->withErrors(['email' => 'Email is already registered as a team member.']);
            }

            // Update the existing customer user to become a team member
            $user->update([
                'name' => $validated['name'],
                'password' => Hash::make($validated['password']),
                'is_team_member' => true,
                'status' => 'Active',
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        } else {
            // Create the Team Member user account
            $user = User::create([
                'name' => $validated['name'],
                'email' => $invitation->email,
                'password' => Hash::make($validated['password']),
                'is_team_member' => true,
                'status' => 'Active',
                'email_verified_at' => now(), // verified email ownership upon clicking unique link
            ]);
        }

        // Assign Role
        if ($invitation->role) {
            $user->assignRole($invitation->role);
        }

        // Mark as accepted
        $invitation->update([
            'accepted_at' => now(),
            'status' => 'accepted',
        ]);

        Log::info("Staff invitation accepted by {$invitation->email}. User account ID {$user->id} created.");

        // Notify all admin users that a new member joined
        $adminRoleExists = \DB::table('roles')->where('name', 'Admin')->exists();
        $admins = $adminRoleExists ? User::role('Admin')->get() : collect();
        $admins->each(function ($admin) use ($user, $invitation) {
            $admin->notify(new InvitationAcceptedNotification(
                $invitation->email,
                $user->name,
                $invitation->role,
            ));
        });

        // Login user
        Auth::login($user);

        return redirect()->route('dashboard')->with('success', 'Account set up successfully. Welcome to the team!');
    }

    /**
     * Resend an invitation with a fresh token and expiration.
     */
    public function resend($id)
    {
        $invitation = Invitation::findOrFail($id);

        if ($invitation->accepted_at || $invitation->status === 'accepted') {
            return back()->withErrors(['error' => 'This invitation has already been accepted.']);
        }

        $plainToken = Str::random(40);

        // Renew invitation details
        $invitation->update([
            'token' => hash('sha256', $plainToken),
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
            'invited_by' => Auth::id(),
        ]);

        // Attach plain token temporarily
        $invitation->plain_token = $plainToken;

        try {
            Mail::to($invitation->email)->send(new TeamInvitation($invitation));
            Log::info("Staff invitation resent to {$invitation->email} by admin ID " . Auth::id());
        } catch (\Exception $e) {
            Log::error('Failed to resend team member invitation email: ' . $e->getMessage());
        }

        // Notify the resending admin
        Auth::user()->notify(new InvitationSentNotification($invitation->email, $invitation->role));

        return back()->with('success', 'Invitation resent to ' . $invitation->email . ' successfully.');
    }

    /**
     * Cancel a pending invitation.
     */
    public function cancel($id)
    {
        $invitation = Invitation::findOrFail($id);

        if ($invitation->accepted_at || $invitation->status === 'accepted') {
            return back()->withErrors(['error' => 'This invitation has already been accepted and cannot be cancelled.']);
        }

        $invitation->update([
            'status' => 'cancelled',
        ]);

        Log::info("Staff invitation for {$invitation->email} cancelled by admin ID " . Auth::id());

        return back()->with('success', 'Invitation for ' . $invitation->email . ' has been cancelled.');
    }
}

