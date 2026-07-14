<?php

namespace Tests\Feature;

use App\Models\CatalogAttribute;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogSettingsTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $categoryA;
    private $categoryB;
    private $subcategory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = $this->createAdminUser();
        $this->categoryA = Category::create(['name' => 'Category A', 'view_order' => 1]);
        $this->categoryB = Category::create(['name' => 'Category B', 'view_order' => 2]);
        
        $this->subcategory = CatalogAttribute::create([
            'type' => 'sub_category',
            'category_id' => $this->categoryA->id,
            'name' => 'Subcategory 1',
            'view_order' => 1,
        ]);
    }

    public function test_can_update_subcategory_name_and_parent_category(): void
    {
        $response = $this->actingAs($this->user)->patch(
            route('catalog-settings.update', ['sub_categories', $this->subcategory->id]),
            [
                'name' => 'Updated Subcategory Name',
                'parent_name' => $this->categoryB->id,
            ]
        );

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->subcategory->refresh();
        $this->assertEquals('Updated Subcategory Name', $this->subcategory->name);
        $this->assertEquals($this->categoryB->id, $this->subcategory->category_id);
    }
}
