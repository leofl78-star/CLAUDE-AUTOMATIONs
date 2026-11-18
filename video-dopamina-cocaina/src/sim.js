// Simulação da sinapse. Sem DOM: roda igual no navegador e no Node (para os testes).
// Coordenadas de cena: origem no centro, x de -480 a 480, y de -480 (topo) a 480.
//   terminal da VTA: acima de y = -40 (membrana pré-sináptica)
//   fenda sináptica: y de -40 a 120
//   neurônio do accumbens: abaixo de y = 120 (membrana pós-sináptica)
(function (root) {
  const DV = (root.DV = root.DV || {});
  const T = DV.T;

  const G = {
    PRE_Y: -40,
    POST_Y: 120,
    CLEFT_TOP: -24,
    CLEFT_BOTTOM: 102,
    CLEFT_HALF_W: 335,
    RELEASE_X: [-84, 0, 84],
    DAT_X: [-268, -186, 186, 268],
    REC_X: Array.from({ length: 10 }, (_, i) => -288 + i * 64),
    BIND_Y: 104,
    SIM_DT: 1 / 60,
    CAP: 40, // acima disso a dopamina escapa pelas laterais da fenda
    METER_NORMAL: 8, // pico de um pulso normal
    METER_MAX: 44,
  };

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const ease = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

  // ---- funções puras do tempo -------------------------------------------------

  // Presença de cada receptor na membrana, de 0 (internalizado) a 1 (ativo).
  function receptorPresence(slot, t) {
    for (const c of T.D2_CHANGES) {
      if (c.slot !== slot) continue;
      let p = 1 - ease((t - c.out[0]) / (c.out[1] - c.out[0]));
      if (c.back) p = Math.max(p, ease((t - c.back[0]) / (c.back[1] - c.back[0])));
      return p;
    }
    return 1;
  }

  // Posição e estado de cada molécula de cocaína. k = índice em BLOCKED_DATS.
  function cocaineState(k, t) {
    const dat = T.BLOCKED_DATS[k];
    const dx = G.DAT_X[dat];
    const side = dx < 0 ? -1 : 1;
    const dock = { x: dx, y: G.PRE_Y + 24 };
    const start = { x: side * 470, y: 30 + k * 26 };
    for (const w of T.COCAINE) {
      const tin = w.tIn + k * T.COCAINE_STAGGER;
      const exitDur = 1.3;
      if (t < tin || t > w.tOut + (w.hiddenExit ? 0 : exitDur)) continue;
      let u;
      if (t <= w.tOut) u = ease((t - tin) / T.COCAINE_TRAVEL);
      else u = 1 - ease((t - w.tOut) / exitDur);
      const wob = Math.sin(u * Math.PI) * 46 * (k % 2 ? -1 : 1);
      return {
        visible: true,
        docked: t <= w.tOut && u >= 0.999,
        u,
        x: start.x + (dock.x - start.x) * u,
        y: start.y + (dock.y - start.y) * u + wob,
        rot: (1 - u) * 2.4 * side + Math.PI / 4,
        alpha: clamp01(u * 6),
        dat,
      };
    }
    return { visible: false, docked: false, u: 0, x: start.x, y: start.y, rot: 0, alpha: 0, dat };
  }

  function monthsAt(t) {
    const m = T.MONTHS;
    return Math.round(clamp01((t - m.t0) / (m.t1 - m.t0)) * m.max);
  }

  // ---- simulação com estado -----------------------------------------------------

  function createSim(seed) {
    const s = {
      G,
      t: 0,
      frame: 0,
      da: [],            // moléculas de dopamina
      receptors: G.REC_X.map((x, i) => ({ x, slot: i, type: i % 2 === 0 ? 'D1' : 'D2', p: 1, bound: null, glow: 0 })),
      dats: G.DAT_X.map((x, i) => ({ x, i, blocked: false, busy: 0, flash: 0 })),
      coke: T.BLOCKED_DATS.map((_, k) => cocaineState(k, 0)),
      ripples: [],       // sinal pós-sináptico: { x, age }
      releases: [],      // flashes de liberação: { x, age }
      meter: 0,          // dopamina na fenda, suavizada
      activity: 0,       // receptores ocupados, suavizado
      count: 0,
      boundCount: 0,
      act2Peak: 0,
      months: 0,
      d2Active: 5,
      stats: { released: 0, recaptured: 0, leaked: 0, bindings: 0 },
    };
    let rng = mulberry32(seed || 20261118);
    let nextPulse = 0;
    let didReset = false;
    let simT = 0;

    function reset() {
      s.t = 0; s.frame = 0; s.da.length = 0; s.ripples.length = 0; s.releases.length = 0;
      s.meter = 0; s.activity = 0; s.count = 0; s.boundCount = 0; s.act2Peak = 0;
      s.stats = { released: 0, recaptured: 0, leaked: 0, bindings: 0 };
      for (const r of s.receptors) { r.p = 1; r.bound = null; r.glow = 0; }
      for (const d of s.dats) { d.blocked = false; d.busy = 0; d.flash = 0; }
      rng = mulberry32(seed || 20261118);
      nextPulse = 0; didReset = false; simT = 0;
    }

    function spawn(n) {
      for (let i = 0; i < n; i++) {
        const site = G.RELEASE_X[i % G.RELEASE_X.length];
        s.da.push({
          x: site + (rng() - 0.5) * 30,
          y: G.CLEFT_TOP + rng() * 6,
          vx: (rng() - 0.5) * 520,
          vy: 280 + rng() * 170,
          state: 'free',
          age: 0,
          cool: 0,
          timer: 0,
          rec: null,
          dat: null,
          alpha: 1,
          id: s.stats.released + i,
        });
      }
      s.stats.released += n;
      for (const x of G.RELEASE_X) s.releases.push({ x, age: 0 });
    }

    function step(dt) {
      simT += dt;
      const t = simT;

      // corte "anos de uso": limpa a fenda por trás da cartela
      if (!didReset && t >= T.RESET_AT) {
        didReset = true;
        s.da.length = 0;
        for (const r of s.receptors) r.bound = null;
        s.meter = 0; s.activity = 0;
      }

      while (nextPulse < T.PULSES.length && T.PULSES[nextPulse].t <= t) {
        spawn(T.PULSES[nextPulse].n);
        nextPulse++;
      }

      // cocaína e transportadores
      for (const d of s.dats) d.blocked = false;
      for (let k = 0; k < s.coke.length; k++) {
        const c = cocaineState(k, t);
        s.coke[k] = c;
        if (c.docked) s.dats[c.dat].blocked = true;
      }
      for (const d of s.dats) { d.busy = Math.max(0, d.busy - dt); d.flash = Math.max(0, d.flash - dt * 2.2); }

      // receptores
      let d2 = 0;
      for (const r of s.receptors) {
        r.p = receptorPresence(r.slot, t);
        if (r.p < 0.9 && r.bound) { r.bound.state = 'free'; r.bound.cool = 1.2; r.bound.vy = -70; r.bound.rec = null; r.bound = null; }
        r.glow += ((r.bound ? 1 : 0) - r.glow) * Math.min(1, dt * 9);
        if (r.type === 'D2' && r.p > 0.5) d2++;
      }
      s.d2Active = d2;

      let freeOrBound = 0, bound = 0;
      const openDats = s.dats.filter((d) => !d.blocked);
      const total = s.da.length;

      for (const p of s.da) {
        p.age += dt;
        if (p.cool > 0) p.cool -= dt;

        if (p.state === 'free') {
          freeOrBound++;
          // movimento browniano com arrasto
          p.vx += (rng() - 0.5) * 2 * 38 - p.vx * 3 * dt;
          p.vy += (rng() - 0.5) * 2 * 38 - p.vy * 3 * dt;

          // puxão de recaptação: só para transportadores abertos e próximos
          // Com a recaptação normal, cada molécula vai para um transportador do seu lado.
          // Com só um aberto, apenas quem está perto dele consegue voltar.
          let best = null, bestD = 1e9;
          const normal = openDats.length >= 3;
          if (normal) {
            const side = openDats.filter((d) => (d.x < 0) === (p.x < 0));
            const pool = side.length ? side : openDats;
            best = pool[p.id % pool.length];
            bestD = Math.hypot(best.x - p.x, G.CLEFT_TOP - p.y);
          } else {
            for (const d of openDats) {
              const dd = Math.hypot(d.x - p.x, G.CLEFT_TOP - p.y);
              if (dd < bestD) { bestD = dd; best = d; }
            }
          }
          if (best && p.age > 1.15 && bestD < (normal ? 900 : 190)) {
            const k = (normal ? 900 : 560) / Math.max(bestD, 30);
            p.vx += (best.x - p.x) * k * dt;
            p.vy += (G.CLEFT_TOP - p.y) * k * dt;
            if (bestD < 26 && best.busy <= 0) {
              p.state = 'uptake'; p.dat = best; p.timer = 0;
              best.busy = normal ? 0.22 : 1.0;
              best.flash = 1;
              continue;
            }
          }

          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.y < G.CLEFT_TOP) { p.y = G.CLEFT_TOP; p.vy = Math.abs(p.vy) * 0.7; }
          if (p.y > G.CLEFT_BOTTOM) { p.y = G.CLEFT_BOTTOM; p.vy = -Math.abs(p.vy) * 0.7; }
          if (!p.leak) {
            if (p.x < -G.CLEFT_HALF_W) { p.x = -G.CLEFT_HALF_W; p.vx = Math.abs(p.vx); }
            if (p.x > G.CLEFT_HALF_W) { p.x = G.CLEFT_HALF_W; p.vx = -Math.abs(p.vx); }
          } else {
            p.vx += Math.sign(p.x || 1) * 260 * dt;
            if (Math.abs(p.x) > G.CLEFT_HALF_W) p.alpha -= dt * 1.6;
          }

          // ligação a um receptor livre
          if (p.cool <= 0 && p.y > G.BIND_Y - 26 && !p.leak) {
            for (const r of s.receptors) {
              if (r.bound || r.p < 0.9) continue;
              if (Math.abs(r.x - p.x) < 19) {
                r.bound = p; p.rec = r; p.state = 'bound';
                p.timer = 0.75 + rng() * 0.55;
                s.ripples.push({ x: r.x, age: 0, type: r.type });
                s.stats.bindings++;
                break;
              }
            }
          }
        } else if (p.state === 'bound') {
          freeOrBound++; bound++;
          p.x += (p.rec.x - p.x) * Math.min(1, dt * 18);
          p.y += (G.BIND_Y - p.y) * Math.min(1, dt * 18);
          p.timer -= dt;
          if (p.timer <= 0) {
            p.rec.bound = null; p.rec = null; p.state = 'free';
            p.cool = 0.7; p.vy = -90 - rng() * 60; p.vx = (rng() - 0.5) * 120;
          }
        } else if (p.state === 'uptake') {
          p.timer += dt;
          const u = clamp01(p.timer / 0.5);
          p.x += (p.dat.x - p.x) * Math.min(1, dt * 20);
          p.y = G.CLEFT_TOP + (G.PRE_Y - 78 - G.CLEFT_TOP) * ease(u);
          p.alpha = 1 - clamp01((u - 0.55) / 0.45);
          if (u >= 1) { p.dead = true; s.stats.recaptured++; }
        }
        if (p.alpha <= 0) { p.dead = true; if (p.leak) s.stats.leaked++; }
      }

      // excesso escapa pelas laterais (a dopamina se difunde para fora da sinapse)
      if (total > G.CAP) {
        let oldest = null;
        for (const p of s.da) if (p.state === 'free' && !p.leak && (!oldest || p.age > oldest.age)) oldest = p;
        if (oldest) oldest.leak = true;
      }

      if (s.da.some((p) => p.dead)) s.da = s.da.filter((p) => !p.dead);
      for (const r of s.ripples) r.age += dt;
      if (s.ripples.length && s.ripples[0].age > 1.2) s.ripples = s.ripples.filter((r) => r.age <= 1.2);
      for (const r of s.releases) r.age += dt;
      if (s.releases.length && s.releases[0].age > 0.7) s.releases = s.releases.filter((r) => r.age <= 0.7);

      s.count = freeOrBound; s.boundCount = bound;
      s.meter += (freeOrBound - s.meter) * (1 - Math.exp(-dt / 0.28));
      s.activity += (bound - s.activity) * (1 - Math.exp(-dt / 0.25));
      if (t >= 18 && t < 32) s.act2Peak = Math.max(s.act2Peak, s.meter);
      s.months = monthsAt(t);
      s.t = t;
    }

    // Avança a simulação até o quadro pedido. Voltar no tempo reinicia do zero.
    s.seekFrame = function (frame) {
      if (frame < s.frame) reset();
      const target = frame / T.FPS;
      while (simT + G.SIM_DT * 0.5 < target) step(G.SIM_DT);
      s.frame = frame;
      s.t = target;
      return s;
    };

    return s;
  }

  DV.G = G;
  DV.createSim = createSim;
  DV.cocaineState = cocaineState;
  DV.receptorPresence = receptorPresence;
  DV.ease = ease;
  DV.clamp01 = clamp01;
})(typeof globalThis !== 'undefined' ? globalThis : this);
