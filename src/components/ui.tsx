import Link from "next/link";
import { ChevronDown, Image as ImageIcon, Info, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import type { Product } from "@/data/products";
import { conditionInfo, home, paths, type Faq } from "@/data/site";
import { availabilityLabel } from "@/lib/commerce";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Você está em">
      <ol>
        <li><Link href={paths.home}>Início</Link></li>
        {items.map(({ label, href }) => (
          <li key={label}>
            {href ? <Link href={href}>{label}</Link> : <span aria-current="page">{label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function Note({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={"notice " + className}>
      <Info aria-hidden="true" size={17} />
      <span>{children}</span>
    </p>
  );
}

export function ImageStamp({ children }: { children: ReactNode }) {
  return <span className="image-stamp"><ImageIcon size={14} aria-hidden="true" />{children}</span>;
}

export function ProductCondition({ condition }: Pick<Product, "condition">) {
  return <span className={"condition-tag condition-tag--" + condition}>{conditionInfo[condition].title}</span>;
}

export function Availability({ product }: { product: Product }) {
  const state = product.demo && product.availability === "disponivel" ? "confirmar" : product.availability;
  return <span className={"availability availability--" + state}><i aria-hidden="true" />{availabilityLabel(product)}</span>;
}

export function WhatsAppButton({ href, children, className = "", describedBy }: {
  href?: string;
  children: ReactNode;
  className?: string;
  describedBy?: string;
}) {
  const classes = "button button--primary " + className;
  const content = <><MessageCircle size={19} aria-hidden="true" />{children}</>;
  if (!href) return <button className={classes} type="button" disabled aria-describedby={describedBy}>{content}</button>;
  return <a className={classes} href={href} target="_blank" rel="noopener noreferrer" aria-describedby={describedBy}>{content}</a>;
}

export function Timeline({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="timeline">
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className="timeline-number" aria-hidden="true">{index + 1}</span>
          <div><h3>{step.title}</h3><p>{step.description}</p></div>
        </li>
      ))}
    </ol>
  );
}

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="faq-list">
      {items.map(({ id, question, answer }) => (
        <details key={id} id={id}>
          <summary>{question}<ChevronDown aria-hidden="true" size={20} /></summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}

export function Closing({ title = home.closing.title }: { title?: string }) {
  return (
    <section className="section closing-section" aria-label={title}>
      <div className="wrap closing" data-reveal data-spotlight>
        <h2>{title}</h2>
        <div className="actions">
          <Link className="button button--primary" href={paths.iphones} data-magnetic>Explorar iPhones</Link>
          <Link className="button button--secondary" href={paths.trade} data-magnetic>Quero trocar meu iPhone</Link>
        </div>
      </div>
    </section>
  );
}

