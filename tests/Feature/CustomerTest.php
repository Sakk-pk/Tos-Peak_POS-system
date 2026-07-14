<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed an admin user (who is a team member)
        $this->user = $this->createAdminUser();
    }

    public function test_authenticated_user_can_access_customers_index(): void
    {
        $customer = User::create([
            'name' => 'Sarah Chen',
            'email' => 'sarah.chen@example.com',
            'phone' => '+1 415 555 0142',
            'visits' => 12,
            'is_team_member' => false,
            'password' => bcrypt('password'),
        ]);

        Order::create([
            'order_number' => 'TP-SC0001',
            'customer_name' => 'Sarah Chen',
            'customer_email' => 'sarah.chen@example.com',
            'customer_phone' => '+1 415 555 0142',
            'subtotal' => 1700.00,
            'tax' => 140.00,
            'total_amount' => 1840.00,
            'payment_method' => 'card',
            'payment_status' => 'Paid'
        ]);

        $response = $this->actingAs($this->user)->get(route('customers.index'));
        $response->assertStatus(200);
        $response->assertSee('Sarah Chen');
        $response->assertSee('+1 415 555 0142');
    }

    public function test_guest_cannot_access_customers_index(): void
    {
        $response = $this->get(route('customers.index'));
        $response->assertRedirect('/login');
    }
}
