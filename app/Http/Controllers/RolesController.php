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
    public function index()
    {
        $baseRoles = ['Admin', 'Manager', 'Staff'];

        foreach ($baseRoles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        $roles = Role::with('permissions')
            ->orderByRaw("CASE WHEN name = 'Admin' THEN 1 WHEN name = 'Manager' THEN 2 WHEN name = 'Staff' THEN 3 ELSE 4 END")
            ->orderBy('name')
            ->get();

        $rolesWithUserCount = $roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => User::role($role->name)->count(),
                'permissions' => $role->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                    ];
                })->values(),
            ];
        });

        $permissions = Permission::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Roles/RolesListPage', [
            'roles' => $rolesWithUserCount,
            'permissions' => $permissions,
        ]);
    }

    public function create()
    {
        $permissions = Permission::all();

        return Inertia::render('Roles/RoleFormPage', [
            'permissions' => $permissions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|min:3|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (!empty($validated['permissions'])) {
            $permissions = Permission::whereIn('id', $validated['permissions'])->pluck('name');
            $role->syncPermissions($permissions);
        }

        return to_route('roles.index')->with("success", "Role added successfully");
    }

    public function edit($id)
    {
        $role = Role::with(['permissions'])->find($id);

        $permissions = Permission::all();

        return Inertia::render('Roles/RoleFormPage', [
            'role' => $role,
            'permissions' => $permissions
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|min:3|unique:roles,name,' . $id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        $role = Role::findById($id);

        $role->name = $validated['name'];

        $role->save();

        $permissionIds = $validated['permissions'] ?? [];
        $permissions = Permission::whereIn('id', $permissionIds)->pluck('name');

        $role->syncPermissions($permissions);

        return to_route('roles.index')->with("success", "Role updated successfully");
    }

    public function destroy($id)
    {
        $role = Role::findById($id);

        $role->delete();

        return to_route('roles.index')->with("success", "Role Deleted successfully");
    }
}
