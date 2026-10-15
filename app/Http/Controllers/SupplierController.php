<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        return Inertia::render('Catalog/Index', ['kind' => 'suppliers', 'rows' => Supplier::withCount('products')->orderBy('supplier_name')->get()]);
    }

    public function create()
    {
        return Inertia::render('Catalog/Form', ['kind' => 'suppliers', 'record' => null]);
    }

    public function store(Request $request)
    {
        Supplier::create($this->validated($request));

        return to_route('suppliers.index')->with('success', 'Supplier added.');
    }

    public function show(Supplier $supplier)
    {
        return Inertia::render('Catalog/Show', ['kind' => 'suppliers', 'record' => $supplier->load('products')]);
    }

    public function edit(Supplier $supplier)
    {
        return Inertia::render('Catalog/Form', ['kind' => 'suppliers', 'record' => $supplier]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $supplier->update($this->validated($request));

        return to_route('suppliers.index')->with('success', 'Supplier updated.');
    }

    public function destroy(Supplier $supplier)
    {
        if ($supplier->products()->exists()) {
            return back()->withErrors(['delete' => 'Move or delete the products supplied by this supplier first.']);
        }
        $supplier->delete();

        return back()->with('success', 'Supplier deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate(['supplier_name' => 'required|string|max:150', 'contact_person' => 'nullable|string|max:100', 'phone' => 'nullable|string|max:50', 'email' => 'nullable|email|max:100', 'address' => 'nullable|string|max:255']);
    }
}
