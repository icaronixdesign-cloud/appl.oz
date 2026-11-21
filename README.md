# Appl.Oz

Protótipo navegável de compra assistida em React, Next.js (App Router) e TypeScript. A home, o catálogo, as fichas, a troca, o guia e as dúvidas são páginas do mesmo site.

## Abrir a prévia

No Windows, extraia o pacote e clique duas vezes em `Iniciar previa.cmd`. Com o Node.js instalado, a prévia compilada abre em `http://127.0.0.1:4173/`. Mantenha a janela do servidor aberta enquanto navega. O pacote inclui a pasta `out/`, então a prévia dispensa a instalação das dependências do projeto.

Use `npm ci` e `npm run dev` para editar com um servidor de desenvolvimento. Para gerar novamente a prévia, use `npm run build` e `npm run preview`. A exportação estática usa o [recurso de exportação do Next.js](https://nextjs.org/docs/app/guides/static-exports).

## Onde editar

| Conteúdo | Local |
| --- | --- |
| Modelos, capacidades, cores, condição e disponibilidade | `src/data/products.ts`. Cada configuração tem um `slug` que define o endereço da ficha. Todos os itens aparecem no catálogo da home; o iPhone 18 Pro Max, quando é o primeiro, ganha o card largo de destaque. |
| Experiência 3D do iPhone 18 | Textos das qualidades, chamada final, botões e acabamentos em `showcase` (`src/data/site.ts`). Poses da câmera por seção em `src/components/experience/phone-experience.tsx` (`desktopPoses` e `mobilePoses`). Materiais, luz e halo em `src/components/experience/phone-scene.ts`. O modelo é `public/3d/iphone-18-pro-max.glb`, exportado de `iPhone_18_Pro_Max.blend` com compressão Draco (decodificador em `public/draco/`). |
| Preço, pagamento, bateria, conservação, garantia e itens inclusos | No mesmo arquivo, por unidade. O valor só aparece quando `demo` é `false` e `price` tem `confirmed: true` e um valor positivo em reais. O catálogo habilita filtros e ordenação por preço após a inclusão de valores confirmados. |
| Fotos de produto | Coloque os arquivos em `public/imagens/` e indique `gallery` na unidade, com `label`, `ratio` e `photo: { src, alt }`. A ficha começa pelo primeiro ângulo disponível. Use 4:3 para as fotos principais. |
| Destaque, logo, loja e clientes | `src/data/site.ts`. O destaque usa o modelo 3D (`site.hero.model`) e, sem WebGL, a imagem `site.hero.fallback`. O logo appl.oz vem de `src/components/brand.tsx`; para trocar por imagem, configure `site.logo` (área de 132 × 40 px). A foto da loja (`site.store.photo`, 3:2) substitui o close das câmeras na seção "Não vendemos vitrine". Depoimentos em `site.testimonials` (foto 1:1). |
| Textos, instruções de troca e perguntas frequentes | `src/data/site.ts`. Os modelos apresentados no formulário e as opções de condição do aparelho atual ficam em `src/data/products.ts`. |
| WhatsApp e Instagram | `site.whatsapp` e `site.instagramUrl` em `src/data/site.ts`. Preencha o WhatsApp com DDI e DDD, somente dígitos, e marque `confirmed: true` após validação. Os textos preenchidos automaticamente ficam em `src/lib/commerce.ts`. |
| Identidade visual | `src/styles/tokens.css`, com cores, famílias tipográficas, espaçamento, raios e largura de conteúdo. |

## Confirmações com a loja

- Número de WhatsApp, link oficial do Instagram, endereço e horários de atendimento.
- Modelos e variantes em estoque, fotos reais de cada unidade, critérios de conservação e saúde da bateria.
- Preços, meios de pagamento e regras de parcelamento.
- Critérios e etapas da troca, iPhones aceitos e como a loja apura o valor final.
- Garantia, itens inclusos, retirada, entrega, prazos e custos.
- Redação oficial sobre aparelhos de vitrine e autorização para usar logotipo, fotos da loja e depoimentos.

O número informado no briefing, **+55 11 96600-1437**, está configurado para testar a geração da mensagem. A abertura do WhatsApp deixa o envio a cargo de quem navega. Antes de publicar, substitua todos os dados de demonstração e desative `site.prototype` depois de confirmar o contato.

## Ilustrações provisórias

Geradas com a ferramenta ImageGen integrada e exportadas em WebP para `public/imagens/`. Os cards e as fichas usam `aparelho-dourado.webp`, `aparelho-azul.webp` e `aparelho-grafite.webp`. O site identifica as imagens como ilustrações e reserva espaço para as fotos da unidade. As imagens do iPhone 18 (`iphone-18-traseira.webp`, `iphone-18-frente.webp` e `iphone-18-cameras.webp`) são renders do modelo Blender da loja. `hero-grafite*.webp` não é mais usada pela home.

## Movimento

A home usa three.js (modelo 3D), GSAP ScrollTrigger (cenas guiadas pela rolagem, trilho horizontal da troca e zoom da seção "Não vendemos vitrine") e Lenis (rolagem suave). Com "reduzir movimento" ativado no sistema, a rolagem suave, as entradas e o trilho horizontal são desligados e o conteúdo fica estático. A cópia de `src/` e `public/` anterior a esta versão está em `work/backup-antes-3d/`.

<details>
<summary>Prompts das ilustrações</summary>

**Destaque**

> Use case: stylized-concept. Asset type: original editorial hero art for a premium independent smartphone store with a graphite-black and gold identity.
> Create a stunning cinema-grade 3D render, wide landscape 3:2. A single large original unbranded concept smartphone dominates the RIGHT half of the frame, back facing the camera in dramatic perspective, angled diagonally so its camera end rises at the upper right and its bottom end points lower left. The back is champagne bronze and finely brushed graphite-toned metal, with three glossy large jet-black lenses in a compact sculptural offset vertical housing with precision-milled rings. The polished golden side rail is visible as a bright edge. This is an imagined conceptual device, no Apple logo, no recognizable trademarks or text. A low golden sun-like halo, a few subtle concentric amber light trails, and graphite haze behind the handset form a restrained product-studio background. Ground fog/long shadows in dim bronze at the bottom. Composition feels expensive, close-up, three-dimensional and tactile, no glitter, no cyberpunk. Palette black #0b0b0c, brown-charcoal shadows, molten amber #ffc744 and champagne highlights. Keep left 30 percent nearly black for adjacent HTML type and keep the entire device within the right 72 percent with some breathing room around its highest camera end. Detailed legible physical form, no human hands, no text, no badges, no watermark. The handset is the brightest visual feature and should consume most of the height.

**Catálogo**

> Use case: stylized-concept. Asset type: three matching interchangeable provisional smartphone product renders in a single sprite sheet for a dark ecommerce UI. The canvas is a wide 3:2, split into exactly THREE equal vertical columns with NO separators, same solid studio background color #18181a across all. Each column contains exactly one original imagined unbranded smartphone viewed from the rear, standing nearly vertical with a slight three-quarter yaw (show one polished side rail). The center of each device is at 16.67%, 50%, 83.33% of the total canvas width, centered vertically as well. Same physical relative scale across all, each device fully contained within the central 58% width of its column and central 72% height of the canvas. LEFT device muted sand-gold titanium and triple black camera lenses in sleek vertical housing, CENTER device cool midnight blue with two distinct circular lenses, RIGHT device neutral matte charcoal graphite with triple circular lenses. Tactile, detailed studio 3D, elegant directional rim lights, localized soft charcoal gradients and grounding shadows per device. Image is intentionally conceptual and imaginary, no Apple logo or exact reproduction of Apple phones. No lettering, no signage, no decoration, no borders, no angled montage, no packaging. Consistent quiet premium aesthetic. Each column will be cropped independently vertically as a portrait and displayed in a dark UI.

</details>
