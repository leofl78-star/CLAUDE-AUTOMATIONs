# Carrossel 5: Plano, não promessa

12 slides, 1080x1440 (3:4), no design system A Família que Fica. Público: quem tá tentando parar. O último slide leva pra consulta individual de R$200 pela palavra CONSULTA (comentário ou direct).

Base de conteúdo: carrossel de outro criador sobre promessa x plano na prevenção de recaída. As ideias foram mantidas e todo o texto foi reescrito na voz do Léo.

## Postar

1. Pelo app do Instagram (agendadores e API aceitam só 10 slides e no máximo 4:5).
2. Slides na ordem dos arquivos, 01 a 12.
3. Legenda em `legenda.txt`.
4. Link da consulta pra mandar no direct: https://pay.hotmart.com/X107019993F?off=n6b3xcvh

## Postar pelo SocialBee

Use a pasta `socialbee-4x5/`: 10 slides em 1080x1350 (4:5), o limite da API do Instagram que o SocialBee usa. Em relação aos 12 slides: os slides 4 e 5 viraram um só e o slide 6 (rotina) saiu.

1. No SocialBee, crie um post novo e escolha o perfil do Instagram. O carrossel direto só funciona com perfil Business ligado a uma página do Facebook.
2. Suba as 10 imagens na ordem dos arquivos, 01 a 10, e confira a ordem na prévia.
3. Cole a legenda de `legenda.txt`.
4. Agende ou publique e confira o post no app depois que sair.

O conector do SocialBee no Zapier aceita uma imagem por post, por isso o carrossel é montado à mão no SocialBee.

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
node render.mjs ..                      # 12 slides, 1080x1440
node render.mjs ../socialbee-4x5 4x5    # 10 slides, 1080x1350
```

O script substitui só os arquivos `NN_nome.png` da pasta de saída. A versão 4x5 usa `fonte/slides-4x5.js` e `fonte/carousel-4x5.css` por cima do estilo principal: mudou um texto em `slides.js`, mude também em `slides-4x5.js`.

As fotos de fundo são da pasta `midia for tiktok`, recebem um tratamento âmbar no CSS. `mulher_tequila.jpg` foi retocada (artefato branco em cima do celular removido). A foto do Léo é `leo-restaurante.jpg`, do design system.
