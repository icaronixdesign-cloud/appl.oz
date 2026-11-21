export function LoadingState({ label = "Carregando a página…" }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      <p>{label}</p>
      <div aria-hidden="true" className="skeleton-line" />
      <div aria-hidden="true" className="skeleton-line skeleton-line--short" />
      <div aria-hidden="true" className="skeleton-grid"><span /><span /><span /></div>
    </div>
  );
}
