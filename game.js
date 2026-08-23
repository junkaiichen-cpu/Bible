const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const W = canvas.width, H = canvas.height, GROUND = 438;
const keys = Object.create(null);
const state = {
  over: false, win: false, shake: 0, slow: 0, combo: 0, comboTimer: 0,
  particles: [], projectiles: [], texts: [], rings: [], timers: [],
};

const p = {
  x: 220, y: 370, w: 42, h: 68, vx: 0, vy: 0, face: 1, onGround: true,
  hp: 100, max: 100, attackTimer: 0, attackStep: 0, attackLock: 0,
  cdSling: 0, cdDash: 0, ult: 0, sub: 2, inv: 0, hitFlash: 0,
};
const e = {
  x: 742, y: 320, w: 86, h: 118, vx: 0, vy: 0, face: -1, onGround: true,
  hp: 180, max: 180, stun: 0, hit: 0, attackCd: 65, attackTimer: 0, hitFlash: 0,
};

const ACTION_KEYS = new Set(['j','k','l','i','o','w','a','d',' ']);
addEventListener('keydown', (ev) => {
  const k = ev.key.toLowerCase();
  if (ACTION_KEYS.has(k)) ev.preventDefault();
  keys[k] = true;
  if (ev.repeat || state.over) return;
  if (k === 'j') attack();
  if (k === 'k') sling();
  if (k === 'l') dash();
  if (k === 'i') substitute();
  if (k === 'o') ultimate();
});
addEventListener('keyup', (ev) => { keys[ev.key.toLowerCase()] = false; });

const mobileButtons = document.querySelectorAll('[data-key]');
mobileButtons.forEach(btn => {
  const k = btn.dataset.key;
  const down = (ev) => { ev.preventDefault(); keys[k] = true; btn.classList.add('pressed'); };
  const up = (ev) => { ev.preventDefault(); keys[k] = false; btn.classList.remove('pressed'); };
  btn.addEventListener('pointerdown', down);
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
  btn.addEventListener('pointerleave', up);
});
document.querySelectorAll('[data-action]').forEach(btn => {
  btn.addEventListener('pointerdown', ev => {
    ev.preventDefault(); btn.classList.add('pressed');
    const action = btn.dataset.action;
    if (action === 'attack') attack();
    if (action === 'sling') sling();
    if (action === 'dash') dash();
    if (action === 'substitute') substitute();
    if (action === 'ultimate') ultimate();
  });
  ['pointerup','pointercancel','pointerleave'].forEach(type => btn.addEventListener(type, () => btn.classList.remove('pressed')));
});

