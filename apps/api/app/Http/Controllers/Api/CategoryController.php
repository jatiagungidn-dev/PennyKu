<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->where(function ($query) {
                $query->where('user_id', Auth::id())
                    ->orWhereNull('user_id');
            })
            ->when($request->type, fn ($query, $type) => $query->where('type', $type))
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();
        $category = Category::create($data);

        return CategoryResource::make($category)->response()->setStatusCode(201);
    }

    public function show(Category $category): CategoryResource
    {
        $this->authorizeOwnership($category);

        return CategoryResource::make($category);
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $this->authorizeOwnership($category);

        $category->update($request->validated());

        return CategoryResource::make($category);
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->authorizeOwnership($category);

        abort_if($category->is_default, 403, 'Kategori default tidak dapat dihapus.');

        $category->delete();

        return response()->json(['message' => 'Kategori dihapus.']);
    }

    private function authorizeOwnership(Category $category): void
    {
        abort_if($category->user_id !== Auth::id(), 404);
    }
}
