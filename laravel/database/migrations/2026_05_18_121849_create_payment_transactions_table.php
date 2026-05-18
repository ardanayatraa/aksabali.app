<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Riwayat transaksi pembayaran Midtrans untuk upgrade Premium.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->string('id', 64)->primary();                 // order_id Midtrans (UUID atau slug)
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('plan', 32);                          // lifetime, school, only25k
            $table->integer('amount');                           // dalam rupiah
            $table->string('currency', 3)->default('IDR');
            $table->enum('status', ['pending', 'success', 'failed', 'expired', 'refunded'])->default('pending');
            $table->string('promo_code')->nullable();            // only25k, dll
            $table->string('payment_type')->nullable();          // qris, gopay, bank_transfer, dll
            $table->string('midtrans_transaction_id')->nullable();
            $table->json('midtrans_response')->nullable();       // raw response/webhook payload
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('promo_code');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
