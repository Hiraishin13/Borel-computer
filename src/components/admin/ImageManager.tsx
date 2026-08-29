'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { uploadImages } from '@/lib/upload-client'
import { cn } from '@/lib/utils'

/**
 * Gestion des images d'un produit : import depuis le poste, réordonnancement,
 * suppression. La première image est l'image principale (thumbnail).
 */
export function ImageManager({
  images,
  onChange,
}: {
  images: string[]
  onChange: (images: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const urls = await uploadImages(Array.from(fileList))
      onChange([...images, ...urls])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'import")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [x] = next.splice(from, 1)
    next.splice(to, 0, x)
    onChange(next)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div
            key={src}
            className={cn(
              'group relative h-24 w-24 overflow-hidden rounded-md border',
              i === 0 ? 'border-accent' : 'border-white/10',
            )}
          >
            <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-accent px-1 text-[10px] text-light">
                Principale
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                className="text-xs text-white disabled:opacity-30"
                disabled={i === 0}
                aria-label="Déplacer à gauche"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="text-xs text-white hover:text-danger"
                aria-label="Supprimer"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                className="text-xs text-white disabled:opacity-30"
                disabled={i === images.length - 1}
                aria-label="Déplacer à droite"
              >
                ›
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-white/20 text-xs text-muted hover:border-accent hover:text-light"
        >
          {uploading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
          ) : (
            <>
              <span className="text-lg">+</span>
              Importer
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-2 text-xs text-muted">
        PNG, JPG, WebP — 6 Mo max. La première image sert de vignette. Glissez avec ‹ › pour
        réordonner.
      </p>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
