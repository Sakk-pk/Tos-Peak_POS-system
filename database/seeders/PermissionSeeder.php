<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Simplified POS permission model.
     *
     * "view-*"   = read-only access to the module
     * "manage-*" = full CRUD access to the module
     */
    public function run(): void
    {
        // Reset Spatie's permission cache so changes take effect immediately
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view-dashboard',
            'manage-pos',
            'manage-products',
            'manage-variants',
            'manage-inventory',
            'manage-orders',
            'manage-payments',
            'manage-customers',
            'manage-staff',
            'manage-roles',
            'view-notifications',
            'view-reports',
            'manage-settings',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(
                ['name' => $permissionName, 'guard_name' => 'web']
            );
        }

        // Remove legacy CRUD permissions that are no longer used
        $legacyPermissions = [
            'role-list', 'role-create', 'role-edit', 'role-delete',
            'user-list', 'user-create', 'user-edit', 'user-delete',
            'category-list', 'category-create', 'category-edit', 'category-delete',
        ];

        Permission::whereIn('name', $legacyPermissions)->delete();
    }
}
