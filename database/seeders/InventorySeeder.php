<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Services\InventoryService;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [];
        foreach (['Electronics' => 'Electronic gadgets and accessories', 'Office Supplies' => 'Pens, paper, and other office items', 'Furniture' => 'Chairs, tables, and storage', 'Groceries' => 'Consumable goods'] as $name => $description) {
            $categories[] = Category::firstOrCreate(['category_name' => $name], ['description' => $description]);
        }
        $suppliers = [];
        foreach ([['TechWorld Distributors', 'Juan Dela Cruz', '0917-123-4567', 'juan@techworld.com', 'Manila, Philippines'], ['Office Depot PH', 'Maria Santos', '0918-765-4321', 'maria@officedepot.ph', 'Quezon City, Philippines'], ['Home Comfort Furnishings', 'Pedro Reyes', '0919-555-1212', 'pedro@homecomfort.com', 'Cavite, Philippines']] as $row) {
            $suppliers[] = Supplier::firstOrCreate(['supplier_name' => $row[0]], array_combine(['contact_person', 'phone', 'email', 'address'], array_slice($row, 1)));
        }
        foreach ([['Wireless Mouse', 'ELEC-001', 0, 0, 50, 299, 10], ['USB-C Cable 1m', 'ELEC-002', 0, 0, 120, 149, 20], ['Ballpoint Pen (Box of 12)', 'OFF-001', 1, 1, 200, 85, 30], ['Bond Paper A4 (Ream)', 'OFF-002', 1, 1, 80, 210, 15], ['Ergonomic Office Chair', 'FUR-001', 2, 2, 15, 3499, 5], ['Study Table', 'FUR-002', 2, 2, 8, 2899, 5]] as $row) {
            if (Product::where('sku', $row[1])->exists()) {
                continue;
            }
            $product = Product::create(['product_name' => $row[0], 'sku' => $row[1], 'category_id' => $categories[$row[2]]->id, 'supplier_id' => $suppliers[$row[3]]->id, 'quantity' => 0, 'unit_price' => $row[5], 'reorder_level' => $row[6]]);
            app(InventoryService::class)->record(['product_id' => $product->id, 'transaction_type' => 'IN', 'quantity' => $row[4], 'remarks' => 'Initial stock'], null);
            if ($row[1] === 'ELEC-001') {
                app(InventoryService::class)->record(['product_id' => $product->id, 'transaction_type' => 'OUT', 'quantity' => 5, 'remarks' => 'Sold to walk-in customer'], null);
            }
        }
    }
}
