export const paths = {
  home: "/",
  iphones: "/iphones/",
  trade: "/troca/",
  guide: "/como-funciona/",
  faq: "/duvidas/",
} as const;

export const navigation = [
  { href: paths.home, label: "Início" },
  { href: paths.iphones, label: "iPhones" },
  { href: paths.trade, label: "Troque seu iPhone" },
  { href: paths.guide, label: "Como funciona" },
  { href: paths.faq, label: "Dúvidas" },
];

export type Photo = { src: string; alt: string };
export type PhotoSlot = {
  label: string;
  ratio: string;
  photo: Photo | null;
};

export type Testimonial = {
  name: string;
  quote: string;
  photo?: Photo;
};

export const site = {
  name: "Appl.Oz",
  location: "Osasco, SP",
  description: "Explore iPhones lacrados e seminovos ou saiba como usar seu aparelho atual na troca com a Appl.Oz, em Osasco.",
  prototype: true,
  whatsapp: {
    digits: "5511966001437",
    display: "+55 11 96600-1437",
    confirmed: false,
  },
  instagramUrl: null as string | null,
  logo: null as Photo | null,
  hero: {
    /** Modelo 3D exibido no destaque e na seção do iPhone 18 (exportado do Blender, compressão Draco). */
    model: "/3d/iphone-18-pro-max.glb",
    /** Imagem estática usada quando o navegador não oferece WebGL. */
    fallback: "/imagens/iphone-18-traseira.webp",
  },
  store: {
    label: "Foto da loja",
    ratio: "3:2",
    photo: null,
  } as PhotoSlot,
  /** Imagem da seção "Não vendemos vitrine" enquanto não houver foto da loja. */
  detailArt: "/imagens/iphone-18-cameras.webp",
  testimonials: [] as Testimonial[],
};

export const home = {
  hero: {
    location: "iPhones em Osasco",
    title: ["Seu próximo", "iPhone começa", "aqui."],
    description: "Explore iPhones lacrados e seminovos. Escolha o seu ou use o aparelho atual na troca.",
  },
  routes: {
    buy: { title: "Comprar um iPhone", description: "Compare modelos, capacidades e condições para encontrar o seu.", action: "Ver catálogo" },
    trade: { title: "Trocar meu iPhone", description: "Informe os dados do seu aparelho e peça uma avaliação à loja.", action: "Iniciar troca" },
  },
  trade: {
    title: "Seu iPhone pode entrar na troca.",
    description: "Conte como está seu aparelho e, se já tiver um modelo em mente, indique qual iPhone você quer levar.",
  },
  trust: {
    title: "Por que comprar na Appl.Oz?",
    description: "Uma loja de iPhones em Osasco, com atendimento pelo WhatsApp para confirmar sua escolha.",
    displayUnits: "A Appl.Oz informa que não vende aparelhos usados em mostruário. No catálogo, a condição indica se a unidade é lacrada ou seminova.",
  },
  clients: {
    title: "Clientes Appl.Oz",
    placeholder: "Espaço reservado para uma avaliação real.",
  },
  closing: { title: "Qual vai ser seu próximo iPhone?" },
};

export const marquee = [
  "iPhones lacrados e seminovos",
  "Seu iPhone entra na troca",
  "Atendimento pelo WhatsApp",
  "Não vendemos vitrine",
  "Osasco, SP",
];

export type Finish = {
  id: string;
  name: string;
  swatch: string;
  /** Cores do material no modelo 3D (sRGB). */
  frame: string;
  polished: string;
  glass: string;
  ring: string;
};

