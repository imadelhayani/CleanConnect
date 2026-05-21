<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Insert defaults
        DB::table('settings')->insert([
            ['key' => 'booking_acceptance_percentage', 'value' => '10', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'admin_bank_account', 'value' => '000000000000000000', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'admin_bank_holder', 'value' => 'Admin Name', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('settings');
    }
};
