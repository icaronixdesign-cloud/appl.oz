"use client";

import { Camera, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { unitPhotoSlots, type Product } from "@/data/products";
import { demo } from "@/data/site";
import { SafeImage } from "./safe-image";
import { ImageStamp } from "./ui";

export function Gallery({ product }: { product: Product }) {
  const slots = (product.gallery?.length ? product.gallery : unitPhotoSlots).map((slot, index) => ({
    ...slot,
    illustration: index === 0 && !slot.photo && Boolean(product.illustration),
  }));
  const firstPhoto = slots.findIndex((slot) => slot.photo || slot.illustration);
  const [active, setActive] = useState(Math.max(firstPhoto, 0));
  const current = slots[active];
  const preview = current.illustration && product.illustration ? { src: product.illustration, alt: "Ilustração de um celular conceitual" } : null;

  return (
    <section className="gallery" aria-label="Galeria do aparelho">
      <div className={"gallery-frame" + (preview ? " gallery-frame--concept" : "")}
        style={{ aspectRatio: current.ratio.replace(":", " / ") }} key={active}>
        <SafeImage photo={current.photo ?? preview} sizes="(max-width: 800px) 92vw, 580px"
          label={current.label} ratio={current.ratio} contain={Boolean(preview)} eager />
        {preview && <ImageStamp>{demo.photo}</ImageStamp>}
      </div>
      <div className="gallery-options" role="group" aria-label="Escolher vista do aparelho">
        {slots.map((slot, index) => (
          <button className="gallery-option" type="button" key={index} aria-pressed={index === active} onClick={() => setActive(index)}>
            {slot.photo ? <Camera aria-hidden="true" size={17} /> : <ImageIcon aria-hidden="true" size={17} />}
            <span>{slot.illustration ? "Vista ilustrativa" : slot.label}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">{current.illustration ? "Vista ilustrativa" : current.label}</p>
    </section>
  );
}
