import type { PhotoSlot } from "./site";

export type Condition = "lacrado" | "seminovo";
export type Availability = "confirmar" | "indisponivel" | "disponivel";

export type Product = {
  slug: string;
  model: string;
  capacity: number;
  color: string;
  swatch: string;
  condition: Condition;
  availability: Availability;
  demo: boolean;
  price: { amount: number; confirmed: boolean; payment?: string } | null;
  battery?: number;
  conservation?: string;
  warranty?: string;
  included?: string;
  illustration?: string;
  gallery?: PhotoSlot[];
};

export const products: Product[] = [
  {
    slug: "iphone-18-pro-max-256-gb",
    model: "iPhone 18 Pro Max",
    capacity: 256,
    color: "Prata",
    swatch: "#dcdcdf",
    condition: "lacrado",
    availability: "confirmar",
    demo: true,
    price: null,
    illustration: "/imagens/iphone-18-traseira.webp",
  },
  {
    slug: "iphone-16-pro-256-gb",
    model: "iPhone 16 Pro",
    capacity: 256,
    color: "Titânio-deserto",
    swatch: "#c0a283",
    condition: "lacrado",
    availability: "confirmar",
    demo: true,
    price: null,
    illustration: "/imagens/aparelho-dourado.webp",
  },
  {
    slug: "iphone-15-128-gb",
    model: "iPhone 15",
    capacity: 128,
    color: "Azul",
    swatch: "#92a9ba",
    condition: "lacrado",
    availability: "confirmar",
    demo: true,
    price: null,
    illustration: "/imagens/aparelho-azul.webp",
  },
  {
    slug: "iphone-14-pro-256-gb",
    model: "iPhone 14 Pro",
    capacity: 256,
    color: "Preto-espacial",
    swatch: "#646269",
    condition: "seminovo",
    availability: "confirmar",
    demo: true,
    price: null,
    battery: 91,
    conservation: "Marcas leves de uso",
    illustration: "/imagens/aparelho-grafite.webp",
  },
  {
    slug: "iphone-13-128-gb",
    model: "iPhone 13",
    capacity: 128,
    color: "Meia-noite",
    swatch: "#464f66",
    condition: "seminovo",
    availability: "confirmar",
    demo: true,
    price: null,
    illustration: "/imagens/aparelho-azul.webp",
  },
  {
    slug: "iphone-15-pro-512-gb",
    model: "iPhone 15 Pro",
    capacity: 512,
    color: "Titânio-preto",
    swatch: "#54535a",
    condition: "seminovo",
    availability: "indisponivel",
    demo: true,
    price: null,
    illustration: "/imagens/aparelho-grafite.webp",
  },
];

export const homeProductSlugs = products.map(({ slug }) => slug);

export const unitPhotoSlots: PhotoSlot[] = [
  { label: "Traseira da unidade", ratio: "4:3", photo: null },
  { label: "Frente da unidade", ratio: "4:3", photo: null },
  { label: "Detalhes da unidade", ratio: "4:3", photo: null },
];

export const tradeModels = [
  "iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17", "iPhone Air", "iPhone 17e",
  "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 16e",
  "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
  "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14",
  "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13 mini", "iPhone 13",
  "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12 mini", "iPhone 12",
  "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11",
  "iPhone XR", "iPhone XS Max", "iPhone XS", "iPhone X", "iPhone SE",
];

export const tradeCapacities = [16, 32, 64, 128, 256, 512, 1024, 2048];
export const tradeConditions = ["Bem conservado e funcionando", "Funcionando, com marcas ou avarias", "Com falhas ou sem ligar", "Não sei avaliar"];
