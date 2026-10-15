<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockTransaction;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockTransactionController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate(['search' => 'nullable|string|max:150']);
        $query = StockTransaction::with(['product', 'user'])->latest('id');
        if ($search = $filters['search'] ?? '') {
            $query->whereHas('product', fn ($q) => $q->where('product_name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%"));
        }

        return Inertia::render('Transactions/Index', ['transactions' => $query->paginate(20)->withQueryString(), 'filters' => $filters]);
    }

    public function create()
    {
        return Inertia::render('Transactions/Form', ['products' => Product::orderBy('product_name')->get(['id', 'product_name', 'sku', 'quantity'])]);
    }

    public function store(Request $request, InventoryService $inventory)
    {
        $data = $request->validate(['product_id' => 'required|integer|exists:products,id', 'transaction_type' => 'required|in:IN,OUT', 'quantity' => 'required|integer|min:1|max:2147483647', 'remarks' => 'nullable|string|max:255']);
        $inventory->record($data, $request->user()->id);

        return to_route('transactions.index')->with('success', 'Stock movement recorded.');
    }

    public function show(StockTransaction $transaction)
    {
        return Inertia::render('Transactions/Show', ['transaction' => $transaction->load(['product', 'user'])]);
    }

    public function destroy(StockTransaction $transaction, InventoryService $inventory)
    {
        $inventory->reverse($transaction);

        return back()->with('success', 'Movement deleted and stock reversed.');
    }
}
