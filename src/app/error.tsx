"use client";

import Link from "next/link";
import { paths } from "@/data/site";

export default function PageError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap inner-page">
      <div className="empty-state" role="alert">
        <h1>Não foi possível abrir esta página.</h1>
        <p>Tente carregar novamente ou volte ao início.</p>
        <div className="actions">
          <button className="button button--primary" type="button" onClick={reset}>Tentar novamente</button>
          <Link className="button button--secondary" href={paths.home}>Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
