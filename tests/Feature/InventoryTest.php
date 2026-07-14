<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\CatalogAttribute;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = $this->createAdminUser();
        
        $category = Category::create(['name' => 'Sports', 'view_order' => 1]);
        $brand = Brand::create(['name' => 'Nike']);
        $subCategory = CatalogAttribute::create(['name' => 'Running', 'type' => 'sub_category', 'category_id' => $category->id]);
        $color = CatalogAttribute::create(['name' => 'Black', 'type' => 'color', 'category_id' => $category->id]);
        $size = CatalogAttribute::create(['name' => '42', 'type' => 'size', 'category_id' => $category->id]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'sub_category_id' => $subCategory->id,
            'color_id' => $color->id,
            'brand_id' => $brand->id,
            'size_id' => $size->id,
            'name' => 'Nike Air Max',
            'description' => 'Great cushioning',
            'price' => 129.99,
            'stock' => 25,
        ]);
    }

    public function test_authenticated_user_can_access_inventory_index(): void
    {
        $response = $this->actingAs($this->user)->get(route('inventory.index'));
        $response->assertStatus(200);
    }

    public function test_guest_cannot_access_inventory_index(): void
    {
        $response = $this->get(route('inventory.index'));
        $response->assertRedirect('/login');
    }

    public function test_can_increment_stock_via_stock_in(): void
    {
        $response = $this->actingAs($this->user)->post(route('inventory.stock-in'), [
            'id' => $this->product->id,
            'quantity' => 10,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        
        $this->assertDatabaseHas('products', [
            'id' => $this->product->id,
            'stock' => 35,
        ]);
    }

    public function test_can_adjust_stock_level(): void
    {
        $response = $this->actingAs($this->user)->post(route('inventory.adjust'), [
            'id' => $this->product->id,
            'quantity' => 3,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        
        $this->assertDatabaseHas('products', [
            'id' => $this->product->id,
            'stock' => 3,
        ]);
    }

    public function test_can_trigger_supplier_notification(): void
    {
        $response = $this->actingAs($this->user)->post(route('inventory.notify-supplier'), [
            'id' => $this->product->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }
}
