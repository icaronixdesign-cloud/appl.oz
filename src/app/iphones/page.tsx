import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
import { LoadingState } from "@/components/loading-state";
import { Breadcrumbs, Note } from "@/components/ui";
import { products } from "@/data/products";
import { demo } from "@/data/site";

export const metadata: Metadata = { title: "Catálogo de iPhones" };

export default function CatalogPage() {
  return (
    <div className="wrap inner-page catalog-page">
      <Breadcrumbs items={[{ label: "iPhones" }]} />
      <div className="page-heading">
        <h1>Encontre seu iPhone<span className="accent">.</span></h1>
        <p>Compare modelos, capacidades e condições para escolher seu próximo aparelho.</p>
        {products.some((product) => product.demo) && <Note className="notice--panel">{demo.catalog}</Note>}
      </div>
      <Suspense fallback={<LoadingState label="Carregando o catálogo…" />}>
        <Catalog />
      </Suspense>
    </div>
  );
}
