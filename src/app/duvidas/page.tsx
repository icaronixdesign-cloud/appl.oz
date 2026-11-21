import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, Closing, FaqList } from "@/components/ui";
import { faqGroups, paths } from "@/data/site";

export const metadata: Metadata = { title: "Dúvidas frequentes" };

export default function FaqPage() {
  return (
    <>
      <div className="wrap inner-page faq-page">
        <Breadcrumbs items={[{ label: "Dúvidas" }]} />
        <div className="page-heading">
          <h1>Dúvidas frequentes<span className="accent">.</span></h1>
          <p>Sobre a compra, a avaliação para troca e o atendimento da Appl.Oz.</p>
        </div>
        <div className="faq-page-grid">
          <nav className="faq-index" aria-label="Tópicos de dúvidas">
            {faqGroups.map(({ id, title }) => <a key={id} href={"#" + id}>{title}</a>)}
            <Link className="text-link" href={paths.guide}>Como funciona</Link>
          </nav>
          <div>
            {faqGroups.map(({ id, title, items }) => (
              <section className="faq-section" key={id} id={id} aria-labelledby={id + "-title"}>
                <h2 id={id + "-title"}>{title}</h2>
                <FaqList items={items} />
              </section>
            ))}
          </div>
        </div>
      </div>
      <Closing />
    </>
  );
}
