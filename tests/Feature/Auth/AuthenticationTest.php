<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        // A user with no role is treated as a customer → redirected to storefront '/'
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email'    => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/');
    }

    public function test_team_members_with_dashboard_permission_are_redirected_to_dashboard(): void
    {
        \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'dashboard', 'guard_name' => 'web']);
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Dashboard Team', 'guard_name' => 'web']);
        $role->syncPermissions(['dashboard']);

        $admin = User::factory()->create(['status' => 'Active', 'is_team_member' => true]);
        $admin->assignRole($role);

        $response = $this->post('/login', [
            'email'    => $admin->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
