'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const slides = images.length ? images : ['/images/placeholder.svg']
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)

  const go = useCallback(
    (next: number) => {
      const len = slides.length
      const target = ((next % len) + len) % len
      setDir(next > index || (index === len - 1 && target === 0) ? 1 : -1)
      setIndex(target)
    },
    [index, slides.length],
  )

  // Défilement automatique fluide (pause au survol)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (slides.length < 2 || paused) return
    const t = setInterval(() => go(index + 1), 4500)
    return () => clearInterval(t)
  }, [index, paused, slides.length, go])

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="group relative aspect-square overflow-hidden rounded-lg bg-secondary">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            initial={{ x: dir * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir * -60, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={slides[index]}
              alt={alt}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => go(index - 1)} />
            <GalleryArrow side="right" onClick={() => go(index + 1)} />
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Image ${i + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === index ? 'w-6 bg-accent' : 'w-1.5 bg-white/40 hover:bg-white/70',
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {slides.map((src, i) => (
            <button
              key={src + i}
              onClick={() => go(i)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-md border transition-colors',
                i === index ? 'border-accent' : 'border-transparent hover:border-white/30',
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function GalleryArrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === 'left' ? 'Précédent' : 'Suivant'}
      className={cn(
        'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-light opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      {side === 'left' ? '‹' : '›'}
    </button>
  )
}
