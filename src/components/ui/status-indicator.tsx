type Status = "clear" | "alert" | "inconclusive" | "unavailable" | "not_included" | "not_applicable" | "not_found";

const labels: Record<Status, string> = {
  clear: "Sem ocorrência",
  alert: "Atenção",
  inconclusive: "Inconclusivo",
  unavailable: "Indisponível",
  not_included: "Não incluído",
  not_applicable: "Não aplicável",
  not_found: "Registro não localizado",
};

export function StatusIndicator({ status }: { status: Status }) {
  return <span className={`status status--${status}`}><span className="status__dot" aria-hidden="true" />{labels[status]}</span>;
}
