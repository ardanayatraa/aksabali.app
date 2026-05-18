<?php

namespace Database\Seeders;

use App\Models\Aksara;
use Illuminate\Database\Seeder;

/**
 * Seed 32+ aksara catalog dari Unicode Balinese block (U+1B00..U+1B7F).
 * Tidak ada hard-coded glyph — semua di-generate via mb_chr(codepoint).
 *
 * Source: docs/aksara.md + lib/aksara-codepoints (web/mobile).
 */
class AksaraSeeder extends Seeder
{
    public function run(): void
    {
        // Wianjana (anacaraka) — 18 konsonan dasar.
        $wianjana = [
            ['cp' => 0x1B33, 'name' => 'Ha', 'latin' => 'ha', 'order' => 1],
            ['cp' => 0x1B26, 'name' => 'Na', 'latin' => 'na', 'order' => 2],
            ['cp' => 0x1B18, 'name' => 'Ca', 'latin' => 'ca', 'order' => 3],
            ['cp' => 0x1B2D, 'name' => 'Ra', 'latin' => 'ra', 'order' => 4],
            ['cp' => 0x1B13, 'name' => 'Ka', 'latin' => 'ka', 'order' => 5],
            ['cp' => 0x1B24, 'name' => 'Da', 'latin' => 'da', 'order' => 6],
            ['cp' => 0x1B22, 'name' => 'Ta', 'latin' => 'ta', 'order' => 7],
            ['cp' => 0x1B32, 'name' => 'Sa', 'latin' => 'sa', 'order' => 8],
            ['cp' => 0x1B2F, 'name' => 'Wa', 'latin' => 'wa', 'order' => 9],
            ['cp' => 0x1B2E, 'name' => 'La', 'latin' => 'la', 'order' => 10],
            ['cp' => 0x1B2B, 'name' => 'Ma', 'latin' => 'ma', 'order' => 11],
            ['cp' => 0x1B15, 'name' => 'Ga', 'latin' => 'ga', 'order' => 12],
            ['cp' => 0x1B29, 'name' => 'Ba', 'latin' => 'ba', 'order' => 13],
            ['cp' => 0x1B17, 'name' => 'Nga', 'latin' => 'nga', 'order' => 14],
            ['cp' => 0x1B27, 'name' => 'Pa', 'latin' => 'pa', 'order' => 15],
            ['cp' => 0x1B1A, 'name' => 'Ja', 'latin' => 'ja', 'order' => 16],
            ['cp' => 0x1B2C, 'name' => 'Ya', 'latin' => 'ya', 'order' => 17],
            ['cp' => 0x1B1C, 'name' => 'Nya', 'latin' => 'nya', 'order' => 18],
        ];

        foreach ($wianjana as $row) {
            $hex = strtoupper(dechex($row['cp']));
            Aksara::updateOrCreate(
                ['id' => "anacaraka-{$row['latin']}-{$hex}"],
                [
                    'name' => $row['name'],
                    'char' => mb_chr($row['cp'], 'UTF-8'),
                    'latin' => $row['latin'],
                    'category' => 'anacaraka',
                    'order' => $row['order'],
                    'is_premium' => $row['order'] > 5, // 5 pertama gratis
                    'svg_url' => "/aksara/strokes/anacaraka/{$row['latin']}-{$hex}.svg",
                    'image_url' => "/aksara/cards/anacaraka/{$row['latin']}-{$hex}.png",
                    'target_stroke_count' => 2,
                    'notes' => "Aksara wianjana {$row['name']} (U+{$hex}).",
                ]
            );
        }

        // Swara — vokal mandiri.
        $swara = [
            ['cp' => 0x1B05, 'name' => 'A', 'latin' => 'a', 'order' => 1],
            ['cp' => 0x1B07, 'name' => 'I', 'latin' => 'i', 'order' => 2],
            ['cp' => 0x1B09, 'name' => 'U', 'latin' => 'u', 'order' => 3],
            ['cp' => 0x1B0F, 'name' => 'E', 'latin' => 'e', 'order' => 4],
            ['cp' => 0x1B11, 'name' => 'O', 'latin' => 'o', 'order' => 5],
        ];

        foreach ($swara as $row) {
            $hex = strtoupper(dechex($row['cp']));
            Aksara::updateOrCreate(
                ['id' => "swara-{$row['latin']}-{$hex}"],
                [
                    'name' => $row['name'],
                    'char' => mb_chr($row['cp'], 'UTF-8'),
                    'latin' => $row['latin'],
                    'category' => 'swara',
                    'order' => $row['order'],
                    'is_premium' => false,
                    'svg_url' => "/aksara/strokes/swara/{$row['latin']}-{$hex}.svg",
                    'image_url' => "/aksara/cards/swara/{$row['latin']}-{$hex}.png",
                    'target_stroke_count' => 2,
                    'notes' => "Aksara swara {$row['name']} (U+{$hex}).",
                ]
            );
        }

        // Pangangge — sandangan vokal (di-render dgn dotted-circle prefix di UI).
        $pangangge = [
            ['cp' => 0x1B35, 'name' => 'Tedung', 'latin' => 'tedung', 'order' => 1, 'note' => 'Tedung — vokal "aa" panjang.'],
            ['cp' => 0x1B36, 'name' => 'Ulu', 'latin' => 'ulu', 'order' => 2, 'note' => 'Ulu — vokal "i" di atas.'],
            ['cp' => 0x1B38, 'name' => 'Suku', 'latin' => 'suku', 'order' => 3, 'note' => 'Suku — vokal "u" di bawah.'],
            ['cp' => 0x1B3E, 'name' => 'Taleng', 'latin' => 'taleng', 'order' => 4, 'note' => 'Taleng — vokal "e" di kiri.'],
            ['cp' => 0x1B40, 'name' => 'Taling Tedung', 'latin' => 'taling-tedung', 'order' => 5, 'note' => 'Taling Tedung — vokal "o".'],
            ['cp' => 0x1B42, 'name' => 'Pepet', 'latin' => 'pepet', 'order' => 6, 'note' => 'Pepet — vokal "e" pepet.'],
        ];

        foreach ($pangangge as $row) {
            $hex = strtoupper(dechex($row['cp']));
            // Pangangge ditampilkan dengan dotted circle prefix (U+25CC).
            $glyph = mb_chr(0x25CC, 'UTF-8') . mb_chr($row['cp'], 'UTF-8');
            Aksara::updateOrCreate(
                ['id' => "pangangge-{$row['latin']}-{$hex}"],
                [
                    'name' => $row['name'],
                    'char' => $glyph,
                    'latin' => $row['latin'],
                    'category' => 'pangangge',
                    'order' => $row['order'],
                    'is_premium' => false,
                    'svg_url' => "/aksara/strokes/pangangge/{$row['latin']}-{$hex}.svg",
                    'image_url' => "/aksara/cards/pangangge/{$row['latin']}-{$hex}.png",
                    'target_stroke_count' => 1,
                    'notes' => $row['note'],
                ]
            );
        }

        // Angka — 0–9.
        for ($digit = 0; $digit <= 9; $digit++) {
            $cp = 0x1B50 + $digit;
            $hex = strtoupper(dechex($cp));
            Aksara::updateOrCreate(
                ['id' => "angka-{$digit}-{$hex}"],
                [
                    'name' => (string) $digit,
                    'char' => mb_chr($cp, 'UTF-8'),
                    'latin' => (string) $digit,
                    'category' => 'angka',
                    'order' => $digit + 1,
                    'is_premium' => $digit > 2, // 3 pertama gratis
                    'svg_url' => "/aksara/strokes/angka/{$digit}-{$hex}.svg",
                    'image_url' => "/aksara/cards/angka/{$digit}-{$hex}.png",
                    'target_stroke_count' => 2,
                    'notes' => "Angka Bali {$digit} (U+{$hex}).",
                ]
            );
        }

        // Gabungan wianjana + vokal — contoh: ki = ka + ulu.
        $gabungan = [
            ['base' => [0x1B13, 0x1B36], 'name' => 'Ki', 'latin' => 'ki', 'order' => 1], // ka + ulu
            ['base' => [0x1B13, 0x1B38], 'name' => 'Ku', 'latin' => 'ku', 'order' => 2], // ka + suku
            ['base' => [0x1B13, 0x1B3E], 'name' => 'Ke', 'latin' => 'ke', 'order' => 3], // ka + taleng (note: taleng renders left)
            ['base' => [0x1B13, 0x1B40], 'name' => 'Ko', 'latin' => 'ko', 'order' => 4], // ka + taling-tedung
        ];

        foreach ($gabungan as $row) {
            $hexParts = array_map(fn ($cp) => strtoupper(dechex($cp)), $row['base']);
            $hex = implode('-', $hexParts);
            $glyph = collect($row['base'])->map(fn ($cp) => mb_chr($cp, 'UTF-8'))->implode('');
            Aksara::updateOrCreate(
                ['id' => "gabungan-vokal-{$row['latin']}-{$hex}"],
                [
                    'name' => $row['name'],
                    'char' => $glyph,
                    'latin' => $row['latin'],
                    'category' => 'gabungan-vokal',
                    'order' => $row['order'],
                    'is_premium' => true,
                    'svg_url' => "/aksara/strokes/gabungan-vokal/{$row['latin']}-{$hex}.svg",
                    'image_url' => "/aksara/cards/gabungan-vokal/{$row['latin']}-{$hex}.png",
                    'target_stroke_count' => 3,
                    'notes' => "Gabungan {$row['name']} — wianjana digabung pangangge.",
                ]
            );
        }
    }
}
