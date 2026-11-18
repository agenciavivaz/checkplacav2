import type { ReactNode } from "react";

export type PlanCardProps = {
  name: string;
  price: string;
  description: string;
  items: readonly string[];
  footer?: ReactNode;
  featured?: boolean;
};

export function PlanCard({ name, price, description, items, footer, featured = false }: PlanCardProps) {
  return (
    <article className={`plan-card${featured ? " plan-card--featured" : ""}`}>
      <div>
        <h3 className="plan-card__name">{name}</h3>
        <p className="plan-card__price">{price}<span> por consulta</span></p>
        <p className="plan-card__description">{description}</p>
      </div>
      <ul className="plan-card__features">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
      {footer && <div className="plan-card__footer">{footer}</div>}
    </article>
  );
}
