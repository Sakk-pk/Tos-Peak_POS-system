<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\CatalogAttribute;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CatalogSettingsController extends Controller
{
    private const COLOR_PALETTE = ['#111111', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    public function index(): Response
    {
        $categories = Category::orderBy('view_order')->orderBy('name')->get(['id', 'name', 'view_order']);

        $subCategories = CatalogAttribute::query()
            ->where('type', 'sub_category')
            ->with('category:id,name')
            ->orderBy('view_order')
            ->orderBy('name')
            ->get(['id', 'name', 'category_id']);

        $colors = CatalogAttribute::query()
            ->where('type', 'color')
            ->orderBy('view_order')
            ->orderBy('name')
            ->get(['id', 'name', 'value']);

        $brands = Brand::orderBy('view_order')->orderBy('name')->get(['id', 'name']);

        $sizes = CatalogAttribute::query()
            ->where('type', 'size')
            ->orderBy('view_order')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('CatalogSettings/CatalogSettingsPage', [
            'catalogData' => [
                'categories' => $categories,
                'subCategories' => $subCategories,
                'colors' => $colors,
                'brands' => $brands,
                'sizes' => $sizes,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tab' => ['required', Rule::in(['categories', 'sub_categories', 'colors', 'brands', 'sizes'])],
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'parent_name' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validated['tab'] === 'categories') {
            Category::create([
                'name' => $validated['name'],
                'view_order' => (int) (Category::max('view_order') ?? 0) + 1,
            ]);

            return back()->with('success', 'Category created successfully.');
        }

        if ($validated['tab'] === 'brands') {
            Brand::create([
                'name' => $validated['name'],
                'view_order' => (int) (Brand::max('view_order') ?? 0) + 1,
            ]);

            return back()->with('success', 'Brand created successfully.');
        }

        if ($validated['tab'] === 'sub_categories') {
            CatalogAttribute::create([
                'type' => 'sub_category',
                'category_id' => (int) $validated['parent_name'],
                'name' => $validated['name'],
                'view_order' => (int) (CatalogAttribute::where('type', 'sub_category')->max('view_order') ?? 0) + 1,
            ]);

            return back()->with('success', 'Sub-category created successfully.');
        }

        $type = $this->mapTabToType($validated['tab']);
        $nextOrder = (int) (CatalogAttribute::where('type', $type)->max('view_order') ?? 0) + 1;

        $payload = [
            'type' => $type,
            'name' => $validated['name'],
            'parent_name' => $validated['parent_name'] ?? null,
            'view_order' => $nextOrder,
        ];

        if ($type === 'color') {
            $existingCount = CatalogAttribute::where('type', 'color')->count();
            $payload['value'] = self::COLOR_PALETTE[$existingCount % count(self::COLOR_PALETTE)];
        }

        CatalogAttribute::create($payload);

        return back()->with('success', 'Catalog item created successfully.');
    }

    public function update(Request $request, string $tab, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        if ($tab === 'categories') {
            $category = Category::findOrFail($id);
            $category->update(['name' => $validated['name']]);

            return back()->with('success', 'Category updated successfully.');
        }

        if ($tab === 'brands') {
            $brand = Brand::findOrFail($id);
            $brand->update(['name' => $validated['name']]);

            return back()->with('success', 'Brand updated successfully.');
        }

        $type = $this->mapTabToType($tab);

        $item = CatalogAttribute::query()
            ->where('type', $type)
            ->where('id', $id)
            ->firstOrFail();

        $item->update([
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Catalog item updated successfully.');
    }

    public function destroy(string $tab, int $id): RedirectResponse
    {
        if ($tab === 'categories') {
            $category = Category::findOrFail($id);
            $category->delete();

            return back()->with('success', 'Category deleted successfully.');
        }

        if ($tab === 'brands') {
            $brand = Brand::findOrFail($id);
            $brand->delete();

            return back()->with('success', 'Brand deleted successfully.');
        }

        $type = $this->mapTabToType($tab);

        $item = CatalogAttribute::query()
            ->where('type', $type)
            ->where('id', $id)
            ->firstOrFail();

        $item->delete();

        return back()->with('success', 'Catalog item deleted successfully.');
    }

    private function mapTabToType(string $tab): string
    {
        return match ($tab) {
            'sub_categories' => 'sub_category',
            'colors' => 'color',
            'sizes' => 'size',
            default => throw new \InvalidArgumentException('Invalid tab type.'),
        };
    }
}
