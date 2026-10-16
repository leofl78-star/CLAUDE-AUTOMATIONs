# Trial Reels diários (Make + API da Meta)

Publica 1 trial reel por dia no Instagram @senta.aqui.com.o.leo a partir de uma pasta do Google Drive.
A legenda sai do Gemini, que assiste ao vídeo. O Instagram decide sozinho se o vídeo vai para os seguidores (graduation_strategy = SS_PERFORMANCE).

## Como funciona

1. Todo dia às 18h (horário de Brasília) o Make procura 1 vídeo na pasta "Trial Reels - Fila".
2. Baixa o vídeo do Drive.
3. Envia o vídeo para o Gemini e espera ele processar.
4. O Gemini escreve a legenda com o prompt de `prompt-legenda.md`.
5. Cria o contêiner do Reel na API da Meta com `media_type=REELS`, `upload_type=resumable` e `trial_params={"graduation_strategy":"SS_PERFORMANCE"}`.
6. Envia o arquivo para `rupload.facebook.com`.
7. Espera o Instagram processar e publica com `media_publish`. Se o vídeo ainda não estiver pronto, o Make tenta de novo.
8. Move o arquivo para "Trial Reels - Publicados".
9. Manda aviso no Telegram (Kai78bot) com a legenda ou com o erro.

Se a pasta estiver vazia, o cenário para e não gasta operação além da busca.

## Configuração (uma vez)

### 1. App na Meta e token

1. Abra developers.facebook.com/apps com o Facebook que administra a Página "Senta Aqui Com O Léo".
2. Clique em Criar app, escolha "Outro" e depois o tipo "Empresa". Nome: Trial Reels Leo.
3. Abra developers.facebook.com/tools/explorer. Em "Meta App", escolha Trial Reels Leo. Em "User or Page", escolha "Get User Access Token".
4. Em Permissions, adicione: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `business_management`.
5. Clique em Generate Access Token. Na janela do Facebook, marque a Página e a conta do Instagram.
6. Copie o token. Abra developers.facebook.com/tools/debug/accesstoken, cole, clique em Debug e depois em "Extend Access Token". Copie o token novo. Ele vale 60 dias.

O app fica em modo de desenvolvimento. Para publicar na sua própria conta, você não precisa de revisão da Meta, porque você é administrador do app.

### 2. Credenciais no Make

Abra o pedido de credenciais "Trial Reels automáticos" no Make (link enviado no chat).

- Google Drive: entre com leofl78@gmail.com.
- Meta Graph Token: chave no cabeçalho (header), nome `Authorization`, valor `OAuth ` seguido do token. Domínios: `graph.facebook.com` e `rupload.facebook.com`.

Nunca cole o token no chat, em planilha ou neste repositório.

### 3. Pastas

O cenário usa duas pastas no Drive de leofl78@gmail.com:

- Trial Reels - Fila: coloque aqui os vídeos originais (MP4 ou MOV, vertical 9:16, sem marca d'água do TikTok).
- Trial Reels - Publicados: o Make move os vídeos para cá depois de publicar.

## Manutenção

- A cada 60 dias: gere um token novo (passos 3 a 6) e atualize a conexão "Meta Graph Token" no Make.
- Custo: cerca de 12 operações do Make por vídeo. No plano Core (20.000 por mês), 30 vídeos por mês usam menos de 2% do plano.
- Gemini: um vídeo de 1 minuto usa poucos milhares de tokens. O custo depende do plano da chave do Gemini.

## Requisitos de vídeo (Meta)

MP4 ou MOV, H.264 ou HEVC, áudio AAC até 48 kHz, 23 a 60 fps, até 1920 px de largura, entre 3 segundos e 15 minutos, até 1 GB. O plano Core do Make limita cada arquivo a 100 MB.

## Fontes

- Meta, IG User Media (trial_params): https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/
- Meta, upload resumable: https://developers.facebook.com/documentation/instagram-platform/content-publishing/resumable-uploads
- Make, Instagram for Business (limitação do Google Drive): documentação do app no Make
