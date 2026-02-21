'use client';
import { useEffect, useRef, useState } from 'react';
import { formatNumber, formatIQD } from '@/lib/api';

interface Props {
    value: number;
    /** If true, format as IQD currency string; otherwise plain number with commas */
    asIQD?: boolean;
    className?: string;
    /** Duration of the counting animation in ms (default 600) */
    duration?: number;
    /** Prefix string shown before the number e.g. "$ " */
    prefix?: string;
    /** Suffix string shown after the number */
    suffix?: string;
}

/**
 * AnimatedNumber — smoothly counts from the previous value to the new one
 * using requestAnimationFrame, and briefly glows gold on change.
 */
export default function AnimatedNumber({
    value,
    asIQD = false,
    className = '',
    duration = 600,
    prefix = '',
    suffix = '',
}: Props) {
    const [display, setDisplay] = useState(value);
    const [flash, setFlash] = useState<'up' | 'down' | null>(null);
    const prevRef = useRef(value);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);

    useEffect(() => {
        const from = prevRef.current;
        const to = value;

        if (from === to) return;

        // Determine direction for colour flash
        setFlash(to > from ? 'up' : 'down');

        // Cancel any in-progress animation
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

        startRef.current = null;

        const animate = (ts: number) => {
            if (startRef.current === null) startRef.current = ts;
            const elapsed = ts - startRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + (to - from) * eased);
            setDisplay(current);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                setDisplay(to);
                prevRef.current = to;
                // Remove flash after a short delay
                setTimeout(() => setFlash(null), 400);
                rafRef.current = null;
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [value, duration]);

    const formatted = asIQD ? formatIQD(display) : formatNumber(display);

    const flashStyle =
        flash === 'up'
            ? { color: '#16a34a', textShadow: '0 0 10px rgba(22,163,74,0.5)' }   // green — price rose
            : flash === 'down'
                ? { color: '#dc2626', textShadow: '0 0 10px rgba(220,38,38,0.4)' }   // red — price dropped
                : {};

    return (
        <span
            className={`tabular-nums transition-colors duration-300 ${className}`}
            style={flashStyle}
        >
            {prefix}{formatted}{suffix}
        </span>
    );
}