export const showcase = {
  slug: "iphone-18-pro-max-256-gb",
  model: "iPhone 18 Pro Max",
  /**
   * Vídeo da tela na seção "Controle da Câmera" (ex.: "/videos/controle-camera.mp4", retrato 1320 x 2868, loop de 8 s).
   * Vazio = interface de câmera desenhada pelo site. O brilho do botão segue o mesmo relógio:
   * toques em 0,9 s e 4,9 s, zoom 1→5× de 1,2 a 3,0 s e 5→1× de 5,2 a 7,0 s.
   */
  cameraVideo: "/videos/controle-camera.mp4",
  intro: {
    eyebrow: "Novo na Appl.Oz",
    description: "Role para conhecer o novo Pro de perto.",
  },
  features: [
    {
      id: "design",
      label: "Design",
      title: "Alumínio de ponta a ponta.",
      description: "Estrutura unibody com moldura acetinada, chanfros polidos e um platô de câmeras esculpido no próprio corpo.",
      chips: ["Unibody", "Moldura acetinada", "Chanfros polidos"],
    },
    {
      id: "cameras",
      label: "Câmeras",
      title: "Três câmeras. Um só platô.",
      description: "Grande-angular, ultra-angular e teleobjetiva com tetraprisma, ao lado do scanner LiDAR e do flash. Cada lente protegida por safira.",
      chips: ["Teleobjetiva tetraprisma", "Scanner LiDAR", "Lentes de safira"],
    },
    {
      id: "controle",
      label: "Controle da Câmera",
      title: "Um toque. A foto certa.",
      description: "O Controle da Câmera em safira abre a câmera, ajusta o zoom e fotografa sem tirar o dedo da lateral. Do outro lado, o Botão de Ação.",
      chips: ["Controle da Câmera", "Botão de Ação", "USB-C"],
    },
    {
      id: "tela",
      label: "Tela",
      title: "Tela que vai até a borda.",
      description: "Bordas finas, Dynamic Island e vidro frontal Ceramic Shield para proteger o que você mais vê no dia.",
      chips: ["Dynamic Island", "Ceramic Shield", "Bordas finas"],
    },
  ],
  launch: {
    eyebrow: "Disponível na Appl.Oz",
    title: ["Seu próximo Pro", "começa aqui."],
    description: "Leve o iPhone 18 Pro Max lacrado com atendimento da loja, ou use seu iPhone atual na troca e pague só a diferença.",
    buy: "Comprar agora",
    trade: "Troque pelo seu iPhone",
    finishLabel: "Acabamento",
    finishNote: "Cores ilustrativas do modelo 3D. Confirme acabamentos e estoque com a loja.",
    dragHint: "Arraste para girar",
  },
  finishes: [
    { id: "prata", name: "Prata", swatch: "#dcdcdf", frame: "#c9cacd", polished: "#eceded", glass: "#d7d8db", ring: "#d9dadd" },
    { id: "grafite", name: "Grafite", swatch: "#3c3d41", frame: "#4a4b50", polished: "#7b7d83", glass: "#3a3b40", ring: "#6d6f75" },
    { id: "azul", name: "Azul profundo", swatch: "#2e3a57", frame: "#34405c", polished: "#66769a", glass: "#2f3b57", ring: "#5b6a8c" },
    { id: "dourado", name: "Dourado", swatch: "#d6bc93", frame: "#c8ae86", polished: "#ead6b4", glass: "#ddcdb4", ring: "#e2cca6" },
  ] as Finish[],
};

export const demo = {
  catalog: "Modelos e condições demonstrativos. Consulte a loja para confirmar estoque e valores.",
  product: "Este exemplo ilustra a ficha de um aparelho. Consulte a loja para confirmar a unidade, o preço e a condição.",
  photo: "Ilustração · foto da unidade 4:3",
  price: "Preço a confirmar",
  disclaimer: "Protótipo com catálogo demonstrativo",
};

export const tradeSteps = [
  { title: "Informe o aparelho atual", description: "Indique o modelo, a capacidade e a condição do seu iPhone." },
  { title: "Receba a avaliação", description: "Envie o resumo pelo WhatsApp. A loja confirma o valor após avaliar o aparelho." },
  { title: "Escolha o próximo", description: "Compare os modelos e confirme como usar a avaliação na sua troca." },
];

export const purchaseSteps = [
  { title: "Compare os iPhones", description: "Use os filtros para encontrar modelos pela capacidade e pela condição que você procura." },
  { title: "Abra a ficha do aparelho", description: "Confira a cor, os detalhes da unidade e as informações comerciais disponíveis." },
  { title: "Confirme com a loja", description: "Abra o WhatsApp com os dados da sua escolha e confirme disponibilidade, preço, pagamento e como receber o aparelho." },
];

