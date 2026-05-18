<?php

namespace Database\Seeders;

use App\Models\Aksara;
use Illuminate\Database\Seeder;

/**
 * Seed 40+ aksara catalog dari Unicode Balinese block (U+1B00..U+1B7F).
 * Tidak ada hard-coded glyph — semua di-generate via mb_chr(codepoint).
 *
 * File assets di public/aksara/:
 *   cards/anacaraka/{latin}-{HEX}.noto.png
 *   cards/swara/{karaname}-{HEX}.noto.png
 *   cards/angka/digit-{word}-{HEX}.noto.png
 *   strokes/anacaraka/{latin}-{HEX}.svg              (subset: da, sa)
 *   strokes/gabungan-vokal/{latin}-{HEX1}-{HEX2}.svg (subset: ki, sa)
 */
class AksaraSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAnacaraka();
        $this->seedSwara();
        $this->seedPangangge();
        $this->seedAngka();
        $this->seedGabungan();
    }

    private function seedAnacaraka(): void
    {
        $items = [
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

        // SVG stroke ref yang sudah ada di public/.
        $strokeAvailable = ['da', 'sa'];

        foreach ($items as $row) {
            $hex = strtoupper(dechex($row['cp']));
            $image = "/aksara/cards/anacaraka/{$row['latin']}-{$hex}.noto.png";
            $svg = in_array($row['latin'], $strokeAvailable, true)
                ? "/aksara/strokes/anacaraka/{$row['latin']}-{$hex}.svg"
                : null;

            Aksara::updateOrCreate(
                ['id' => "anacaraka-{$row['latin']}-{$hex}"],
                [
                    'name' => $row['name'],
                    'char' => mb_chr($row['cp'], 'UTF-8'),
                    'latin' => $row['latin'],
                    'category' => 'anacaraka',
                    'order' => $row['order'],
                    'is_premium' => $row['order'] > 5,
                    'svg_url' => $svg,
                    'image_url' => $image,
                    'target_stroke_count' => 2,
                    'notes' => "Aksara wianjana {$row['name']} (U+{$hex}).",
                ]
            );
        }
    }

    private function seedSwara(): void
    {
        // Swara — vokal mandiri (file naming pakai {kara-name}-{HEX}).
        $items = [
            ['cp' => 0x1B05, 'name' => 'A', 'latin' => 'a', 'fileSlug' => 'akara', 'order' => 1],
            ['cp' => 0x1B07, 'name' => 'I', 'latin' => 'i', 'fileSlug' => 'ikara', 'order' => 2],
            ['cp' => 0x1B09, 'name' => 'U', 'latin' => 'u', 'fileSlug' => 'ukara', 'order' => 3],
            ['cp' => 0x1B0F, 'name' => 'E', 'latin' => 'e', 'fileSlug' => 'ekara', 'order' => 4],
            ['cp' => 0x1B11, 'name' => 'O', 'latin' => 'o', 'fileSlug' => 'okara', 'order' => 5],
        ];

        foreach ($items as $row) {
            $hex = strtoupper(dechex($row['cp']));
            $image = "/aksara/cards/swara/{$row['fileSlug']}-{$hex}.noto.png";
            $svg = $row['fileSlug'] === 'ikara' ? '/aksara/swara/swara-ikara-1b07.svg' : null;

            Aksara::updateOrCreate(
                ['id' => "swara-{$row['latin']}-{$hex}"],
                [
                    'name' => $row['name'],
                    'char' => mb_chr($row['cp'], 'UTF-8'),
                    'latin' => $row['latin'],
                    'category' => 'swara',
                    'order' => $row['order'],
                    'is_premium' => false,
                    'svg_url' => $svg,
                    'image_url' => $image,
                    'target_stroke_count' => 2,
                    'notes' => "Aksara swara {$row['name']} (U+{$hex}).",
                ]
            );
        }
    }

    private function seedPangangge(): void
    {
        $items = [
            ['cp' => 0x1B35, 'name' => 'Tedung', 'latin' => 'tedung', 'order' => 1, 'note' => 'Tedung — vokal "aa" panjang.'],
            ['cp' => 0x1B36, 'name' => 'Ulu', 'latin' => 'ulu', 'order' => 2, 'note' => 'Ulu — vokal "i" di atas.'],
            ['cp' => 0x1B38, 'name' => 'Suku', 'latin' => 'suku', 'order' => 3, 'note' => 'Suku — vokal "u" di bawah.'],
            ['cp' => 0x1B3E, 'name' => 'Taleng', 'latin' => 'taleng', 'order' => 4, 'note' => 'Taleng — vokal "e" di kiri.'],
            ['cp' => 0x1B40, 'name' => 'Taling Tedung', 'latin' => 'taling-tedung', 'order' => 5, 'note' => 'Taling Tedung — vokal "o".'],
            ['cp' => 0x1B42, 'name' => 'Pepet', 'latin' => 'pepet', 'order' => 6, 'note' => 'Pepet — vokal "e" pepet.'],
        ];

        foreach ($items as $row) {
            $hex = strtoupper(dechex($row['cp']));
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
                    'svg_url' => null,
                    'image_url' => null,
                    'target_stroke_count' => 1,
                    'notes' => $row['note'],
                ]
            );
        }
    }

    private function seedAngka(): void
    {
        $words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        for ($digit = 0; $digit <= 9; $digit++) {
            $cp = 0x1B50 + $digit;
            $hex = strtoupper(dechex($cp));
            $word = $words[$digit];
            $image = "/aksara/cards/angka/digit-{$word}-{$hex}.noto.png";

            Aksara::updateOrCreate(
                ['id' => "angka-{$digit}-{$hex}"],
                [
                    'name' => (string) $digit,
                    'char' => mb_chr($cp, 'UTF-8'),
                    'latin' => (string) $digit,
                    'category' => 'angka',
                    'order' => $digit + 1,
                    'is_premium' => $digit > 2,
                    'svg_url' => null,
                    'image_url' => $image,
                    'target_stroke_count' => 2,
                    'notes' => "Angka Bali {$digit} ({$word} — U+{$hex}).",
                ]
            );
        }
    }

    private function seedGabungan(): void
    {
        // Gabungan wianjana + vokal — file naming: {latin}-{HEX1}-{HEX2}.svg.
        $items = [
            ['base' => [0x1B13, 0x1B36], 'name' => 'Ki', 'latin' => 'ki', 'order' => 1, 'hasSvg' => true],
            ['base' => [0x1B13, 0x1B38], 'name' => 'Ku', 'latin' => 'ku', 'order' => 2, 'hasSvg' => false],
            ['base' => [0x1B13, 0x1B3E], 'name' => 'Ke', 'latin' => 'ke', 'order' => 3, 'hasSvg' => false],
            ['base' => [0x1B13, 0x1B40], 'name' => 'Ko', 'latin' => 'ko', 'order' => 4, 'hasSvg' => false],
        ];

        foreach ($items as $row) {
            $hexParts = array_map(fn ($cp) => strtoupper(dechex($cp)), $row['base']);
            $hex = implode('-', $hexParts);
            $glyph = collect($row['base'])->map(fn ($cp) => mb_chr($cp, 'UTF-8'))->implode('');
            $svg = $row['hasSvg'] ? "/aksara/strokes/gabungan-vokal/{$row['latin']}-{$hex}.svg" : null;

            Aksara::updateOrCreate(
                ['id' => "gabungan-vokal-{$row['latin']}-{$hex}"],
                [
                    'name' => $row['name'],
                    'char' => $glyph,
                    'latin' => $row['latin'],
                    'category' => 'gabungan-vokal',
                    'order' => $row['order'],
                    'is_premium' => true,
                    'svg_url' => $svg,
                    'image_url' => null,
                    'target_stroke_count' => 3,
                    'notes' => "Gabungan {$row['name']} — wianjana digabung pangangge.",
                ]
            );
        }
    }
}
