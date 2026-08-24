(()=>{
'use strict';
let active=false;
const boot=()=>{
 if(active||!window.S||!window.A||!window.B||typeof window.hit!=='function') return false;
 const canvas=document.querySelector('#game'); if(!canvas) return false;
 const X=canvas.getContext('2d'); if(!X) return false;
 active=true;
 const p=window.BIBLE_FIGHTER_DAVID_POLISH=window.BIBLE_FIGHTER_DAVID_POLISH||{version:'1.4.3',ready:true,cameraKick:0,flash:0,lastEvent:'',ko:false,hitCount:0};
 p.version='1.4.3'; p.cameraKick=0; p.flash=0; p.ko=false;
 const david=f=>f?.id==='david';
 const baseHit=window.hit;
 window.hit=(a,d,damage,stun,knock,label)=>{
  const before=d?.hp??0; baseHit(a,d,damage,stun,knock,label);
  if(!david(a)||!d||!(d.hp<before)) return;
  const text=String(label||'hit'); p.lastEvent=text; p.hitCount++;
  p.cameraKick=Math.max(p.cameraKick,text.includes('重')||Number(a.step||0)>=5?8:4);
  p.flash=Math.max(p.flash,text.includes('投石索')?8:5);
  if(d.hp<=0) p.ko=true;
 };
 const lifecycle=()=>{
  const alive=(window.A?.hp??1)>0&&(window.B?.hp??1)>0;
  if(alive) p.ko=false;
  if(!window.S?.run){canvas.style.transform='';p.cameraKick=0;return;}
  if(p.cameraKick>0){const amp=Math.min(4,Math.ceil(p.cameraKick/2));const x=p.cameraKick%2?amp:-amp;const y=p.cameraKick%3-1;canvas.style.transform=`translate(${x}px,${y}px)`;p.cameraKick--;}else canvas.style.transform='';
 };
 const overlay=()=>{
  if(p.flash>0){X.save();X.globalAlpha=Math.min(.18,p.flash/45);X.fillStyle='#f3dfad';X.fillRect(0,0,canvas.width,canvas.height);X.restore();p.flash--;}
  if(p.ko&&window.S?.run){X.save();X.globalAlpha=.82;X.fillStyle='#d8b766';X.fillRect(0,canvas.height*.38,canvas.width,canvas.height*.2);X.globalAlpha=1;X.fillStyle='#120d08';X.textAlign='center';X.font='900 30px sans-serif';X.fillText('DAVID · FINISH',canvas.width/2,canvas.height*.50);X.font='700 12px sans-serif';X.fillText('Trust over strength',canvas.width/2,canvas.height*.55);X.restore();}
 };
 window.BIBLE_FIGHTER_DAVID_POLISH_READY=true;
 window.BIBLE_FIGHTER_DAVID_POLISH_API={snapshot:()=>({version:p.version,cameraKick:p.cameraKick,flash:p.flash,lastEvent:p.lastEvent,hitCount:p.hitCount,ko:p.ko})};
 const loop=()=>{lifecycle();overlay();requestAnimationFrame(loop)};loop();return true;
};
const ensure=()=>{if(!boot())setTimeout(ensure,80)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
})();
