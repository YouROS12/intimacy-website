"use client";

import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const LoveAtmosphere: React.FC = () => {
    // Generate static random values once on mount to avoid hydration mismatch/re-render jitter
    const [particles, setParticles] = useState<{ id: number, left: number, delay: number, size: number, duration: number }[]>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100, // 0-100% width
            delay: Math.random() * 10, // 0-10s delay
            size: Math.random() * 20 + 10, // 10-30px size
            duration: Math.random() * 10 + 10 // 10-20s duration
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute bottom-[-50px] text-brand-500/30 blur-[1px]"
                    style={{
                        left: `${p.left}%`,
                        animation: `float ${p.duration}s infinite linear`,
                        animationDelay: `${p.delay}s`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        opacity: 0, // Starts at 0, animation handles fade in
                    }}
                >
                    <Heart fill="currentColor" strokeWidth={0} className="w-full h-full" />
                </div>
            ))}
        </div>
    );
};

export default LoveAtmosphere;
