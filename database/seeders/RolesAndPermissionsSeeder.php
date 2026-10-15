<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $read = ['dashboard.view', 'products.view', 'categories.view', 'suppliers.view', 'transactions.view'];
        $manage = ['products.manage', 'categories.manage', 'suppliers.manage', 'transactions.create'];
        $all = [...$read, ...$manage, 'products.delete', 'transactions.delete', 'users.manage'];
        foreach ($all as $permission) {
            Permission::findOrCreate($permission, 'web');
        }
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Role::findOrCreate('Admin', 'web')->syncPermissions($all);
        Role::findOrCreate('Manager', 'web')->syncPermissions([...$read, ...$manage]);
        Role::findOrCreate('User', 'web')->syncPermissions($read);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
