import type { Metadata } from "next";
import { ButtonLink, EmptyState, Field, Notice, PlanCard, Skeleton, StatusIndicator } from "@/components/ui";

export const metadata: Metadata = { title: "Componentes | Checkplaca", robots: { index: false, follow: false } };

export default function DesignSystemPage() {
  return <main className="shell showcase">
    <p className="eyebrow">Referência de interface</p>
    <h1>Componentes da Checkplaca</h1>
    <p className="lead">Exemplos de estados de interface para revisão visual. Nenhum resultado veicular é exibido nesta página.</p>
    <section aria-labelledby="actions-title">
      <h2 id="actions-title">Ações e formulário</h2>
      <div className="actions"><ButtonLink href="/">Ação principal</ButtonLink><ButtonLink href="/" variant="secondary">Ação secundária</ButtonLink><ButtonLink href="/" variant="quiet">Ação discreta</ButtonLink></div>
      <div className="showcase__fields"><Field id="example-email" label="E-mail" type="email" autoComplete="email" hint="Exemplo de campo com instrução." /><Field id="example-error" label="Código" error="Confira o código informado." /></div>
    </section>
    <section aria-labelledby="states-title">
      <h2 id="states-title">Estados de verificação</h2>
      <div className="status-grid">{(["clear", "alert", "inconclusive", "unavailable", "not_included", "not_applicable", "not_found"] as const).map((status) => <StatusIndicator key={status} status={status} />)}</div>
      <Notice>Mensagem informativa.</Notice><Notice tone="warning">Um módulo pode exigir atenção.</Notice><Notice tone="danger">Não foi possível concluir esta etapa.</Notice>
    </section>
    <section aria-labelledby="content-title">
      <h2 id="content-title">Conteúdo</h2>
      <div className="showcase__columns"><EmptyState title="Nenhum item por enquanto" description="Quando houver informações disponíveis, elas aparecerão aqui." /><Skeleton label="Exemplo de carregamento" /></div>
      <div className="showcase__plan"><PlanCard name="Exemplo de card" price="R$ 19,90" description="Visualização de um plano com conteúdo demonstrativo." items={["Primeiro item", "Segundo item"]} featured /></div>
    </section>
  </main>;
}
