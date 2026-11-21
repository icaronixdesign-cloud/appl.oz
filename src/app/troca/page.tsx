import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import { TradeForm } from "@/components/trade-form";
import { Breadcrumbs } from "@/components/ui";
import { tradeCopy } from "@/data/site";

export const metadata: Metadata = { title: "Troque seu iPhone" };

export default function TradePage() {
  return (
    <div className="wrap inner-page trade-page">
      <Breadcrumbs items={[{ label: "Troque seu iPhone" }]} />
      <div className="page-heading">
        <h1>{tradeCopy.title}<span className="accent">.</span></h1>
        <p>{tradeCopy.description}</p>
      </div>
      <Suspense fallback={<LoadingState label="Preparando a avaliação…" />}>
        <TradeForm />
      </Suspense>
    </div>
  );
}
