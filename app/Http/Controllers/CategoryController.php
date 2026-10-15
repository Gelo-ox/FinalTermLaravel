<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Catalog/Index', ['kind' => 'categories', 'rows' => Category::withCount('products')->orderBy('category_name')->get()]);
    }

    public function create()
    {
        return Inertia::render('Catalog/Form', ['kind' => 'categories', 'record' => null]);
    }

    public function store(Request $request)
    {
        Category::create($this->validated($request));

        return to_route('categories.index')->with('success', 'Category added.');
    }

    public function show(Category $category)
    {
        return Inertia::render('Catalog/Show', ['kind' => 'categories', 'record' => $category->load('products')]);
    }

    public function edit(Category $category)
    {
        return Inertia::render('Catalog/Form', ['kind' => 'categories', 'record' => $category]);
    }

    public function update(Request $request, Category $category)
    {
        $category->update($this->validated($request));

        return to_route('categories.index')->with('success', 'Category updated.');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->exists()) {
            return back()->withErrors(['delete' => 'Move or delete the products in this category first.']);
        }
        $category->delete();

        return back()->with('success', 'Category deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate(['category_name' => 'required|string|max:100', 'description' => 'nullable|string|max:255']);
    }
}
