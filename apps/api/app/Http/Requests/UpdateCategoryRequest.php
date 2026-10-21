<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:50', Rule::unique('categories')->where('user_id', $this->user()->id)->where('type', $this->input('type', $this->route('category')->type))->ignore($this->route('category')->id)],
            'type' => ['sometimes', 'in:income,expense'],
            'icon' => ['sometimes', 'string', 'max:50'],
            'color' => ['sometimes', 'string', 'max:7'],
        ];
    }
}
