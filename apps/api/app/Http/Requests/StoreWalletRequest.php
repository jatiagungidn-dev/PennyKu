<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Override;

class StoreWalletRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:50'],
            'type' => ['required', 'in:cash,bank,e_wallet,other'],
            'initial_balance' => ['nullable', 'numeric', 'min:0'],
            'color' => ['nullable', 'strin', 'max:7'],
        ];
    }

    #[Override]
    protected function prepareForValidation(): void
    {
        $this->merge([
            'initial_balance' => $this->initial_balance ?? 0,
            'color' => $this->color ?? '#22c55e',
        ]);
    }
}
