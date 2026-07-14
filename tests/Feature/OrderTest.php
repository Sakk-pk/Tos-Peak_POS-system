<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\CatalogAttribute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_access_orders_index(): void
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)->get(route('orders.index'));

        $response->assertStatus(200);
    }

    public function test_guest_cannot_access_orders_index(): void
    {
        $response = $this->get(route('orders.index'));

        $response->assertRedirect('/login');
    }

    public function test_checkout_creates_order_and_reduces_stock(): void
    {
        $this->withoutMiddleware();

        $user = $this->createAdminUser();
        
        $category = Category::create(['name' => 'Shoes', 'view_order' => 1]);
        $brand = Brand::create(['name' => 'Nike']);
        $subCategory = CatalogAttribute::create(['name' => 'Running', 'type' => 'sub_category', 'category_id' => $category->id]);
        $color = CatalogAttribute::create(['name' => 'Red', 'type' => 'color', 'category_id' => $category->id]);
        $size = CatalogAttribute::create(['name' => 'M', 'type' => 'size', 'category_id' => $category->id]);

        $product = Product::create([
            'category_id' => $category->id,
            'sub_category_id' => $subCategory->id,
            'color_id' => $color->id,
            'brand_id' => $brand->id,
            'size_id' => $size->id,
            'name' => 'Aero Runner',
            'description' => 'Great shoes',
            'price' => 100.00,
            'stock' => 10,
        ]);

        $this->assertEquals(10, $product->stock);

        $response = $this->actingAs($user)->post(route('orders.store'), [
            'customer_name' => 'Walk-in Customer',
            'payment_method' => 'cash',
            'cash_received' => 120.00,
            'items' => [
                [
                    'id' => $product->id,
                    'quantity' => 2,
                ]
            ]
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        // Check if order exists in DB
        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals('Walk-in Customer', $order->customer_name);
        $this->assertEquals(200.00, $order->subtotal); // 2 * 100
        $this->assertEquals(16.00, $order->tax); // 8% of 200
        $this->assertEquals(216.00, $order->total_amount); // 216.00

        // Check if item exists in DB
        $this->assertCount(1, $order->items);
        $this->assertEquals(2, $order->items[0]->quantity);
        $this->assertEquals(100.00, $order->items[0]->price);

        // Check stock reduction
        $product->refresh();
        $this->assertEquals(8, $product->stock);
    }
}
