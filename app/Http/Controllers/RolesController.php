<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Models\User;

class RolesController extends Controller
{
    /**
     * Permission catalogue — defines the display order and label for every
     * permission in the simplified View / Manage model.
     */
    private const PERMISSION_CATALOGUE = [
        'view-dashboard'    => ['label' => 'Dashboard',          'type' => 'view'],
        'manage-pos'        => ['label' => 'POS',                'type' => 'manage'],
        'manage-products'   => ['label' => 'Products',           'type' => 'manage'],
        'manage-variants'   => ['label' => 'Variants',           'type' => 'manage'],
        'manage-inventory'  => ['label' => 'Inventory',          'type' => 'manage'],
        'manage-orders'     => ['label' => 'Orders',             'type' => 'manage'],
        'manage-payments'   => ['label' => 'Payments',           'type' => 'manage'],
        'manage-customers'  => ['label' => 'Customers',          'type' => 'manage'],
        'manage-staff'      => ['label' => 'Staff',              'type' => 'manage'],
        'manage-roles'      => ['label' => 'Roles & Permissions','type' => 'manage'],
        'view-notifications'=> ['label' => 'Notifications',      'type' => 'view'],
        'view-reports'      => ['label' => 'Reports',            'type' => 'view'],
        'manage-settings'   => ['label' => 'Settings',           'type' => 'manage'],
    ];

    /** Roles that cannot be deleted by users. */
    private const PROTECTED_ROLES = ['Admin', 'Manager', 'Staff'];

    public function index()
    {
        // Ensure the three default roles always exist
        foreach (self::PROTECTED_ROLES as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        $roles = Role::with('permissions')
            ->orderByRaw("CASE WHEN name = 'Admin' THEN 1 WHEN name = 'Manager' THEN 2 WHEN name = 'Staff' THEN 3 ELSE 4 END")
            ->orderBy('name')
            ->get();

        $rolesWithUserCount = $roles->map(function ($role) {
            return [
                'id'          => $role->id,
                'name'        => $role->name,
                'is_system'   => in_array($role->name, self::PROTECTED_ROLES),
                'users_count' => User::role($role->name)->count(),
                'permissions' => $role->permissions->pluck('name')->values(),
            ];
        });

        // Build the ordered permission catalogue from the DB
        $dbPermissions = Permission::whereIn('name', array_keys(self::PERMISSION_CATALOGUE))
            ->get()
            ->keyBy('name');

        $catalogue = collect(self::PERMISSION_CATALOGUE)
            ->map(function ($meta, $permName) use ($dbPermissions) {
                $perm = $dbPermissions->get($permName);
                return $perm ? [
                    'id'    => $perm->id,
                    'name'  => $perm->name,
                    'label' => $meta['label'],
                    'type'  => $meta['type'],
                ] : null;
            })
            ->filter()
            ->values();

        return Inertia::render('Admin/Roles/RolesListPage', [
            'roles'       => $rolesWithUserCount,
            'permissions' => $catalogue,
        ]);
    }

    public function create()
    {
        $permissions = Permission::whereIn('name', array_keys(self::PERMISSION_CATALOGUE))
            ->get(['id', 'name']);

        return Inertia::render('Admin/Roles/RoleFormPage', [
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|min:3|unique:roles,name',
            'permissions'   => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create([
            'name'       => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return to_route('roles.index')->with('success', 'Role created successfully.');
    }

    public function edit($id)
    {
        $role = Role::with(['permissions'])->findOrFail($id);

        $permissions = Permission::whereIn('name', array_keys(self::PERMISSION_CATALOGUE))
            ->get(['id', 'name']);

        return Inertia::render('Admin/Roles/RoleFormPage', [
            'role'        => [
                'id'          => $role->id,
                'name'        => $role->name,
                'is_system'   => in_array($role->name, self::PROTECTED_ROLES),
                'permissions' => $role->permissions->pluck('name')->values(),
            ],
            'permissions' => $permissions,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name'          => 'required|min:3|unique:roles,name,' . $id,
            'permissions'   => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::findById($id);

        // Prevent renaming protected roles
        if (!in_array($role->name, self::PROTECTED_ROLES)) {
            $role->name = $validated['name'];
            $role->save();
        }

        $role->syncPermissions($validated['permissions'] ?? []);

        return to_route('roles.index')->with('success', 'Role updated successfully.');
    }

    public function destroy($id)
    {
        $role = Role::findById($id);

        if (in_array($role->name, self::PROTECTED_ROLES)) {
            return to_route('roles.index')->with('error', 'System roles cannot be deleted.');
        }

        $role->delete();

        return to_route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
