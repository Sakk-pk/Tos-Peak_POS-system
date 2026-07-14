<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use App\Models\Brand;
use App\Models\Category;
use App\Models\CatalogAttribute;
use Tests\TestCase;

class SecurityAuditorReportTest extends TestCase
{
    use RefreshDatabase;

    private $category;
    private $brand;
    private $subCategory;
    private $color;
    private $size;
    private $admin;
    private $manager;
    private $staff;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed new simplified permissions and roles
        $allPerms = [
            'view-dashboard', 'manage-pos', 'manage-products', 'manage-variants',
            'manage-inventory', 'manage-orders', 'manage-payments', 'manage-customers',
            'manage-staff', 'manage-roles', 'view-notifications', 'view-reports', 'manage-settings',
        ];

        foreach ($allPerms as $permName) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permName, 'guard_name' => 'web']);
        }

        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions($allPerms);

        $managerRole = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
        $managerRole->syncPermissions([
            'view-dashboard', 'manage-pos', 'manage-products', 'manage-variants',
            'manage-inventory', 'manage-orders', 'manage-payments',
            'manage-customers', 'view-notifications', 'view-reports',
        ]);

        $staffRole = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
        $staffRole->syncPermissions([
            'view-dashboard', 'manage-pos', 'manage-orders',
            'manage-payments', 'manage-customers', 'view-notifications',
        ]);

        $this->category = Category::create(['name' => 'Testing Unit', 'view_order' => 1]);
        $this->brand = Brand::create(['name' => 'AuditBrand']);
        $this->subCategory = CatalogAttribute::create(['name' => 'SubCat', 'type' => 'sub_category', 'category_id' => $this->category->id]);
        $this->color = CatalogAttribute::create(['name' => 'Red', 'type' => 'color', 'category_id' => $this->category->id]);
        $this->size = CatalogAttribute::create(['name' => 'XL', 'type' => 'size', 'category_id' => $this->category->id]);

        $this->admin = User::factory()->create(['status' => 'Active', 'is_team_member' => true]);
        $this->admin->assignRole('Admin');

        $this->manager = User::factory()->create(['status' => 'Active', 'is_team_member' => true]);
        $this->manager->assignRole('Manager');

        $this->staff = User::factory()->create(['status' => 'Active', 'is_team_member' => true]);
        $this->staff->assignRole('Staff');
    }


    /**
     * Test missing access control is fixed: Staff gets 403 when creating categories.
     */
    public function test_staff_cannot_create_categories_or_roles_directly(): void
    {
        // Category creation
        $response = $this->actingAs($this->staff)->post(route('categories.store'), [
            'name' => 'Unauthorized Category',
            'view_order' => 50,
        ]);
        
        $response->assertStatus(403);
        $this->assertDatabaseMissing('categories', ['name' => 'Unauthorized Category']);
    }

    /**
     * Test staff role modification (privilege escalation) is blocked.
     */
    public function test_staff_can_escalate_privilege_due_to_missing_middleware(): void
    {
        // A Staff member attempts to updates their own role to Admin
        $response = $this->actingAs($this->staff)->patch(route('users.update', $this->staff->id), [
            'role' => 'Admin'
        ]);

        $response->assertStatus(403);
        $this->assertFalse($this->staff->fresh()->hasRole('Admin'));
    }

    /**
     * Test staff deactivating admins is blocked.
     */
    public function test_staff_can_deactivate_admin_due_to_missing_middleware(): void
    {
        $response = $this->actingAs($this->staff)->post(route('users.deactivate', $this->admin->id));

        $response->assertStatus(403);
        $this->assertEquals('Active', $this->admin->fresh()->status);
    }

    /**
     * Test JWT tampering and invalid token validation.
     */
    public function test_jwt_tampering_is_rejected(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsig',
        ])->getJson('/api/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthorized'
            ]);
    }

    /**
     * Test webhook signature validation with invalid credentials.
     */
    public function test_webhook_rejects_empty_signature(): void
    {
        $response = $this->postJson('/api/khqr/webhook', [
            'khqr_md5' => 'e5915f34778ae434914c6ff2ef9198b1',
            'transaction_id' => 'TXN_TEST_123',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test that order creation secures stock and prevents negative inventory.
     */
    public function test_checkout_fails_on_insufficient_stock(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'sub_category_id' => $this->subCategory->id,
            'color_id' => $this->color->id,
            'brand_id' => $this->brand->id,
            'size_id' => $this->size->id,
            'name' => 'Limited Product',
            'description' => 'Test',
            'price' => 10.00,
            'stock' => 1,
        ]);

        $response = $this->actingAs($this->staff)->post(route('orders.store'), [
            'customer_name' => 'Test',
            'payment_method' => 'cash',
            'items' => [
                ['id' => $product->id, 'quantity' => 2]
            ]
        ]);

        $response->assertSessionHasErrors(['error']);
        $product->refresh();
        $this->assertEquals(1, $product->stock); // Stock remains unchanged
    }
}
