"use client";

import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import type { Photo } from "@/data/site";

type SafeImageProps = {
  photo?: Photo | null;
  sizes: string;
  label: string;
  ratio: string;
  eager?: boolean;
  contain?: boolean;
};

export function SafeImage({ photo, sizes, label, ratio, eager, contain }: SafeImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const showPhoto = photo && photo.src !== failedSource;

  if (showPhoto) {
    return (
      <Image
        className={contain ? "image-contain" : "image-cover"}
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        onError={() => setFailedSource(photo.src)}
      />
    );
  }

  return (
    <div className="photo-placeholder">
      <ImageIcon size={25} strokeWidth={1.65} aria-hidden="true" />
      <span>{label} · {ratio}</span>
      {photo && <small>Imagem temporariamente indisponível</small>}
    </div>
  );
}
