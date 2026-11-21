"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigation, paths } from "@/data/site";
import { Brand } from "./brand";
import { Drawer } from "./drawer";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [scrollState, setScrollState] = useState({ hidden: false, scrolled: false });
  const headerRef = useRef<HTMLElement>(null);

  // Glass header that steps aside while reading down and returns on the way up.
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      const focusInside = headerRef.current?.contains(document.activeElement) ?? false;
      setScrollState((current) => {
        const hidden = focusInside ? false : y > 240 && Math.abs(delta) > 4 ? delta > 0 : current.hidden && y > 240;
        const scrolled = y > 12;
        return hidden === current.hidden && scrolled === current.scrolled ? current : { hidden, scrolled };
      });
      if (Math.abs(delta) > 4) last = y;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  function navLinks(onSelect?: () => void) {
    return navigation.map(({ href, label }) => {
      const current = href === paths.home ? pathname === href : pathname.startsWith(href);
      return (
        <Link key={href} className="nav-link" href={href} aria-current={current ? "page" : undefined} onClick={onSelect}>
          {label}
        </Link>
      );
    });
  }

  return (
    <header
      ref={headerRef}
      className="site-header"
      data-hidden={scrollState.hidden && menuPath !== pathname ? "true" : undefined}
      data-scrolled={scrollState.scrolled ? "true" : undefined}
      data-home={pathname === paths.home ? "true" : undefined}
    >
      <div className="wrap header-grid">
        <Brand />
        <nav className="nav-desktop" aria-label="Navegação principal">{navLinks()}</nav>
        <div className="header-actions">
          <Link href={paths.iphones} className="button button--primary button--small header-cta">
            <span className="header-cta-long">Explorar iPhones</span>
            <span className="header-cta-short">Ver iPhones</span>
          </Link>
          <button
            className="icon-button menu-toggle"
            type="button"
            onClick={() => setMenuPath(pathname)}
            aria-label="Abrir menu de navegação"
            aria-haspopup="dialog"
            aria-expanded={menuPath === pathname}
          >
            <Menu aria-hidden="true" size={23} />
          </button>
        </div>
      </div>
      <Drawer title="Navegação" open={menuPath === pathname} onClose={() => setMenuPath(null)}>
        <nav className="nav-mobile" aria-label="Navegação principal">{navLinks(() => setMenuPath(null))}</nav>
      </Drawer>
    </header>
  );
}
