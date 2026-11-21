"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Pencil, Repeat2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { products, tradeCapacities, tradeConditions, tradeModels } from "@/data/products";
import { conditionInfo, paths, tradeCopy } from "@/data/site";
import { batteryLabel, capacityLabel, currentCapacity, currentModel, otherModel, productDescription, tradeMessage, unknownCapacity, unknownModel, whatsappLink, type TradeAnswers } from "@/lib/commerce";
import { SelectInput } from "./select-input";
import { WhatsAppButton } from "./ui";

type EditableStep = 0 | 1 | 2;
type Step = EditableStep | 3;
type Errors = Partial<Record<keyof TradeAnswers, string>>;

const exchangeOptions = products.filter(({ availability }) => availability !== "indisponivel");
const nextStep = [1, 2, 3] as const;
const previousStep = [0, 0, 1, 2] as const;

function validate(step: EditableStep, answers: TradeAnswers) {
  const errors: Errors = {};
  if (step === 0) {
    if (!answers.model) errors.model = "Selecione o modelo ou escolha “Não sei o modelo”.";
    if (answers.model === otherModel && !answers.customModel.trim()) errors.customModel = "Digite o modelo do seu iPhone.";
    if (!answers.capacity) errors.capacity = "Selecione a capacidade ou escolha “Não sei a capacidade”.";
  }
  if (step === 1) {
    if (!answers.condition) errors.condition = "Selecione a condição ou escolha “Não sei avaliar”.";
    if (answers.batteryMode === "known") {
      const battery = Number(answers.battery);
      if (!Number.isInteger(battery) || battery < 1 || battery > 100) errors.battery = "Digite uma porcentagem inteira entre 1 e 100.";
    }
  }
  return errors;
}

