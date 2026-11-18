import Link from "next/link";
import { ButtonLink, Notice, PlanCard } from "@/components/ui";

const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    description: "Verifique apenas se a placa segue um formato brasileiro conhecido.",
    items: ["Formato antigo e Mercosul", "Sem cadastro", "Sem consulta de dados do veículo"],
  },
  {
    name: "Essencial",
    price: "R$ 19,90",
    description: "Situação cadastral e restrições conforme as fontes disponíveis.",
    items: ["Dados cadastrais", "Gravame e restrições", "Recall e débitos disponíveis"],
  },
  {
    name: "Completo",
    price: "R$ 39,90",
    description: "Verificações adicionais para apoiar a análise pré-compra.",
    items: ["Tudo do Essencial", "Histórico de leilão", "FIPE e histórico autorizado"],
  },
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Link href="/" className="brand" aria-label="Checkplaca, início">
            <span className="brand__accent">check</span>placa
          </Link>
          <a className="site-header__link" href="#planos">Conheça os planos</a>
        </div>
      </header>
      <main>
        <section className="shell hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow">Informação para decidir melhor</p>
            <h1 id="hero-title">Mais clareza antes de comprar um veículo.</h1>
            <p className="lead">Comece pelo formato da placa. Quando as consultas estiverem disponíveis, veja informações veiculares em um relatório fácil de entender.</p>
            <div className="actions">
              <ButtonLink href="#planos">Ver opções de consulta</ButtonLink>
              <ButtonLink href="#como-funciona" variant="secondary">Como funciona</ButtonLink>
            </div>
          </div>
          <aside className="hero__panel" id="como-funciona">
            <p className="eyebrow">O primeiro passo</p>
            <h2>Comece com a placa.</h2>
            <p>O validador gratuito verificará apenas se a combinação segue o padrão brasileiro antigo ou Mercosul.</p>
            <div className="plate-example">
              <span>Exemplos de formato</span>
              <strong>AAA1234 <span aria-hidden="true">·</span> AAA1A23</strong>
            </div>
            <p className="hero__disclaimer">Formato válido não confirma que o veículo existe, está regular ou pertence a determinado modelo.</p>
          </aside>
        </section>
        <section className="shell plans" id="planos" aria-labelledby="plans-title">
          <p className="eyebrow">Opções de consulta</p>
          <h2 id="plans-title">Escolha o nível de informação.</h2>
          <p className="section-intro">A validação gratuita e os planos pagos têm finalidades diferentes. A disponibilidade de cada fonte será informada no relatório.</p>
          <div className="plan-grid">
            {plans.map((plan) => <PlanCard key={plan.name} {...plan} featured={plan.name === "Essencial"} />)}
          </div>
          <Notice>As consultas pagas ainda estão em preparação. Nenhuma cobrança ou consulta a fornecedores é realizada nesta etapa.</Notice>
        </section>
      </main>
      <footer className="site-footer"><div className="shell">© Checkplaca · Informações para apoiar sua decisão.</div></footer>
    </>
  );
}
