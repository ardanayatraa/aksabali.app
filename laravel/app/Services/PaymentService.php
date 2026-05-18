<?php

namespace App\Services;

use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Midtrans Snap integration buat upgrade Premium.
 * Tidak ada SDK eksternal — pakai HTTP langsung ke Snap API.
 */
class PaymentService
{
    /** Plans yang tersedia + harga. */
    public const PLANS = [
        'lifetime' => [
            'name' => 'Premium Lifetime',
            'amount' => 49000, // Rp 49rb
            'currency' => 'IDR',
        ],
        'only25k' => [
            'name' => 'Premium Promo Awal',
            'amount' => 25000, // Rp 25rb
            'currency' => 'IDR',
            'promo_code' => 'only25k',
        ],
    ];

    /**
     * Bikin transaksi pending + minta Snap token ke Midtrans.
     *
     * @return array{transaction: PaymentTransaction, snap_token: string|null, redirect_url: string|null}
     */
    public function createTransaction(User $user, string $plan): array
    {
        if (! isset(self::PLANS[$plan])) {
            throw new RuntimeException("Plan '{$plan}' tidak dikenal.");
        }

        $planMeta = self::PLANS[$plan];
        $orderId = 'AKS-' . strtoupper(Str::random(12));

        $transaction = PaymentTransaction::create([
            'id' => $orderId,
            'user_id' => $user->id,
            'plan' => $plan,
            'amount' => $planMeta['amount'],
            'currency' => $planMeta['currency'],
            'status' => 'pending',
            'promo_code' => $planMeta['promo_code'] ?? null,
        ]);

        $snapToken = null;
        $redirectUrl = null;

        $serverKey = config('services.midtrans.server_key');
        if ($serverKey) {
            try {
                $isProduction = (bool) config('services.midtrans.is_production', false);
                $endpoint = $isProduction
                    ? 'https://app.midtrans.com/snap/v1/transactions'
                    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

                $payload = [
                    'transaction_details' => [
                        'order_id' => $orderId,
                        'gross_amount' => $planMeta['amount'],
                    ],
                    'customer_details' => [
                        'first_name' => $user->display_name ?? $user->name ?? 'Pengguna',
                        'email' => $user->email,
                    ],
                    'item_details' => [
                        [
                            'id' => $plan,
                            'price' => $planMeta['amount'],
                            'quantity' => 1,
                            'name' => $planMeta['name'],
                        ],
                    ],
                    'callbacks' => [
                        'finish' => url('/payment/finish?order_id=' . $orderId),
                    ],
                ];

                $response = Http::withBasicAuth($serverKey, '')
                    ->acceptJson()
                    ->asJson()
                    ->post($endpoint, $payload);

                if ($response->successful()) {
                    $body = $response->json();
                    $snapToken = $body['token'] ?? null;
                    $redirectUrl = $body['redirect_url'] ?? null;
                    $transaction->update([
                        'midtrans_response' => array_merge(
                            $transaction->midtrans_response ?? [],
                            ['snap' => $body]
                        ),
                    ]);
                } else {
                    Log::warning('Midtrans Snap gagal', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Midtrans Snap exception: ' . $e->getMessage());
            }
        }

        return [
            'transaction' => $transaction,
            'snap_token' => $snapToken,
            'redirect_url' => $redirectUrl,
        ];
    }

    /**
     * Handle webhook Midtrans — set status transaksi + upgrade user kalau success.
     */
    public function handleWebhook(array $payload): PaymentTransaction
    {
        $orderId = $payload['order_id'] ?? null;
        if (! $orderId) {
            throw new RuntimeException('order_id missing in webhook payload.');
        }

        /** @var PaymentTransaction|null $transaction */
        $transaction = PaymentTransaction::find($orderId);
        if (! $transaction) {
            throw new RuntimeException("Transaction {$orderId} not found.");
        }

        $status = $this->mapMidtransStatus(
            $payload['transaction_status'] ?? null,
            $payload['fraud_status'] ?? null
        );

        $transaction->update([
            'status' => $status,
            'payment_type' => $payload['payment_type'] ?? $transaction->payment_type,
            'midtrans_transaction_id' => $payload['transaction_id'] ?? $transaction->midtrans_transaction_id,
            'midtrans_response' => array_merge(
                $transaction->midtrans_response ?? [],
                ['webhook' => $payload]
            ),
            'paid_at' => $status === 'success' ? now() : $transaction->paid_at,
        ]);

        if ($status === 'success' && $transaction->user) {
            $transaction->user->update([
                'tier' => 'premium',
            ]);
        }

        return $transaction->fresh();
    }

    /**
     * Map status Midtrans → status internal.
     */
    private function mapMidtransStatus(?string $transactionStatus, ?string $fraudStatus): string
    {
        return match ($transactionStatus) {
            'capture' => $fraudStatus === 'accept' ? 'success' : 'pending',
            'settlement' => 'success',
            'pending' => 'pending',
            'deny', 'cancel' => 'failed',
            'expire' => 'expired',
            'refund', 'partial_refund' => 'refunded',
            default => 'pending',
        };
    }
}
