<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\CatalogAttribute;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $category;
    private $brand;
    private $subCategory;
    private $color;
    private $size;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = $this->createAdminUser();
        $this->category = Category::create(['name' => 'Clothing', 'view_order' => 1]);
        $this->brand = Brand::create(['name' => 'Adidas']);
        $this->subCategory = CatalogAttribute::create(['name' => 'Shirt', 'type' => 'sub_category', 'category_id' => $this->category->id]);
        $this->color = CatalogAttribute::create(['name' => 'Blue', 'type' => 'color', 'category_id' => $this->category->id]);
        $this->size = CatalogAttribute::create(['name' => 'L', 'type' => 'size', 'category_id' => $this->category->id]);
    }

    public function test_authenticated_user_can_access_products_index(): void
    {
        $response = $this->actingAs($this->user)->get(route('products.index'));
        $response->assertStatus(200);
    }

    public function test_guest_cannot_access_products_index(): void
    {
        $response = $this->get(route('products.index'));
        $response->assertRedirect('/login');
    }

    public function test_can_create_product(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('test_product.jpg');

        $response = $this->actingAs($this->user)->post(route('products.store'), [
            'category_id' => $this->category->id,
            'sub_category_id' => $this->subCategory->id,
            'color_id' => $this->color->id,
            'brand_id' => $this->brand->id,
            'size_id' => $this->size->id,
            'name' => 'Test Product',
            'description' => 'Test Description',
            'price' => 45.99,
            'stock' => 150,
            'image' => $file,
        ]);

        $response->assertSessionHasNoErrors();
        // ProductController::store redirects to the new product's show page so managers
        // can immediately review the product and add additional variants.
        $newProduct = Product::where('name', 'Test Product')->first();
        $response->assertRedirect(route('products.show', $newProduct->id));


        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'price' => 45.99,
            'stock' => 150,
        ]);

        $product = Product::where('name', 'Test Product')->first();
        $this->assertNotNull($product->image);
        Storage::disk('public')->assertExists($product->image);
    }

    public function test_can_update_product(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('updated_product.jpg');

        $product = Product::create([
            'category_id' => $this->category->id,
            'sub_category_id' => $this->subCategory->id,
            'color_id' => $this->color->id,
            'brand_id' => $this->brand->id,
            'size_id' => $this->size->id,
            'name' => 'Old Product Name',
            'description' => 'Old Description',
            'price' => 20.00,
            'stock' => 50,
            'image' => 'products/old_image.jpg',
        ]);

        // Mock old image
        Storage::disk('public')->put('products/old_image.jpg', 'content');

        // inertia form submit for update/edit uses POST with _method=PATCH because of multipart limitation
        $response = $this->actingAs($this->user)->post(route('products.update', $product->id), [
            '_method' => 'PATCH',
            'category_id' => $this->category->id,
            'sub_category_id' => $this->subCategory->id,
            'color_id' => $this->color->id,
            'brand_id' => $this->brand->id,
            'size_id' => $this->size->id,
            'name' => 'Updated Product Name',
            'description' => 'Updated Description',
            'price' => 25.50,
            'stock' => 60,
            'image' => $file,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('products.index'));

        $product->refresh();
        $this->assertEquals('Updated Product Name', $product->name);
        $this->assertEquals(25.50, $product->price);
        $this->assertEquals(60, $product->stock);

        // Verify old image is deleted and new image exists
        Storage::disk('public')->assertMissing('products/old_image.jpg');
        Storage::disk('public')->assertExists($product->image);
    }

    public function test_can_update_product_without_changing_image(): void
    {
        Storage::fake('public');

        $product = Product::create([
            'category_id' => $this->category->id,
            'sub_category_id' => $this->subCategory->id,
            'color_id' => $this->color->id,
            'brand_id' => $this->brand->id,
            'size_id' => $this->size->id,
            'name' => 'Old Name',
            'description' => 'Old Desc',
            'price' => 10.00,
            'stock' => 5,
            'image' => 'products/existing_image.jpg',
        ]);

        Storage::disk('public')->put('products/existing_image.jpg', 'content');

        $response = $this->actingAs($this->user)->post(route('products.update', $product->id), [
            '_method' => 'PATCH',
            'category_id' => $this->category->id,
            'sub_category_id' => $this->subCategory->id,
            'color_id' => $this->color->id,
            'brand_id' => $this->brand->id,
            'size_id' => $this->size->id,
            'name' => 'New Name',
            'description' => 'New Desc',
            'price' => 12.00,
            'stock' => 10,
            'image' => 'products/existing_image.jpg', // sends string path
        ]);

        $response->assertSessionHasNoErrors();
        $product->refresh();

        $this->assertEquals('New Name', $product->name);
        $this->assertEquals('products/existing_image.jpg', $product->image);
        Storage::disk('public')->assertExists('products/existing_image.jpg');
    }

    public function test_can_delete_product(): void
    {
        Storage::fake('public');

        $product = Product::create([
            'category_id' => $this->category->id,
            'sub_category_id' => $this->subCategory->id,
            'color_id' => $this->color->id,
            'brand_id' => $this->brand->id,
            'size_id' => $this->size->id,
            'name' => 'ToDelete Product',
            'description' => 'ToDelete Desc',
            'price' => 10.00,
            'stock' => 5,
            'image' => 'products/delete_me.jpg',
        ]);

        Storage::disk('public')->put('products/delete_me.jpg', 'content');

        $response = $this->actingAs($this->user)->delete(route('products.destroy', $product->id));

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('products.index'));

        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
        ]);
        Storage::disk('public')->assertMissing('products/delete_me.jpg');
    }

    public function test_can_get_product_variants_details(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'sub_category_id' => $this->subCategory->id,
            'color_id' => $this->color->id,
            'brand_id' => $this->brand->id,
            'size_id' => $this->size->id,
            'name' => 'V-Product',
            'description' => 'V-Desc',
            'price' => 10.00,
            'stock' => 5,
        ]);

        $response = $this->actingAs($this->user)->get(route('products.variants', $product->id));
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'product_name',
            'description',
            'price',
            'brand',
            'category',
            'image',
            'variants' => [
                '*' => [
                    'id',
                    'color' => ['id', 'name', 'value'],
                    'size' => ['id', 'name'],
                    'stock',
                ]
            ]
        ]);
    }
}

