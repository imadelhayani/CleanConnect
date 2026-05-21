<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sweepstar_id')->constrained('users')->onDelete('cascade');
            $table->string('code')->unique();                  // motif
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('sender_account_number')->nullable();           // sweepstar's bank account
            $table->string('sender_account_name')->nullable();             // sweepstar's full name
            $table->string('screenshot_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_verifications');
    }
};
