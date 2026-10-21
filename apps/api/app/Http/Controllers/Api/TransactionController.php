<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $transactions = Transaction::query()
            ->where('user_id', Auth::id())
            ->with(['wallet', 'category', 'transferWallet'])
            ->when($request->month, function ($query, $month) {
                $query->whereBetween('occurred_at', [
                    $month.'-01 00:00:00',
                    date('Y-m-t 23:59:59', strtotime($month.'-01')),
                ]);
            })
            ->when($request->type, fn ($query, $type) => $query->where('type', $type))
            ->when($request->wallet_id, fn ($query, $walletId) => $query->where('wallet_id', $walletId))
            ->when($request->category_id, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($request->search, function ($query, $search) {
                $query->where('note', 'ilike', '%'.$search.'%');
            })
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 20));

        return TransactionResource::collection($transactions);
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        $transaction = DB::transaction(fn () => Transaction::query()->create($data));

        return TransactionResource::make(
            $transaction->load(['wallet', 'category', 'transferWallet'])
        )->response()->setStatusCode(201);
    }

    public function show(Transaction $transaction): TransactionResource
    {
        $this->authorizeOwnership($transaction);

        return TransactionResource::make(
            $transaction->load(['wallet', 'category', 'transferWallet'])
        );
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): TransactionResource
    {
        $this->authorizeOwnership($transaction);

        $transaction->update($request->validated());

        return TransactionResource::make(
            $transaction->load(['wallet', 'category', 'transferWallet'])
        );
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        $this->authorizeOwnership($transaction);

        $transaction->delete();

        return response()->json(['message' => 'Transaksi dihapus.']);
    }

    private function authorizeOwnership(Transaction $transaction): void
    {
        abort_if($transaction->user_id !== Auth::id(), 404);
    }
}
