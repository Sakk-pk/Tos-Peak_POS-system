<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    /**
     * Create (or retrieve) the Admin role with all permissions and return a
     * user assigned to that role. Useful for feature tests that need to bypass
     * permission gates.
     */
    protected function createAdminUser(array $attributes = []): User
    {
        // Ensure all permissions exist
        $permissionNames = [
            'dashboard', 'pos', 'catalog', 'products', 'inventory', 'orders',
            'customers', 'team-members', 'roles',
        ];

        foreach ($permissionNames as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $role = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $role->syncPermissions($permissionNames);

        $user = User::factory()->create(array_merge(['is_team_member' => true], $attributes));
        $user->assignRole($role);

        return $user;
    }
}
