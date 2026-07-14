<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\CatalogAttribute;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class POSTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $category;
    private $brand;
    private $subCategory;
    private $color;
    private $size;
    private $product;

    protected function setUp(): void
    {
        parent::setUp();

        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
        $this->user = $this->createAdminUser();
        $this->user->assignRole('Staff');
        $this->category = Category::create(['name' => 'Sports', 'view_order' => 1]);
        $this->brand = Brand::create(['name' => 'Nike']);
        $this->subCategory = CatalogAttribute::create(['name' => 'Running', 'type' => 'sub_category', 'category_id' => $this->category->id]);
        $this->color = CatalogAttribute::create(['name' => 'Red', 'type' => 'color', 'category_id' => $this->category->id]);
        $this->size = CatalogAttribute::create(['name' => '40', 'type' => 'size', 'category_id' => $this->category->id]);

        $this->product = Product::create([
            'category_id' => $this->category->id,
            'sub_category_id' => $this->subCategory->id,
            'color_id' => $this->color->id,
            'brand_id' => $this->brand->id,
            'size_id' => $this->size->id,
            'name' => 'Aero Runner',
            'description' => 'Test POS Product',
            'price' => 50.00,
            'stock' => 10,
        ]);
    }


    public function test_authenticated_user_can_access_point_of_sale_index_with_props(): void
    {
        $response = $this->actingAs($this->user)->get(route('point-of-sale.index'));
        $response->assertStatus(200);

        // Assert props contain categories, products, and subCategories
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/POS/POSPage')
            ->has('categories')
            ->has('subCategories')
            ->has('products')
        );

        // Verify products mapping returned mapped details correctly
        $props = $response->original->getData()['page']['props'];
        $this->assertCount(1, $props['products']);
    }
}
