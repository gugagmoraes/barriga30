'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface RuixenCardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  badge?: {
    text: string;
    variant: 'pink' | 'indigo' | 'orange' | 'red';
  };
  href?: string;
  id?: string;
}

interface RuixenCarouselWaveProps {
  items: RuixenCardProps[];
}

export default function RuixenCarouselWave({ items }: RuixenCarouselWaveProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const shift = (direction: 'next' | 'prev') => {
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % items.length
        : (currentIndex - 1 + items.length) % items.length;
    setCurrentIndex(nextIndex);
  };

  useEffect(() => {
    // Reset refs array to match items length
    cardRefs.current = cardRefs.current.slice(0, items.length);
    
    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      let position = i - currentIndex;
      if (position < -Math.floor(items.length / 2)) {
        position += items.length;
      } else if (position > Math.floor(items.length / 2)) {
        position -= items.length;
      }

      const x = position * 320; // Increased spacing slightly for better mobile view if needed
      const y = position === 0 ? 20 : 0;
      const scale = position === 0 ? 1.03 : 0.95;
      const zIndex = position === 0 ? 10 : 10 - Math.abs(position);
      const opacity = Math.abs(position) > 2 ? 0 : 1; // Hide cards too far away

      if (Math.abs(position) > 2) {
        gsap.set(card, { x, y, scale, zIndex, opacity });
      } else {
        gsap.to(card, {
          x,
          y,
          scale,
          zIndex,
          opacity,
          duration: 0.6,
          ease: 'power2.out',
        });
      }
    });
  }, [currentIndex, items.length]);

  const badgeColors = {
    pink: 'bg-pink-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    orange: 'bg-orange-500 text-white',
    red: 'bg-[#FF4D4D] text-white',
  };

  return (
    <div className="h-full w-full relative px-2 py-12 overflow-hidden min-h-[450px]">
      <div className="relative flex items-center justify-center h-[400px]">
        {items.map((card, index) => (
          <div
            key={index}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="absolute transition-transform will-change-transform"
            style={{ width: '280px' }} // Fixed width for better centering
          >
            <div className="flex flex-col group">
              <div 
                className="relative block overflow-hidden rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 hover:scale-[1.02] cursor-grab active:cursor-grabbing"
              >
                {/* Image */}
                <div className="relative h-[320px] w-full bg-gray-100">
                  {card.image ? (
                    <Image
                      src={card.image}
                      alt={card.title ?? ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={index === currentIndex}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      Sem Imagem
                    </div>
                  )}
                </div>

                {/* Badge */}
                {card.badge && (
                  <div className="absolute top-4 -left-10 transform -rotate-45 z-20">
                    <div
                      className={cn(
                        'px-8 py-1 text-xs font-bold shadow-md text-center w-32',
                        badgeColors[card.badge.variant]
                      )}
                    >
                      {card.badge.text}
                    </div>
                  </div>
                )}

                {/* Text Overlay */}
                <div className="absolute bottom-4 left-4 right-4 group-hover:scale-[1.01] group-hover:translate-y-[-4px] transform transition-all duration-300 ease-out bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20">
                  <div className="flex flex-col gap-1">
                    {card.title && (
                      <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">
                        {card.title}
                      </h3>
                    )}
                    <p className="text-sm text-gray-600 dark:text-zinc-300 leading-snug italic line-clamp-3">
                      "{card.subtitle}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4 z-30">
        <button
          onClick={() => shift('prev')}
          className="p-3 rounded-full border border-zinc-200 bg-white shadow-lg hover:scale-110 transition active:scale-95 text-[#FF4D4D]"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => shift('next')}
          className="p-3 rounded-full border border-zinc-200 bg-white shadow-lg hover:scale-110 transition active:scale-95 text-[#FF4D4D]"
          aria-label="Próximo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
