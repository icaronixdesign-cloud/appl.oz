import Link from "next/link";
import { paths } from "@/data/site";

export default function NotFound() {
  return (
    <div className="wrap inner-page">
      <div className="empty-state">
        <h1>Página não encontrada.</h1>
        <p>O link pode ter mudado. Explore o catálogo para encontrar outro aparelho.</p>
        <Link className="button button--primary" href={paths.iphones}>Explorar iPhones</Link>
      </div>
    </div>
  );
}
