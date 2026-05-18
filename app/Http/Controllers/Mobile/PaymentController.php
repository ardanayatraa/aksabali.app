<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $service) {}

    /** List plan + harga. */
    public function plans(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => collect(PaymentService::PLANS)
                ->map(fn ($meta, $id) => array_merge($meta, ['id' => $id]))
                ->values()
                ->all(),
        ]);
    }

    /** Bikin transaksi → return Snap token. */
    public function checkout(Request $request): JsonResponse
    {
        $data = $request->validate(['plan' => 'required|string']);

        try {
            $result = $this->service->createTransaction($request->user(), $data['plan']);
        } catch (Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'transaction_id' => $result['transaction']->id,
                'snap_token' => $result['snap_token'],
                'redirect_url' => $result['redirect_url'],
                'amount' => (int) $result['transaction']->amount,
                'currency' => $result['transaction']->currency,
                'status' => $result['transaction']->status,
            ],
        ], 201);
    }

    /** Cek status transaksi. */
    public function status(PaymentTransaction $transaction, Request $request): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'forbidden'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $transaction->id,
                'status' => $transaction->status,
                'paid_at' => $transaction->paid_at?->toIso8601String(),
                'tier' => $request->user()->fresh()->tier,
            ],
        ]);
    }
}
