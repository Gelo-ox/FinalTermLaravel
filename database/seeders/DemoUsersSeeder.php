<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing')) {
            return;
        }
        foreach (['Admin', 'Manager', 'User'] as $role) {
            $user = User::firstOrCreate(['email' => strtolower($role).'@inventrack.test'], ['name' => $role.' Demo', 'password' => 'Inventory123!', 'email_verified_at' => now()]);
            $user->syncRoles([$role]);
        }
    }
}
