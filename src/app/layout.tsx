import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/data/site";
import "./globals.css";
import "../styles/experience.css";
import "../styles/home.css";
import "../styles/commerce.css";
import "../styles/trade.css";

export const metadata: Metadata = {
  title: { default: site.name + " | iPhones em Osasco", template: "%s | " + site.name },
  description: site.description,
  robots: site.prototype ? { index: false, follow: false } : undefined,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <SiteHeader />
        <main id="conteudo" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
