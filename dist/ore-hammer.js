import {bindDrop} from './direct-manipulation.js';

const hammerArt=`<img src="./assets/story/realistic-club.png" alt="" draggable="false">`;
const fragments=Array.from({length:17},(_,i)=>{
 const direction=i%2?-1:1;
 return `<i style="--chip-size:${1.3+(i*13%25)/10}cqi;--chip-x:${direction*(38+i*19%124)}px;--chip-apex:${-22-i*37%76}px;--chip-turn:${direction*(44+i*41%204)}deg;--chip-delay:${i*13%75}ms;--chip-shade:${.66+i*11%33/100}"></i>`;
}).join('');

export function mountOreHammer(host,{onCrushed=()=>{}}={}){
 const stage=host.querySelector('.ore-render-stage'),source=stage.querySelector('canvas'),hint=stage.querySelector('.ore-gesture-hint');
 const tool=document.createElement('button');
 tool.type='button';
 tool.className='ore-hammer-tool';
 tool.setAttribute('aria-pressed','false');
 tool.setAttribute('aria-label','拿起槌子敲碎鐵礦');
 tool.innerHTML=`${hammerArt}<span>拿起槌子</span>`;
 const overlay=document.createElement('img');overlay.src='./assets/story/hematite-pile-realistic.png';overlay.alt='敲碎後的小顆赤鐵礦自然堆在鍛刀房地面';overlay.draggable=false;overlay.className='ore-fracture-canvas ore-realistic-pile';overlay.hidden=true;overlay.setAttribute('role','img');stage.append(overlay);
 const target=document.createElement('button');target.type='button';target.className='ore-strike-target';target.setAttribute('aria-label','用槌子敲擊鐵礦');target.hidden=true;stage.append(target);
 const swing=document.createElement('div');swing.className='ore-hammer-swing';swing.innerHTML=hammerArt;swing.hidden=true;swing.setAttribute('aria-hidden','true');stage.append(swing);
 const debris=document.createElement('div');debris.className='ore-strike-debris';debris.innerHTML=`<span></span><span></span>${fragments}`;debris.hidden=true;debris.setAttribute('aria-hidden','true');stage.append(debris);
 stage.append(tool);
 let frame=0,hit=false,alive=true;
 host.dataset.oreHits='0';
 hint.textContent='把槌子拖到礦石上';
 function arm(){
  if(hit)return;
  tool.setAttribute('aria-pressed','true');
  target.hidden=false;
  hint.textContent='點擊礦石敲擊 · Enter 也可以';
 }
 function strike(){
  if(!alive||hit)return;
  hit=true;
  target.hidden=true;
  tool.disabled=true;
  tool.setAttribute('aria-pressed','false');
  host.querySelectorAll('[data-ore-view],[data-ore-reset]').forEach(b=>b.disabled=true);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start=performance.now();
  swing.hidden=reduced;
  function animate(now){
   if(!alive)return;
   const elapsed=reduced?910:now-start;
   if(elapsed>=240&&overlay.hidden){
    source.style.visibility='hidden';
    overlay.hidden=false;
    debris.hidden=reduced;
   }
   if(elapsed<910){frame=requestAnimationFrame(animate);return;}
   swing.hidden=true;
   debris.hidden=true;
   host.dataset.oreHits='1';
   hint.textContent='敲碎前後：都是氧化鐵 Fe₂O₃';
   onCrushed();
  }
  frame=requestAnimationFrame(animate);
 }
 tool.onclick=arm;target.onclick=strike;
 // A separate visible drop zone lets students drag the actual hammer onto the ore.
 const drop=document.createElement('div');drop.className='ore-hammer-drop';stage.append(drop);
 const release=bindDrop(tool,drop,{highlightOnPickup:false,disabled:()=>hit,onDrop:strike,onMiss:arm});
 tool.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopImmediatePropagation();arm();target.focus({preventScroll:true});}},true);
 return ()=>{alive=false;cancelAnimationFrame(frame);release();};
}
