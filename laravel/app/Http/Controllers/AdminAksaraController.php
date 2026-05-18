<?php

namespace App\Http\Controllers;

use App\Models\Aksara;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CMS catalog aksara — list, edit, hapus.
 * Tidak ada upload file di iterasi pertama: svg_url + image_url + audio_url di-input sbg path string.
 */
class AdminAksaraController extends Controller
{
    /** List + filter: `/admin/aksara`. */
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

        $aksara = $query->paginate(40)->withQueryString();
        $categories = Category::orderBy('order')->get(['id', 'name']);

        return Inertia::render('admin/aksara/index', [
            'aksara' => $aksara->through(fn (Aksara $a) => [
                'id' => $a->id,
                'name' => $a->name,
                'char' => $a->char,
                'latin' => $a->latin,
                'category' => $a->category,
                'order' => (int) $a->order,
                'is_premium' => (bool) $a->is_premium,
                'svg_url' => $a->svg_url,
                'target_stroke_count' => (int) $a->target_stroke_count,
            ]),
            'categories' => $categories,
            'filters' => [
                'category' => $request->query('category'),
                'q' => $request->query('q'),
            ],
        ]);
    }

    /** Form bikin baru. */
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

    /** Form edit existing. */
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

        return redirect()->route('admin.aksara.index')->with('success', "Aksara {$aksara->name} diupdate");
    }

    /** Hapus. */
    public function destroy(Aksara $aksara): RedirectResponse
    {
        $name = $aksara->name;
        $aksara->delete();

        return redirect()->route('admin.aksara.index')->with('success', "Aksara {$name} dihapus");
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
