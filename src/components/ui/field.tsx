import type { InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function Field({ id, label, hint, error, className = "", ...inputProps }: FieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return <div className={`field ${className}`}>
    <label className="field__label" htmlFor={id}>{label}</label>
    <input className="field__input" id={id} aria-invalid={Boolean(error)} aria-describedby={descriptionId} {...inputProps} />
    {error ? <p className="field__error" id={descriptionId} role="alert">{error}</p> : hint ? <p className="field__hint" id={descriptionId}>{hint}</p> : null}
  </div>;
}
