"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ListFilter, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { products, type Product } from "@/data/products";
import { conditionInfo, paths } from "@/data/site";
import { availabilityLabel, capacityLabel, confirmedPrice, priceLabel, productPath } from "@/lib/commerce";
import { Drawer } from "./drawer";
import { ProductCard } from "./product-card";
import { SelectInput } from "./select-input";

const compareLimit = 2;
const modelOptions = [...new Set(products.map(({ model }) => model))].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
const capacityOptions = [...new Set(products.map(({ capacity }) => capacity))].sort((a, b) => a - b);
const hasPrices = products.some((product) => confirmedPrice(product));
const allPriceRanges = [
  { value: "ate-3500", label: "Até R$ 3.500", min: 0, max: 3500 },
  { value: "3500-6000", label: "Acima de R$ 3.500 até R$ 6.000", min: 3500, max: 6000 },
  { value: "acima-6000", label: "Acima de R$ 6.000", min: 6000, max: Infinity },
];
const sorts = [
  { value: "", label: "Em destaque" },
  { value: "modelo", label: "Modelo A–Z" },
  { value: "capacidade", label: "Maior capacidade" },
  ...(hasPrices ? [{ value: "menor-preco", label: "Menor preço" }, { value: "maior-preco", label: "Maior preço" }] : []),
];

const filterOptions = {
  modelo: modelOptions.map((model) => ({ value: model, label: model })),
  capacidade: capacityOptions.map((capacity) => ({ value: String(capacity), label: capacityLabel(capacity) })),
  condicao: Object.entries(conditionInfo).map(([value, { title }]) => ({ value, label: title })),
  preco: hasPrices ? allPriceRanges : [],
};
const filterFields = [
  { name: "modelo", label: "Modelo", all: "Todos" },
  { name: "capacidade", label: "Capacidade", all: "Todas" },
  { name: "condicao", label: "Condição", all: "Todas" },
  ...(hasPrices ? [{ name: "preco" as const, label: "Faixa de preço", all: "Todos os preços" }] : []),
] as const;
type FilterName = keyof typeof filterOptions;

