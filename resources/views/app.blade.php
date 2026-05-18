<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#B91C1C">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Aksa Bali') }}</title>

        {{-- SEO + social meta --}}
        <meta name="description" content="Aksa Bali — belajar nyurat aksara Bali. Stroke recognition, kuis multiplayer, web + Android, sekali bayar." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="{{ url()->current() }}" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Aksa Bali — Goresan indah, mengingat sejarah" />
        <meta property="og:description" content="Belajar nyurat aksara Bali. Stroke recognition + kuis kelas. Web + Android." />
        <meta property="og:url" content="{{ url()->current() }}" />
        <meta property="og:site_name" content="Aksa Bali" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:image" content="{{ url('/logo.svg') }}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Aksa Bali — Belajar nyurat aksara Bali" />
        <meta name="twitter:description" content="Stroke recognition + kuis kelas. Web + Android, sekali bayar." />
        <meta name="twitter:image" content="{{ url('/logo.svg') }}" />

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link
            href="https://fonts.bunny.net/css?family=lexend:400,500,600,700|epilogue:400,500,600,700,800|noto-sans-balinese:400"
            rel="stylesheet"
        />

        {{-- Anti-FOUC theme — kasih class .dark sebelum React load --}}
        <script>
            (function () {
                try {
                    var saved = localStorage.getItem('appearance');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var isDark = saved === 'dark' || ((!saved || saved === 'system') && prefersDark);
                    if (isDark) document.documentElement.classList.add('dark');
                } catch (e) {}
            })();
        </script>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="bg-background text-foreground antialiased">
        @inertia
    </body>
</html>
