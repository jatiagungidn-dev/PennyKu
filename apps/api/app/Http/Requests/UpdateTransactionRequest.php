<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
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
            'wallet_id' => ['sometimes', Rule::exists('wallets', 'id')->where('user_id', $this->user()->id)],
            'category_id' => ['nullable', Rule::exists('categories', 'id')->where('user_id', $this->user()->id)],
            'type' => ['sometimes', 'in:income,expense,transfer'],
            'amount' => ['sometimes', 'numeric', 'gt:0', 'max:999999999999.99'],
            'transfer_wallet_id' => ['nullable', Rule::exists('wallets', 'id')->where('user_id', $this->user()->id)],
            'note' => ['nullable', 'string', 'max:255'],
            'occurred_at' => ['sometimes', 'date', 'before_or_equal:now'],
        ];
    }
}
