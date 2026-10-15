<?php

use App\Http\Controllers\StockTransactionController;
use Illuminate\Support\Facades\Route;

Route::resource('transactions', StockTransactionController::class)->except(['edit', 'update'])->middlewareFor(['index', 'show'], 'permission:transactions.view')->middlewareFor(['create', 'store'], 'permission:transactions.create')->middlewareFor('destroy', 'permission:transactions.delete');
