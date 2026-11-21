import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HardDrive, Repeat2 } from "lucide-react";
import { Gallery } from "@/components/gallery";
import { ProductCard } from "@/components/product-card";
import { Availability, Breadcrumbs, Note, ProductCondition, Timeline, WhatsAppButton } from "@/components/ui";
import { products } from "@/data/products";
import { demo, paths, purchaseSteps } from "@/data/site";
import { capacityLabel, confirmedPrice, priceLabel, purchaseMessage, whatsappLink } from "@/lib/commerce";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  return product ? { title: product.model + " " + capacityLabel(product.capacity) } : {};
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const unavailable = product.availability === "indisponivel";
  const price = confirmedPrice(product);
  const contact = whatsappLink(purchaseMessage(product));
  const tradeHref = paths.trade + "?desejado=" + encodeURIComponent(product.slug);
  const contactHint = contact ? "Abre o WhatsApp em outra aba com os dados deste iPhone." : "Contato a confirmar com a Appl.Oz.";
  const related = products.filter((item) => item.slug !== product.slug && item.availability !== "indisponivel")
    .sort((a, b) => Number(b.condition === product.condition) - Number(a.condition === product.condition)).slice(0, 3);

  return (
    <div className="wrap inner-page detail-page">
      <Breadcrumbs items={[{ label: "iPhones", href: paths.iphones }, { label: product.model }]} />
      <div className="detail-grid">
        <Gallery key={product.slug} product={product} />
        <div className="detail-summary">
          <div className="detail-tags">
            <ProductCondition condition={product.condition} />
            {product.demo && <span className="inline-demo">Demonstração</span>}
          </div>
          <h1>{product.model}</h1>
          <Availability product={product} />
          <dl className="detail-specs">
            <div><dt>Capacidade</dt><dd><HardDrive size={17} aria-hidden="true" />{capacityLabel(product.capacity)}</dd></div>
            <div><dt>Cor</dt><dd><i aria-hidden="true" className="swatch" style={{ backgroundColor: product.swatch }} />{product.color}</dd></div>
          </dl>
          <div className="detail-price">
            {price && <span>Preço</span>}
            <strong>{priceLabel(product)}</strong>
            <p>{price?.payment ?? "Confirme as condições de pagamento com a loja."}</p>
          </div>
          {unavailable ? (
            <>
              <p className="unavailable-note">{product.demo ? "Este exemplo mostra como a ficha aparece quando uma unidade está indisponível." : "Esta unidade está indisponível. Consulte outras opções no catálogo."}</p>
              <Link href={paths.iphones} className="button button--primary">Ver outros iPhones</Link>
              {contact && <a className="text-link unavailable-contact" href={contact} target="_blank" rel="noopener noreferrer">Consultar este modelo no WhatsApp</a>}
            </>
          ) : (
            <div className="detail-actions">
              <WhatsAppButton className="detail-action-desktop" href={contact} describedBy="buy-contact-hint">Tenho interesse neste iPhone</WhatsAppButton>
              <Link className="button button--secondary" href={tradeHref}><Repeat2 size={20} aria-hidden="true" />Quero usar meu iPhone na troca</Link>
              <p className="action-hint" id="buy-contact-hint">{contactHint}</p>
            </div>
          )}
          {product.demo && <Note className="detail-demo-note">{demo.product}</Note>}
        </div>
      </div>

      <section className="detail-more section" aria-labelledby="unit-details">
        <h2 id="unit-details">Detalhes da unidade.</h2>
        <dl className="unit-details">
          {product.condition === "seminovo" && (
            <>
              <div><dt>Saúde da bateria</dt><dd>{product.battery == null ? "A confirmar" : product.battery + "%" + (product.demo ? " (exemplo)" : "")}</dd></div>
              <div><dt>Conservação</dt><dd>{product.conservation ? product.conservation + (product.demo ? " (exemplo)" : "") : "A confirmar na avaliação da unidade"}</dd></div>
            </>
          )}
          <div><dt>Garantia</dt><dd>{product.warranty ?? "Confirme com a loja"}</dd></div>
          <div><dt>Itens inclusos</dt><dd>{product.included ?? "Confirme com a loja"}</dd></div>
        </dl>
      </section>

      <section className="section detail-process split-section" aria-labelledby="next-steps">
        <div className="section-intro">
          <h2 id="next-steps">Como comprar.</h2>
          <Link className="text-link" href={paths.guide}>Entenda o atendimento</Link>
        </div>
        <Timeline steps={purchaseSteps} />
      </section>

      {related.length > 0 && (
        <section className="section detail-related" aria-labelledby="related-title">
          <div className="section-heading">
            <h2 id="related-title">Outros iPhones.</h2>
            <Link className="text-link" href={paths.iphones}>Ver todo o catálogo</Link>
          </div>
          <div className="home-product-grid">
            {related.map((item) => <ProductCard product={item} key={item.slug} />)}
          </div>
        </section>
      )}

      {!unavailable && (
        <aside className="product-dock" aria-label="Ação para este iPhone">
          <div className="product-dock-inner">
            <WhatsAppButton href={contact} describedBy="mobile-contact-hint">Tenho interesse neste iPhone</WhatsAppButton>
            <p className="action-hint" id="mobile-contact-hint">{contact ? "Abre uma mensagem no WhatsApp." : contactHint}</p>
          </div>
        </aside>
      )}
    </div>
  );
}
