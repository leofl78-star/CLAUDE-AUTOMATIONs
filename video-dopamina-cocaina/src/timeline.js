// Linha do tempo do vídeo: atos, pulsos de dopamina, cocaína, receptores e textos.
// Tudo que define "o que acontece e quando" fica aqui. Tempos em segundos.
(function (root) {
  const DV = (root.DV = root.DV || {});

  const T = {
    FPS: 30,
    DURATION: 60,

    ACTS: [
      { id: 'hook', t0: 0, t1: 4 },
      { id: 'a1', t0: 4, t1: 18, n: 1, label: 'SEM COCAÍNA' },
      { id: 'a2', t0: 18, t1: 32, n: 2, label: 'COM COCAÍNA' },
      { id: 'a3', t0: 32, t1: 48, n: 3, label: 'ANOS DE USO' },
      { id: 'a4', t0: 48, t1: 56, n: 4, label: 'ABSTINÊNCIA' },
      { id: 'end', t0: 56, t1: 60 },
    ],

    // Cada pulso é uma liberação de dopamina pelo terminal da VTA.
    // n = quantas moléculas saem. Ilustrativo, fora de escala.
    PULSES: [
      // gancho + ato 1: liberação normal, um ciclo a cada 3,5 s
      { t: 0.6, n: 8 }, { t: 4.1, n: 8 }, { t: 7.6, n: 8 }, { t: 11.1, n: 8 }, { t: 14.6, n: 8 },
      // ato 2: mesma liberação, mas a recaptação está travada
      { t: 19.2, n: 8 }, { t: 21.6, n: 8 }, { t: 24.0, n: 8 }, { t: 26.4, n: 8 }, { t: 28.8, n: 8 }, { t: 30.8, n: 8 },
      // ato 3a: anos de uso, sem a droga. Liberação reduzida.
      { t: 34.6, n: 3 }, { t: 37.6, n: 3 }, { t: 40.2, n: 3 },
      // ato 3b: anos de uso, com a droga. Liberação continua reduzida.
      { t: 41.6, n: 3 }, { t: 43.4, n: 3 }, { t: 45.2, n: 3 }, { t: 46.8, n: 3 },
      // ato 4: abstinência. Não animo aumento de liberação: não tenho fonte confiável para isso.
      { t: 50.6, n: 3 }, { t: 53.2, n: 3 }, { t: 55.4, n: 3 }, { t: 57.6, n: 3 },
    ],

    // Janelas em que a cocaína está presente. Ela ocupa 3 dos 4 transportadores (75%),
    // dentro da faixa de 60 a 77% medida em humanos.
    COCAINE: [
      { tIn: 18.4, tOut: 33.0, hiddenExit: true },
      { tIn: 41.0, tOut: 48.0, hiddenExit: false },
    ],
    COCAINE_TRAVEL: 1.6, // segundos da entrada até travar o DAT
    COCAINE_STAGGER: 0.35,
    BLOCKED_DATS: [0, 1, 3],

    // Momento do corte "anos de uso": a fenda é limpa por trás da cartela.
    RESET_AT: 33.0,

    // Receptores D2 que saem da membrana no ato 3 e o que volta no ato 4.
    // slot = índice do receptor (ímpares são D2).
    D2_CHANGES: [
      { slot: 3, out: [35.2, 37.0], back: [51.4, 53.4] },
      { slot: 7, out: [35.8, 37.6], back: null },
    ],

    MONTHS: { t0: 48.6, t1: 55.6, max: 12 },

    // Textos na tela. {chaves} = destaque laranja. [colchetes] = apagado. \n = quebra forçada.
    CUES: [
      { t0: 4, t1: 7.5, head: 'DOIS NEURÔNIOS.\n{UMA SINAPSE.}', sub: 'Em cima, o neurônio da VTA. Embaixo, o do núcleo accumbens.' },
      { t0: 7.5, t1: 11, head: '{LIBEROU.}\n[SINALIZOU.]\n[RECOLHEU.]', sub: 'A dopamina sai do terminal.', focus: 'release' },
      { t0: 11, t1: 14.5, head: '[LIBEROU.]\n{SINALIZOU.}\n[RECOLHEU.]', sub: 'Ela encaixa nos receptores D1 e D2 e passa o sinal.', focus: 'receptors' },
      { t0: 14.5, t1: 18, head: '[LIBEROU.]\n[SINALIZOU.]\n{RECOLHEU.}', sub: 'O transportador DAT recolhe a dopamina. O sinal termina.', focus: 'dat' },
      { t0: 18, t1: 22.5, head: 'A {COCAÍNA} CHEGA.', sub: 'Ela trava o transportador DAT.', focus: 'dat' },
      { t0: 22.5, t1: 27, head: 'A SAÍDA {FECHOU.}', sub: 'A dopamina continua saindo e não tem como voltar.' },
      { t0: 27, t1: 32, head: 'A COCAÍNA NÃO CRIA DOPAMINA.\n{ELA FECHA A SAÍDA.}', sub: '60 a 77% dos transportadores bloqueados.', source: 'Volkow et al., Nature, 1997' },
      { t0: 34, t1: 41, head: 'O CÉREBRO {SE ADAPTA.}', sub: 'Sem a droga: menos receptores D2 e menos dopamina liberada.', source: 'Volkow et al., 1993 e 1997. Martinez et al., 2007', focus: 'receptors' },
      { t0: 41, t1: 48, head: '{QUER MAIS.}\nSENTE MENOS.', sub: 'Com a droga, o pico já não chega perto do começo.', source: 'Volkow et al., Nature, 1997' },
      { t0: 48, t1: 56, head: 'COM TEMPO LIMPO, O CÉREBRO {SE REORGANIZA.}', sub: 'Parte dos receptores volta. A recuperação é parcial e varia de pessoa para pessoa.', source: 'Nader et al., Nature Neuroscience, 2006 (estudo com macacos)', focus: 'receptors' },
    ],

    HOOK: {
      v: ['POR QUE QUEM', 'USA COCAÍNA', 'HÁ ANOS', '{SENTE MENOS}', '{E QUER MAIS?}'],
      h: ['POR QUE QUEM USA', 'COCAÍNA HÁ ANOS', '{SENTE MENOS}', '{E QUER MAIS?}'],
    },
    SKIP_CARD: { t0: 32, t1: 34.2, text: 'MUITOS ANOS DE USO' },
    END: {
      lines: ['DEPENDÊNCIA É', 'DOENÇA DO CÉREBRO.', '{NÃO É FALTA}', '{DE CARÁTER.}'],
      brand: 'SENTA AQUI COM O LÉO',
      handle: '@sentaaquicomoleo',
      disclaimer: 'Conteúdo educativo. Não substitui avaliação médica.',
    },
  };

  T.actAt = function (t) {
    for (const a of T.ACTS) if (t >= a.t0 && t < a.t1) return a;
    return T.ACTS[T.ACTS.length - 1];
  };
  T.cueAt = function (t) {
    for (const c of T.CUES) if (t >= c.t0 && t < c.t1) return c;
    return null;
  };

  DV.T = T;
})(typeof globalThis !== 'undefined' ? globalThis : this);
