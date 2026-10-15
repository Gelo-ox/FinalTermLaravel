<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\Supplier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PDO;

class ImportLegacyInventory extends Command
{
    protected $signature = 'inventory:import-legacy {--database=inventory_system : Source MySQL database}';

    protected $description = 'Copy the original inventory into empty inventory tables, preserving stock and history';

    public function handle(): int
    {
        if (Product::exists() || Category::exists() || Supplier::exists() || StockTransaction::exists()) {
            $this->error('Import requires empty target inventory tables. No records were changed.');

            return self::FAILURE;
        }
        $name = $this->option('database');
        if (! preg_match('/^[a-zA-Z0-9_]+$/', $name)) {
            $this->error('Invalid source database name.');

            return self::FAILURE;
        }
        $source = new PDO('mysql:host='.config('database.connections.mysql.host').';port='.config('database.connections.mysql.port').';dbname='.$name.';charset=utf8mb4', config('database.connections.mysql.username'), config('database.connections.mysql.password'), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
        // A consistent, read-only snapshot; this command never writes to the source.
        $source->exec('SET TRANSACTION READ ONLY');
        $source->beginTransaction();
        try {
            $categories = $source->query('SELECT * FROM categories')->fetchAll();
            $suppliers = $source->query('SELECT * FROM suppliers')->fetchAll();
            $products = $source->query('SELECT * FROM products')->fetchAll();
            $transactions = $source->query('SELECT * FROM stock_transactions ORDER BY transaction_id')->fetchAll();
            $source->commit();
            $reconciliations = 0;
            DB::transaction(function () use ($categories, $suppliers, $products, $transactions, &$reconciliations) {
                $categoryIds = $supplierIds = $productIds = $balances = [];
                foreach ($categories as $row) {
                    $model = new Category(['category_name' => $row['category_name'], 'description' => $row['description']]);
                    $model->created_at = $row['created_at'];
                    $model->updated_at = $row['created_at'];
                    $model->save();
                    $categoryIds[$row['category_id']] = $model->id;
                }
                foreach ($suppliers as $row) {
                    $model = new Supplier(array_intersect_key($row, array_flip(['supplier_name', 'contact_person', 'phone', 'email', 'address'])));
                    $model->created_at = $row['created_at'];
                    $model->updated_at = $row['created_at'];
                    $model->save();
                    $supplierIds[$row['supplier_id']] = $model->id;
                }
                foreach ($products as $row) {
                    if ($row['quantity'] < 0 || $row['quantity'] > 2147483647 || $row['unit_price'] < 0 || $row['reorder_level'] < 0) {
                        throw new \RuntimeException('Invalid legacy numeric values for SKU '.$row['sku'].'. Import rolled back.');
                    }
                    $model = new Product(array_intersect_key($row, array_flip(['product_name', 'sku', 'quantity', 'unit_price', 'reorder_level'])));
                    $model->category_id = $categoryIds[$row['category_id']] ?? null;
                    $model->supplier_id = $supplierIds[$row['supplier_id']] ?? null;
                    $model->created_at = $row['created_at'];
                    $model->updated_at = $row['updated_at'];
                    $model->save();
                    $productIds[$row['product_id']] = $model->id;
                    $balances[$model->id] = 0;
                }
                foreach ($transactions as $row) {
                    if (! isset($productIds[$row['product_id']]) || $row['quantity'] <= 0 || ! in_array($row['transaction_type'], ['IN', 'OUT'])) {
                        throw new \RuntimeException('Invalid legacy stock transaction. Import rolled back.');
                    }
                    $id = $productIds[$row['product_id']];
                    $entry = new StockTransaction(['product_id' => $id, 'transaction_type' => $row['transaction_type'], 'quantity' => $row['quantity'], 'remarks' => $row['remarks']]);
                    $entry->created_at = $row['transaction_date'];
                    $entry->updated_at = $row['transaction_date'];
                    $entry->save();
                    $balances[$id] += $row['transaction_type'] === 'IN' ? $row['quantity'] : -$row['quantity'];
                }
                foreach (Product::all() as $product) {
                    $difference = $product->quantity - $balances[$product->id];
                    if ($difference === 0) {
                        continue;
                    }
                    // Preserve current stock; add an explicit migration reconciliation instead of changing history.
                    $product->stockTransactions()->create(['transaction_type' => $difference > 0 ? 'IN' : 'OUT', 'quantity' => abs($difference), 'remarks' => 'Migration reconciliation: legacy stock differs from recorded movements.']);
                    $reconciliations++;
                }
            });
            $this->info('Imported '.count($products).' products, '.count($transactions).' historical movements, and '.$reconciliations.' reconciliation entries. Original database unchanged.');

            return self::SUCCESS;
        } catch (\Throwable $exception) {
            if ($source->inTransaction()) {
                $source->rollBack();
            }
            $this->error($exception->getMessage());

            return self::FAILURE;
        }
    }
}
