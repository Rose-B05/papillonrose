"use client"

import { useState } from "react"

interface ProductImageProps {
  src: string
  alt: string
  className?: string
}

export default function ProductImage({ src, alt, className }: ProductImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#F0EBE3] dark:bg-neutral-700`}>
        <span className="text-xs text-gray-400 dark:text-neutral-500 text-center px-2">{alt}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  )
}
