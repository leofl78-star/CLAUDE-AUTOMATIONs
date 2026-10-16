# Carrossel 6: Gatilho (Dia 1…)

10 slides sobre gatilhos, pra quem tá tentando ficar limpo, no design system Dia 1…. Três versões do mesmo texto:

- `4x5/`: 1080x1350. Serve pro app do Instagram e pro SocialBee.
- `1x1/`: 1080x1080, quadrado. A capa fica dentro do recorte 3:4 do grid do perfil.
- `9x16/`: 1080x1920, pra Stories e carrossel de fotos do TikTok. O carrossel do feed do Instagram não aceita 9:16 e corta a imagem, então use `4x5/` no feed.

Legenda em `legenda.txt`, a mesma pras versões de feed e pro TikTok.

Base de conteúdo: carrossel do podcast "Papo de Adicto" sobre gatilhos. As ideias e a ordem foram mantidas e todo o texto foi reescrito na voz do Léo.

## Desvios do Dia 1 escolhidos pelo Léo

- Fundo com fotos de cenas de sofrimento, em tom oliva. O Dia 1 pede só imagens "do depois".
- O último slide vende a consulta individual de R$ 200 (comentário ou direct com CONSULTA). O Dia 1 pede CTA só de triagem grátis.

O resto segue o sistema: paleta oliva sem âmbar, DM Serif itálico com um acento por título, eyebrows Bebas numeradas, "1" gigante vazado, brilho oliva, grão, marca do sol com "Dia 1…" no canto e assinatura "— Léo".

## Postar

1. Escolha uma versão e suba os 10 arquivos na ordem, 01 a 10.
2. Cole a legenda de `legenda.txt`.
3. Responda quem comentar ou mandar CONSULTA no direct com o link da consulta: https://pay.hotmart.com/X107019993F?off=n6b3xcvh
4. Pelo SocialBee, o carrossel direto só funciona com perfil Business ligado a uma página do Facebook.

## Versão 9:16 (Stories e TikTok)

- Nos Stories não tem comentário, botão de salvar nem arrastar. Por isso a 9:16 troca três frases: "arrasta →" vira "continua →", "Deixa salvo pra um dia ruim." vira "Volta no 05 e tira print pra um dia ruim." e o botão vira "Manda CONSULTA no direct". As trocas ficam em `fonte/slides-9x16.js`.
- Nos Stories, dá pra pôr o sticker de link da consulta no slide 10, na área escura à direita do rosto. O link leva direto pro pagamento.
- O texto fica fora dos 250px de cima e dos 300px de baixo, onde o Instagram mostra o nome do perfil e a caixa de resposta.

## Confirmar antes de postar

- "Eu recaí antes de ficar limpo" (slide 8).
- Que a consulta de R$ 200 inclui montar o mapa de gatilhos (slide 10).
- O slide 2 traz exemplos genéricos de gatilho (sexta à tarde, dinheiro vivo, um nome no celular, ruas do caminho). Se forem os seus de verdade, dá pra voltar pra primeira pessoa.

## Fontes

- Pistas ligadas ao uso disparam fissura por associação aprendida: NIDA, *Drugs, Brains, and Behavior*. https://nida.nih.gov/publications/drugs-brains-behavior-science-addiction/drugs-brain
- Gatilhos externos e internos, incluindo emoções positivas: NIAAA Rethinking Drinking. https://rethinkingdrinking.niaaa.nih.gov/tools/worksheets-more/how-stop-alcohol-cravings
- Situações de alto risco (Marlatt), incluindo estados emocionais positivos e pressão social: Larimer, Palmer e Marlatt, 1999. https://pmc.ncbi.nlm.nih.gov/articles/PMC6760427
- A fissura sobe e passa como uma onda, sem duração fixa: NIAAA. https://pubs.niaaa.nih.gov/sites/default/files/patient-education-tips-for-quitting-drinking-and-recovering-from-a-drinking-episode.pdf

## Editar e gerar de novo

Texto em `fonte/slides.js`. Estilo em `fonte/carousel.css`, com os ajustes do quadrado em `fonte/carousel-1x1.css` e os do 9:16 em `fonte/carousel-9x16.css` e `fonte/slides-9x16.js`. Precisa de Node e Playwright:

```
cd fonte
node render.mjs ../4x5          # 1080x1350
node render.mjs ../1x1 1x1      # 1080x1080
node render.mjs ../9x16 9x16    # 1080x1920
```

O script substitui só os arquivos `NN_nome.png` da pasta de saída.
