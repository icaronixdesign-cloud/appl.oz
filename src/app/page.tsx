import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardList, Image as ImageIcon, MessageCircle, Repeat2, ShieldCheck, Smartphone } from "lucide-react";
import { home, homeFaqs, paths, site, tradeSteps } from "@/data/site";
import { HomeMotion } from "@/components/experience/home-motion";
import { PhoneExperience } from "@/components/experience/phone-experience";
import { HomeExplorer } from "@/components/home-explorer";
import { SplitText } from "@/components/split-text";
import { Closing, FaqList } from "@/components/ui";

const stepIcons = [Smartphone, MessageCircle, Repeat2];

export default function HomePage() {
  const storePhoto = site.store.photo;

  return (
    <>
      <PhoneExperience />

      <HomeExplorer />

      <section id="caminhos" className="section section--paths" aria-labelledby="paths-title">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow" data-reveal>Dois caminhos</p>
              <SplitText id="paths-title">Escolha seu caminho.</SplitText>
            </div>
          </div>
          <div className="path-grid">
            <Link className="path-card" href={paths.iphones} data-spotlight data-reveal>
              <span className="feature-icon"><Smartphone size={24} aria-hidden="true" /></span>
              <div>
                <h3>{home.routes.buy.title}</h3>
                <p>{home.routes.buy.description}</p>
                <span className="path-action">{home.routes.buy.action}<ArrowRight size={16} aria-hidden="true" /></span>
              </div>
              <span className="path-index" aria-hidden="true">01</span>
            </Link>
            <Link className="path-card" href={paths.trade} data-spotlight data-reveal>
              <span className="feature-icon"><Repeat2 size={25} aria-hidden="true" /></span>
              <div>
                <h3>{home.routes.trade.title}</h3>
                <p>{home.routes.trade.description}</p>
                <span className="path-action">{home.routes.trade.action}<ArrowRight size={16} aria-hidden="true" /></span>
              </div>
              <span className="path-index" aria-hidden="true">02</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="rail" data-rail aria-labelledby="trade-home-title">
        <div className="rail-head wrap">
          <p className="eyebrow">Como funciona a troca</p>
          <div className="rail-progress" data-rail-progress aria-hidden="true"><span /></div>
        </div>
        <div className="rail-viewport">
          <ol className="rail-track" data-rail-track>
            <li className="rail-panel rail-panel--intro" data-rail-panel>
              <div className="rail-intro">
                <h2 id="trade-home-title">{home.trade.title}</h2>
                <p>{home.trade.description}</p>
                <Link className="button button--primary" href={paths.trade} data-magnetic>Iniciar avaliação<ArrowRight size={17} aria-hidden="true" /></Link>
              </div>
            </li>
            {tradeSteps.map((step, index) => {
              const Icon = stepIcons[index] ?? ClipboardList;
              return (
                <li className="rail-panel" data-rail-panel key={step.title}>
                  <span className="rail-number" data-rail-number aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <article className="rail-card" data-rail-card data-trade-step={index + 1}>
                    <span className="rail-card-icon"><Icon size={26} aria-hidden="true" /></span>
                    <p className="rail-card-step">Etapa {index + 1} de {tradeSteps.length}</p>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                </li>
              );
            })}
            <li className="rail-panel rail-panel--end" data-rail-panel>
              <div className="rail-card rail-card--cta" data-rail-card>
                <h3>Pronto para avaliar o seu?</h3>
                <p>Comece pelo modelo e pela capacidade do seu iPhone. Você revisa tudo antes de enviar.</p>
                <Link className="button button--primary" href={paths.trade} data-magnetic>Quero trocar meu iPhone</Link>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="zoom-section" data-zoom aria-labelledby="trust-title">
        <div className="zoom-media" data-zoom-media>
          {storePhoto ? (
            <Image src={storePhoto.src} alt={storePhoto.alt} fill sizes="100vw" className="image-cover" data-zoom-image />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.detailArt} alt="Detalhe das câmeras do iPhone 18 Pro Max" width={1800} height={1350} loading="lazy" data-zoom-image />
          )}
          <div className="zoom-shade" aria-hidden="true" />
        </div>
        <div className="wrap zoom-copy" data-zoom-copy>
          <p className="eyebrow">{home.trust.title}</p>
          <h2 id="trust-title">Não vendemos vitrine.</h2>
          <p>{home.trust.displayUnits}</p>
          <div className="zoom-points">
            <span><ShieldCheck size={18} aria-hidden="true" />Lacrados e seminovos identificados</span>
            <span><MessageCircle size={18} aria-hidden="true" />Confirmação pelo WhatsApp</span>
          </div>
          <Link className="text-link" href={paths.guide + "#condicao"}>Entenda as condições dos aparelhos</Link>
        </div>
      </section>

      <section className="section section--clients" aria-labelledby="clients-title">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow" data-reveal>Depoimentos</p>
              <SplitText id="clients-title">{home.clients.title}</SplitText>
              <p className="section-lede" data-reveal>{home.trust.description}</p>
            </div>
          </div>
          <div className="clients-grid">
            {site.testimonials.length ? site.testimonials.map((item) => (
              <figure className="client-item" key={item.name + item.quote} data-reveal>
                <div className="client-avatar">
                  {item.photo
                    ? <Image src={item.photo.src} alt={item.photo.alt} sizes="64px" fill className="image-cover" />
                    : <ImageIcon size={20} aria-hidden="true" />}
                </div>
                <div><blockquote>{item.quote}</blockquote><figcaption>{item.name}</figcaption></div>
              </figure>
            )) : ["Avaliação de cliente", "Depoimento de cliente"].map((label) => (
              <div className="client-item client-item--placeholder" key={label} data-reveal>
                <div className="client-avatar"><ImageIcon size={20} aria-hidden="true" /></div>
                <div><h3>{label}</h3><p>{home.clients.placeholder}</p><small>Foto de cliente · 1:1</small></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section faq-home" aria-labelledby="faq-home-title">
        <div className="wrap split-section">
          <div className="section-intro">
            <p className="eyebrow" data-reveal>Dúvidas</p>
            <SplitText id="faq-home-title">Dúvidas frequentes.</SplitText>
            <Link className="text-link" href={paths.faq} data-reveal>Ver todas as dúvidas</Link>
          </div>
          <div data-reveal><FaqList items={homeFaqs} /></div>
        </div>
      </section>

      <Closing />
      <HomeMotion />
    </>
  );
}
