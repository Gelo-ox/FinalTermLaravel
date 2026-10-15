<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public function record(array $data, ?int $userId): StockTransaction
    {
        return DB::transaction(function () use ($data, $userId) {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);
            $quantity = (int) $data['quantity'];
            $next = $product->quantity + ($data['transaction_type'] === 'IN' ? $quantity : -$quantity);
            if ($next < 0 || $next > 2147483647) {
                throw ValidationException::withMessages(['quantity' => 'Stock movement exceeds the available stock or supported quantity.']);
            }
            $product->update(['quantity' => $next]);

            return $product->stockTransactions()->create([...$data, 'user_id' => $userId]);
        }, 3);
    }

    public function reverse(StockTransaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $product = Product::lockForUpdate()->findOrFail($transaction->product_id);
            $entry = StockTransaction::lockForUpdate()->findOrFail($transaction->id);
            $next = $product->quantity + ($entry->transaction_type === 'IN' ? -$entry->quantity : $entry->quantity);
            if ($next < 0 || $next > 2147483647) {
                throw ValidationException::withMessages(['transaction' => 'This movement cannot be reversed because the resulting stock would be invalid.']);
            }
            $product->update(['quantity' => $next]);
            $entry->delete();
        }, 3);
    }
}
