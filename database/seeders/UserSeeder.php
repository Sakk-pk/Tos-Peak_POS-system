<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
        $user = User::updateOrCreate(['email' => 'admin@gmail.com'], [
            'name' => 'admin',
            'password' => Hash::make('123456')
        ]);
        
        $role = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $permissions = Permission::pluck('id','id')->all();
        $role->syncPermissions($permissions);
        $user->syncRoles([$role->name]);
    }
}
