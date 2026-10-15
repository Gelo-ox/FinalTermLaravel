<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\Supplier;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Dashboard', [
            'stats' => ['products' => Product::count(), 'categories' => Category::count(), 'suppliers' => Supplier::count(), 'value' => (float) Product::selectRaw('COALESCE(SUM(quantity * unit_price), 0) as value')->value('value')],
            'lowStock' => Product::with('category')->whereColumn('quantity', '<=', 'reorder_level')->orderBy('quantity')->get(),
            'recent' => StockTransaction::with('product')->latest('id')->limit(6)->get(),
        ]);
    }
}
