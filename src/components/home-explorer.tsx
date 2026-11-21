"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { homeProductSlugs, products, type Condition } from "@/data/products";
import { demo, paths, showcase } from "@/data/site";
import { ProductCard } from "./product-card";
import { SplitText } from "./split-text";
import { Note } from "./ui";

const categories: { value: Condition | ""; label: string }[] = [
  { value: "", label: "Todos" }, { value: "lacrado", label: "Lacrados" }, { value: "seminovo", label: "Seminovos" },
];

/** Columns the closing tile spans so a 3-column grid always ends on a full row. */
function tileSpan(slotsUsed: number) {
  const remainder = slotsUsed % 3;
  return remainder === 0 ? 3 : 3 - remainder;
}

export function HomeExplorer() {
  const [category, setCategory] = useState<Condition | "">("");
  const [inView, setInView] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const displayed = category
    ? products.filter((product) => product.condition === category)
    : products.filter(({ slug }) => homeProductSlugs.includes(slug));
  const hasExamples = products.some((product) => product.demo);
  const counts = {
    "": products.length,
    lacrado: products.filter(({ condition }) => condition === "lacrado").length,
    seminovo: products.filter(({ condition }) => condition === "seminovo").length,
  };

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || inView) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -12% 0px" });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [inView]);

  return (
    <section id="explorar" className="section explorer-section" aria-labelledby="explorer-title">
      <div className="wrap">
        <div className="section-heading explorer-heading">
          <div>
            <p className="eyebrow" data-reveal>Catálogo</p>
            <SplitText id="explorer-title" accent="iPhone.">Encontre seu iPhone.</SplitText>
            {hasExamples && <div data-reveal><Note>{demo.catalog}</Note></div>}
          </div>
          <Link href={paths.iphones} className="button button--glass explorer-desktop-link" data-magnetic>
            Ver todos os aparelhos<ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="segments" role="group" aria-label="Condição dos iPhones em destaque" data-reveal>
          {categories.map(({ value, label }) => (
            <button className="segment" type="button" key={label} aria-pressed={category === value} onClick={() => setCategory(value)}>
              {label}<span className="segment-count">{counts[value]}</span>
            </button>
          ))}
        </div>
        <p role="status" className="sr-only">{displayed.length === 1 ? "1 iPhone em destaque" : displayed.length + " iPhones em destaque"}</p>
        {displayed.length ? (
          <div ref={gridRef} className={"home-product-grid" + (inView ? " is-inview" : "")} key={category}>
            {displayed.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} featured={index === 0 && product.slug === showcase.slug} />
            ))}
            <Link
              href={paths.iphones}
              className="catalog-tile"
              data-spotlight
              style={{
                "--i": displayed.length,
                "--span": tileSpan(displayed.length + (displayed[0]?.slug === showcase.slug ? 1 : 0)),
                "--span-2": displayed.length % 2 === 0 ? 2 : 1,
              } as CSSProperties}
            >
              <span className="catalog-tile-count">{products.length} modelos</span>
              <span className="catalog-tile-title">Veja todos os iPhones da Appl.Oz</span>
              <span className="catalog-tile-text">Compare capacidade, cor e condição no catálogo completo.</span>
              <span className="catalog-tile-arrow" aria-hidden="true"><ArrowRight size={22} /></span>
            </Link>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhum aparelho nesta categoria.</h3>
            <p>Veja todos os iPhones para explorar outras opções.</p>
            {category && <button className="button button--secondary" type="button" onClick={() => setCategory("")}>Mostrar todos</button>}
          </div>
        )}
        <Link href={paths.iphones} className="button button--secondary explorer-mobile-link">Ver todos os aparelhos</Link>
      </div>
    </section>
  );
}
