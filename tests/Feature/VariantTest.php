<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\CatalogAttribute;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VariantTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = $this->createAdminUser();
        
        $category = Category::create(['name' => 'Clothing', 'view_order' => 1]);
        $brand = Brand::create(['name' => 'Adidas']);
        $subCategory = CatalogAttribute::create(['name' => 'Shirt', 'type' => 'sub_category', 'category_id' => $category->id]);
        $color = CatalogAttribute::create(['name' => 'Blue', 'type' => 'color', 'category_id' => $category->id]);
        $size = CatalogAttribute::create(['name' => 'L', 'type' => 'size', 'category_id' => $category->id]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'sub_category_id' => $subCategory->id,
            'color_id' => $color->id,
            'brand_id' => $brand->id,
            'size_id' => $size->id,
            'name' => 'Aero Runner',
            'description' => 'Great running shoes',
            'price' => 129.99,
            'stock' => 10,
        ]);
    }

    public function test_authenticated_user_can_access_variants_index(): void
    {
        $response = $this->actingAs($this->user)->get(route('variants.index'));
        $response->assertStatus(200);
    }

    public function test_guest_cannot_access_variants_index(): void
    {
        $response = $this->get(route('variants.index'));
        $response->assertRedirect('/login');
    }

    public function test_can_update_variant_stock(): void
    {
        $response = $this->actingAs($this->user)->post(route('variants.update-stock'), [
            'id' => $this->product->id,
            'stock' => 15,
        ]);

        $response->assertSessionHasNoErrors();
        
        $this->assertDatabaseHas('products', [
            'id' => $this->product->id,
            'stock' => 15,
        ]);
    }

    public function test_can_create_new_variant_on_the_fly(): void
    {
        $newSize = CatalogAttribute::create([
            'name' => 'M',
            'type' => 'size',
            'category_id' => $this->product->category_id,
        ]);

        $response = $this->actingAs($this->user)->post(route('variants.update-stock'), [
            'product_name' => $this->product->name,
            'color_id' => $this->product->color_id,
            'size_id' => $newSize->id,
            'stock' => 25,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertJson([
            'success' => true,
        ]);
        
        $this->assertDatabaseHas('products', [
            'name' => $this->product->name,
            'color_id' => $this->product->color_id,
            'size_id' => $newSize->id,
            'stock' => 25,
        ]);
    }
}
