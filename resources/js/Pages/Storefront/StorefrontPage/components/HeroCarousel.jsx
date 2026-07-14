import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import heroSlides from '@/data/heroData';

const SLIDE_INTERVAL = 4500; // ms between auto-advances

export default function HeroCarousel() {
    const [current, setCurrent]   = useState(0);
    const [paused,  setPaused]    = useState(false);
    const [animDir, setAnimDir]   = useState('next'); // 'next' | 'prev'
    const [visible, setVisible]   = useState(true);   // for cross-fade
    const timerRef                = useRef(null);
    const total                   = heroSlides.length;

    // ── transition helper ──────────────────────────────────────────────────
    const goTo = useCallback((index, dir = 'next') => {
        setAnimDir(dir);
        setVisible(false);
        setTimeout(() => {
            setCurrent((index + total) % total);
            setVisible(true);
        }, 280); // matches CSS transition duration
    }, [total]);

    const goNext = useCallback(() => goTo(current + 1, 'next'), [current, goTo]);
    const goPrev = useCallback(() => goTo(current - 1, 'prev'), [current, goTo]);

    // ── auto-advance ───────────────────────────────────────────────────────
    useEffect(() => {
        if (paused) return;
        timerRef.current = setTimeout(goNext, SLIDE_INTERVAL);
        return () => clearTimeout(timerRef.current);
    }, [current, paused, goNext]);

    // ── keyboard nav ───────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft')  goPrev();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goNext, goPrev]);

    const slide = heroSlides[current];

    return (
        <section
            className="hero-carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-label="Featured Collections"
        >
            {/* ── Background image with Ken Burns zoom ────────────────── */}
            {heroSlides.map((s, i) => (
                <div
                    key={s.id}
                    className={`hero-bg ${i === current ? 'hero-bg--active' : ''}`}
                    style={{ backgroundImage: `url(${s.image})` }}
                    aria-hidden={i !== current}
                />
            ))}

            {/* ── Dark overlay gradient ────────────────────────────────── */}
            <div className={`hero-overlay bg-gradient-to-r ${slide.overlay}`} />

            {/* ── Slide content ─────────────────────────────────────────── */}
            <div className={`hero-content ${visible ? 'hero-content--visible' : 'hero-content--hidden'}`}>
                <div className="hero-inner">

                    {/* Badge */}
                    <span
                        className="hero-badge"
                        style={{ backgroundColor: slide.accentColor }}
                    >
                        {slide.badge}
                    </span>

                    {/* Headline */}
                    <h1 className="hero-headline">
                        {slide.headline.map((line, i) => (
                            <span key={i} className="block">{line}</span>
                        ))}
                    </h1>

                    {/* Subheadline */}
                    <p className="hero-sub">{slide.subheadline}</p>
                </div>
            </div>

            {/* ── Arrow controls ────────────────────────────────────────── */}
            <button
                onClick={goPrev}
                className="hero-arrow hero-arrow--left"
                aria-label="Previous slide"
            >
                <ChevronLeft size={22} />
            </button>
            <button
                onClick={goNext}
                className="hero-arrow hero-arrow--right"
                aria-label="Next slide"
            >
                <ChevronRight size={22} />
            </button>

            {/* ── Dot indicators ───────────────────────────────────────── */}
            <div className="hero-dots" role="tablist" aria-label="Slide indicators">
                {heroSlides.map((s, i) => (
                    <button
                        key={s.id}
                        role="tab"
                        aria-selected={i === current}
                        aria-label={`Go to slide ${i + 1}`}
                        onClick={() => goTo(i, i > current ? 'next' : 'prev')}
                        className={`hero-dot ${i === current ? 'hero-dot--active' : ''}`}
                        style={i === current ? { backgroundColor: slide.accentColor } : {}}
                    />
                ))}
            </div>

            {/* ── Progress bar ─────────────────────────────────────────── */}
            {!paused && (
                <div className="hero-progress-track">
                    <div
                        key={current} // re-mount to restart animation
                        className="hero-progress-bar"
                        style={{
                            animationDuration: `${SLIDE_INTERVAL}ms`,
                            backgroundColor: slide.accentColor,
                        }}
                    />
                </div>
            )}
        </section>
    );
}
