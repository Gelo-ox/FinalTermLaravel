<?php

use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::resource('suppliers', SupplierController::class)->middlewareFor(['index', 'show'], 'permission:suppliers.view')->middlewareFor(['create', 'store', 'edit', 'update', 'destroy'], 'permission:suppliers.manage');
