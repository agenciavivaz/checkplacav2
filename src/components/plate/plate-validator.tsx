"use client";

import { useState, type FormEvent } from "react";
import { validatePlate, type PlateValidation } from "@/lib/vehicles/plate";

const errors = {
  empty: "Digite uma placa para verificar o formato.",
  length: "A placa precisa ter sete caracteres, sem contar espaços ou hífen.",
  characters: "Use apenas letras de A a Z e números de 0 a 9.",
  pattern: "Use o padrão antigo AAA1234 ou Mercosul AAA1A23.",
};

export function PlateValidator() {
  const [plate, setPlate] = useState("");
  const [result, setResult] = useState<PlateValidation | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(validatePlate(plate));
  }

  return <form className="plate-form" onSubmit={submit} noValidate>
    <label htmlFor="plate-free">Confira o formato da placa gratuitamente</label>
    <div className="plate-form__row">
      <input id="plate-free" type="text" inputMode="text" autoComplete="off" autoCapitalize="characters" maxLength={12} value={plate} onChange={(event) => { setPlate(event.target.value); setResult(null); }} placeholder="AAA1A23" aria-describedby="plate-free-help plate-free-result" aria-invalid={result?.valid === false} />
      <button className="button button--primary" type="submit">Validar formato</button>
    </div>
    <p id="plate-free-help" className="plate-form__help">Aceita placas antigas e Mercosul. Nenhuma consulta veicular é feita.</p>
    <div id="plate-free-result" className="plate-form__result" aria-live="polite">
      {result?.valid === true && <p className="plate-form__success">Formato de placa válido. Isso não confirma que o veículo existe, está regular ou pertence a determinado modelo.</p>}
      {result?.valid === false && <p className="plate-form__error">{errors[result.reason]}</p>}
    </div>
  </form>;
}
