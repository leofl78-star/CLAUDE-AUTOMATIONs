// Final copy: judge-merged from 3 drafts, fact-checked, revised after 4-lens QA and a final verify pass.
const META = {"handle": "@senta.aqui.com.o.leo"};
const SLIDES = [
 {
  "type": "cover",
  "name": "capa",
  "eyebrow": "Uma carta pra quem tá tentando parar",
  "title": "Eu prometi <span class=\"accent\">nunca mais</span> dezenas de vezes",
  "sub": "Nenhuma promessa segurou. O que me mantém limpo há 6 anos é outra coisa.",
  "bg": "homem_desesperado.jpg",
  "bgPos": "50% 38%"
 },
 {
  "type": "stat",
  "name": "dado",
  "eyebrow": "Antes de você se culpar",
  "statValue": "40<small>a</small>60%",
  "statLabel": "é a taxa de recaída entre pessoas tratadas por dependência química",
  "body": [
   "Parecida com a de hipertensão e asma (50&nbsp;a&nbsp;70%).",
   "Recair não quer dizer que o tratamento falhou. É sinal pra retomar ou ajustar."
  ],
  "source": "NIDA, Drugs, Brains, and Behavior · McLellan et al., JAMA, 2000"
 },
 {
  "type": "item",
  "name": "primeiros-dias",
  "eyebrow": "Promessa de ressaca",
  "num": "01",
  "title": "Logo depois do estrago, prometer sai <span class=\"accent\">fácil</span>",
  "body": [
   "Tudo ainda doía.<br>Eu jurava com a vergonha quente.",
   "Umas semanas depois, a cabeça já tinha editado a história e guardado só a parte boa."
  ],
  "note": "Promessa feita na vergonha passa junto com ela.",
  "bg": "homem_jogando_garrafas_no_chao.jpg",
  "bgPos": "50% 4%"
 },
 {
  "type": "item",
  "name": "a-fissura-pergunta",
  "eyebrow": "Na hora que bate",
  "num": "02",
  "title": "A fissura não grita.<br>Ela faz <span class=\"accent\">perguntas</span>.",
  "list": [
   "Lembra como era bom?",
   "Quem disse que você tem problema?",
   "Pra que aguentar isso de cara limpa?"
  ],
  "listStyle": "quote",
  "note": "E a promessa não tem resposta pra nenhuma delas.",
  "bg": "bebado_insonia_2.jpg",
  "bgPos": "50% 34%"
 },
 {
  "type": "item",
  "name": "a-negociacao",
  "eyebrow": "Quando você improvisa",
  "num": "03",
  "title": "Discutir com a fissura na hora é jogar no <span class=\"accent\">campo</span> dela",
  "list": [
   "Hoje tem motivo, ninguém é de ferro.",
   "Vou lá só pra ver o pessoal.",
   "Amanhã eu recomeço."
  ],
  "listStyle": "quote",
  "note": "Eu já caí em todas essas. Aí eu entendi uma coisa.",
  "bg": "mulher_tequila.jpg",
  "bgPos": "50% 0%"
 },
 {
  "type": "item",
  "name": "rotina",
  "eyebrow": "O que eu entendi",
  "num": "04",
  "title": "A fissura vai e volta.<br>A <span class=\"accent\">rotina</span> fica.",
  "list": [
   "De manhã, antes de a cabeça acelerar",
   "No fim da tarde, quando bate o vazio",
   "Na sexta à noite, quando todo mundo sai"
  ],
  "listStyle": "dot",
  "note": "E a rotina aguenta mais quando tem um plano por trás.",
  "bg": "homem_na_sarjeta.jpg",
  "bgPos": "50% 0%"
 },
 {
  "type": "item",
  "name": "o-plano",
  "eyebrow": "Montando o plano",
  "num": "05",
  "title": "Pra cada pergunta<br>da fissura,<br>uma resposta <span class=\"accent\">já escrita</span>",
  "list": [
   "Os sinais de que eu tô em risco",
   "Uma frase pronta pra recusar",
   "Meu roteiro até a fissura passar",
   "Quem me atende de madrugada"
  ],
  "listStyle": "dot",
  "note": "Escreve num dia calmo, de preferência com alguém.",
  "bg": "adolecente_asking_for_help.jpg",
  "bgPos": "50% 30%"
 },
 {
  "type": "item",
  "name": "o-dia-ruim",
  "eyebrow": "O teste",
  "num": "06",
  "title": "Plano de verdade é o que aguenta o seu <span class=\"accent\">pior</span> dia",
  "list": [
   "Depois de uma briga em casa",
   "No dia que cai o pagamento",
   "Quando chega uma notícia ruim",
   "Depois de uma noite sem dormir"
  ],
  "listStyle": "dot",
  "note": "E dá pra deixar esses dias menos perigosos.",
  "bg": "mulher_bebada_sozinha.jpg",
  "bgPos": "50% 40%"
 },
 {
  "type": "item",
  "name": "ambiente",
  "eyebrow": "Mexer no ambiente",
  "num": "07",
  "title": "Cada barreira até o uso é <span class=\"accent\">tempo</span> pra pensar",
  "list": [
   "Tirar de casa o que te leva ao uso",
   "Apagar o contato de quem oferece",
   "Evitar os lugares onde você usava"
  ],
  "listStyle": "dot",
  "note": "E o número de quem te ajuda fica no topo da tela.",
  "bg": "father_and_addicted_daughter.jpg",
  "bgPos": "50% 30%"
 },
 {
  "type": "item",
  "name": "sem-vontade",
  "eyebrow": "Sobre os dias sem vontade",
  "num": "08",
  "title": "Tem dia que a <span class=\"accent\">vontade</span> de ficar limpo some. Comigo também.",
  "body": [
   "Seis anos limpo e ainda tem manhã assim. Nesses dias eu não espero o ânimo voltar."
  ],
  "list": [
   "Ligo pra alguém que tá do meu lado",
   "Faço o primeiro item do plano sem negociar",
   "Vou no grupo e na terapia mesmo assim"
  ],
  "listStyle": "dot",
  "bg": "grupo_de_apoio.jpg",
  "bgPos": "50% 28%",
  "note": "Nada disso pede vontade. Pede plano."
 },
 {
  "type": "turn",
  "name": "manifesto",
  "eyebrow": "Se você leu até aqui",
  "lines": [
   {
    "text": "Parar, eu prometi dezenas de vezes."
   },
   {
    "text": "Ficar limpo, eu tive que construir."
   },
   {
    "text": "Não jura de novo. Monta um plano.",
    "accent": true
   },
   {
    "text": "Salva pra reler no dia difícil."
   },
   {
    "text": "E manda pra quem tá tentando parar."
   }
  ],
  "sig": "Léo",
  "swipe": "Quer montar o seu comigo?"
 },
 {
  "type": "leo",
  "photo": "leo-restaurante.jpg",
  "price": "200",
  "keyword": "CONSULTA",
  "name": "leo",
  "eyebrow": "",
  "hello": "Oi, eu sou o Léo.",
  "title": "6 anos limpo, hoje conselheiro.<br>A gente monta seu plano<br>antes da próxima promessa.",
  "offerTitle": "Consulta individual",
  "offerSub": "Online ou presencial em SP",
  "hint": "que eu te mando o link<br>pra marcar no direct",
  "crisis": "Se hoje tá pesado, liga pro <b>CVV 188</b>. 24h, gratuito.",
  "private": "Prefere não comentar? Manda <b>CONSULTA</b> no direct."
 }
];
