# Carrossel 5: Plano, não promessa

12 slides, 1080x1440 (3:4), no design system A Família que Fica. Público: quem tá tentando parar. O último slide leva pra consulta individual de R$200 pela palavra CONSULTA (comentário ou direct).

Base de conteúdo: carrossel de outro criador sobre promessa x plano na prevenção de recaída. As ideias foram mantidas e todo o texto foi reescrito na voz do Léo.

## Postar

1. Pelo app do Instagram (agendadores e API aceitam só 10 slides e no máximo 4:5).
2. Slides na ordem dos arquivos, 01 a 12.
3. Legenda em `legenda.txt`.
4. Link da consulta pra mandar no direct: https://pay.hotmart.com/X107019993F?off=n6b3xcvh

## Confirmar antes de postar

- "6 anos limpo" (slides 1, 10 e 12).
- Frases em primeira pessoa: "prometi nunca mais dezenas de vezes", "Eu jurava com a vergonha quente", "Eu já caí em todas essas", "ainda tem manhã assim", "Faço o primeiro item do plano sem negociar".
- Que a consulta de R$200 inclui montar o plano de prevenção de recaída (slide 12).

## Fontes

- Slide 2: NIDA, *Drugs, Brains, and Behavior: The Science of Addiction*, capítulo Treatment and Recovery (gráfico de McLellan et al., JAMA 284:1689, 2000). https://nida.nih.gov/publications/drugs-brains-behavior-science-addiction/treatment-recovery
- Slide 9: controle de estímulos e ambiente, Larimer, Palmer e Marlatt, Alcohol Research & Health 23(2), 1999. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6760427/
- CVV 188: ligação gratuita, 24h. https://cvv.org.br

## Editar e gerar de novo

Texto em `fonte/slides.js`, estilo em `fonte/carousel.css`. Para gerar os PNGs (precisa de Node e Playwright):

```
cd fonte
node render.mjs ..
```

O script substitui só os arquivos `NN_nome.png` da pasta de saída.

As fotos de fundo são da pasta `midia for tiktok`, recebem um tratamento âmbar no CSS. `mulher_tequila.jpg` foi retocada (artefato branco em cima do celular removido). A foto do Léo é `leo-restaurante.jpg`, do design system.
