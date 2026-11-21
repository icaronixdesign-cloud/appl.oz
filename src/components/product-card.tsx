import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { CSSProperties } from "react";
import { unitPhotoSlots, type Product } from "@/data/products";
import { demo } from "@/data/site";
import { capacityLabel, confirmedPrice, priceLabel, productPath } from "@/lib/commerce";
import { SafeImage } from "./safe-image";
import { Availability, ImageStamp, ProductCondition } from "./ui";

export function ProductCard({ product, compare, index, featured }: {
  product: Product;
  compare?: { selected: boolean; full: boolean; onToggle: () => void };
  index?: number;
  featured?: boolean;
}) {
  const slots = product.gallery?.length ? product.gallery : unitPhotoSlots;
  const realPhoto = slots.find((slot) => slot.photo)?.photo;
  const isIllustration = !realPhoto && Boolean(product.illustration);
  const photo = realPhoto ?? (product.illustration ? { src: product.illustration, alt: "" } : null);

  return (
    <article className={"product-card" + (featured ? " product-card--featured" : "")} data-tilt style={index === undefined ? undefined : { "--i": index } as CSSProperties}>
      <span className="card-glare" aria-hidden="true" />
      <div className={"product-media" + (isIllustration ? " product-media--concept" : "")}>
        <SafeImage photo={photo} sizes="(max-width: 630px) 90vw, (max-width: 1060px) 45vw, 370px" label={slots[0].label} ratio={slots[0].ratio} contain={isIllustration} />
        {product.demo && <span className="demo-badge">Demonstração</span>}
        {isIllustration && <ImageStamp>{demo.photo}</ImageStamp>}
      </div>
      <div className="product-card-body">
        <ProductCondition condition={product.condition} />
        <h3>{product.model}</h3>
        <p className="product-card-spec"><span>{capacityLabel(product.capacity)}</span><span>{product.color}</span></p>
        <p className={"product-card-price" + (confirmedPrice(product) ? " product-card-price--confirmed" : "")}>{priceLabel(product)}</p>
        <Availability product={product} />
        <div className="product-card-actions">
          <Link className="button button--secondary button--small product-card-link" href={productPath(product)}
            aria-label={"Ver detalhes de " + product.model + " " + capacityLabel(product.capacity) + ", " + product.color}>
            Ver detalhes
          </Link>
          {compare && (
            <button className="button button--quiet button--small compare-toggle" type="button"
              aria-label={"Comparar " + product.model + " " + capacityLabel(product.capacity)}
              aria-pressed={compare.selected} disabled={compare.full && !compare.selected} onClick={compare.onToggle}>
              {compare.selected ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
              <span>Comparar</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
