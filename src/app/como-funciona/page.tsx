import type { Metadata } from "next";
import Link from "next/link";
import { Info, Repeat2, Smartphone } from "lucide-react";
import { Breadcrumbs, Closing, Label, Timeline } from "@/components/ui";
import { conditionInfo, home, paths, purchaseSteps, tradeSteps } from "@/data/site";

export const metadata: Metadata = { title: "Como funciona" };

export default function GuidePage() {
  return (
    <>
      <div className="wrap inner-page guide-page">
        <Breadcrumbs items={[{ label: "Como funciona" }]} />
        <div className="page-heading">
          <h1>Como funciona<span className="accent">.</span></h1>
          <p>Da escolha do aparelho ao atendimento pelo WhatsApp, com ou sem um iPhone para troca.</p>
        </div>
        <section className="section guide-section split-section" aria-labelledby="guide-buy-title">
          <div className="section-intro">
            <span className="feature-icon"><Smartphone size={24} aria-hidden="true" /></span>
            <h2 id="guide-buy-title">Comprar um iPhone.</h2>
            <Link className="button button--primary" href={paths.iphones}>Explorar iPhones</Link>
          </div>
          <Timeline steps={purchaseSteps} />
        </section>
        <section className="section guide-section split-section" aria-labelledby="guide-trade-title">
          <div className="section-intro">
            <span className="feature-icon"><Repeat2 size={24} aria-hidden="true" /></span>
            <h2 id="guide-trade-title">Usar meu iPhone na troca.</h2>
            <Link className="button button--secondary" href={paths.trade}>Iniciar avaliação</Link>
          </div>
          <Timeline steps={tradeSteps} />
        </section>
        <section className="section guide-section" id="condicao" aria-labelledby="guide-condition-title">
          <div className="section-heading"><h2 id="guide-condition-title">Condições dos aparelhos.</h2></div>
          <div className="conditions-grid">
            {Object.values(conditionInfo).map(({ title, description }) => (
              <div key={title}><h3>{title}</h3><p>{description}</p></div>
            ))}
          </div>
          <div className="trust-callout guide-callout">
            <Info size={23} aria-hidden="true" />
            <div><h3>Não vendemos vitrine.</h3><p>{home.trust.displayUnits}</p></div>
          </div>
        </section>
        <section className="guide-support section" aria-labelledby="guide-help-title">
          <Label>Antes de comprar</Label>
          <h2 id="guide-help-title">Pagamento, garantia, retirada e entrega.</h2>
          <p>Confirme valores, formas de pagamento, garantia, itens inclusos e como receber o aparelho durante o atendimento.</p>
          <Link className="text-link" href={paths.faq + "#condicoes-comerciais"}>Ver dúvidas sobre a compra</Link>
        </section>
      </div>
      <Closing />
    </>
  );
}
