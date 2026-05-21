<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('sweepstar_profiles', function (Blueprint $table) {
            $table->decimal('points_balance', 10, 2)->default(0)->after('total_jobs_completed');
        });
    }

    public function down()
    {
        Schema::table('sweepstar_profiles', function (Blueprint $table) {
            $table->dropColumn('points_balance');
        });
    }
};
