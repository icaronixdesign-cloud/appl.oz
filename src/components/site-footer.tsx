import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { demo, navigation, site } from "@/data/site";
import { whatsappLink } from "@/lib/commerce";
import { Brand } from "./brand";

export function SiteFooter() {
  const contact = whatsappLink("Olá! Vim pelo site da Appl.Oz e gostaria de tirar uma dúvida.");

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>iPhones lacrados e seminovos em Osasco.</p>
          </div>
          <nav aria-label="Links no rodapé" className="footer-links">
            {navigation.slice(1).map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
          <div className="footer-contact">
            <span><MapPin size={17} aria-hidden="true" /> {site.location}</span>
            {contact && (
              <a href={contact} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={17} aria-hidden="true" /> WhatsApp <span className="sr-only">{site.whatsapp.display}, abre em outra aba</span>
              </a>
            )}
            {site.instagramUrl && <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>}
          </div>
        </div>
        <div className="footer-bottom">
          <span>{site.name}</span>
          {site.prototype && <span>{demo.disclaimer}</span>}
        </div>
      </div>
    </footer>
  );
}
