<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWalletRequest;
use App\Http\Requests\UpdateWalletRequest;
use App\Http\Resources\WalletResource;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;

class WalletController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return WalletResource::collection(
            Wallet::where('user_id', Auth::id())
                ->orderBy('name')
                ->get()
        );
    }

    public function store(StoreWalletRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        $wallet = Wallet::create($data);

        return WalletResource::make($wallet)->response()->setStatusCode(201);
    }

    public function show(Wallet $wallet): WalletResource
    {
        $this->authorizeOwnership($wallet);

        return WalletResource::make($wallet);
    }

    public function update(UpdateWalletRequest $request, Wallet $wallet): WalletResource
    {
        $this->authorizeOwnership($wallet);

        $wallet->update($request->validated());

        return WalletResource::make($wallet);
    }

    public function destroy(Wallet $wallet): JsonResponse
    {
        $this->authorizeOwnership($wallet);

        $wallet->delete();

        return response()->json(['message' => 'Wallet dihapus.']);
    }

    private function authorizeOwnership(Wallet $wallet): void
    {
        abort_if($wallet->user_id !== Auth::id(), 404);
    }
}
