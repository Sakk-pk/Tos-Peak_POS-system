<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_two_factor_settings(): void
    {
        $response = $this->postJson('/user/two-factor-authentication');
        $response->assertStatus(401);

        $response = $this->deleteJson('/user/two-factor-authentication');
        $response->assertStatus(401);

        $response = $this->postJson('/user/two-factor-confirmation', ['code' => '123456']);
        $response->assertStatus(401);
    }

    public function test_user_can_prepare_two_factor_authentication(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/user/two-factor-authentication');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'qr_code',
            'manual_key'
        ]);

        $this->assertNotNull($user->twoFactorAuth);
        $this->assertFalse($user->hasTwoFactorEnabled());
    }

    public function test_user_cannot_confirm_two_factor_with_invalid_code(): void
    {
        $user = User::factory()->create();

        // First generate
        $this->actingAs($user)->postJson('/user/two-factor-authentication');

        // Try to confirm with wrong code
        $response = $this->actingAs($user)->postJson('/user/two-factor-confirmation', [
            'code' => '000000'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('code');
        $this->assertFalse($user->hasTwoFactorEnabled());
    }

    public function test_user_can_disable_two_factor_authentication(): void
    {
        $user = User::factory()->create();

        // Enable two factor manually for the test
        $user->createTwoFactorAuth();
        $user->twoFactorAuth->enabled_at = now();
        $user->twoFactorAuth->save();

        $this->assertTrue($user->hasTwoFactorEnabled());

        $response = $this->actingAs($user)->deleteJson('/user/two-factor-authentication');

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success'
        ]);

        $user->refresh();
        $this->assertFalse($user->hasTwoFactorEnabled());
    }
}