export const conditionInfo = {
  lacrado: { title: "Lacrado", description: "Aparelho novo, apresentado com o lacre original da embalagem." },
  seminovo: { title: "Seminovo", description: "Aparelho usado. Bateria, conservação e itens inclusos dependem de cada unidade." },
};

export const tradeCopy = {
  title: "Troque seu iPhone",
  description: "Conte um pouco sobre o aparelho que você usa hoje. Você poderá revisar tudo antes de pedir uma avaliação no WhatsApp.",
  assessment: "O valor da troca depende da análise da loja.",
  stages: ["Aparelho", "Condição", "Próximo iPhone", "Resumo"],
  stepTitles: ["Qual iPhone você tem?", "Como ele está?", "Qual iPhone você quer?", "Revise sua avaliação"],
  stepDescriptions: [
    "Selecione o modelo e a capacidade do aparelho que você quer usar na troca.",
    "Informe o que você sabe sobre a conservação e a bateria do seu iPhone.",
    "Se você já escolheu um aparelho, inclua-o no pedido de avaliação.",
    "Confira as informações que vão na mensagem para a Appl.Oz. Você pode editar cada etapa.",
  ],
};

export type Faq = { id: string; question: string; answer: string };
export const faqGroups: { id: string; title: string; items: Faq[] }[] = [
  {
    id: "compra",
    title: "Compra e aparelhos",
    items: [
      { id: "estoque", question: "Como confirmo se um iPhone está disponível?", answer: "Escolha um modelo no catálogo e abra a ficha. Ao tocar em “Tenho interesse neste iPhone”, você vai ao WhatsApp com o modelo, a capacidade, a cor e a condição já na mensagem. A loja confirma a disponibilidade da unidade." },
      { id: "condicoes", question: "Qual é a diferença entre lacrado e seminovo?", answer: "Lacrado é um aparelho novo com o lacre original da embalagem. Seminovo é um aparelho que já foi usado. Nos seminovos, confirme o estado de conservação, a saúde da bateria e o que acompanha a unidade." },
      { id: "vitrine", question: "O que significa “não vendemos vitrine”?", answer: "Aparelho de vitrine é uma unidade usada para exposição em mostruário. A Appl.Oz informa que não comercializa esse tipo de aparelho." },
    ],
  },
  {
    id: "avaliacao",
    title: "Avaliação para troca",
    items: [
      { id: "troca", question: "Como funciona a troca do meu iPhone?", answer: "Informe modelo, capacidade e condição do seu iPhone no formulário de troca. Revise o resumo e envie a mensagem pelo WhatsApp. A loja orienta a análise e confirma quanto o aparelho pode valer na troca." },
      { id: "bateria", question: "Posso pedir avaliação sem saber a saúde da bateria?", answer: "Sim. Selecione “Não sei” no campo de saúde da bateria e prossiga. A loja pode pedir informações adicionais durante a avaliação." },
    ],
  },
  {
    id: "condicoes-comerciais",
    title: "Pagamento, garantia e recebimento",
    items: [
      { id: "pagamento", question: "Quais são os preços e as formas de pagamento?", answer: "Confirme no atendimento o valor atualizado do aparelho, os meios de pagamento aceitos e as condições de parcelamento, se houver." },
      { id: "garantia", question: "Como funcionam a garantia e os itens inclusos?", answer: "Peça à loja as informações de garantia e os itens que acompanham a unidade escolhida. As condições são confirmadas no atendimento." },
      { id: "retirada", question: "Como funcionam a retirada e a entrega?", answer: "A Appl.Oz fica em Osasco, SP. Confirme com a loja as opções de retirada ou entrega, o endereço, os prazos e eventuais custos." },
    ],
  },
];

const homeFaqIds = ["condicoes", "troca", "vitrine", "pagamento", "garantia", "retirada"];
export const homeFaqs = homeFaqIds.flatMap((id) => faqGroups.flatMap(({ items }) => items.filter((item) => item.id === id)));