function FilterControls({ prefix, values, onChange, onClear, active }: {
  prefix: string;
  values: Record<FilterName, string>;
  onChange: (name: FilterName, value: string) => void;
  onClear: () => void;
  active: boolean;
}) {
  return (
    <div className="filter-fields">
      {filterFields.map(({ name, label, all }) => {
        const id = prefix + "-" + name;
        return (
          <div className="field" key={name}>
            <label htmlFor={id}>{label}</label>
            <SelectInput id={id} value={values[name]} onChange={(event) => onChange(name, event.target.value)}>
              <option value="">{all}</option>
              {filterOptions[name].map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </SelectInput>
          </div>
        );
      })}
      {active && <button className="text-link filter-clear" type="button" onClick={onClear}>Limpar filtros</button>}
    </div>
  );
}

function compareTable(items: Product[]) {
  const rows: { label: string; value: (product: Product) => ReactNode }[] = [
    { label: "Condição", value: (product) => conditionInfo[product.condition].title },
    { label: "Capacidade", value: (product) => capacityLabel(product.capacity) },
    { label: "Cor", value: (product) => product.color },
    { label: "Disponibilidade", value: availabilityLabel },
    { label: "Preço", value: priceLabel },
    { label: "Bateria", value: (product) => {
      if (product.condition === "lacrado") return "—";
      return product.battery == null ? "A confirmar" : product.battery + "%" + (product.demo ? " (exemplo)" : "");
    } },
  ];

  return (
    <table className="compare-table">
      <caption className="sr-only">Comparação dos iPhones selecionados</caption>
      <thead><tr><th scope="col">Atributo</th>{items.map((product) => (
        <th scope="col" key={product.slug}>{product.model}{product.demo && <small>Demonstração</small>}</th>
      ))}</tr></thead>
      <tbody>
        {rows.map(({ label, value }) => <tr key={label}><th scope="row">{label}</th>{items.map((product) => <td key={product.slug}>{value(product)}</td>)}</tr>)}
        <tr><th scope="row" className="compare-actions-label"><span className="sr-only">Abrir ficha</span></th>{items.map((product) => (
          <td key={product.slug}><Link className="text-link" href={productPath(product)} aria-label={"Ver detalhes de " + product.model}>Ver detalhes</Link></td>
        ))}</tr>
      </tbody>
    </table>
  );
}

export function Catalog() {
  const query = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const selectedProducts = selectedSlugs.flatMap((slug) => products.filter((product) => product.slug === slug));
  const values = {
    modelo: filterOptions.modelo.find(({ value }) => value === query.get("modelo"))?.value ?? "",
    capacidade: filterOptions.capacidade.find(({ value }) => value === query.get("capacidade"))?.value ?? "",
    condicao: filterOptions.condicao.find(({ value }) => value === query.get("condicao"))?.value ?? "",
    preco: filterOptions.preco.find(({ value }) => value === query.get("preco"))?.value ?? "",
  };
  const sort = sorts.find(({ value }) => value === query.get("ordem"))?.value ?? "";
  const activeFilters = filterFields.filter(({ name }) => values[name]);
  const priceRange = allPriceRanges.find(({ value }) => value === values.preco);
  const shown = products.filter((product) => {
    const price = confirmedPrice(product);
    return (!values.modelo || product.model === values.modelo)
      && (!values.capacidade || String(product.capacity) === values.capacidade)
      && (!values.condicao || product.condition === values.condicao)
      && (!priceRange || Boolean(price && price.amount > priceRange.min && price.amount <= priceRange.max));
  });

  if (sort === "modelo") shown.sort((a, b) => a.model.localeCompare(b.model, "pt-BR", { numeric: true }));
  if (sort === "capacidade") shown.sort((a, b) => b.capacity - a.capacity);
  if (sort === "menor-preco" || sort === "maior-preco") {
    shown.sort((a, b) => {
      const first = confirmedPrice(a);
      const second = confirmedPrice(b);
      if (first && second) return sort === "menor-preco" ? first.amount - second.amount : second.amount - first.amount;
      return Number(Boolean(second)) - Number(Boolean(first));
    });
  }

  const resultCount = shown.length === 1 ? "1 aparelho" : shown.length + " aparelhos";

  function updateSearch(params: Partial<Record<FilterName | "ordem", string>>) {
    const next = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    window.history.replaceState(null, "", paths.iphones + (next.size ? "?" + next.toString() : ""));
  }

  const changeFilter = (name: FilterName, value: string) => updateSearch({ [name]: value });
  const clearFilters = () => updateSearch({ modelo: "", capacidade: "", condicao: "", preco: "" });

  function toggleCompare(slug: string) {
    setSelectedSlugs((previous) => {
      if (previous.includes(slug)) return previous.filter((item) => item !== slug);
      return previous.length < compareLimit ? [...previous, slug] : previous;
    });
  }

  return (
    <div className="catalog-layout">
      <aside className="catalog-sidebar" aria-label="Filtros do catálogo">
        <div className="filter-title"><ListFilter aria-hidden="true" size={20} /><h2>Filtros</h2></div>
        <FilterControls prefix="desktop" values={values} onChange={changeFilter} onClear={clearFilters} active={Boolean(activeFilters.length)} />
      </aside>
      <section className="catalog-results" aria-label="Aparelhos do catálogo">
        <div className="catalog-toolbar">
          <p className="catalog-count" role="status">{resultCount}</p>
          <div className="catalog-tools">
            <button type="button" className="button button--secondary button--small mobile-filters" onClick={() => setFilterOpen(true)} aria-haspopup="dialog" aria-expanded={filterOpen}>
              <ListFilter size={18} aria-hidden="true" />Filtros{activeFilters.length ? " (" + activeFilters.length + ")" : ""}
            </button>
            <div className="sort-field">
              <label htmlFor="catalog-order">Ordenar</label>
              <SelectInput id="catalog-order" value={sort} onChange={(event) => updateSearch({ ordem: event.target.value })}>
                {sorts.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </SelectInput>
            </div>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <ul className="active-filters" aria-label="Filtros selecionados">
            {activeFilters.map(({ name, label }) => {
              const selected = filterOptions[name].find(({ value }) => value === values[name])?.label;
              return (
                <li key={name}>
                  <button type="button" className="filter-chip" onClick={() => changeFilter(name, "")} aria-label={"Remover filtro " + label + ": " + selected}>
                    {selected}<X aria-hidden="true" size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {shown.length > 0 ? (
          <div className="catalog-grid">
            {shown.map((product) => <ProductCard key={product.slug} product={product}
              compare={{ selected: selectedSlugs.includes(product.slug), full: selectedSlugs.length === compareLimit, onToggle: () => toggleCompare(product.slug) }} />)}
          </div>
        ) : (
          <div className="empty-state">
            <span className="feature-icon"><Search size={24} aria-hidden="true" /></span>
            <h2>{activeFilters.length ? "Nenhum iPhone com esses filtros." : "O catálogo está sem aparelhos no momento."}</h2>
            <p>{activeFilters.length ? "Experimente outra combinação ou limpe os filtros para ver todos os aparelhos." : "Você pode conhecer o processo de compra enquanto os modelos são atualizados."}</p>
            {activeFilters.length
              ? <button className="button button--primary" type="button" onClick={clearFilters}>Limpar filtros</button>
              : <Link className="button button--secondary" href={paths.guide}>Como funciona</Link>}
          </div>
        )}
      </section>

      <Drawer title="Filtros" open={filterOpen} onClose={() => setFilterOpen(false)}>
        <FilterControls prefix="mobile" values={values} onChange={changeFilter} onClear={clearFilters} active={Boolean(activeFilters.length)} />
        <button className="button button--primary drawer-apply" type="button" onClick={() => setFilterOpen(false)}>
          {shown.length > 0 ? "Ver " + resultCount : "Ver resultados"}
        </button>
      </Drawer>

      {selectedProducts.length > 0 && (
        <aside className="compare-tray" aria-label="Seleção para comparação">
          <div className="compare-tray-inner">
            <div role="status">
              <strong>{selectedProducts.length} de {compareLimit} selecionados</strong>
              <p>{selectedProducts.map(({ model }) => model).join(" · ")}</p>
            </div>
            <button type="button" className="icon-button" aria-label="Limpar seleção de comparação" onClick={() => setSelectedSlugs([])}>
              <X size={18} aria-hidden="true" />
            </button>
            <button type="button" className="button button--primary button--small" aria-haspopup="dialog"
              disabled={selectedProducts.length < compareLimit} onClick={() => setCompareOpen(true)}>Comparar</button>
          </div>
        </aside>
      )}

      <Drawer title="Compare os iPhones" open={compareOpen} onClose={() => setCompareOpen(false)} variant="center">
        {compareTable(selectedProducts)}
      </Drawer>
    </div>
  );
}
