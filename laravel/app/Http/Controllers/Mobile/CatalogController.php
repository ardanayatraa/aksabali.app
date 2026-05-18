<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Aksara;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Catalog aksara untuk mobile — list categories + aksara per category.
 */
class CatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()->orderBy('order')->orderBy('id')->get();
        $aksara = Aksara::query()->orderBy('category')->orderBy('order')->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $categories->map(fn (Category $c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'description' => $c->description,
                    'order' => (int) $c->order,
                ])->all(),
                'aksara' => $aksara->map(fn (Aksara $a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'char' => $a->char,
                    'latin' => $a->latin,
                    'category' => $a->category,
                    'order' => (int) $a->order,
                    'is_premium' => (bool) $a->is_premium,
                    'svg_url' => $a->svg_url,
                    'image_url' => $a->image_url,
                    'audio_url' => $a->audio_url,
                    'target_stroke_count' => (int) $a->target_stroke_count,
                    'notes' => $a->notes,
                ])->all(),
            ],
        ]);
    }

    public function show(string $aksaraId): JsonResponse
    {
        $aksara = Aksara::find($aksaraId);
        if (! $aksara) {
            return response()->json(['success' => false, 'error' => 'not_found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $aksara->id,
                'name' => $aksara->name,
                'char' => $aksara->char,
                'latin' => $aksara->latin,
                'category' => $aksara->category,
                'order' => (int) $aksara->order,
                'is_premium' => (bool) $aksara->is_premium,
                'svg_url' => $aksara->svg_url,
                'image_url' => $aksara->image_url,
                'audio_url' => $aksara->audio_url,
                'target_stroke_count' => (int) $aksara->target_stroke_count,
                'notes' => $aksara->notes,
            ],
        ]);
    }
}
