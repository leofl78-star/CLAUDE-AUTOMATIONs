// Testa se a simulação mostra o que o roteiro afirma. Rodar: node test-sim.js
require('./src/timeline.js');
require('./src/sim.js');
const { T, createSim, G } = globalThis.DV;

let failed = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
  if (!ok) failed++;
}

const sim = createSim();
const at = {}; // amostras por quadro
const maxIn = (a, b, key) => {
  let m = -Infinity;
  for (let f = Math.round(a * T.FPS); f < Math.round(b * T.FPS); f++) m = Math.max(m, at[f][key]);
  return m;
};
for (let f = 0; f <= T.DURATION * T.FPS; f++) {
  sim.seekFrame(f);
  at[f] = {
    count: sim.count, meter: sim.meter, bound: sim.boundCount, d2: sim.d2Active,
    blocked: sim.dats.filter((d) => d.blocked).length, months: sim.months,
  };
}
const F = (t) => at[Math.round(t * T.FPS)];

// Ato 1: cada pulso é recolhido antes do próximo ("Liberou. Sinalizou. Recolheu.")
for (const t of [4.05, 7.55, 11.05, 14.55, 18.0]) {
  check(`ato 1: fenda limpa antes do pulso em t=${t}`, F(t).count <= 1, `dopamina na fenda = ${F(t).count}`);
}
const a1Peak = maxIn(4, 18, 'count');
check('ato 1: pico igual ao pulso normal', a1Peak === 8, `pico = ${a1Peak}`);
check('ato 1: receptores recebem dopamina', maxIn(4, 18, 'bound') >= 3, `máx. ocupados = ${maxIn(4, 18, 'bound')}`);
check('ato 1: nenhum transportador bloqueado', maxIn(4, 18, 'blocked') === 0);

// Ato 2: 3 de 4 transportadores travados e a dopamina acumula
check('ato 2: 3 de 4 DAT bloqueados (75%)', F(25).blocked === 3, `bloqueados = ${F(25).blocked}`);
check('ato 2: cocaína trava antes de t=21', F(21).blocked === 3);
const a2Peak = maxIn(18, 32, 'meter');
check('ato 2: dopamina acumula, pico >= 3x o normal', a2Peak >= 3 * G.METER_NORMAL, `pico = ${a2Peak.toFixed(1)}`);
check('ato 2: pico cabe no medidor', a2Peak <= G.METER_MAX, `pico = ${a2Peak.toFixed(1)}, máx = ${G.METER_MAX}`);
check('ato 2: nível no fim maior que no meio (sobe o ato todo)', F(31.5).meter > F(24).meter, `${F(24).meter.toFixed(1)} -> ${F(31.5).meter.toFixed(1)}`);

// Ato 3a: anos de uso, sem droga
check('ato 3: fenda limpa após o corte', F(34).count === 0);
check('ato 3: D2 ativos caem de 5 para 3', F(34).d2 === 5 && F(40).d2 === 3, `t=34: ${F(34).d2}, t=40: ${F(40).d2}`);
const a3aPeak = maxIn(34, 41, 'meter');
check('ato 3a: sem droga, pico abaixo do normal', a3aPeak < G.METER_NORMAL * 0.6, `pico = ${a3aPeak.toFixed(1)}`);
check('ato 3a: sem transportador bloqueado', maxIn(34, 40.9, 'blocked') === 0);

// Ato 3b: anos de uso, com droga. Pico menor que no ato 2 ("quer mais, sente menos")
check('ato 3b: 3 de 4 DAT bloqueados', F(45).blocked === 3);
const a3bPeak = maxIn(41, 48, 'meter');
check('ato 3b: pico acima do ato 3a', a3bPeak > a3aPeak * 1.8, `${a3bPeak.toFixed(1)} vs ${a3aPeak.toFixed(1)}`);
check('ato 3b: pico menor que metade do ato 2', a3bPeak < a2Peak * 0.5, `${a3bPeak.toFixed(1)} vs ${a2Peak.toFixed(1)}`);

// Ato 4: abstinência, recuperação parcial
check('ato 4: transportadores livres', F(50).blocked === 0);
check('ato 4: fenda esvazia depois que a cocaína sai', F(50.5).count <= 1, `dopamina = ${F(50.5).count}`);
check('ato 4: um D2 volta (3 -> 4), não todos', F(49).d2 === 3 && F(55).d2 === 4, `t=49: ${F(49).d2}, t=55: ${F(55).d2}`);
check('ato 4: contador vai de 0 a 12 meses', F(48.6).months === 0 && F(55.6).months === 12);

// Determinismo: mesma entrada, mesmo vídeo
const b = createSim(); b.seekFrame(900);
const c = createSim(); c.seekFrame(1200); c.seekFrame(900);
const sig = (s) => s.da.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)},${p.state}`).join('|');
check('determinismo: avançar e voltar dá o mesmo quadro', sig(b) === sig(c) && b.da.length > 0, `${b.da.length} moléculas`);

console.log(`\nresumo: ato1 pico ${a1Peak} | ato2 pico ${a2Peak.toFixed(1)} | ato3a pico ${a3aPeak.toFixed(1)} | ato3b pico ${a3bPeak.toFixed(1)}`);
console.log(`liberadas ${sim.stats.released}, recaptadas ${sim.stats.recaptured}, escaparam ${sim.stats.leaked}, ligações ${sim.stats.bindings}`);
console.log(failed ? `\n${failed} teste(s) falharam` : '\ntodos os testes passaram');
process.exit(failed ? 1 : 0);
