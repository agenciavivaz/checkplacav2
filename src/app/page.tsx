import Link from "next/link";
import { ButtonLink, Notice, PlanCard } from "@/components/ui";
import { PlateValidator } from "@/components/plate/plate-validator";
import { getVisibleOffers } from "@/lib/catalog/server";

export const instant = false;

export default async function Home() {
  const offers = await getVisibleOffers();
  return (
    <>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Link href="/" className="brand" aria-label="Checkplaca, início">
            <span className="brand__accent">check</span>placa
          </Link>
          <nav className="site-header__nav" aria-label="Navegação principal">
            <a className="site-header__link" href="#planos">Conheça os planos</a>
            <Link className="site-header__link" href="/conta">Minha conta</Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="shell hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow">Informação para decidir melhor</p>
            <h1 id="hero-title">Mais clareza antes de comprar um veículo.</h1>
            <p className="lead">Comece pelo formato da placa. Quando as consultas estiverem disponíveis, veja informações veiculares em um relatório fácil de entender.</p>
            <PlateValidator />
            <div className="actions">
              <ButtonLink href="#planos" variant="secondary">Ver opções de consulta</ButtonLink>
            </div>
          </div>
          <aside className="hero__panel" id="como-funciona">
            <p className="eyebrow">O primeiro passo</p>
            <h2>Comece com a placa.</h2>
            <p>O validador gratuito verifica apenas se a combinação segue o padrão brasileiro antigo ou Mercosul.</p>
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
            {offers.map((plan) => <PlanCard key={plan.code} {...plan} featured={plan.code === "essential"} footer={plan.code !== "free" ? <ButtonLink href={`/checkout?plan=${plan.code}`} variant="secondary">Selecionar {plan.name}</ButtonLink> : undefined} />)}
          </div>
          <Notice>As consultas pagas ainda estão em preparação. Nenhuma cobrança ou consulta a fornecedores é realizada nesta etapa.</Notice>
        </section>
      </main>
      <footer className="site-footer"><div className="shell">© Checkplaca · Informações para apoiar sua decisão.</div></footer>
    </>
  );
}