function TradeWizard({ preferred }: { preferred: string }) {
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<TradeAnswers>({
    model: "", customModel: "", capacity: "", condition: "", damage: "",
    batteryMode: "unknown", battery: "", desiredSlug: preferred,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [editSnapshot, setEditSnapshot] = useState<TradeAnswers | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(false);
  const desired = exchangeOptions.find(({ slug }) => slug === answers.desiredSlug);
  const contact = step === 3 ? whatsappLink(tradeMessage(answers, desired)) : undefined;

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "nearest" });
  }, [step]);

  function change<K extends keyof TradeAnswers>(name: K, value: TradeAnswers[K]) {
    setAnswers((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  function move(to: Step) {
    setErrors({});
    shouldFocus.current = true;
    setStep(to);
  }

  function edit(to: EditableStep) {
    setEditSnapshot(answers);
    move(to);
  }

  function back() {
    if (editSnapshot) {
      setAnswers(editSnapshot);
      setEditSnapshot(null);
      move(3);
    } else {
      move(previousStep[step]);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 3) return;
    const found = validate(step, answers);
    const firstError = Object.keys(found)[0];
    if (firstError) {
      setErrors(found);
      document.getElementById("trade-" + firstError)?.focus();
      return;
    }
    move(editSnapshot ? 3 : nextStep[step]);
    setEditSnapshot(null);
  }

  function inputState(name: keyof TradeAnswers) {
    return {
      id: "trade-" + name,
      "aria-invalid": errors[name] ? true as const : undefined,
      "aria-describedby": errors[name] ? "trade-error-" + name : undefined,
    };
  }

  function fieldError(name: keyof TradeAnswers) {
    return errors[name] && <p id={"trade-error-" + name} className="field-error" role="alert">{errors[name]}</p>;
  }

  const review: { step: EditableStep; title: string; editLabel: string; rows: [string, string][] }[] = [
    { step: 0, title: "Aparelho atual", editLabel: "Editar aparelho", rows: [["Modelo", currentModel(answers)], ["Capacidade", currentCapacity(answers)]] },
    { step: 1, title: "Condição do aparelho", editLabel: "Editar condição", rows: [
      ["Conservação", answers.condition], ["Saúde da bateria", batteryLabel(answers)], ["Avarias", answers.damage.trim() || "Não detalhadas"],
    ] },
    { step: 2, title: "Aparelho desejado", editLabel: "Editar aparelho desejado", rows: [
      ["Preferência", desired ? productDescription(desired) + (desired.demo ? " (demonstração)" : "") : "Ainda estou decidindo"],
    ] },
  ];

  return (
    <div className="trade-layout">
      <aside className="trade-sidebar" aria-label="Progresso da avaliação">
        <ol className="stepper">
          {tradeCopy.stages.map((label, index) => (
            <li key={label} className={index < step ? "step-done" : undefined} aria-current={index === step ? "step" : undefined}>
              <span className="step-number" aria-hidden="true">{index < step ? <Check size={16} /> : index + 1}</span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
        <div className="trade-assessment">
          <Repeat2 size={21} aria-hidden="true" />
          <p>{tradeCopy.assessment}</p>
          <Link href={paths.faq + "#avaliacao"} className="text-link">Dúvidas sobre a troca</Link>
        </div>
      </aside>
      <div className="trade-panel">
        <p className="step-caption">{editSnapshot ? "Editando o resumo" : "Etapa " + (step + 1) + " de " + tradeCopy.stages.length}</p>
        <h2 tabIndex={-1} ref={heading}>{tradeCopy.stepTitles[step]}</h2>
        <p className="step-description">{tradeCopy.stepDescriptions[step]}</p>

        {step === 3 ? (
          <>
            <div className="review">
              {review.map((group) => (
                <section key={group.step} className="review-group" aria-labelledby={"review-" + group.step}>
                  <div className="review-title">
                    <h3 id={"review-" + group.step}>{group.title}</h3>
                    <button type="button" className="text-link edit-button" onClick={() => edit(group.step)} aria-label={group.editLabel}>
                      <Pencil size={15} aria-hidden="true" />Editar
                    </button>
                  </div>
                  <dl>{group.rows.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}</dl>
                </section>
              ))}
            </div>
            <div className="trade-submit">
              <WhatsAppButton href={contact} describedBy="trade-contact-hint">Abrir WhatsApp</WhatsAppButton>
              <p className="action-hint" id="trade-contact-hint">
                {contact ? "Sua mensagem abre no WhatsApp. Você decide quando enviar." : "Contato a confirmar com a Appl.Oz."}
              </p>
            </div>
          </>
        ) : (
          <form className="trade-form" noValidate onSubmit={submit}>
            {step === 0 && (
              <>
                <div className="field">
                  <label htmlFor="trade-model">Modelo atual</label>
                  <SelectInput {...inputState("model")} value={answers.model} required onChange={(event) => change("model", event.target.value)}>
                    <option value="">Selecione o modelo</option>
                    {tradeModels.map((model) => <option key={model} value={model}>{model}</option>)}
                    <option value={otherModel}>{otherModel}</option>
                    <option value={unknownModel}>{unknownModel}</option>
                  </SelectInput>
                  {fieldError("model")}
                </div>
                {answers.model === otherModel && (
                  <div className="field">
                    <label htmlFor="trade-customModel">Qual é o modelo?</label>
                    <input {...inputState("customModel")} value={answers.customModel} required maxLength={60} onChange={(event) => change("customModel", event.target.value)} placeholder="Ex.: iPhone 8 Plus" />
                    {fieldError("customModel")}
                  </div>
                )}
                <div className="field">
                  <label htmlFor="trade-capacity">Capacidade</label>
                  <SelectInput {...inputState("capacity")} required value={answers.capacity} onChange={(event) => change("capacity", event.target.value)}>
                    <option value="">Selecione a capacidade</option>
                    {tradeCapacities.map((capacity) => <option key={capacity} value={capacity}>{capacityLabel(capacity)}</option>)}
                    <option value={unknownCapacity}>{unknownCapacity}</option>
                  </SelectInput>
                  {fieldError("capacity")}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="field">
                  <label htmlFor="trade-condition">Condição geral</label>
                  <SelectInput {...inputState("condition")} required value={answers.condition} onChange={(event) => change("condition", event.target.value)}>
                    <option value="">Selecione a condição que melhor descreve</option>
                    {tradeConditions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </SelectInput>
                  {fieldError("condition")}
                </div>
                <div className="field">
                  <label htmlFor="trade-damage">Avarias <span className="field-optional">(opcional)</span></label>
                  <textarea id="trade-damage" value={answers.damage} rows={3} maxLength={240}
                    onChange={(event) => change("damage", event.target.value)} placeholder="Ex.: tela trincada ou marcas nas laterais" />
                </div>
                <fieldset className="field battery-field">
                  <legend>Saúde da bateria</legend>
                  <div className="radio-options">
                    <label className="radio-option"><input type="radio" name="battery-mode" checked={answers.batteryMode === "unknown"} onChange={() => change("batteryMode", "unknown")} />Não sei</label>
                    <label className="radio-option"><input type="radio" name="battery-mode" checked={answers.batteryMode === "known"} onChange={() => change("batteryMode", "known")} />Sei a porcentagem</label>
                  </div>
                  {answers.batteryMode === "known" && (
                    <div className="field battery-value">
                      <label htmlFor="trade-battery">Porcentagem da bateria</label>
                      <input {...inputState("battery")} type="number" inputMode="numeric" min={1} max={100} step={1} value={answers.battery}
                        onChange={(event) => change("battery", event.target.value)} placeholder="Ex.: 86" />
                      {fieldError("battery")}
                    </div>
                  )}
                </fieldset>
              </>
            )}

            {step === 2 && (
              <div className="field">
                <label htmlFor="trade-desired">Próximo iPhone <span className="field-optional">(opcional)</span></label>
                <SelectInput id="trade-desired" value={answers.desiredSlug} onChange={(event) => change("desiredSlug", event.target.value)}>
                  <option value="">Ainda estou decidindo</option>
                  {exchangeOptions.map((product) => <option key={product.slug} value={product.slug}>{product.model} · {capacityLabel(product.capacity)} · {product.color}</option>)}
                </SelectInput>
                {desired && (
                  <p className="desired-preview">
                    <span className="feature-icon"><Check aria-hidden="true" size={20} /></span>
                    <span>
                      <strong>{desired.model}</strong>
                      {capacityLabel(desired.capacity)} · {desired.color} · {conditionInfo[desired.condition].title}
                      {desired.demo && " · Demonstração"}
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="form-actions">
              {(step > 0 || editSnapshot) && <button className="button button--secondary" type="button" onClick={back}>{editSnapshot ? "Cancelar edição" : "Voltar"}</button>}
              <button className="button button--primary" type="submit">
                {editSnapshot ? "Salvar e voltar ao resumo" : step === 2 ? "Revisar avaliação" : "Continuar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function TradeForm() {
  const query = useSearchParams();
  const preferred = exchangeOptions.find(({ slug }) => slug === query.get("desejado"))?.slug ?? "";
  return <TradeWizard key={preferred} preferred={preferred} />;
}
