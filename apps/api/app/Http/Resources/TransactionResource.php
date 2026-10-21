<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'amount' => (float) $this->amount,
            'note' => $this->note,
            'occurred_at' => $this->occurred_at->toIso8601String(),
            'wallet' => new WalletResource($this->whenLoaded('wallet')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'transfer_wallet' => new WalletResource($this->whenLoaded('transferWallet')),
        ];
    }
}
