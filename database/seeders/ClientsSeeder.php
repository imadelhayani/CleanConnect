<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ClientsSeeder extends Seeder
{
    public function run()
    {
        // Create 15 new client users
        User::factory()->count(15)->create([
            'role' => 'client',
            'password' => Hash::make('password'), // optional, factory already sets password
        ]);
    }
}
