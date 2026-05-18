<?php

namespace App\Http\Controllers;

use App\Models\Aksara;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CMS catalog aksara — list, edit, hapus, upload SVG.
 *
 * Pakai pattern master-detail: satu halaman /admin/aksara nampilin semua
 * aksara di list kiri, form edit + preview di kanan. Click item → load
 * ke form. Save via Inertia PUT, upload SVG via fetch POST.
 */
class AdminAksaraController extends Controller
{
    private const MAX_SVG_BYTES = 524288; // 512 KB

    /** List + filter: `/admin/aksara`. Return SEMUA aksara (no pagination) buat master-detail UI. */
    public function index(Request $request): Response
    {
        $query = Aksara::query()->orderBy('category')->orderBy('order')->orderBy('id');

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }
        if ($q = $request->query('q')) {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('latin', 'like', "%{$q}%")
                  ->orWhere('id', 'like', "%{$q}%");
            });
        }

        $aksara = $query->get()->map(fn (Aksara $a) => [
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
        ])->all();

        $categories = Category::orderBy('order')->get(['id', 'name']);

        return Inertia::render('admin/aksara/index', [
            'aksara' => $aksara,
            'categories' => $categories,
            'filters' => [
                'category' => $request->query('category'),
                'q' => $request->query('q'),
            ],
        ]);
    }

    /** Form bikin baru — legacy fallback. Master-detail di index sekarang yg utama. */
    public function create(): Response
    {
        return Inertia::render('admin/aksara/edit', [
            'aksara' => null,
            'categories' => Category::orderBy('order')->get(['id', 'name']),
        ]);
    }

    /** Simpan baru. */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateAksara($request);
        Aksara::create($data);

        return redirect()->route('admin.aksara.index')->with('success', "Aksara {$data['name']} dibuat");
    }

    /** Form edit existing — legacy fallback. */
    public function edit(Aksara $aksara): Response
    {
        return Inertia::render('admin/aksara/edit', [
            'aksara' => [
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
            'categories' => Category::orderBy('order')->get(['id', 'name']),
        ]);
    }

    /** Update existing. */
    public function update(Aksara $aksara, Request $request): RedirectResponse
    {
        $data = $this->validateAksara($request, $aksara);
        $aksara->update($data);

        return back()->with('success', "Aksara {$aksara->name} diupdate");
    }

    /** Hapus. */
    public function destroy(Aksara $aksara): RedirectResponse
    {
        $name = $aksara->name;
        $aksara->delete();

        return redirect()->route('admin.aksara.index')->with('success', "Aksara {$name} dihapus");
    }

    /**
     * Upload SVG file untuk aksara existing.
     *
     * - Validate: ext .svg, size ≤ 512KB, harus contain <svg>+<path d="..">
     * - Reject: <script>, <foreignObject>, javascript: URI, on* event handlers
     * - Simpan ke storage/app/public/aksara/{category}/{id}.svg
     * - Update kolom svg_url + target_stroke_count berdasar jumlah path
     */
    public function uploadSvg(Aksara $aksara, Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimetypes:image/svg+xml,text/plain|max:512',
        ]);

        $file = $request->file('file');
        $name = strtolower($file->getClientOriginalName());
        if (! str_ends_with($name, '.svg')) {
            return response()->json(['success' => false, 'error' => 'Format file harus .svg.'], 400);
        }
        if ($file->getSize() > self::MAX_SVG_BYTES) {
            return response()->json(['success' => false, 'error' => 'SVG maksimal 512KB.'], 413);
        }

        $svg = trim((string) file_get_contents($file->getRealPath()));
        if (! str_contains($svg, '<svg') || ! str_contains($svg, '</svg>')) {
            return response()->json(['success' => false, 'error' => 'File harus SVG valid.'], 400);
        }
        if (! preg_match('/<path\b[^>]*\sd=["\'][^"\']+["\'][^>]*>/i', $svg)) {
            return response()->json(['success' => false, 'error' => 'SVG referensi wajib punya minimal satu path stroke.'], 400);
        }
        if (
            preg_match('/<script\b/i', $svg)
            || preg_match('/<foreignObject\b/i', $svg)
            || preg_match('/\son[a-z]+\s*=/i', $svg)
            || preg_match('/javascript:/i', $svg)
        ) {
            return response()->json(['success' => false, 'error' => 'SVG mengandung elemen yg tidak aman.'], 400);
        }

        preg_match_all('/<path\b[^>]*\sd=["\'][^"\']+["\'][^>]*>/i', $svg, $matches);
        $strokeCount = count($matches[0]);

        $categorySegment = $this->safeSegment($aksara->category) ?: 'aksara';
        $fileSegment = $this->safeSegment($aksara->id);
        $relativePath = "aksara/strokes/{$categorySegment}/{$fileSegment}.svg";

        // Pakai disk 'public' (storage/app/public) supaya akses via /storage/...
        Storage::disk('public')->put($relativePath, $svg);
        $publicUrl = '/storage/' . $relativePath;

        $aksara->update([
            'svg_url' => $publicUrl,
            'target_stroke_count' => $strokeCount,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'svgUrl' => $publicUrl,
                'strokeCount' => $strokeCount,
            ],
        ]);
    }

    private function safeSegment(?string $value): string
    {
        $value = strtolower(trim((string) $value));
        $value = preg_replace('/[^a-z0-9_-]+/', '-', $value);
        $value = preg_replace('/^-+|-+$/', '', $value);
        return substr($value ?? '', 0, 80);
    }

    private function validateAksara(Request $request, ?Aksara $existing = null): array
    {
        $idRule = 'required|string|max:80';
        if (! $existing) {
            $idRule .= '|unique:aksara,id';
        }

        return $request->validate([
            'id' => $idRule,
            'name' => 'required|string|max:80',
            'char' => 'nullable|string|max:20',
            'latin' => 'required|string|max:80',
            'category' => 'required|string|max:40|exists:categories,id',
            'order' => 'nullable|integer|min:0',
            'is_premium' => 'boolean',
            'svg_url' => 'nullable|string|max:255',
            'image_url' => 'nullable|string|max:255',
            'audio_url' => 'nullable|string|max:255',
            'target_stroke_count' => 'nullable|integer|min:0|max:30',
            'notes' => 'nullable|string|max:1000',
        ]);
    }
}
