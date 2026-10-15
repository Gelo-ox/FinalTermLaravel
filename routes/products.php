<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::resource('products', ProductController::class)->middlewareFor(['index', 'show'], 'permission:products.view')->middlewareFor(['create', 'store', 'edit', 'update'], 'permission:products.manage')->middlewareFor('destroy', 'permission:products.delete');
