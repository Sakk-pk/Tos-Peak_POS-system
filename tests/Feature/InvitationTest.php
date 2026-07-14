<?php

namespace Tests\Feature;

use App\Models\Invitation;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use App\Mail\TeamInvitation;
use Tests\TestCase;

class InvitationTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $role;

    protected function setUp(): void
    {
        parent::setUp();

        $this->role = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);

        $this->admin = User::factory()->create([
            'is_team_member' => true,
        ]);
        $this->admin->assignRole($adminRole->name);
    }

    public function test_admin_can_send_invitation(): void
    {
        Mail::fake();

        $response = $this->actingAs($this->admin)->post(route('invitations.store'), [
            'email' => 'invitee@example.com',
            'role' => 'Manager',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('invitations', [
            'email' => 'invitee@example.com',
            'role' => 'Manager',
        ]);

        $invitation = Invitation::where('email', 'invitee@example.com')->first();
        $this->assertNotNull($invitation->token);

        Mail::assertSent(TeamInvitation::class, function ($mail) use ($invitation) {
            return $mail->hasTo('invitee@example.com') && $mail->invitation->id === $invitation->id;
        });
    }

    public function test_guest_can_view_accept_invitation_page(): void
    {
        $plainToken = 'test-invitation-token';
        $invitation = Invitation::create([
            'email' => 'invitee@example.com',
            'role' => 'Manager',
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->get(route('invitations.accept', ['token' => $plainToken]));
        $response->assertStatus(200);
    }

    public function test_guest_can_accept_invitation_and_become_team_member(): void
    {
        $plainToken = 'test-invitation-token';
        $invitation = Invitation::create([
            'email' => 'invitee@example.com',
            'role' => 'Manager',
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->post(route('invitations.accept.post'), [
            'token' => $plainToken,
            'name' => 'New Staff Name',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('users', [
            'name' => 'New Staff Name',
            'email' => 'invitee@example.com',
            'is_team_member' => true,
        ]);

        $user = User::where('email', 'invitee@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('Manager'));

        $invitation->refresh();
        $this->assertNotNull($invitation->accepted_at);
        $this->assertAuthenticatedAs($user);
    }

    public function test_admin_can_deactivate_staff_member(): void
    {
        $staff = User::factory()->create([
            'is_team_member' => true,
            'status' => 'Active',
        ]);

        $response = $this->actingAs($this->admin)->post(route('users.deactivate', $staff->id));
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertEquals('Inactive', $staff->refresh()->status);
    }

    public function test_deactivated_staff_member_is_logged_out_immediately(): void
    {
        $staff = User::factory()->create([
            'is_team_member' => true,
            'status' => 'Inactive',
        ]);

        $response = $this->actingAs($staff)->get(route('dashboard'));
        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_deactivated_staff_member_cannot_login(): void
    {
        $staff = User::factory()->create([
            'is_team_member' => true,
            'email' => 'inactive@example.com',
            'password' => Hash::make('password123'),
            'status' => 'Inactive',
        ]);

        $response = $this->post(route('login'), [
            'email' => 'inactive@example.com',
            'password' => 'password123',
        ]);

        // Attempting to access any page will trigger the middleware, logging them out and redirecting
        $this->get(route('dashboard'))->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_admin_can_reactivate_staff_member(): void
    {
        $staff = User::factory()->create([
            'is_team_member' => true,
            'status' => 'Inactive',
        ]);

        $response = $this->actingAs($this->admin)->post(route('users.reactivate', $staff->id));
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertEquals('Active', $staff->refresh()->status);
    }

    public function test_admin_can_resend_invitation(): void
    {
        Mail::fake();

        $invitation = Invitation::create([
            'email' => 'invitee@example.com',
            'role' => 'Manager',
            'token' => 'old-token',
            'status' => 'expired',
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->admin)->post(route('invitations.resend', $invitation->id));
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $invitation->refresh();
        $this->assertEquals('pending', $invitation->status);
        $this->assertNotEquals('old-token', $invitation->token);
        $this->assertTrue($invitation->expires_at->isAfter(now()));

        Mail::assertSent(TeamInvitation::class);
    }

    public function test_admin_can_cancel_invitation(): void
    {
        $invitation = Invitation::create([
            'email' => 'invitee@example.com',
            'role' => 'Manager',
            'token' => 'some-token',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->actingAs($this->admin)->post(route('invitations.cancel', $invitation->id));
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertEquals('cancelled', $invitation->refresh()->status);
    }

    public function test_admin_can_invite_existing_customer_email_to_team(): void
    {
        Mail::fake();

        // Create a customer user
        User::factory()->create([
            'email' => 'customer@example.com',
            'is_team_member' => false,
        ]);

        $response = $this->actingAs($this->admin)->post(route('invitations.store'), [
            'email' => 'customer@example.com',
            'role' => 'Manager',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('invitations', [
            'email' => 'customer@example.com',
            'role' => 'Manager',
        ]);
    }

    public function test_customer_can_accept_invitation_and_be_promoted_to_team_member(): void
    {
        // Create a customer user
        $customer = User::factory()->create([
            'name' => 'Original Customer Name',
            'email' => 'customer@example.com',
            'is_team_member' => false,
        ]);

        $plainToken = 'test-promotion-token';
        $invitation = Invitation::create([
            'email' => 'customer@example.com',
            'role' => 'Manager',
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->post(route('invitations.accept.post'), [
            'token' => $plainToken,
            'name' => 'Promoted Staff Name',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('dashboard'));

        // Check customer was updated (promoted), and no duplicate user row was created
        $this->assertEquals(2, User::count()); // admin and the promoted customer

        $customer->refresh();
        $this->assertEquals('Promoted Staff Name', $customer->name);
        $this->assertTrue($customer->is_team_member);
        $this->assertTrue($customer->hasRole('Manager'));
        $this->assertTrue(Hash::check('newpassword123', $customer->password));

        $invitation->refresh();
        $this->assertNotNull($invitation->accepted_at);
        $this->assertAuthenticatedAs($customer);
    }
}

