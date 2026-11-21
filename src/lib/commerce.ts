import type { Product } from "@/data/products";
import { conditionInfo, demo, paths, site } from "@/data/site";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function capacityLabel(capacity: number) {
  return capacity >= 1024 && capacity % 1024 === 0 ? `${capacity / 1024} TB` : `${capacity} GB`;
}

export function productPath(product: Product) {
  return `${paths.iphones}${product.slug}/`;
}

export function confirmedPrice(product: Product) {
  const price = product.price;
  return !product.demo && price?.confirmed && Number.isFinite(price.amount) && price.amount > 0 ? price : null;
}

export function priceLabel(product: Product) {
  const price = confirmedPrice(product);
  return price ? money.format(price.amount) : demo.price;
}

export function availabilityLabel(product: Product) {
  if (product.availability === "indisponivel") return product.demo ? "Indisponível (exemplo)" : "Indisponível";
  if (product.availability === "disponivel" && !product.demo) return "Disponível";
  return "Disponibilidade a confirmar";
}

export function productDescription(product: Product) {
  return [product.model, capacityLabel(product.capacity), product.color, conditionInfo[product.condition].title].join(", ");
}

export function whatsappLink(message: string) {
  const digits = site.whatsapp.digits.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15 || (!site.prototype && !site.whatsapp.confirmed)) return undefined;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function purchaseMessage(product: Product) {
  const opening = `Olá! Tenho interesse no ${productDescription(product)}.`;
  const intent = product.availability === "indisponivel"
    ? "Gostaria de saber se há outra unidade ou um modelo parecido."
    : "Gostaria de confirmar a disponibilidade e as condições.";
  const context = product.demo
    ? "Usei a ficha de demonstração da Appl.Oz como referência."
    : `Vi esse aparelho no site da Appl.Oz.${confirmedPrice(product) ? ` O valor exibido é ${priceLabel(product)}.` : ""}`;
  return [opening, context, intent].join(" ");
}

export type TradeAnswers = {
  model: string;
  customModel: string;
  capacity: string;
  condition: string;
  damage: string;
  batteryMode: "known" | "unknown";
  battery: string;
  desiredSlug: string;
};

export const unknownModel = "Não sei o modelo";
export const otherModel = "Outro modelo";
export const unknownCapacity = "Não sei a capacidade";

export function currentModel(answers: TradeAnswers) {
  return answers.model === otherModel ? answers.customModel.trim() : answers.model;
}

export function currentCapacity(answers: TradeAnswers) {
  return answers.capacity === unknownCapacity ? unknownCapacity : capacityLabel(Number(answers.capacity));
}

export function batteryLabel(answers: TradeAnswers) {
  return answers.batteryMode === "known" && answers.battery ? `${Number(answers.battery)}%` : "Não sei";
}

export function tradeMessage(answers: TradeAnswers, desired: Product | undefined) {
  return [
    "Olá! Quero avaliar uma troca na Appl.Oz.",
    `Meu aparelho atual: ${currentModel(answers)}, ${currentCapacity(answers)}, ${answers.condition.toLocaleLowerCase("pt-BR")}.`,
    `Saúde da bateria: ${batteryLabel(answers)}.`,
    answers.damage.trim() ? `Avarias informadas: ${answers.damage.trim()}` : null,
    desired
      ? `Tenho interesse no ${productDescription(desired)}${desired.demo ? " (referência do catálogo demonstrativo)" : ""}.`
      : "Ainda estou decidindo qual iPhone quero.",
  ].filter(Boolean).join("\n");
}