function hitbox(x,y,w,h){ return {x,y,w,h}; }
function overlap(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function center(o){ return {x:o.x+o.w/2,y:o.y+o.h/2}; }
function pop(x,y,t,kind='normal'){ state.texts.push({x,y,t,life:40,kind}); }
function burst(x,y,count=10,color='#d6b36e',power=3){ for(let i=0;i<count;i++) state.particles.push({x,y,vx:(Math.random()-.5)*power,vy:(Math.random()-.8)*power,life:20+Math.random()*25,c:color,s:2+Math.random()*3}); }
function ring(x,y,r,color='#e7c47e'){ state.rings.push({x,y,r,life:18,max:18,c:color}); }
function flash(){ const f=document.getElementById('flash'); f.animate([{opacity:.72},{opacity:0}],{duration:320,easing:'ease-out'}); }
function message(text){ const el=document.getElementById('centerMessage'); el.textContent=text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }
function addUlt(v){ p.ult = clamp(p.ult+v,0,100); }
function setTimer(fn,ms){ state.timers.push(setTimeout(fn,ms)); }

function attack(){
  if (state.over || p.attackLock > 0) return;
  const now = performance.now();
  if (!p._lastAttack || now - p._lastAttack > 620) p.attackStep = 0;
  p._lastAttack = now;
  p.attackStep = (p.attackStep % 5) + 1;
  p.attackTimer = 22;
  p.attackLock = 16;
  const step = p.attackStep;
  setTimer(() => {
    if (state.over) return;
    const reach = step >= 4 ? 70 : 55;
    const box = hitbox(p.x + (p.face > 0 ? p.w-4 : -reach+4), p.y+12, reach, 54);
    if (overlap(box, hitbox(e.x,e.y,e.w,e.h))) {
      const dmg = [0,7,8,10,12,15][step];
      strikeEnemy(dmg, step >= 4 ? 12 : 7, step === 5 ? 14 : 7, '普攻');
    }
  }, 75);
}

function sling(){
  if(state.over || p.cdSling > 0) return;
  p.cdSling = 44;
  state.projectiles.push({x:p.x+p.w/2+p.face*22,y:p.y+28,vx:p.face*14,life:65,spin:0});
  pop(p.x+p.w/2,p.y-18,'投石索','skill');
}
function dash(){
  if(state.over || p.cdDash > 0) return;
  p.cdDash = 62;
  p.vx = p.face*13;
  p.inv = 15;
  ring(p.x+p.w/2,p.y+p.h/2,22,'#c6a968');
  burst(p.x+p.w/2,p.y+p.h-4,8,'#d6b36e',2.2);
  pop(p.x,p.y-16,'奔跑突进','skill');
}
function substitute(){
  if(state.over || p.sub <= 0) return;
  p.sub--; p.inv=44;
  const direction = p.face;
  p.x = clamp(p.x - direction*125, 60, W-p.w-60);
  burst(p.x+p.w/2,p.y+p.h/2,14,'#c3b18e',3);
  ring(p.x+p.w/2,p.y+p.h/2,28,'#e0c992');
  pop(p.x,p.y-16,'替身','skill');
}
function ultimate(){
  if(state.over || p.ult < 100) return;
  p.ult = 0; state.shake=16; state.slow=35; flash(); message('五块石头');
  const target = center(e);
  burst(p.x+p.w/2,p.y+25,22,'#f1d082',4);
  setTimer(()=>{ if(state.over)return; state.slow=18; burst(target.x,target.y,34,'#fff0bd',6); ring(target.x,target.y,54,'#f5d47e'); strikeEnemy(58, 58, 30, '奥义'); },420);
}
function strikeEnemy(dmg, stun=8, knock=7, label='命中'){
  if(state.over) return;
  e.hp=clamp(e.hp-dmg,0,e.max); e.stun=Math.max(e.stun,stun); e.hit=Math.max(e.hit,8); e.hitFlash=8;
  e.vx += p.face*knock; e.vy -= 2.1;
  state.shake=Math.max(state.shake, dmg>25?8:4);
  addUlt(dmg>25?10:4);
  state.combo += 1; state.comboTimer=48;
  pop(e.x+e.w/2,e.y-14,`-${dmg}`,'damage');
  if(label) pop(e.x+e.w/2,e.y+e.h+4,label,'skill');
  burst(e.x+e.w/2,e.y+e.h/2,dmg>25?18:8,dmg>25?'#f4d27e':'#d7bd88',3.5);
  if(e.hp<=0) finish(true);
}
function hurt(dmg){
  if(p.inv>0 || state.over) return;
  p.hp=clamp(p.hp-dmg,0,p.max); p.inv=22; state.shake=6; p.hitFlash=8;
  state.combo=0; burst(p.x+p.w/2,p.y+p.h/2,10,'#9e6252',2.5); pop(p.x+p.w/2,p.y-12,`-${dmg}`,'enemy');
  if(p.hp<=0) finish(false);
}

function finish(win){
  state.over=true; state.win=win;
  message(win?'巨人倒下了':'你倒在以拉谷');
  document.getElementById('resultTitle').textContent=win?'巨人倒下了':'倒在以拉谷';
  document.getElementById('resultCopy').textContent=win
    ?'你刚刚通过动作机制经历了《撒母耳记上》第17章的核心冲突。下一阶段可以继续解锁大卫的故事线。'
    :'大卫不是无敌英雄。重新挑战，练习投石索的距离、冲锋的无敌与替身的时机。';
  setTimer(()=>document.getElementById('result').classList.remove('hidden'),420);
}

function reset(){
  state.over=false; state.win=false; state.shake=0; state.slow=0; state.combo=0; state.comboTimer=0; state.projectiles=[]; state.particles=[]; state.texts=[]; state.rings=[];
  state.timers.forEach(clearTimeout); state.timers=[];
  Object.assign(p,{x:220,y:370,w:42,h:68,vx:0,vy:0,face:1,onGround:true,hp:100,attackTimer:0,attackStep:0,attackLock:0,cdSling:0,cdDash:0,ult:0,sub:2,inv:0,hitFlash:0,_lastAttack:0});
  Object.assign(e,{x:742,y:320,w:86,h:118,vx:0,vy:0,face:-1,onGround:true,hp:180,stun:0,hit:0,attackCd:65,attackTimer:0,hitFlash:0});
  document.getElementById('result').classList.add('hidden');
  updateHud();
}

document.getElementById('restartBtn').onclick=reset;
document.getElementById('storyBtn').onclick=()=>document.getElementById('storyDialog').showModal();
document.getElementById('closeDialog').onclick=()=>document.getElementById('storyDialog').close();
document.getElementById('verseBtn').onclick=()=>document.getElementById('storyDialog').showModal();

function update(){
  const timeScale = state.slow>0 ? .45 : 1;
  if(!state.over){
    p.inv=Math.max(0,p.inv-1*timeScale); p.attackTimer=Math.max(0,p.attackTimer-1*timeScale); p.attackLock=Math.max(0,p.attackLock-1*timeScale); p.cdSling=Math.max(0,p.cdSling-1*timeScale); p.cdDash=Math.max(0,p.cdDash-1*timeScale); p.hitFlash=Math.max(0,p.hitFlash-1); state.slow=Math.max(0,state.slow-1);
    const movingLeft=keys.a, movingRight=keys.d;
    if(movingLeft && !movingRight) p.vx=-4.6;
    else if(movingRight && !movingLeft) p.vx=4.6;
    else p.vx*=.74;
    if(Math.abs(p.vx)>.1) p.face=Math.sign(p.vx);
    if(keys.w&&p.onGround){p.vy=-11.2;p.onGround=false;keys.w=false;}
    p.vy+=.58; p.x+=p.vx*timeScale; p.y+=p.vy*timeScale;
    if(p.y+p.h>=GROUND){p.y=GROUND-p.h;p.vy=0;p.onGround=true;}
    p.x=clamp(p.x,28,W-p.w-28);
    addUlt(.035);

    updateEnemy(timeScale);
    updateProjectiles(timeScale);
    updateFx();
  }
  updateHud();
}

function updateEnemy(scale){
  e.stun=Math.max(0,e.stun-1*scale); e.hit=Math.max(0,e.hit-1); e.hitFlash=Math.max(0,e.hitFlash-1); e.attackCd-=1*scale;
  if(!e.stun){
    const dist=(p.x+p.w/2)-(e.x+e.w/2); const abs=Math.abs(dist);
    if(abs>145) e.vx=Math.sign(dist)*1.35;
    else if(abs>100) e.vx*=.84;
    else e.vx=0;
    if(abs<102 && e.attackCd<=0){ e.attackCd=74; e.attackTimer=18; setTimer(()=>{if(!state.over&&!e.stun){const box=hitbox(e.x+(e.face>0?e.w-5:-58),e.y+18,58,70);if(overlap(box,hitbox(p.x,p.y,p.w,p.h)))hurt(8);}},100); }
  }else e.vx*=.75;
  if(Math.abs(e.vx)>.1)e.face=Math.sign(e.vx);
  e.vy+=.58; e.x+=e.vx*scale; e.y+=e.vy*scale;
  if(e.y+e.h>=GROUND){e.y=GROUND-e.h;e.vy=0;e.onGround=true;}
  e.x=clamp(e.x,360,W-e.w-25);
}
function updateProjectiles(scale){
  for(const q of state.projectiles){
    q.x+=q.vx*scale; q.spin+=.3;
    if(q.life>0){
      q.life-=1*scale;
      if(overlap(hitbox(q.x-7,q.y-7,14,14),hitbox(e.x,e.y,e.w,e.h))){ strikeEnemy(20,13,11,'精准'); q.life=0; }
    }
  }
  state.projectiles=state.projectiles.filter(q=>q.life>0 && q.x>-50 && q.x<W+50);
}
function updateFx(){
  state.comboTimer=Math.max(0,state.comboTimer-1); if(state.comboTimer<=0)state.combo=0;
  for(const x of state.particles){x.x+=x.vx;x.y+=x.vy;x.vy+=.09;x.life--;x.vx*=.985;}
  state.particles=state.particles.filter(x=>x.life>0);
  for(const x of state.texts){x.y-=.55;x.life--;}
  state.texts=state.texts.filter(x=>x.life>0);
  for(const x of state.rings){x.r+=2.4;x.life--;}
  state.rings=state.rings.filter(x=>x.life>0);
}

function updateHud(){
  document.getElementById('playerHpText').textContent=`${Math.ceil(p.hp)} / ${p.max}`;
  document.getElementById('enemyHpText').textContent=`${Math.ceil(e.hp)} / ${e.max}`;
  document.getElementById('playerHpBar').style.width=`${p.hp/p.max*100}%`;
  document.getElementById('enemyHpBar').style.width=`${e.hp/e.max*100}%`;
  document.getElementById('ultBar').style.width=`${p.ult}%`;
  document.getElementById('enemyStance').textContent=e.stun>0?'巨人 · 失衡':e.attackTimer>0?'巨人 · 进攻':'巨人 · 压迫';
  const comboHud=document.getElementById('comboHud');
  comboHud.classList.toggle('show',state.combo>=2);
  document.getElementById('comboCount').textContent=state.combo;
}

function draw(){
  ctx.save();
  if(state.shake>0){ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake);state.shake*=.88;if(state.shake<.2)state.shake=0;}
  drawBg(); drawWorldFx(); drawProjectiles(); drawCharacter(p,'david'); drawCharacter(e,'goliath'); drawParticles(); drawTexts(); ctx.restore();
  requestAnimationFrame(()=>{update();draw();});
}
function drawBg(){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#705944');g.addColorStop(.58,'#b78f59');g.addColorStop(1,'#5c3d25');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#69472b';
  for(let i=0;i<10;i++){ctx.beginPath();ctx.moveTo(i*120,GROUND);ctx.lineTo(i*120+55,300+Math.sin(i*1.7)*28);ctx.lineTo(i*120+112,GROUND);ctx.fill();}
  ctx.fillStyle='#4e341f';ctx.fillRect(0,GROUND,W,H-GROUND);ctx.fillStyle='#755033';ctx.fillRect(0,GROUND,W,5);
  ctx.globalAlpha=.28;ctx.fillStyle='#f5e1b5';for(let i=0;i<34;i++){ctx.fillRect((i*79)%W,310+(i*37)%120,2,2);}ctx.globalAlpha=1;
  ctx.fillStyle='#dac092';ctx.font='bold 14px Georgia';ctx.fillText('ELAH VALLEY',38,145);ctx.font='bold 11px sans-serif';ctx.fillText('以 拉 谷',40,163);
  ctx.fillStyle='#e7d4ae';ctx.font='10px sans-serif';ctx.fillText('非利士军营',742,180);ctx.fillStyle='#f1dfbb';ctx.fillText('以色列阵营',68,180);
}
function drawWorldFx(){
  if(e.stun>0){ctx.strokeStyle='#f0ce87';ctx.globalAlpha=.55;ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+28,35,Math.PI*1.12,Math.PI*1.88);ctx.stroke();ctx.globalAlpha=1;}
  for(const x of state.rings){ctx.globalAlpha=x.life/x.max;ctx.strokeStyle=x.c;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x.x,x.y,x.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
}
function drawCharacter(o,type){
  const blink=o.inv>0 && Math.floor(o.inv/3)%2===0; if(blink)return;
  ctx.save();ctx.translate(Math.round(o.x+o.w/2),Math.round(o.y+o.h));ctx.scale(o.face,1);
  if(type==='david'){
    ctx.fillStyle='#263b31';ctx.fillRect(-17,-54,34,45);ctx.fillStyle='#caa477';ctx.fillRect(-13,-77,26,23);ctx.fillStyle='#3a2418';ctx.fillRect(-15,-83,30,9);ctx.fillStyle='#8d6338';ctx.fillRect(-24,-11,12,11);ctx.fillRect(12,-11,12,11);
    ctx.fillStyle='#dbc28e';ctx.fillRect(11,-49,21,5);ctx.fillStyle='#d2a55f';ctx.fillRect(-29,-45,11,5);
    if(p.attackTimer>0){ctx.fillStyle='#c6b07d';ctx.fillRect(18,-51,36,5);if(p.attackStep>=4){ctx.fillRect(24,-43,28,4);}}
  }else{
    ctx.fillStyle='#4c4035';ctx.fillRect(-35,-105,70,88);ctx.fillStyle='#a88b65';ctx.fillRect(-28,-130,56,34);ctx.fillStyle='#332d27';ctx.fillRect(-32,-137,64,12);ctx.fillStyle='#5c4c3d';ctx.fillRect(-50,-72,19,55);ctx.fillRect(31,-72,19,55);ctx.fillStyle='#3a3028';ctx.fillRect(-29,-17,21,17);ctx.fillRect(8,-17,21,17);
    if(e.attackTimer>0){ctx.fillStyle='#745c45';ctx.fillRect(30,-72,28,8);}
  }
  if(o.hitFlash>0){ctx.globalAlpha=.55;ctx.fillStyle='#fff5d6';ctx.fillRect(-45,-140,90,125);ctx.globalAlpha=1;}
  ctx.restore();
}
function drawProjectiles(){
  for(const q of state.projectiles){
    ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.spin);ctx.fillStyle='#2e271f';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e1bf7b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-19,0);ctx.lineTo(19,0);ctx.stroke();ctx.restore();
  }
}
function drawParticles(){for(const x of state.particles){ctx.globalAlpha=Math.max(0,x.life/40);ctx.fillStyle=x.c;ctx.fillRect(x.x,x.y,x.s,x.s);ctx.globalAlpha=1;}}
function drawTexts(){ctx.font='bold 14px sans-serif';ctx.textAlign='center';for(const x of state.texts){ctx.globalAlpha=Math.max(0,x.life/40);ctx.fillStyle=x.kind==='damage'?'#ffe6a4':x.kind==='enemy'?'#d98b7a':'#fff3d2';if(x.kind==='skill')ctx.font='bold 11px sans-serif';ctx.fillText(x.t,x.x,x.y);}ctx.globalAlpha=1;ctx.textAlign='left';}

setInterval(()=>{if(state.over)return;for(let i=0;i<2;i++)state.particles.push({x:Math.random()*W,y:GROUND-3,vx:(Math.random()-.5)*.4,vy:-Math.random()*.9,life:35+Math.random()*30,c:'#c5a66d',s:1+Math.random()*2});},150);
reset();
draw();
