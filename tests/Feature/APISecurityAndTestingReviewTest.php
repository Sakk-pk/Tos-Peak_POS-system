<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Role;
use App\Models\Brand;
use App\Models\Category;
use App\Models\CatalogAttribute;
use Tests\TestCase;

class APISecurityAndTestingReviewTest extends TestCase
{
    use RefreshDatabase;

    private $category;
    private $brand;
    private $subCategory;
    private $color;
    private $size;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed permissions + default roles so permission checks work in tests
        $this->createAdminUser(); // seeds all permissions and Admin role as a side-effect

        $staffRole = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
        $staffRole->syncPermissions([
            'view-dashboard', 'manage-pos', 'manage-orders',
            'manage-payments', 'manage-customers', 'view-notifications',
        ]);

        $managerRole = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
        $managerRole->syncPermissions([
            'view-dashboard', 'manage-pos', 'manage-products', 'manage-variants',
            'manage-inventory', 'manage-orders', 'manage-payments',
            'manage-customers', 'view-notifications', 'view-reports',
        ]);

        $this->category = Category::create(['name' => 'Clothing', 'view_order' => 1]);
        $this->brand = Brand::create(['name' => 'Adidas']);
        $this->subCategory = CatalogAttribute::create(['name' => 'Shirt', 'type' => 'sub_category', 'category_id' => $this->category->id]);
        $this->color = CatalogAttribute::create(['name' => 'Blue', 'type' => 'color', 'category_id' => $this->category->id]);
        $this->size = CatalogAttribute::create(['name' => 'L', 'type' => 'size', 'category_id' => $this->category->id]);
    }

    /**
     * Test API login handles invalid emails gracefully without throwing null pointer exceptions.
     */
    public function test_api_login_fails_gracefully_with_non_existent_email(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'doesnotexist@tospeak.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error' => true,
                'email' => true,
                'message' => 'The email address is not registered.'
            ]);
    }

    /**
     * Test deactivated users cannot log in via the API.
     */
    public function test_inactive_users_cannot_login_via_api(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive_staff@tospeak.com',
            'password' => Hash::make('password123'),
            'status' => 'Inactive',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'inactive_staff@tospeak.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error' => true,
                'message' => 'Your account has been deactivated. Please contact an administrator.'
            ]);
    }

    /**
     * Test the resolved jwt.auth route middleware works and authenticates.
     */
    public function test_jwt_middleware_alias_authenticates_correctly(): void
    {
        $user = User::factory()->create([
            'email' => 'active_staff@tospeak.com',
            'password' => Hash::make('password123'),
            'status' => 'Active',
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'active_staff@tospeak.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');
        $this->assertNotEmpty($token);

        // Access route protected by jwt.auth middleware
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('email', 'active_staff@tospeak.com');
    }

    /**
     * Test the jwt middleware blocks requests from deactivated users.
     */
    public function test_jwt_middleware_blocks_inactive_user_tokens(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive_staff@tospeak.com',
            'password' => Hash::make('password123'),
            'status' => 'Active',
        ]);

        // Generate token while user is Active
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);

        // Deactivate user afterwards
        $user->update(['status' => 'Inactive']);

        // Access route with deactivated user's token
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/auth/me');

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Your account has been deactivated. Please contact an administrator.'
            ]);
    }

    /**
     * Test public webhook rejects requests that have invalid signatures.
     */
    public function test_webhook_rejects_requests_with_invalid_signatures(): void
    {
        $response = $this->postJson('/api/khqr/webhook', [
            'khqr_md5' => 'e5915f34778ae434914c6ff2ef9198b1',
            'transaction_id' => 'TXN_INVALID_SIGN',
        ], [
            'X-Bakong-Signature' => 'invalid-hmac-signature-here',
            'X-Bakong-Timestamp' => time(),
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid webhook signature verification failed.',
            ]);
    }

    /**
     * Test public webhook accepts valid HMAC signatures.
     */
    public function test_webhook_accepts_valid_signatures(): void
    {
        config(['bakong.webhook_secret' => 'test-secret']);
        config(['bakong.whitelisted_ips' => []]); // temporarily bypass IP check for test execution

        $payment = Payment::create([
            'amount' => 50.00,
            'currency' => 'USD',
            'khqr_md5' => 'e5915f34778ae434914c6ff2ef9198b1',
            'payment_status' => 'pending',
        ]);

        $payload = json_encode([
            'khqr_md5' => 'e5915f34778ae434914c6ff2ef9198b1',
            'transaction_id' => 'TXN_VALID_SIGN_123',
        ]);

        $signature = hash_hmac('sha256', $payload, 'test-secret');

        $response = $this->postJson('/api/khqr/webhook', json_decode($payload, true), [
            'X-Bakong-Signature' => $signature,
            'X-Bakong-Timestamp' => time(),
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Payment confirmed.',
            ]);

        $payment->refresh();
        $this->assertEquals('paid', $payment->payment_status);
        $this->assertEquals('TXN_VALID_SIGN_123', $payment->transaction_id);
    }

    /**
     * Test manual payment confirmation requires Admin/Manager role override.
     */
    public function test_manual_confirmation_requires_supervisor_role(): void
    {
        $cashier = User::factory()->create(['status' => 'Active']);
        $cashier->assignRole('Staff');

        $payment = Payment::create([
            'amount' => 10.00,
            'currency' => 'USD',
            'khqr_md5' => 'e5915f34778ae434914c6ff2ef9198b1',
            'payment_status' => 'pending',
        ]);

        $response = $this->actingAs($cashier, 'sanctum')->postJson('/api/khqr/manual-confirm', [
            'md5' => 'e5915f34778ae434914c6ff2ef9198b1',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'requires_auth' => true,
                'message' => 'Unauthorized: Supervisor authorization required (Admin or Manager).'
            ]);
    }

    /**
     * Test manual payment confirmation permits Admin/Manager credentials.
     */
    public function test_manual_confirmation_permits_admin_supervisor_credentials(): void
    {
        $cashier = User::factory()->create(['status' => 'Active']);
        $cashier->assignRole('Staff');

        $supervisor = User::factory()->create([
            'email' => 'admin_supervisor@tospeak.com',
            'password' => Hash::make('supervisor_secret'),
            'status' => 'Active',
        ]);
        $supervisor->assignRole('Admin');

        $payment = Payment::create([
            'amount' => 10.00,
            'currency' => 'USD',
            'khqr_md5' => 'e5915f34778ae434914c6ff2ef9198b1',
            'payment_status' => 'pending',
        ]);

        // Mock verifyPayment in PaymentService to return true
        $this->mock(\App\Services\PaymentService::class, function ($mock) {
            $mock->shouldReceive('verifyPayment')->once()->with('e5915f34778ae434914c6ff2ef9198b1')->andReturn(true);
        });

        $response = $this->actingAs($cashier, 'sanctum')->postJson('/api/khqr/manual-confirm', [
            'md5' => 'e5915f34778ae434914c6ff2ef9198b1',
            'supervisor_email' => 'admin_supervisor@tospeak.com',
            'supervisor_password' => 'supervisor_secret',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Payment successfully verified with Bakong API and marked paid.'
            ]);
    }

    /**
     * Test order cancellation releases reserved stock.
     */
    public function test_order_cancellation_releases_reserved_stock(): void
    {
        $user = User::factory()->create(['status' => 'Active']);
        $user->assignRole('Staff');

        $product = Product::create([
            'category_id' => $this->category->id,
            'sub_category_id' => $this->subCategory->id,
            'color_id' => $this->color->id,
            'brand_id' => $this->brand->id,
            'size_id' => $this->size->id,
            'name' => 'Aero Runner',
            'description' => 'Test description',
            'price' => 15.00,
            'stock' => 10,
        ]);

        // Checkout sets order to pending, reserving stock
        $response = $this->actingAs($user)->post(route('orders.store'), [
            'customer_name' => 'Test Customer',
            'payment_method' => 'qr',
            'items' => [
                ['id' => $product->id, 'quantity' => 3]
            ]
        ], ['Accept' => 'application/json']);

        $product->refresh();
        $this->assertEquals(7, $product->stock); // 10 - 3 = 7

        $order = Order::latest()->first();
        $this->assertEquals('Pending', $order->payment_status);

        // Cancel order to release stock
        $cancelResponse = $this->actingAs($user)->post(route('orders.cancel', $order->id));

        $product->refresh();
        $this->assertEquals(10, $product->stock); // 7 + 3 = 10 (Restored)

        $order->refresh();
        $this->assertEquals('Cancelled', $order->payment_status);
    }
}
