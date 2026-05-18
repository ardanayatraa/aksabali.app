<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /** Render sitemap.xml — endpoint `/sitemap.xml`. */
    public function __invoke(): Response
    {
        $base = rtrim(config('app.url', 'https://aksabali.app'), '/');

        $urls = [
            ['loc' => $base . '/', 'priority' => '1.0', 'changefreq' => 'weekly'],
            ['loc' => $base . '/login', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => $base . '/harga', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['loc' => $base . '/only25k', 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['loc' => $base . '/latihan', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['loc' => $base . '/quiz', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['loc' => $base . '/game/lobby', 'priority' => '0.6', 'changefreq' => 'monthly'],
        ];

        // Mode latihan + kuis statis.
        foreach (['nyurat', 'huruf', 'swara', 'angka', 'kata', 'membaca'] as $m) {
            $urls[] = ['loc' => "{$base}/latihan/{$m}", 'priority' => '0.6', 'changefreq' => 'monthly'];
        }
        foreach (['acak', 'nyurat', 'kata', 'huruf', 'match', 'maca'] as $m) {
            $urls[] = ['loc' => "{$base}/quiz/{$m}", 'priority' => '0.6', 'changefreq' => 'monthly'];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $u) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$u['loc']}</loc>\n";
            $xml .= "    <changefreq>{$u['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$u['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }
        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}
