<?php

use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;

Route::resource('categories', CategoryController::class)->middlewareFor(['index', 'show'], 'permission:categories.view')->middlewareFor(['create', 'store', 'edit', 'update', 'destroy'], 'permission:categories.manage');
