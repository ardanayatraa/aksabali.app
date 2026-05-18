import { useEffect, useId, useRef } from 'react';

interface Props {
    /** Ukuran cell grid (px). Default 40. */
    gridSize?: number;
    className?: string;
}

/**
 * Animated grid background — port full dari Next.js dgn 2 layer:
 *  1. Background tipis (opacity 6%) — grid drift terus pelan.
 *  2. Spotlight (opacity 40%) — grid yang sama, masked dgn radial gradient
 *     300px lingkaran yang follow cursor. Default centered di 65% / 35%.
 *
 * Plus 2 corner glow brick + accent. Pure CSS + requestAnimationFrame, no
 * framer-motion dependency.
 */
export function AnimatedGridBackground({ gridSize = 40, className = '' }: Props) {
    const rootRef = useRef<HTMLDivElement>(null);
    const mutedRef = useRef<SVGSVGElement>(null);
    const activeRef = useRef<HTMLDivElement>(null);
    const activeSvgRef = useRef<SVGSVGElement>(null);
    const rawId = useId().replace(/:/g, '');
    const mutedPatternId = `grid-muted-${rawId}`;
    const activePatternId = `grid-active-${rawId}`;

    useEffect(() => {
        const root = rootRef.current;
        const muted = mutedRef.current;
        const active = activeRef.current;
        const activeSvg = activeSvgRef.current;
        if (!root || !muted || !active || !activeSvg) return;

        let offsetX = 0;
        let offsetY = 0;
        let mouseX = 0;
        let mouseY = 0;
        let raf = 0;

        const centerMask = () => {
            const b = root.getBoundingClientRect();
            mouseX = b.width * 0.65;
            mouseY = b.height * 0.35;
        };

        const handleMove = (e: PointerEvent) => {
            const b = root.getBoundingClientRect();
            mouseX = e.clientX - b.left;
            mouseY = e.clientY - b.top;
        };

        const tick = () => {
            offsetX = (offsetX + 0.45) % gridSize;
            offsetY = (offsetY + 0.45) % gridSize;

            const mutedPattern = muted.querySelector('pattern');
            const activePattern = activeSvg.querySelector('pattern');
            if (mutedPattern) {
                mutedPattern.setAttribute('x', `${offsetX}`);
                mutedPattern.setAttribute('y', `${offsetY}`);
            }
            if (activePattern) {
                activePattern.setAttribute('x', `${offsetX}`);
                activePattern.setAttribute('y', `${offsetY}`);
            }

            const mask = `radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent 72%)`;
            active.style.maskImage = mask;
            active.style.webkitMaskImage = mask as unknown as string;

            raf = requestAnimationFrame(tick);
        };

        centerMask();
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('resize', centerMask);
        raf = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('resize', centerMask);
            cancelAnimationFrame(raf);
        };
    }, [gridSize]);

    const patternPath = `M ${gridSize} 0 L 0 0 0 ${gridSize}`;

    return (
        <div
            ref={rootRef}
            aria-hidden
            className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
        >
            {/* Layer 1: muted grid global */}
            <div className="absolute inset-0 opacity-[0.06]">
                <svg ref={mutedRef} className="h-full w-full text-muted-foreground">
                    <defs>
                        <pattern id={mutedPatternId} width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                            <path d={patternPath} fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${mutedPatternId})`} />
                </svg>
            </div>

            {/* Layer 2: active grid spotlight (follows cursor) */}
            <div ref={activeRef} className="absolute inset-0 opacity-40">
                <svg ref={activeSvgRef} className="h-full w-full text-muted-foreground">
                    <defs>
                        <pattern id={activePatternId} width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                            <path d={patternPath} fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${activePatternId})`} />
                </svg>
            </div>

            {/* Corner glows — brick top-right, accent bottom-left */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,hsl(var(--primary)/0.16),transparent_32%),radial-gradient(circle_at_5%_92%,hsl(var(--accent)/0.30),transparent_34%)]" />
        </div>
    );
}
