// Carrossel 6 · Gatilho (Dia 1…). Copy: judge-merged from 3 drafts, fact-checked (workflow_result.json); personal trigger examples made generic.
const SLIDES = [
 {
  "type": "cover",
  "name": "capa",
  "eyebrow": "Pra ler antes da próxima fissura",
  "title": "Gatilho bate na porta.<br>Abrir ainda é<br>uma <em>escolha</em>.",
  "sub": "16 anos de uso, 6 anos limpo.<br>Te mostro o que fazer quando bate.",
  "bg": "homem_desesperado.jpg",
  "bgPos": "50% 35%",
  "one": {
   "size": 1150,
   "kind": "forte",
   "pos": "right:-170px;top:-190px"
  }
 },
 {
  "type": "item",
  "name": "o-que-e",
  "eyebrow": "01 · o que é",
  "title": "Gatilho é tudo que te<br>lembra do <em>uso</em>.",
  "body": [
   "O cérebro aprende essa associação. E quase sempre é coisa banal:"
  ],
  "list": [
   "Sexta à tarde, saindo do trampo",
   "Dinheiro vivo na mão",
   "Um nome piscando no celular",
   "Certas ruas do caminho de casa"
  ],
  "listStyle": "dot",
  "bg": "mulher_tequila.jpg",
  "bgPos": "50% 0%"
 },
 {
  "type": "item",
  "name": "sem-culpa",
  "eyebrow": "02 · sem culpa",
  "title": "Ter fissura não<br>é <em>fraqueza</em>.",
  "body": [
   "Fissura não é prova de derrota. É&nbsp;o cérebro repetindo uma lição antiga. A&nbsp;sua resposta a ela é que dá pra treinar."
  ],
  "note": "Quando bater, troca a culpa por atenção.",
  "bg": "adolecente_asking_for_help.jpg",
  "bgPos": "50% 30%"
 },
 {
  "type": "item",
  "name": "tres-portas",
  "eyebrow": "03 · de onde vem",
  "title": "O gatilho bate em<br>três <em>portas</em>.",
  "rows": [
   {
    "k": "Por dentro",
    "v": "Cansaço, raiva engolida, até dia bom demais"
   },
   {
    "k": "No meio de gente",
    "v": "Briga em casa, churrasco, jogo do time"
   },
   {
    "k": "Por fora",
    "v": "O caixa 24h, aquele bar, aquela esquina"
   }
  ],
  "note": "Repara em qual porta ele bate mais.",
  "bg": "familia_da_adicta.jpg",
  "bgPos": "50% 40%"
 },
 {
  "type": "myth",
  "name": "mito",
  "eyebrow": "04 · mito",
  "myth": "“Bateu a fissura, já era pra mim.”",
  "truthLabel": "O que a recuperação mostra",
  "body": [
   "Mesmo sem usar, fissura não fica no máximo pra sempre. Uma hora cede, e&nbsp;o tempo varia de pessoa pra pessoa.",
   "O que decide é o que a gente faz enquanto ela tá no alto."
  ],
  "note": "Fissura é visita. Não é dona da casa.",
  "one": {
   "size": 1000,
   "kind": "fraco",
   "pos": "right:-150px;bottom:-330px"
  },
  "glow": "top"
 },
 {
  "type": "item",
  "name": "na-hora",
  "eyebrow": "05 · na hora",
  "title": "O que fazer quando<br>o gatilho <em>acende</em>.",
  "rows": [
   {
    "k": "Lembra do porquê",
    "v": "Foto, mensagem, o motivo que te fez parar"
   },
   {
    "k": "Rebate o pensamento",
    "v": "Desmente o “só uma vez” em vez de negociar"
   },
   {
    "k": "Fala com alguém",
    "v": "Mensagem curta já serve: “tá batendo”"
   },
   {
    "k": "Ocupa o corpo",
    "v": "Água gelada, banho, volta no quarteirão"
   }
  ],
  "bg": "man_and_beers_trying_to_stop.jpg",
  "bgPos": "50% 12%",
  "note": "Escolhe uma e deixa pronta antes de precisar."
 },
 {
  "type": "item",
  "name": "o-mapa",
  "eyebrow": "06 · o mapa",
  "title": "Gatilho conhecido<br>é gatilho <em>com plano</em>.",
  "body": [
   "Passou a fissura? Anota. Se só de lembrar ela volta, faz isso com alguém de confiança."
  ],
  "list": [
   "Onde foi e que horas eram",
   "Com quem você tava",
   "O que rolou uma hora antes",
   "O que o corpo tava sentindo"
  ],
  "listStyle": "dot",
  "note": "Um mapa começa assim:<br>fim&nbsp;de&nbsp;tarde, sozinho, com dinheiro.",
  "bg": "homem_na_sarjeta.jpg",
  "bgPos": "50% 10%"
 },
 {
  "type": "item",
  "name": "rede",
  "eyebrow": "07 · rede",
  "title": "Sem rede, todo gatilho<br>parece <em>maior</em>.",
  "body": [
   "O que segura: terapia, grupo e&nbsp;alguém que atende às 3h da manhã.",
   "Eu recaí antes de ficar limpo. Recaída não é o fim. É hora de ajustar o plano."
  ],
  "note": "Não é só força de vontade. É estrutura.",
  "bg": "grupo_de_apoio.jpg",
  "bgPos": "50% 28%"
 },
 {
  "type": "turn",
  "name": "salva-e-comenta",
  "eyebrow": "Pra guardar",
  "lines": [
   {
    "text": "Com mapa, dá pra ver o gatilho chegando."
   },
   {
    "text": "Deixa salvo pra um dia ruim."
   },
   {
    "text": "Em qual porta ele bate mais: dentro, gente ou fora?",
    "accent": true
   },
   {
    "text": "Responde numa palavra. Eu leio."
   }
  ],
  "one": {
   "size": 1000,
   "kind": "fraco",
   "pos": "left:-130px;bottom:-320px"
  },
  "glow": "top",
  "swipe": "tem mais um →",
  "nosig": true
 },
 {
  "type": "leo",
  "name": "leo",
  "hello": "Oi, eu sou o Léo, conselheiro certificado.",
  "title": "Usei por 16 anos. Tô limpo há 6.<br>Monta comigo o seu<br><em>mapa de gatilhos</em>.",
  "offerTitle": "Consulta individual",
  "offerSub": "Online ou presencial em SP",
  "hint": "que eu te mando o link<br>no direct",
  "private": "Prefere sigilo? Manda <b>CONSULTA</b> no direct.",
  "crisis": "Se tá pesado agora: <b>CVV 188</b>, 24h e gratuito.",
  "photo": "leo-restaurante.jpg",
  "avatar": "leo-face-circle.jpg",
  "price": "200",
  "keyword": "CONSULTA"
 }
];
