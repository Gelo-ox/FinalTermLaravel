<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate(['search' => 'nullable|string|max:150', 'category_id' => 'nullable|integer|exists:categories,id']);
        $query = Product::with(['category', 'supplier'])->latest('id');
        if ($search = $filters['search'] ?? '') {
            $query->where(fn ($q) => $q->where('product_name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%"));
        }
        if ($category = $filters['category_id'] ?? null) {
            $query->where('category_id', $category);
        }

        return Inertia::render('Products/Index', ['products' => $query->paginate(15)->withQueryString(), 'categories' => Category::orderBy('category_name')->get(), 'filters' => $filters]);
    }

    public function create()
    {
        return Inertia::render('Products/Form', $this->formData(null));
    }

    public function store(Request $request, InventoryService $inventory)
    {
        $data = $this->validated($request);
        DB::transaction(function () use ($data, $request, $inventory) {
            $quantity = (int) $data['quantity'];
            $product = Product::create([...$data, 'quantity' => 0]);
            if ($quantity) {
                $inventory->record(['product_id' => $product->id, 'transaction_type' => 'IN', 'quantity' => $quantity, 'remarks' => 'Opening stock'], $request->user()->id);
            }
        });

        return to_route('products.index')->with('success', 'Product added.');
    }

    public function show(Product $product)
    {
        return Inertia::render('Products/Show', ['product' => $product->load(['category', 'supplier', 'stockTransactions' => fn ($q) => $q->latest()->limit(50)])]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('Products/Form', $this->formData($product));
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validated($request, $product);
        unset($data['quantity']);
        $product->update($data);

        return to_route('products.index')->with('success', 'Product updated. Use stock movements to adjust quantities.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return to_route('products.index')->with('success', 'Product and its stock history deleted.');
    }

    private function formData(?Product $product): array
    {
        return ['product' => $product, 'categories' => Category::orderBy('category_name')->get(), 'suppliers' => Supplier::orderBy('supplier_name')->get()];
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        return $request->validate(['product_name' => 'required|string|max:150', 'sku' => ['required', 'string', 'max:50', Rule::unique('products')->ignore($product)], 'category_id' => 'nullable|integer|exists:categories,id', 'supplier_id' => 'nullable|integer|exists:suppliers,id', 'quantity' => $product ? 'prohibited' : 'required|integer|min:0|max:2147483647', 'unit_price' => 'required|numeric|min:0|max:99999999.99|decimal:0,2', 'reorder_level' => 'required|integer|min:0|max:2147483647']);
    }
}
