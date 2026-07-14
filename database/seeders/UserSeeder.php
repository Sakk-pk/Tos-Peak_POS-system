<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ── Admin ────────────────────────────────────────────────────────────
        $adminUser = User::updateOrCreate(['email' => 'admin@gmail.com'], [
            'name'           => 'admin',
            'password'       => Hash::make('123456'),
            'is_team_member' => true,
        ]);

        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        // Admin gets ALL permissions
        $allPermissions = Permission::pluck('name')->all();
        $adminRole->syncPermissions($allPermissions);
        $adminUser->syncRoles([$adminRole->name]);

        // ── Manager ──────────────────────────────────────────────────────────
        $managerUser = User::updateOrCreate(['email' => 'manager@gmail.com'], [
            'name'           => 'Manager Staff',
            'password'       => Hash::make('123456'),
            'is_team_member' => true,
        ]);

        $managerRole = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
        $managerRole->syncPermissions([
            'view-dashboard',
            'manage-pos',
            'manage-products',
            'manage-variants',
            'manage-inventory',
            'manage-orders',
            'manage-payments',
            'manage-customers',
            'view-notifications',
            'view-reports',
            // No: manage-staff, manage-roles, manage-settings
        ]);
        $managerUser->syncRoles([$managerRole->name]);

        // ── Staff ────────────────────────────────────────────────────────────
        $staffRole = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
        $staffRole->syncPermissions([
            'view-dashboard',
            'manage-pos',
            'manage-orders',
            'manage-payments',
            'manage-customers',
            'view-notifications',
            // No: manage-products, manage-variants, manage-inventory,
            //     manage-staff, manage-roles, view-reports, manage-settings
        ]);

        // ── Seed mock customers (is_team_member = false) ─────────────────────
        User::updateOrCreate(['email' => 'sarah.chen@example.com'], [
            'name'           => 'Sarah Chen',
            'phone'          => '+1 415 555 0142',
            'visits'         => 12,
            'is_team_member' => false,
            'password'       => Hash::make('123456'),
        ]);

        User::updateOrCreate(['email' => 'marcus.lee@example.com'], [
            'name'           => 'Marcus Lee',
            'phone'          => '+1 415 555 0188',
            'visits'         => 4,
            'is_team_member' => false,
            'password'       => Hash::make('123456'),
        ]);

        User::updateOrCreate(['email' => 'aisha.khan@example.com'], [
            'name'           => 'Aisha Khan',
            'phone'          => '+44 20 7946 0991',
            'visits'         => 7,
            'is_team_member' => false,
            'password'       => Hash::make('123456'),
        ]);

        User::updateOrCreate(['email' => 'daniel.park@example.com'], [
            'name'           => 'Daniel Park',
            'phone'          => '+82 10 4321 9988',
            'visits'         => 3,
            'is_team_member' => false,
            'password'       => Hash::make('123456'),
        ]);

        User::updateOrCreate(['email' => 'elena.rossi@example.com'], [
            'name'           => 'Elena Rossi',
            'phone'          => '+39 06 9876 1234',
            'visits'         => 9,
            'is_team_member' => false,
            'password'       => Hash::make('123456'),
        ]);

        User::updateOrCreate(['email' => 'john.doe@example.com'], [
            'name'           => 'John Doe',
            'phone'          => '+855 12 345 678',
            'visits'         => 4,
            'is_team_member' => false,
            'password'       => Hash::make('123456'),
        ]);

        User::updateOrCreate(['email' => 'sarah.c@example.com'], [
            'name'           => 'Sarah Connor',
            'phone'          => '+855 98 765 432',
            'visits'         => 7,
            'is_team_member' => false,
            'password'       => Hash::make('123456'),
        ]);
    }
}
