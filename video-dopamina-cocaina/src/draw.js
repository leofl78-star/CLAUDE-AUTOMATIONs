// Desenho de cada quadro em canvas 2D. Só roda no navegador.
// Dois layouts com o mesmo conteúdo: v = 1080x1920 (Reels, TikTok, Shorts), h = 1920x1080 (YouTube).
(function (root) {
  const DV = root.DV;
  const T = DV.T, G = DV.G, ease = DV.ease, clamp01 = DV.clamp01;

  const C = {
    bg: '#06070c', white: '#ffffff', text: '#eef0f7', muted: '#9aa1b8', dim: 'rgba(255,255,255,0.26)',
    accent: '#ff6b3d', da: '#ff7a2f', daCore: '#ffe6c7',
    d1: '#4da6ff', d2: '#c4ff3e', dat: '#e3a6ff', datBlocked: '#6f6787', danger: '#ff4d5e',
    coke: '#ffffff', cokeEdge: '#7fdcff',
    pre1: '#4b3aa6', pre2: '#231a5a', preStroke: '#a595ff',
    post1: '#0f5a66', post2: '#072a33', postStroke: '#45e0cf',
  };
  const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';

  const LAYOUTS = {
    v: {
      W: 1080, H: 1920,
      scene: { cx: 548, cy: 935, s: 0.8 },
      progress: { x: 70, y: 196, w: 940, h: 8 }, chip: { x: 70, y: 244, size: 28 },
      head: { x: 70, y: 272, w: 900, size: 78, lh: 1.04 },
      sub: { x: 70, y: 1338, w: 860, size: 42, lh: 1.22 },
      source: { x: 70, y: 1478, size: 24 },
      meter: { x: 62, y: 680, w: 34, h: 540, labelSize: 21 },
      months: { x: 1010, y: 540 },
      hook: { x: 70, cy: 800, w: 900, size: 112 },
      card: { cx: 540, cy: 860, size: 92, w: 900 },
      end: { cx: 540, top: 400, size: 84, w: 940, tile: 220, disclaimerY: 1420 },
    },
    h: {
      W: 1920, H: 1080,
      scene: { cx: 1390, cy: 540, s: 0.92 },
      progress: { x: 90, y: 96, w: 640, h: 8 }, chip: { x: 90, y: 144, size: 26 },
      head: { x: 90, y: 178, w: 700, size: 70, lh: 1.04 },
      sub: { x: 90, y: 560, w: 640, size: 38, lh: 1.24 },
      source: { x: 90, y: 724, size: 22 },
      meter: { x: 842, y: 270, w: 36, h: 540, labelSize: 20 },
      months: { x: 1850, y: 64 },
      hook: { x: 110, cy: 540, w: 1700, size: 128 },
      card: { cx: 960, cy: 520, size: 110, w: 1700 },
      end: { cx: 960, top: 130, size: 80, w: 1700, tile: 170, disclaimerY: 1010 },
    },
  };

  // ---- texto com destaque --------------------------------------------------------

  function parseRich(str) {
    const lines = []; let cur = []; let style = 'n'; let word = '';
    const push = () => { if (word) { cur.push({ w: word, style }); word = ''; } };
    for (const ch of str) {
      if (ch === '{') { push(); style = 'a'; }
      else if (ch === '[') { push(); style = 'd'; }
      else if (ch === '}' || ch === ']') { push(); style = 'n'; }
      else if (ch === ' ') push();
      else if (ch === '\n') { push(); lines.push(cur); cur = []; }
      else word += ch;
    }
    push(); lines.push(cur);
    return lines;
  }
  function wrapRich(ctx, forced, maxW) {
    const sp = ctx.measureText(' ').width; const out = [];
    for (const words of forced) {
      let line = [], w = 0;
      for (const wd of words) {
        const ww = ctx.measureText(wd.w).width;
        if (line.length && w + sp + ww > maxW) { out.push({ words: line, width: w }); line = []; w = 0; }
        w += (line.length ? sp : 0) + ww;
        line.push({ w: wd.w, style: wd.style, ww });
      }
      out.push({ words: line, width: w });
    }
    return out;
  }
  const styleColor = (st) => (st === 'a' ? C.accent : st === 'd' ? C.dim : C.white);

  // Desenha texto rico. align: 'left' ou 'center'. Retorna a altura usada.
  function drawRich(ctx, str, x, y, o) {
    const size = o.size, lh = (o.lh || 1.05) * size;
    ctx.save();
    ctx.font = `${o.weight || 900} ${size}px ${FONT}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    const lines = wrapRich(ctx, parseRich(str), o.w);
    const sp = ctx.measureText(' ').width;
    lines.forEach((ln, i) => {
      const a = o.lineAlpha ? o.lineAlpha(i) : 1;
      const dy = o.lineDy ? o.lineDy(i) : 0;
      let cx = o.align === 'center' ? x - ln.width / 2 : x;
      for (const wd of ln.words) {
        ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * a;
        ctx.fillStyle = o.color || styleColor(wd.style);
        ctx.fillText(wd.w, cx, y + i * lh + dy);
        cx += wd.ww + sp;
      }
    });
    ctx.restore();
    return lines.length * lh;
  }
  function fitSize(ctx, str, w, size, weight) {
    ctx.save();
    let s = size;
    for (; s > 20; s -= 2) {
      ctx.font = `${weight || 900} ${s}px ${FONT}`;
      const widest = Math.max(...parseRich(str).map((ws) => ctx.measureText(ws.map((x) => x.w).join(' ')).width));
      if (widest <= w) break;
    }
    ctx.restore();
    return s;
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ---- formas da cena ------------------------------------------------------------------

  function terminalPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(-62, -560);
    ctx.bezierCurveTo(-62, -410, -340, -430, -340, -235);
    ctx.lineTo(-340, -90);
    ctx.quadraticCurveTo(-340, G.PRE_Y, -290, G.PRE_Y);
    ctx.lineTo(290, G.PRE_Y);
    ctx.quadraticCurveTo(340, G.PRE_Y, 340, -90);
    ctx.lineTo(340, -235);
    ctx.bezierCurveTo(340, -430, 62, -410, 62, -560);
    ctx.closePath();
  }
  function spinePath(ctx) {
    ctx.beginPath();
    ctx.moveTo(-340, 170);
    ctx.quadraticCurveTo(-340, G.POST_Y, -290, G.POST_Y);
    ctx.lineTo(290, G.POST_Y);
    ctx.quadraticCurveTo(340, G.POST_Y, 340, 170);
    ctx.lineTo(340, 270);
    ctx.bezierCurveTo(340, 420, 92, 400, 92, 560);
    ctx.lineTo(-92, 560);
    ctx.bezierCurveTo(-92, 400, -340, 420, -340, 270);
    ctx.closePath();
  }

  const VESICLES = [
    { home: [-96, -172], site: 0 }, { home: [0, -146], site: 1 }, { home: [96, -172], site: 2 },
    { home: [-192, -206] }, { home: [192, -206] }, { home: [-268, -176] }, { home: [268, -176] },
  ];
  const VES_DOTS = [[0, 0], [-9, -7], [9, -7], [-8, 9], [8, 9]];

  function vesicleState(v, j, t) {
    const bob = [Math.sin(t * 0.9 + j * 1.7) * 4, Math.cos(t * 0.7 + j * 2.3) * 4];
    const home = [v.home[0] + bob[0], v.home[1] + bob[1]];
    const st = { x: home[0], y: home[1], scale: 1, alpha: 1, full: true };
    if (v.site == null) return st;
    const dock = [G.RELEASE_X[v.site], G.PRE_Y - 28];
    let refill = null;
    for (const p of T.PULSES) {
      const ph = t - p.t;
      if (ph >= -0.7 && ph < 0) {
        const u = ease((ph + 0.7) / 0.7);
        st.x = home[0] + (dock[0] - home[0]) * u; st.y = home[1] + (dock[1] - home[1]) * u;
        return st;
      }
      if (ph >= 0 && ph < 0.32) {
        const u = ph / 0.32;
        st.x = dock[0]; st.y = dock[1] + 10 * u; st.scale = 1 + 0.25 * u; st.alpha = 1 - u; st.full = false;
        return st;
      }
      if (ph >= 0.32 && ph < 1.4) refill = (ph - 0.32) / 1.08;
    }
    if (refill != null) { st.scale = 0.4 + 0.6 * ease(refill); st.alpha = ease(refill); }
    return st;
  }

  // ---- renderizador -------------------------------------------------------------------

  function createRenderer(canvas, format, assets) {
    const L = LAYOUTS[format] || LAYOUTS.v;
    canvas.width = L.W; canvas.height = L.H;
    const ctx = canvas.getContext('2d');

    // sprite da dopamina com brilho (mais rápido que sombra por molécula)
    const spr = document.createElement('canvas');
    spr.width = spr.height = 96;
    (function () {
      const c = spr.getContext('2d');
      const g = c.createRadialGradient(48, 48, 2, 48, 48, 46);
      g.addColorStop(0, 'rgba(255,170,90,0.95)'); g.addColorStop(0.22, 'rgba(255,122,47,0.55)');
      g.addColorStop(0.55, 'rgba(255,107,61,0.14)'); g.addColorStop(1, 'rgba(255,107,61,0)');
      c.fillStyle = g; c.fillRect(0, 0, 96, 96);
      c.fillStyle = C.da; c.beginPath(); c.arc(48, 48, 15, 0, Math.PI * 2); c.fill();
      c.fillStyle = C.daCore; c.beginPath(); c.arc(44, 44, 6.5, 0, Math.PI * 2); c.fill();
    })();
    const DA_R = 12; // raio do núcleo em unidades de cena
    function drawDA(x, y, alpha, scale) {
      const k = (DA_R / 15) * (scale || 1);
      ctx.globalAlpha = alpha;
      ctx.drawImage(spr, x - 48 * k, y - 48 * k, 96 * k, 96 * k);
      ctx.globalAlpha = 1;
    }

    function background(t) {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, L.W, L.H);
      const sc = L.scene;
      const g = ctx.createRadialGradient(sc.cx, sc.cy, 40, sc.cx, sc.cy, 760 * sc.s + 200);
      g.addColorStop(0, 'rgba(46,54,128,0.42)'); g.addColorStop(0.55, 'rgba(24,28,70,0.18)'); g.addColorStop(1, 'rgba(6,7,12,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, L.W, L.H);
      // pontos de luz desfocados, bem lentos
      for (let i = 0; i < 9; i++) {
        const px = (0.13 + 0.83 * ((i * 0.6180339) % 1)) * L.W + Math.sin(t * 0.11 + i * 2.1) * 40;
        const py = (0.1 + 0.8 * ((i * 0.3819660 + 0.17) % 1)) * L.H + Math.cos(t * 0.09 + i * 1.3) * 50;
        const r = 60 + (i % 4) * 34;
        const b = ctx.createRadialGradient(px, py, 0, px, py, r);
        b.addColorStop(0, i % 3 === 0 ? 'rgba(255,107,61,0.055)' : 'rgba(120,140,255,0.06)'); b.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = b; ctx.fillRect(px - r, py - r, r * 2, r * 2);
      }
    }

    function sceneLabel(text, x, y, size, color, weight, alpha) {
      ctx.save();
      ctx.font = `${weight || 700} ${size}px ${FONT}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = alpha == null ? 1 : alpha;
      ctx.fillStyle = color; ctx.fillText(text, x, y);
      ctx.restore();
    }

    function focusBox(x, y, w, h, t, t0) {
      const a = clamp01((t - t0) / 0.35) * (0.5 + 0.3 * Math.sin((t - t0) * 5.2));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = C.white; ctx.lineWidth = 3; ctx.setLineDash([12, 9]); ctx.lineDashOffset = -t * 26;
      rr(ctx, x, y, w, h, 20); ctx.stroke();
      ctx.restore();
    }

    function drawScene(sim, t, cue) {
      const sc = L.scene;
      ctx.save();
      ctx.translate(sc.cx, sc.cy); ctx.scale(sc.s, sc.s);
      const chronic = t >= T.RESET_AT;

      // --- terminal da VTA
      const fadeTop = (rgb) => {
        const f = ctx.createLinearGradient(0, -540, 0, G.PRE_Y);
        f.addColorStop(0, `rgba(${rgb[0]},0)`); f.addColorStop(0.28, `rgba(${rgb[0]},1)`); f.addColorStop(1, `rgba(${rgb[1]},1)`);
        return f;
      };
      const fadeBottom = (rgb) => {
        const f = ctx.createLinearGradient(0, G.POST_Y, 0, 540);
        f.addColorStop(0, `rgba(${rgb[0]},1)`); f.addColorStop(0.7, `rgba(${rgb[1]},1)`); f.addColorStop(1, `rgba(${rgb[1]},0)`);
        return f;
      };
      let g = fadeTop(['35,26,90', '75,58,166']);
      ctx.save();
      ctx.shadowColor = 'rgba(140,120,255,0.55)'; ctx.shadowBlur = 34;
      terminalPath(ctx); ctx.fillStyle = g; ctx.fill();
      ctx.restore();
      terminalPath(ctx); ctx.strokeStyle = fadeTop(['165,149,255', '165,149,255']); ctx.lineWidth = 5; ctx.stroke();

      // vesículas
      VESICLES.forEach((v, j) => {
        const st = vesicleState(v, j, t);
        ctx.save();
        ctx.translate(st.x, st.y); ctx.scale(st.scale, st.scale); ctx.globalAlpha = st.alpha;
        ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill();
        ctx.strokeStyle = 'rgba(214,205,255,0.85)'; ctx.lineWidth = 3; ctx.stroke();
        if (st.full) {
          const n = chronic ? 2 : 5;
          for (let i = 0; i < n; i++) {
            ctx.beginPath(); ctx.arc(VES_DOTS[i][0], VES_DOTS[i][1], 5, 0, Math.PI * 2);
            ctx.fillStyle = C.da; ctx.fill();
          }
        }
        ctx.restore();
      });

      // --- neurônio do accumbens
      g = fadeBottom(['15,90,102', '7,42,51']);
      ctx.save();
      ctx.shadowColor = 'rgba(69,224,207,0.45)'; ctx.shadowBlur = 34;
      spinePath(ctx); ctx.fillStyle = g; ctx.fill();
      ctx.restore();
      // brilho de atividade: quanto mais receptores ocupados, mais forte
      const act = clamp01(sim.activity / 6);
      if (act > 0.01) {
        ctx.save(); spinePath(ctx); ctx.clip();
        const ag = ctx.createLinearGradient(0, G.POST_Y, 0, G.POST_Y + 250);
        ag.addColorStop(0, `rgba(160,255,240,${0.6 * act})`); ag.addColorStop(1, 'rgba(160,255,240,0)');
        ctx.fillStyle = ag; ctx.fillRect(-360, G.POST_Y, 720, 260);
        ctx.restore();
      }
      // ondas do sinal saindo de cada receptor ativado
      ctx.save(); spinePath(ctx); ctx.clip();
      for (const r of sim.ripples) {
        const u = r.age / 1.2;
        ctx.beginPath(); ctx.arc(r.x, G.POST_Y + 8, 14 + u * 92, 0, Math.PI);
        ctx.strokeStyle = r.type === 'D1' ? C.d1 : C.d2; ctx.globalAlpha = (1 - u) * 0.75; ctx.lineWidth = 5 * (1 - u) + 1.5;
        ctx.stroke();
      }
      ctx.restore();
      spinePath(ctx); ctx.strokeStyle = fadeBottom(['69,224,207', '69,224,207']); ctx.lineWidth = 5; ctx.stroke();

      // --- receptores D1 e D2
      for (const r of sim.receptors) {
        const col = r.type === 'D1' ? C.d1 : C.d2;
        if (r.p < 0.98) { // contorno tracejado no lugar do receptor que saiu
          ctx.save();
          ctx.globalAlpha = (1 - r.p) * 0.9; ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.setLineDash([5, 5]);
          ctx.beginPath(); ctx.arc(r.x, G.BIND_Y, 16, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(r.x, G.POST_Y); ctx.lineTo(r.x, G.POST_Y + 26); ctx.stroke();
          ctx.restore();
        }
        if (r.p > 0.02) {
          ctx.save();
          ctx.translate(0, (1 - r.p) * 64); ctx.globalAlpha = r.p;
          if (r.glow > 0.05) { ctx.shadowColor = col; ctx.shadowBlur = 26 * r.glow; }
          ctx.strokeStyle = col; ctx.lineCap = 'round';
          ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(r.x, G.POST_Y); ctx.lineTo(r.x, G.POST_Y + 26); ctx.stroke();
          ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(r.x, G.BIND_Y, 16, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
          ctx.restore();
        }
      }

      // --- transportadores DAT
      for (const d of sim.dats) {
        ctx.save();
        const col = d.blocked ? C.datBlocked : C.dat;
        if (d.blocked) { ctx.shadowColor = C.danger; ctx.shadowBlur = 22; }
        else if (d.flash > 0) { ctx.shadowColor = C.dat; ctx.shadowBlur = 30 * d.flash; }
        ctx.fillStyle = col; ctx.strokeStyle = d.blocked ? C.danger : 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2.5;
        for (const sx of [-15, 15]) {
          rr(ctx, d.x + sx - 9, G.PRE_Y - 36, 18, 60, 9); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      }
      sceneLabel('DAT', -227, G.PRE_Y - 62, 22, 'rgba(240,215,255,0.9)', 800);
      sceneLabel('DAT', 227, G.PRE_Y - 62, 22, 'rgba(240,215,255,0.9)', 800);

      // flashes de liberação
      for (const r of sim.releases) {
        const u = r.age / 0.7;
        ctx.beginPath(); ctx.arc(r.x, G.PRE_Y, 10 + u * 46, 0, Math.PI);
        ctx.strokeStyle = C.da; ctx.globalAlpha = (1 - u) * 0.8; ctx.lineWidth = 4; ctx.stroke(); ctx.globalAlpha = 1;
      }

      // --- dopamina
      for (const p of sim.da) drawDA(p.x, p.y, clamp01(p.alpha), p.state === 'bound' ? 1.08 : 1);

      // --- cocaína
      sim.coke.forEach((c, k) => {
        if (!c.visible) return;
        ctx.save();
        ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.globalAlpha = c.alpha;
        ctx.shadowColor = C.cokeEdge; ctx.shadowBlur = 22;
        ctx.fillStyle = C.coke; ctx.strokeStyle = C.cokeEdge; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.rect(-12, -12, 24, 24); ctx.fill(); ctx.stroke();
        ctx.restore();
        if (k === 0 && !c.docked && c.u > 0.02 && c.u < 0.98) {
          sceneLabel('COCAÍNA', c.x + 4, c.y + 40, 24, C.white, 800, c.alpha);
        }
      });

      // --- destaques do que a legenda está explicando
      if (cue && cue.focus === 'release') focusBox(-140, G.PRE_Y - 64, 280, 84, t, cue.t0);
      if (cue && cue.focus === 'receptors') focusBox(-326, G.BIND_Y - 34, 652, 92, t, cue.t0);
      if (cue && cue.focus === 'dat') {
        focusBox(-312, G.PRE_Y - 50, 170, 88, t, cue.t0);
        focusBox(142, G.PRE_Y - 50, 170, 88, t, cue.t0);
      }

      // --- rótulos fixos
      sceneLabel('NEURÔNIO DA VTA', 0, -318, 33, C.white, 900);
      sceneLabel('libera dopamina', 0, -280, 24, 'rgba(225,218,255,0.85)', 600);
      sceneLabel('NÚCLEO ACCUMBENS', 0, 236, 33, C.white, 900);
      sceneLabel('recebe o sinal', 0, 274, 24, 'rgba(200,245,240,0.85)', 600);
      // contagem de receptores ativos
      ctx.save();
      ctx.font = `800 25px ${FONT}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      const d2txt = `D2  ${sim.d2Active}/5`;
      const w1 = ctx.measureText('D1  5/5').width, w2 = ctx.measureText(d2txt).width;
      let kx = -(w1 + w2 + 22 * 2 + 12 * 2 + 44) / 2;
      const ky = 322;
      ctx.fillStyle = C.d1; rr(ctx, kx, ky - 11, 22, 22, 5); ctx.fill();
      ctx.fillStyle = C.white; ctx.fillText('D1  5/5', kx + 34, ky + 1);
      kx += 34 + w1 + 44;
      ctx.fillStyle = C.d2; rr(ctx, kx, ky - 11, 22, 22, 5); ctx.fill();
      ctx.fillStyle = sim.d2Active < 5 ? C.accent : C.white; ctx.fillText(d2txt, kx + 34, ky + 1);
      ctx.restore();

      ctx.restore();
    }

    function drawMeter(sim, t, alpha) {
      const m = L.meter;
      const yOf = (v) => m.y + m.h - clamp01(v / G.METER_MAX) * m.h;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `800 ${m.labelSize}px ${FONT}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      ctx.fillStyle = C.text;
      ctx.fillText('DOPAMINA', m.x, m.y - 42); ctx.fillText('NA FENDA', m.x, m.y - 42 + m.labelSize * 1.2);
      rr(ctx, m.x, m.y, m.w, m.h, m.w / 2); ctx.fillStyle = 'rgba(255,255,255,0.09)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 2; ctx.stroke();
      // preenchimento
      const top = yOf(sim.meter);
      ctx.save(); rr(ctx, m.x, m.y, m.w, m.h, m.w / 2); ctx.clip();
      const g = ctx.createLinearGradient(0, m.y + m.h, 0, m.y);
      g.addColorStop(0, '#ff6b3d'); g.addColorStop(0.6, '#ff9a3d'); g.addColorStop(1, '#ffd23d');
      if (sim.meter > G.METER_NORMAL * 1.3) { ctx.shadowColor = C.da; ctx.shadowBlur = 24; }
      ctx.fillStyle = g; ctx.fillRect(m.x, top, m.w, m.y + m.h - top);
      ctx.restore();
      // marcas
      const mark = (v, label, color) => {
        const y = yOf(v);
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
        ctx.beginPath(); ctx.moveTo(m.x - 6, y); ctx.lineTo(m.x + m.w + 10, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `700 ${m.labelSize}px ${FONT}`; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
        ctx.fillText(label, m.x + m.w + 16, y);
      };
      mark(G.METER_NORMAL, 'pico normal', C.white);
      if (t >= 32 && sim.act2Peak > 0) mark(sim.act2Peak, 'pico no ato 2', C.accent);
      ctx.restore();
    }

    function drawProgress(t, alpha) {
      const p = L.progress, acts = T.ACTS.filter((a) => a.n), gap = 12;
      const sw = (p.w - gap * (acts.length - 1)) / acts.length;
      ctx.save(); ctx.globalAlpha = alpha;
      acts.forEach((a, i) => {
        const x = p.x + i * (sw + gap);
        rr(ctx, x, p.y, sw, p.h, p.h / 2); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill();
        const f = clamp01((t - a.t0) / (a.t1 - a.t0));
        if (f > 0) { rr(ctx, x, p.y, Math.max(p.h, sw * f), p.h, p.h / 2); ctx.fillStyle = C.accent; ctx.fill(); }
      });
      const act = T.actAt(t);
      if (act.n) {
        ctx.font = `800 ${L.chip.size}px ${FONT}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        try { ctx.letterSpacing = '3px'; } catch (e) {}
        ctx.fillStyle = C.accent; ctx.fillText(`ATO ${act.n} DE 4`, L.chip.x, L.chip.y);
        const w = ctx.measureText(`ATO ${act.n} DE 4`).width;
        ctx.fillStyle = C.text; ctx.fillText(`·  ${act.label}`, L.chip.x + w + 14, L.chip.y);
      }
      ctx.restore();
    }

    const plain = (s) => s.replace(/[{}\[\]]/g, '');
    function drawCaptions(t) {
      const cue = T.cueAt(t);
      if (!cue) return;
      // a manchete só anima quando o texto muda de fato
      let headStart = cue.t0;
      for (const c of T.CUES) if (c.t1 === headStart && plain(c.head) === plain(cue.head)) headStart = c.t0;
      for (const c of T.CUES) if (c.t1 === headStart && plain(c.head) === plain(cue.head)) headStart = c.t0;
      const ha = ease((t - headStart) / 0.3), hd = (1 - ha) * 26;
      drawRich(ctx, cue.head, L.head.x, L.head.y + hd, { size: L.head.size, lh: L.head.lh, w: L.head.w, alpha: ha });
      const sa = ease((t - cue.t0 - 0.12) / 0.3);
      drawRich(ctx, cue.sub, L.sub.x, L.sub.y + (1 - sa) * 14, { size: L.sub.size, lh: L.sub.lh, w: L.sub.w, weight: 600, color: C.text, alpha: sa });
      if (cue.source) {
        ctx.save();
        ctx.globalAlpha = sa * 0.95; ctx.font = `500 ${L.source.size}px ${FONT}`; ctx.fillStyle = C.muted;
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        ctx.fillText('Fonte: ' + cue.source, L.source.x, L.source.y);
        ctx.restore();
      }
    }

    function drawMonths(sim, t) {
      const a = ease((t - 48.3) / 0.4) * (1 - ease((t - 55.8) / 0.3));
      if (a <= 0) return;
      const txt = String(sim.months).padStart(2, '0');
      ctx.save(); ctx.globalAlpha = a;
      const w = 300, h = 64, x = L.months.x - w, y = L.months.y;
      rr(ctx, x, y, w, h, 32); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.font = `700 22px ${FONT}`; ctx.fillStyle = C.text; ctx.fillText('MESES SEM USO', x + 24, y + h / 2 + 1);
      ctx.font = `900 38px ${FONT}`; ctx.fillStyle = C.accent; ctx.textAlign = 'right'; ctx.fillText(txt, x + w - 24, y + h / 2 + 2);
      ctx.restore();
    }

    function drawHook(t) {
      const out = 1 - ease((t - 3.55) / 0.45);
      if (out <= 0) return;
      ctx.save(); ctx.globalAlpha = 0.74 * out; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, L.W, L.H); ctx.restore();
      const lines = T.HOOK[format] || T.HOOK.v;
      const str = lines.join('\n');
      const size = fitSize(ctx, str, L.hook.w, L.hook.size);
      const lh = size * 1.03;
      const y0 = L.hook.cy - (lines.length * lh) / 2;
      drawRich(ctx, str, L.hook.x, y0, {
        size, lh: 1.03, w: 99999, alpha: out,
        lineAlpha: (i) => ease((t - 0.12 - i * 0.17) / 0.28),
        lineDy: (i) => (1 - ease((t - 0.12 - i * 0.17) / 0.28)) * 40,
      });
    }

    function drawSkipCard(t) {
      const k = T.SKIP_CARD;
      const a = ease((t - k.t0) / 0.35) * (1 - ease((t - (k.t1 - 0.4)) / 0.4));
      if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = 0.95 * a; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, L.W, L.H); ctx.restore();
      const size = fitSize(ctx, k.text, L.card.w, L.card.size);
      const u = t - k.t0;
      // setas de avanço rápido
      ctx.save();
      const n = 5, tw = size * 0.5, total = n * tw * 1.15;
      for (let i = 0; i < n; i++) {
        const on = 0.25 + 0.75 * clamp01(1 - Math.abs(((u * 4.5) % (n + 1)) - i - 0.5));
        ctx.globalAlpha = a * on; ctx.fillStyle = C.accent;
        const x = L.card.cx - total / 2 + i * tw * 1.15, y = L.card.cy - size * 1.15;
        ctx.beginPath(); ctx.moveTo(x, y - tw * 0.45); ctx.lineTo(x + tw * 0.8, y); ctx.lineTo(x, y + tw * 0.45); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      drawRich(ctx, k.text, L.card.cx, L.card.cy - size * 0.5, { size, w: 99999, align: 'center', alpha: a });
      drawRich(ctx, 'mesma sinapse, mesmo cérebro', L.card.cx, L.card.cy + size * 0.85, { size: size * 0.4, w: 99999, align: 'center', alpha: a * 0.9, weight: 600, color: C.muted });
    }

    function drawEnd(t) {
      const e = L.end, a = ease((t - 56) / 0.6);
      if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = 0.9 * a; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, L.W, L.H); ctx.restore();
      const str = T.END.lines.join('\n');
      const size = fitSize(ctx, str, e.w, e.size);
      const hgt = drawRich(ctx, str, e.cx, e.top, {
        size, lh: 1.06, w: 99999, align: 'center',
        lineAlpha: (i) => ease((t - 56.2 - i * 0.16) / 0.3),
        lineDy: (i) => (1 - ease((t - 56.2 - i * 0.16) / 0.3)) * 30,
      });
      const b = ease((t - 57.1) / 0.45);
      let y = e.top + hgt + size * 0.7;
      if (assets && assets.logo) {
        ctx.save(); ctx.globalAlpha = b;
        rr(ctx, e.cx - e.tile / 2, y, e.tile, e.tile, e.tile * 0.22); ctx.clip();
        ctx.drawImage(assets.logo, e.cx - e.tile / 2, y, e.tile, e.tile);
        ctx.restore();
        y += e.tile + 34;
      }
      ctx.save(); ctx.globalAlpha = b; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      try { ctx.letterSpacing = '4px'; } catch (err) {}
      ctx.font = `900 ${Math.round(size * 0.46)}px ${FONT}`; ctx.fillStyle = C.white; ctx.fillText(T.END.brand, e.cx, y);
      try { ctx.letterSpacing = '0px'; } catch (err) {}
      ctx.font = `700 ${Math.round(size * 0.4)}px ${FONT}`; ctx.fillStyle = C.accent; ctx.fillText(T.END.handle, e.cx, y + size * 0.66);
      ctx.font = `500 24px ${FONT}`; ctx.fillStyle = C.muted; ctx.fillText(T.END.disclaimer, e.cx, e.disclaimerY);
      ctx.restore();
    }

    function render(sim) {
      const t = sim.t;
      const cue = T.cueAt(t);
      background(t);
      drawScene(sim, t, cue);
      const ui = ease((t - 3.8) / 0.5) * (1 - ease((t - 56) / 0.4));
      if (ui > 0) {
        drawMeter(sim, t, ui);
        drawProgress(t, ui);
        drawCaptions(t);
        drawMonths(sim, t);
      }
      drawSkipCard(t);
      drawHook(t);
      drawEnd(t);
    }

    return { render, layout: L };
  }

  DV.LAYOUTS = LAYOUTS;
  DV.createRenderer = createRenderer;
})(typeof globalThis !== 'undefined' ? globalThis : this);
