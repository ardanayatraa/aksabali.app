<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#B91C1C">

        <title inertia>{{ config('app.name', 'Aksa Bali') }}</title>

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
