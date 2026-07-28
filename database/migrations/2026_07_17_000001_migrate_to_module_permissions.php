<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    private const MODULES = [
        'dashboard', 'pos', 'catalog', 'products', 'inventory', 'orders',
        'customers', 'team-members', 'roles',
    ];

    private const LEGACY_MAP = [
        'view-dashboard' => 'dashboard',
        'manage-pos' => 'pos',
        'manage-settings' => 'catalog',
        'manage-products' => 'products',
        'manage-variants' => 'products',
        'manage-inventory' => 'inventory',
        'manage-orders' => 'orders',
        'manage-payments' => 'orders',
        'manage-customers' => 'customers',
        'manage-staff' => 'team-members',
        'manage-roles' => 'roles',
    ];

    public function up(): void
    {
        foreach (self::MODULES as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $permission, 'guard_name' => 'web'],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        $permissions = DB::table('permissions')->pluck('id', 'name');
        $moduleIds = collect(self::MODULES)->mapWithKeys(
            fn (string $name) => [$name => $permissions[$name]]
        );

        foreach (self::LEGACY_MAP as $legacy => $module) {
            $legacyId = $permissions[$legacy] ?? null;
            if (! $legacyId) {
                continue;
            }

            foreach (DB::table('role_has_permissions')->where('permission_id', $legacyId)->get() as $grant) {
                DB::table('role_has_permissions')->insertOrIgnore([
                    'permission_id' => $moduleIds[$module],
                    'role_id' => $grant->role_id,
                ]);
            }

            foreach (DB::table('model_has_permissions')->where('permission_id', $legacyId)->get() as $grant) {
                DB::table('model_has_permissions')->insertOrIgnore([
                    'permission_id' => $moduleIds[$module],
                    'model_type' => $grant->model_type,
                    'model_id' => $grant->model_id,
                ]);
            }
        }

        $modulePermissionIds = $moduleIds->values()->all();
        DB::table('role_has_permissions')->whereNotIn('permission_id', $modulePermissionIds)->delete();
        DB::table('model_has_permissions')->whereNotIn('permission_id', $modulePermissionIds)->delete();
        DB::table('permissions')->whereNotIn('id', $modulePermissionIds)->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Legacy action-level permissions are intentionally not restored.
    }
};
