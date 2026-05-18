<?php

namespace App\Http\Controllers;

use App\Models\Aksara;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PracticeController extends Controller
{
    /** Mode latihan yang valid sbg URL `/latihan/{mode}`. */
    private const MODES = ['nyurat', 'huruf', 'swara', 'angka', 'kata', 'membaca'];

    /** Map mode → kategori catalog. */
    private const MODE_CATEGORY = [
        'huruf' => 'anacaraka',
        'swara' => 'swara',
        'angka' => 'angka',
        'kata' => 'kata-aksara',
        'membaca' => 'anacaraka',
        'nyurat' => null, // semua kategori
    ];

    /** Hub mode latihan: `/latihan`. */
    public function index(): Response
    {
        $catalog = $this->loadCatalog();

        return Inertia::render('latihan/index', [
            'catalog' => $catalog,
        ]);
    }

    /** Per-mode drill list: `/latihan/{mode}`. */
    public function mode(string $mode): Response
    {
        abort_unless(in_array($mode, self::MODES, true), 404);

        $category = self::MODE_CATEGORY[$mode] ?? null;
        $catalog = $this->loadCatalog($category);

        return Inertia::render('latihan/mode', [
            'mode' => $mode,
            'catalog' => $catalog,
        ]);
    }

    /** Single character drill: `/latihan/{aksaraId}`. */
    public function drill(string $aksaraId): Response
    {
        $aksara = Aksara::query()->where('id', $aksaraId)->firstOrFail();

        return Inertia::render('latihan/drill', [
            'aksara' => [
                'id' => $aksara->id,
                'name' => $aksara->name,
                'char' => $aksara->char,
                'latin' => $aksara->latin,
                'category' => $aksara->category,
                'is_premium' => (bool) $aksara->is_premium,
                'svg_url' => $aksara->svg_url,
                'image_url' => $aksara->image_url,
                'target_stroke_count' => (int) $aksara->target_stroke_count,
                'notes' => $aksara->notes,
            ],
        ]);
    }

    /** Ambil catalog aksara — bisa filter per-category. */
    private function loadCatalog(?string $category = null): array
    {
        $query = Aksara::query()->orderBy('order')->orderBy('id');

        if ($category !== null) {
            $query->where('category', $category);
        }

        return $query->get()->map(fn (Aksara $a) => [
            'id' => $a->id,
            'name' => $a->name,
            'char' => $a->char,
            'latin' => $a->latin,
            'category' => $a->category,
            'is_premium' => (bool) $a->is_premium,
            'svg_url' => $a->svg_url,
            'image_url' => $a->image_url,
            'target_stroke_count' => (int) $a->target_stroke_count,
        ])->all();
    }
}
