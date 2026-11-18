export function Skeleton({ label = "Carregando conteúdo", lines = 3 }: { label?: string; lines?: number }) {
  return <div className="skeleton" role="status" aria-label={label}>
    {Array.from({ length: lines }, (_, index) => <span className="skeleton__line" key={index} aria-hidden="true" />)}
  </div>;
}
