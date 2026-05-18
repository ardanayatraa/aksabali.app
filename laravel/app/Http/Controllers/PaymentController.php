<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $service) {}

    /** Halaman harga + tombol Ambil Premium: `/harga` (alias `/pricing`). */
    public function pricing(Request $request): Response
    {
        return Inertia::render('pricing', [
            'plans' => collect(PaymentService::PLANS)
                ->map(fn ($meta, $key) => array_merge($meta, ['id' => $key]))
                ->values()
                ->all(),
            'currentTier' => $request->user()?->tier,
        ]);
    }

    /** Bikin transaksi + redirect ke checkout Snap: `POST /payment/checkout`. */
    public function checkout(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'plan' => 'required|string',
        ]);

        try {
            $result = $this->service->createTransaction($request->user(), $data['plan']);
        } catch (Throwable $e) {
            return back()->withErrors(['plan' => $e->getMessage()]);
        }

        return redirect()->route('payment.show', ['transaction' => $result['transaction']->id]);
    }

    /** Halaman checkout Snap: `/payment/{transaction}`. */
    public function show(PaymentTransaction $transaction, Request $request): Response
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        $clientKey = config('services.midtrans.client_key');
        $isProduction = (bool) config('services.midtrans.is_production', false);

        $snapToken = $transaction->midtrans_response['snap']['token'] ?? null;
        $redirectUrl = $transaction->midtrans_response['snap']['redirect_url'] ?? null;

        return Inertia::render('payment/show', [
            'transaction' => [
                'id' => $transaction->id,
                'plan' => $transaction->plan,
                'amount' => (int) $transaction->amount,
                'currency' => $transaction->currency,
                'status' => $transaction->status,
                'paid_at' => $transaction->paid_at?->toIso8601String(),
            ],
            'snap' => [
                'client_key' => $clientKey,
                'token' => $snapToken,
                'redirect_url' => $redirectUrl,
                'is_production' => $isProduction,
            ],
        ]);
    }

    /** Polling status transaksi (JSON) — dipakai halaman checkout untuk update. */
    public function status(PaymentTransaction $transaction, Request $request): JsonResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        return response()->json([
            'status' => $transaction->status,
            'paid_at' => $transaction->paid_at?->toIso8601String(),
            'tier' => $request->user()->fresh()->tier,
        ]);
    }

    /** Endpoint webhook Midtrans: `POST /payment/midtrans-webhook` (public, signed via JSON payload). */
    public function webhook(Request $request): JsonResponse
    {
        try {
            $this->service->handleWebhook($request->all());
        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json(['ok' => true]);
    }

    /** Halaman finish — kalau user dibalikin dari Midtrans setelah bayar. */
    public function finish(Request $request): RedirectResponse
    {
        $orderId = $request->query('order_id');
        if ($orderId) {
            $transaction = PaymentTransaction::find($orderId);
            if ($transaction && $transaction->user_id === $request->user()?->id) {
                return redirect()->route('payment.show', ['transaction' => $transaction->id]);
            }
        }

        return redirect()->route('pricing');
    }
}
