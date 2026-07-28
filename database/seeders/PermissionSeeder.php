<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /** Each permission grants complete access to one administration module. */
    public function run(): void
    {
        // Reset Spatie's permission cache so changes take effect immediately
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'dashboard', 'pos', 'catalog', 'products', 'inventory', 'orders',
            'customers', 'team-members', 'roles',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(
                ['name' => $permissionName, 'guard_name' => 'web']
            );
        }

        Permission::whereNotIn('name', $permissions)->delete();
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
