import { useEffect, useRef } from 'react';

interface Props {
    gridSize?: number;
    className?: string;
}

/**
 * Subtle animated grid background — port dari Next.js components/ui/animated-grid-background.
 * Pakai CSS grid lines + slow drift animation. Pure decorative, pointer-events-none.
 */
export function AnimatedGridBackground({ gridSize = 44, className = '' }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let raf = 0;
        let start = Date.now();
        const tick = () => {
            const elapsed = (Date.now() - start) / 1000;
            const offsetX = Math.sin(elapsed * 0.12) * 4;
            const offsetY = Math.cos(elapsed * 0.18) * 3;
            el.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div
            ref={ref}
            aria-hidden
            className={`pointer-events-none ${className}`}
            style={{
                backgroundImage:
                    `linear-gradient(hsl(var(--primary) / 0.07) 1px, transparent 1px),` +
                    `linear-gradient(90deg, hsl(var(--primary) / 0.07) 1px, transparent 1px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
        />
    );
}
