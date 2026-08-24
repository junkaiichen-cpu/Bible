(() => {
  'use strict';

  const C = document.querySelector('#game');
  if (!C) return;
  const X = C.getContext('2d');
  X.imageSmoothingEnabled = false;

  window.W = 960;
  window.H = 540;
  window.G = 438;
  window.Q = window.Q || Object.create(null);
  window.cl = (v, a, b) => Math.max(a, Math.min(b, v));
  window.hb = (x, y, w, h) => ({ x, y, w, h });
  window.ov = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  window.$ = (id) => document.getElementById(id);

  window.K = {
    david: { hp: 100, sp: 5, jp: 11.6, pw: 1, sk: ['投石索', '疾奔'], ds: '牧羊跃步', ul: '五块石头', c: '#c7ad71' },
    moses: { hp: 116, sp: 4, jp: 10.6, pw: 1.03, sk: ['杖击', '分海'], ds: '带领前行', ul: '红海', c: '#91a6b1' },
    samson: { hp: 132, sp: 3.7, jp: 10, pw: 1.18, sk: ['驴腮骨', '撕裂'], ds: '巨力冲锋', ul: '推柱', c: '#a68561' },
    daniel: { hp: 108, sp: 4.2, jp: 11, pw: .98, sk: ['祷告', '狮坑'], ds: '退入狮坑', ul: '封住狮口', c: '#8fa0b9' },
    elijah: { hp: 100, sp: 4.5, jp: 11.2, pw: 1.05, sk: ['火焰', '迦密山'], ds: '先知步', ul: '从天降火', c: '#be7650' },
    paul: { hp: 102, sp: 5.1, jp: 11.7, pw: .98, sk: ['书信', '宣讲'], ds: '宣教奔行', ul: '宣教旅程', c: '#859879' }
  };

  window.S = {
    pick: { p1: null, p2: null, sc1: 'fire', sc2: 'water', h1: 'michael', h2: 'elijah' },
    run: 0, over: 0, r: 1, score: [0, 0], cnt: 0,
    fx: [], shots: [], txt: [], rings: [], shake: 0, used: { p1: 0, p2: 0 },
    paused: false, time: 0
  };
  window.A = null;
  window.B = null;

  const say = (t) => {
    const e = $('centerMessage');
    if (!e) return;
    e.textContent = t;
    e.classList.remove('show');
    void e.offsetWidth;
    e.classList.add('show');
  };
  window.say = say;
  window.txt = (x, y, t, k = 'n') => S.txt.push({ x, y, t, l: 42, k });
  window.burst = (x, y, n, c, p = 3) => { for (let i = 0; i < n; i++) S.fx.push({ x, y, vx: (Math.random() - .5) * p, vy: (Math.random() - .9) * p, l: 18 + Math.random() * 24, c }); };
  window.ring = (x, y, r, c = '#cdbb91') => S.rings.push({ x, y, r, l: 18, c });
  window.opp = (f) => f.slot === 'p1' ? B : A;

  function mk(slot, id, x, f, scroll, helper) {
    const k = K[id] || K.david;
    return {
      slot, id, x, y: G - 68, w: 42, h: 68, f,
      hp: k.hp, max: k.hp, sp: k.sp, jp: k.jp, pw: k.pw,
      skill: k.sk, dash: k.ds, ult: k.ul, color: k.c,
      cd1: 0, cd2: 0, cdS: 0, cdD: 0, u: 0, sub: 2,
      inv: 0, st: 0, lock: 0, step: 0, last: 0, combo: 0, ct: 0,
      atk: 0, on: 1, vx: 0, vy: 0, scroll, scrollCd: 0, armor: 0,
      helper, helperUsed: S.used[slot] || 0, skillCtx: null, skillBusy: 0,
      attackCtx: null, bufferedAttack: 0, subLock: 0, protect: 0,
      juggleCount: 0, juggleGrace: 0, airborneTime: 0
    };
  }

  window.clean = () => { S.fx = []; S.shots = []; S.txt = []; S.rings = []; S.shake = 0; };

  window.refreshSelect = () => {
    for (const [gid, slot] of [['p1Grid', 'p1'], ['p2Grid', 'p2']]) {
      const g = $(gid);
      if (!g || !window.BIBLE_ROSTER) continue;
      g.innerHTML = '';
      Object.values(window.BIBLE_ROSTER).forEach((c) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `char-card ${S.pick[slot] === c.id ? 'selected' : ''}`;
        b.innerHTML = `<div class="avatar ${c.id}">${c.name[0]}</div><div class="char-main"><strong>${c.name}</strong><span>${c.role}</span><small>${c.anchor}</small></div><i>${S.pick[slot] === c.id ? 'READY' : '选择'}</i>`;
        b.onclick = () => {
          S.pick[slot] = c.id;
          window.refreshSelect();
          const startBtn = $('startBtn');
          if (startBtn) startBtn.disabled = !(S.pick.p1 && S.pick.p2);
          window.BIBLE_FIGHTER_SELECTION_READY = !!(document.querySelector('#p1Grid .char-card') && document.querySelector('#p2Grid .char-card'));
        };
        g.appendChild(b);
      });
      const label = $(`${slot}Label`);
      if (label) label.textContent = S.pick[slot] ? window.BIBLE_ROSTER[S.pick[slot]].name : '未选择';
    }
    const pairs = [['p1Scroll', 'sc1'], ['p2Scroll', 'sc2'], ['p1Helper', 'h1'], ['p2Helper', 'h2']];
    pairs.forEach(([id, key]) => {
      const e = $(id);
      if (!e || !window.BIBLE_SUPPORTS) return;
      const src = key[0] === 's' ? window.BIBLE_SUPPORTS.scrolls : window.BIBLE_SUPPORTS.helpers;
      e.innerHTML = '';
      Object.entries(src || {}).forEach(([v, c]) => {
        const o = document.createElement('option');
        o.value = v;
        o.textContent = c.name;
        e.appendChild(o);
      });
      if (S.pick[key]) e.value = S.pick[key];
    });
    const startBtn = $('startBtn');
    if (startBtn) startBtn.disabled = !(S.pick.p1 && S.pick.p2);
    window.BIBLE_FIGHTER_SELECTION_READY = !!(
      document.querySelector('#p1Grid .char-card') &&
      document.querySelector('#p2Grid .char-card') &&
      document.querySelectorAll('#p1Scroll option').length &&
      document.querySelectorAll('#p1Helper option').length
    );
    return window.BIBLE_FIGHTER_SELECTION_READY;
  };

  window.roundInit = () => {
    clean(); S.over = 0; S.run = 0; S.cnt = 3;
    A = window.A = mk('p1', S.pick.p1, 205, 1, S.pick.sc1, S.pick.h1);
    B = window.B = mk('p2', S.pick.p2, 713, -1, S.pick.sc2, S.pick.h2);
    $('result')?.classList.add('hidden');
    say(`${S.r} · 3`);
    let n = 3;
    const tick = () => { n -= 1; S.cnt = n; if (n) say(String(n)); else { say('FIGHT!'); S.run = 1; } if (n > 0) setTimeout(tick, 620); };
    setTimeout(tick, 620);
  };

  window.start = () => {
    if (!S.pick.p1 || !S.pick.p2) return false;
    S.r = 1; S.score = [0, 0]; S.used = { p1: 0, p2: 0 };
    S.pick.sc1 = $('p1Scroll')?.value || S.pick.sc1;
    S.pick.sc2 = $('p2Scroll')?.value || S.pick.sc2;
    S.pick.h1 = $('p1Helper')?.value || S.pick.h1;
    S.pick.h2 = $('p2Helper')?.value || S.pick.h2;
    $('selectScreen')?.classList.add('hidden');
    $('battleScreen')?.classList.remove('hidden');
    roundInit();
    meta();
    return true;
  };
  window.back = () => { S.run = 0; $('battleScreen')?.classList.add('hidden'); $('selectScreen')?.classList.remove('hidden'); $('result')?.classList.add('hidden'); refreshSelect(); };
  window.rematch = () => { S.r = 1; S.score = [0, 0]; S.used = { p1: 0, p2: 0 }; roundInit(); };

  window.act = (slot, a) => {
    const f = slot === 'p1' ? A : B;
    if (!f) return;
    const map = { a: attack, s1: skill1, s2: skill2, d: dash, r: sub, u: ult, c: scroll, h: helper };
    map[a]?.(f);
  };

  window.attack = (f) => {
    if (!S.run || !f || f.st > 0 || f.lock > 0) return;
    const now = performance.now();
    if (now - f.last > 620) f.step = 0;
    f.last = now; f.step = (f.step % 5) + 1;
    f.lock = 12; f.atk = 18;
    const n = f.step;
    setTimeout(() => {
      if (!S.run || f.st > 0) return;
      const e = opp(f); const r = n >= 4 ? 72 : 56;
      const b = hb(f.f > 0 ? f.x + f.w - 2 : f.x - r + 2, f.y + 8, r, 58);
      if (e && ov(b, hb(e.x, e.y, e.w, e.h))) hit(f, e, [0, 6, 7, 9, 11, 14][n] * f.pw, n === 5 ? 16 : 8, n === 5 ? 15 : 7, n === 5 ? '重击' : '普攻');
    }, 46);
  };

  function skill1(f) {
    if (!S.run || f.st > 0 || f.cd1 > 0) return;
    f.cd1 = 32; const e = opp(f); const c = { x: f.x + 21, y: f.y + 30 };
    txt(c.x, c.y - 18, f.skill[0], 'skill');
    switch (f.id) {
      case 'david': shot(f, 16, 'davidStone', 24); break;
      case 'moses': melee(f, e, 17, 96, '杖击'); break;
      case 'samson': melee(f, e, 22, 116, '驴腮骨'); break;
      case 'daniel': f.inv = 20; ring(c.x, c.y, 34, '#b9c9df'); break;
      case 'elijah': shot(f, 9, 'fire', 28); break;
      case 'paul': shot(f, 13, 'letter', 20); break;
    }
  }
  function skill2(f) {
    if (!S.run || f.st > 0 || f.cd2 > 0) return;
    f.cd2 = 54; const e = opp(f); const c = { x: f.x + 21, y: f.y + 30 };
    txt(c.x, c.y - 18, f.skill[1], 'skill');
    switch (f.id) {
      case 'david': f.vx = f.f * 15; f.inv = 18; setTimeout(() => { if (S.run) melee(f, opp(f), 15, 110, '疾奔'); }, 80); break;
      case 'moses': f.vx = f.f * 5; f.inv = 10; if (e && ov(hb(f.f > 0 ? f.x + 20 : f.x - 115, f.y - 18, 115, 96), hb(e.x, e.y, e.w, e.h))) hit(f, e, 22 * f.pw, 20, 16, '分海'); break;
      case 'samson': f.vx = f.f * 16; f.inv = 20; setTimeout(() => { if (S.run) melee(f, opp(f), 28, 125, '撕裂'); }, 90); break;
      case 'daniel': f.inv = 36; f.vx = -f.f * 5; ring(c.x, c.y, 46, '#cbd9eb'); break;
      case 'elijah': f.inv = 8; if (e && ov(hb(f.f > 0 ? f.x + 25 : f.x - 120, f.y - 30, 120, 110), hb(e.x, e.y, e.w, e.h))) hit(f, e, 25, 22, 20, '迦密山'); break;
      case 'paul': f.vx = f.f * 12; shot(f, 14, 'letter', 17); setTimeout(() => { if (S.run) melee(f, opp(f), 13, 76, '宣讲'); }, 120); break;
    }
  }
  window.skill1 = skill1;
  window.skill2 = skill2;

  function melee(f, e, d, r, label) { if (!e) return; const b = hb(f.f > 0 ? f.x + 24 : f.x - r, f.y - 12, r, 92); if (ov(b, hb(e.x, e.y, e.w, e.h))) hit(f, e, d * f.pw, 17, 13, label); burst(f.x + 21 + f.f * 45, f.y + 25, 12, f.color, 3); }
  function shot(f, v, kind, d) { S.shots.push({ o: f, x: f.x + 21 + f.f * 22, y: f.y + 28, v: f.f * v, l: 58, k: kind, d }); }
  function dash(f) { if (!S.run || f.st > 0 || f.cdD > 0) return; f.cdD = 58; f.inv = 16; f.vx = f.f * 13; txt(f.x, f.y - 14, f.dash, 'skill'); setTimeout(() => { if (S.run) melee(f, opp(f), 12, 98, '冲锋'); }, 42); }
  window.dash = dash;
  function sub(f) { if (!S.run || f.sub <= 0) return; f.sub -= 1; f.inv = 46; const ox = f.x; f.x = cl(f.x - f.f * 132, 40, W - f.w - 40); burst(ox + 21, f.y + 34, 15, '#c5b697', 3); ring(f.x + 21, f.y + 34, 28); txt(f.x, f.y - 14, '替身', 'skill'); }
  window.sub = sub;
  function scroll(f) { if (!S.run || f.st > 0 || f.scrollCd > 0 || !BIBLE_SUPPORTS?.scrolls?.[f.scroll]) return; const s = BIBLE_SUPPORTS.scrolls[f.scroll]; f.scrollCd = s.cd; f.armor = 36; txt(f.x + 21, f.y - 20, s.name, 'support'); burst(f.x + 21, f.y + 34, 18, s.color, 4); ring(f.x + f.f * 55, f.y + 28, 44, s.color); }
  window.scroll = scroll;
  function helper(f) { if (!S.run || f.helperUsed || !BIBLE_SUPPORTS?.helpers?.[f.helper]) return; f.helperUsed = 1; S.used[f.slot] = 1; const h = BIBLE_SUPPORTS.helpers[f.helper]; txt(f.x + 21, f.y - 35, h.name, 'support'); burst(f.x + 21, f.y + 24, 15, h.color, 4); }
  window.helper = helper;
  function ult(f) { if (!S.run || f.st > 0 || f.u < 100) return; f.u = 0; say(f.ult); S.shake = 15; const e = opp(f); setTimeout(() => { if (S.run && e) hit(f, e, ({ david: 60, moses: 62, samson: 68, daniel: 56, elijah: 64, paul: 58 }[f.id] || 55) * f.pw, 28, 26, '奥义'); }, 300); }
  window.ult = ult;

  window.hit = (f, e, d, st, kn, label) => {
    if (!S.run || !e || e.inv || e.armor > 0) return;
    e.hp = cl(e.hp - d, 0, e.max); e.st = st; e.vx += f.f * kn; e.vy = -2.4;
    f.u = cl(f.u + (d > 25 ? 11 : 4), 0, 100); f.combo += 1; f.ct = 52; e.combo = 0; e.ct = 0;
    S.shake = Math.max(S.shake, d > 25 ? 10 : 4); txt(e.x + 21, e.y - 12, '-' + Math.ceil(d), 'dmg'); txt(e.x + 21, e.y + 82, label, 'skill');
    burst(e.x + 21, e.y + 32, d > 25 ? 20 : 8, d > 25 ? '#f5d37f' : f.color, 3.5);
    if (e.hp <= 0) win(f);
  };

  function win(f) {
    if (S.over) return; S.over = 1; S.run = 0; const i = f.slot === 'p1' ? 0 : 1; S.score[i] += 1; say(`${f.slot === 'p1' ? 'P1' : 'P2'} WIN`);
    if (S.score[i] >= 2) { const title = $('resultTitle'); const copy = $('resultCopy'); if (title) title.textContent = `${f.slot === 'p1' ? 'P1' : 'P2'} 胜利 · ${window.BIBLE_ROSTER?.[f.id]?.name || f.id}`; if (copy) copy.textContent = `Best of 3 · ${S.score[0]}-${S.score[1]}`; $('result')?.classList.remove('hidden'); }
    else { S.r += 1; setTimeout(roundInit, 900); }
  }

  window.update = (f, dt) => {
    if (!f) return;
    f.inv = Math.max(0, f.inv - dt); f.st = Math.max(0, f.st - dt); f.lock = Math.max(0, f.lock - dt); f.cd1 = Math.max(0, f.cd1 - dt); f.cd2 = Math.max(0, f.cd2 - dt); f.cdS = Math.max(0, f.cdS - dt); f.cdD = Math.max(0, f.cdD - dt); f.scrollCd = Math.max(0, f.scrollCd - dt); f.armor = Math.max(0, f.armor - dt); f.ct = Math.max(0, f.ct - 1); f.atk = Math.max(0, f.atk - 1); f.subLock = Math.max(0, f.subLock - dt); f.juggleGrace = Math.max(0, f.juggleGrace - dt); f.protect = Math.max(0, f.protect - dt);
    if (f.ct <= 0) f.combo = 0;
    if (f.st <= 0) {
      const left = Q[f.slot === 'p1' ? 'a' : 'arrowleft']; const right = Q[f.slot === 'p1' ? 'd' : 'arrowright'];
      if (left && !right) f.vx = -f.sp; else if (right && !left) f.vx = f.sp; else f.vx *= .74;
      if (Math.abs(f.vx) > .1) f.f = Math.sign(f.vx);
      const jump = f.slot === 'p1' ? 'w' : 'arrowup';
      if (Q[jump] && f.on) { f.vy = -f.jp; f.on = 0; Q[jump] = 0; }
    } else f.vx *= .78;
    f.vy += .58 * dt; f.x += f.vx * dt; f.y += f.vy * dt;
    if (f.y + f.h >= G) { f.y = G - f.h; f.vy = 0; f.on = 1; f.airborneTime = 0; } else { f.on = 0; f.airborneTime += dt; }
    f.x = cl(f.x, 24, W - f.w - 24); f.u = cl(f.u + .028 * dt, 0, 100);
  };

  function shots(dt) { for (const q of S.shots) { q.x += q.v * dt; q.y += (q.vy || 0) * dt; q.l -= dt; const t = q.o?.slot === 'p1' ? B : A; if (q.l > 0 && t && ov(hb(q.x - 9, q.y - 9, 18, 18), hb(t.x, t.y, t.w, t.h))) { hit(q.o, t, (q.d || 20) * q.o.pw, 14, 11, '精准'); q.l = 0; } } S.shots = S.shots.filter(q => q.l > 0 && q.x > -50 && q.x < W + 50); }
  function fx() { for (const p of S.fx) { p.x += p.vx; p.y += p.vy; p.vy += .09; p.l -= 1; } S.fx = S.fx.filter(p => p.l > 0); for (const t of S.txt) { t.y -= .55; t.l -= 1; } S.txt = S.txt.filter(t => t.l > 0); for (const r of S.rings) { r.r += 2.5; r.l -= 1; } S.rings = S.rings.filter(r => r.l > 0); }
  window.hud = () => {
    if (!A || !B) return;
    const ra = window.BIBLE_ROSTER?.[A.id]; const rb = window.BIBLE_ROSTER?.[B.id];
    $('p1Name') && ($('p1Name').textContent = `P1 · ${ra?.name || A.id}`); $('p2Name') && ($('p2Name').textContent = `P2 · ${rb?.name || B.id}`);
    $('p1HpText') && ($('p1HpText').textContent = `${Math.ceil(A.hp)} / ${A.max}`); $('p2HpText') && ($('p2HpText').textContent = `${Math.ceil(B.hp)} / ${B.max}`);
    $('p1HpBar') && ($('p1HpBar').style.width = `${A.hp / A.max * 100}%`); $('p2HpBar') && ($('p2HpBar').style.width = `${B.hp / B.max * 100}%`);
    $('p1UltBar') && ($('p1UltBar').style.width = `${A.u}%`); $('p2UltBar') && ($('p2UltBar').style.width = `${B.u}%`);
    $('p1Combo')?.classList.toggle('show', A.combo > 1); $('p2Combo')?.classList.toggle('show', B.combo > 1);
    document.querySelector('.round-info b')?.replaceChildren(document.createTextNode(S.cnt ? `准备 · ${S.cnt}` : `第 ${S.r} 回合`));
  };
  function meta() {
    const a = window.BIBLE_ROSTER?.[A?.id]; const b = window.BIBLE_ROSTER?.[B?.id];
    const title = $('fightLoreTitle'); const lore = $('fightLore');
    if (!title || !lore || !a || !b) return;
    title.textContent = `${a.name} vs ${b.name}`;
    lore.innerHTML = `<div><b>${a.name}</b><span>${a.role}</span><small>${a.facts.join(' · ')}</small><em>${a.anchor}</em></div><div><b>${b.name}</b><span>${b.role}</span><small>${b.facts.join(' · ')}</small><em>${b.anchor}</em></div>`;
  }
  window.meta = meta;

  window.arena = () => { const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#171c25'); g.addColorStop(.6, '#727b7e'); g.addColorStop(1, '#2f271f'); X.fillStyle = g; X.fillRect(0, 0, W, H); X.fillStyle = '#b7ab94'; X.globalAlpha = .2; for (let i = 0; i < 7; i++) { X.beginPath(); X.moveTo(i * 170, G); X.lineTo(i * 170 + 75, 310 + Math.sin(i) * 25); X.lineTo(i * 170 + 150, G); X.fill(); } X.globalAlpha = 1; X.fillStyle = '#4d3927'; X.fillRect(0, G, W, H - G); X.fillStyle = '#735739'; X.fillRect(0, G, W, 6); };
  window.draw = (f) => { if (!f) return; if (f.inv > 0 && Math.floor(f.inv / 3) % 2 === 0) return; X.save(); X.translate(f.x + 21, f.y + 68); X.scale(f.f, 1); X.fillStyle = '#0007'; X.beginPath(); X.ellipse(0, 2, 29, 7, 0, 0, Math.PI * 2); X.fill(); X.fillStyle = f.color; X.fillRect(-18, -58, 36, 50); X.fillStyle = '#c9a477'; X.fillRect(-13, -81, 26, 23); X.fillStyle = '#40342a'; X.fillRect(-16, -87, 32, 10); if (f.id === 'moses') { X.fillStyle = '#8d7250'; X.fillRect(-18, -64, 6, 42); } if (f.id === 'samson') { X.fillStyle = '#2d231c'; X.fillRect(-25, -88, 50, 20); } if (f.atk > 0) { X.fillStyle = '#f2d69d'; X.fillRect(16, -53, 30, 4); } if (f.armor > 0) { X.strokeStyle = '#fff0ad'; X.lineWidth = 3; X.beginPath(); X.arc(0, -37, 38, 0, Math.PI * 2); X.stroke(); } X.restore(); };
  window.drawFx = () => { for (const q of S.shots) { X.fillStyle = q.k?.includes('fire') ? '#e28e4e' : '#e5d0a2'; X.beginPath(); X.arc(q.x, q.y, 6, 0, Math.PI * 2); X.fill(); X.strokeStyle = '#e2c17c'; X.beginPath(); X.moveTo(q.x - 18, q.y); X.lineTo(q.x + 18, q.y); X.stroke(); } for (const r of S.rings) { X.globalAlpha = r.l / 18; X.strokeStyle = r.c; X.beginPath(); X.arc(r.x, r.y, r.r, 0, Math.PI * 2); X.stroke(); } X.globalAlpha = 1; for (const p of S.fx) { X.fillStyle = p.c; X.fillRect(p.x, p.y, 3, 3); } for (const t of S.txt) { X.fillStyle = t.k === 'dmg' ? '#ffe4a0' : '#f4ddb0'; X.fillText(t.t, t.x, t.y); } };

  const bind = () => {
    $('startBtn')?.addEventListener('click', window.start);
    $('rematchBtn')?.addEventListener('click', window.rematch);
    $('changeBtn')?.addEventListener('click', window.back);
    $('aboutBtn')?.addEventListener('click', () => $('aboutDialog')?.showModal());
    $('closeAbout')?.addEventListener('click', () => $('aboutDialog')?.close());
    ['p1Scroll', 'p2Scroll', 'p1Helper', 'p2Helper'].forEach((id) => $(id)?.addEventListener('change', () => {
      const key = id.startsWith('p1') ? (id.includes('Scroll') ? 'sc1' : 'h1') : (id.includes('Scroll') ? 'sc2' : 'h2');
      S.pick[key] = $(id).value;
    }));
    refreshSelect();
  };

  function loop() {
    if (A && B && !S.paused) { update(A, 1); update(B, 1); if (S.run) shots(1); fx(); hud(); }
    X.save(); if (S.shake) { X.translate((Math.random() - .5) * S.shake, (Math.random() - .5) * S.shake); S.shake--; }
    arena(); draw(A); draw(B); drawFx(); X.restore(); S.time += 1; requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true }); else bind();
  loop();
})();
