<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'wallet_id' => ['required', Rule::exists('wallets', 'id')->where('user_id', $this->user()->id)],
            'category_id' => ['nullable', Rule::exists('categories', 'id')->where('user_id', $this->user()->id)],
            'type' => ['required', 'in:income,expense,transfer'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:999999999999.99'],
            'transfer_wallet_id' => ['nullable', 'required_if:type,transfer', 'different:wallet_id', Rule::exists('wallets', 'id')->where('user_id', $this->user()->id)],
            'note' => ['nullable', 'string', 'max:255'],
            'occurred_at' => ['required', 'date', 'before_or_equal:now'],
        ];
    }

    public function messages(): array
    {
        return [
            'transfer_wallet_id.required_if' => 'Wallet tujuan transfer wajib dipilih',
            'transfer_wallet_id.different' => 'Wallet tujuan tidak boleh sama dengan wallet asal',
        ];
    }
}
