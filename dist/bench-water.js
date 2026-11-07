import {solidNextAction,highlightNext} from './combustion-guidance.js';
import {bindDrop} from './direct-manipulation.js';
import {scopeMarkup} from './card-markup.js';
import {litmusResult} from './journey-cards.js';
import {spoonIllustration} from './laboratory-assets.js';
import {mountBottleAnalysis} from './bottle-analysis.js';

export const waterCases={Cu:{kind:'neutral',route:'solid',text:'黑色氧化層幾乎不溶，留在杯底；銅片本體不加入。'},Mg:{kind:'base',route:'solid',text:'MgO 與水緩慢作用；可見白色固體，液相呈鹼性。'},Zn:{kind:'neutral',route:'solid',text:'冷卻後的白色 ZnO 難溶於水，兩張試紙無明顯變色。'},Na:{kind:'base',route:'solid',text:'本次燃燒的 Na₂O₂ 與水作用產生 NaOH，呈鹼性。'},P:{kind:'acid',route:'solid',text:'白色磷氧化物與足量水作用，水呈酸性。'},S:{kind:'acid',route:'gas',text:'SO₂ 在瓶內溶於水後呈酸性；氣體與水保持無色。'},C:{kind:'acid',route:'gas',text:'CO₂ 在瓶內部分溶於水，形成酸性溶液。'},CO:{kind:'neutral',route:'reference',text:'改接已知 CO 代表氣體瓶；CO 難溶於水，試紙無明顯變色。'}};

export function mountBenchWater(board,{key,completed,spoonOrigin=null,delay,onCleanup=()=>{},notice,onWaterAdded=()=>{},onPhaseChange=()=>{},onComplete}){
 const d=waterCases[key],gas=d.route!=='solid';if(gas)return mountBottleAnalysis(board,{key,completed,delay,onCleanup,notice,onWaterAdded,onPhaseChange,onComplete});let ready=false;const dipped=new Set();
 const station=document.createElement('div');station.className='bench-water-station';station.dataset.waterState='empty';
 station.innerHTML=scopeMarkup(`<svg class="bench-water-art" viewBox="0 0 760 430" aria-hidden="true"><defs><linearGradient id="beaker-glass"><stop stop-color="#91b7c1" stop-opacity=".5"/><stop offset=".12" stop-color="#fff" stop-opacity=".75"/><stop offset=".25" stop-color="#d2ebea" stop-opacity=".07"/><stop offset=".78" stop-color="#fff" stop-opacity=".15"/><stop offset=".9" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#8eafb5" stop-opacity=".4"/></linearGradient></defs><ellipse cx="147" cy="377" rx="75" ry="9" fill="#182e35" opacity=".23"/><path d="M77 279V358Q77 375 147 375Q217 375 217 358V279" fill="url(#beaker-glass)" stroke="#a5c7cb" stroke-width="1.4"/><path d="M81 317V356Q147 371 213 356V317Z" fill="#cde7eb" fill-opacity=".25"/><ellipse cx="147" cy="317" rx="66" ry="6" fill="#ebffff" fill-opacity=".35" stroke="#b5d6d8" stroke-opacity=".7"/><ellipse data-beaker-mouth cx="147" cy="279" rx="70" ry="7" fill="#e5f8f2" fill-opacity=".15" stroke="#b2cdd1" stroke-width="1.5"/><path d="M84 291V353M207 292V352" stroke="white" stroke-width="2" opacity=".6"/><path d="M193 295h15m-15 15h12m-12 16h15m-15 16h12" stroke="#d7eeee" opacity=".8"/><path data-bench-sediment d="M87 357q16 -6 30 -1t32 -2 29 3l26 -2 -4 8q-51 9 -108 0Z" fill="${key==='Cu'?'#232c2b':'#ebeee7'}" visibility="hidden"/><text x="147" y="400" text-anchor="middle" fill="#eff6ef" font-size="12">清水 · 觀察試紙浸水端</text><g class="water-ripples"><ellipse cx="147" cy="317" rx="24" ry="3" fill="none" stroke="#f1ffff" opacity=".7"/></g></svg><div data-bench-add class="bench-add-target drop-target"><span>產物加入杯口 ↓</span></div><div data-bench-liquid class="bench-liquid-target"></div><div class="bench-paper-rack"><span>石蕊試紙</span></div>${['red','blue'].map(p=>`<div class="litmus-paper bench-paper ${p}" data-bench-paper="${p}" aria-disabled="true" aria-label="${p==='red'?'紅色':'藍色'}石蕊試紙"><span class="paper-fibre"></span><span class="paper-tip"></span></div>`).join('')}<div class="bench-addition ${gas?'gas-bubbles':''}" aria-hidden="true">${Array.from({length:84},(_,i)=>`<i style="--i:${i};--grain-x:${(i*37)%100}%;--grain-size:${1.8+(i%6)*.45}px;--sample-colour:${key==='Cu'?'#192924':'#fffcec'}"></i>`).join('')}</div><p class="bench-water-status" role="status" hidden></p>`, 'bench-water-'+key);
 board.append(station);
 const status=station.querySelector('.bench-water-status'),zone=station.querySelector('[data-bench-add]');zone.hidden=!completed;
 function tell(t,error=false){status.textContent=t;status.hidden=!error;status.dataset.feedback=error?'error':'quiet';notice(t);}
 function guide(){const next=solidNextAction({completed,ready,adding:station.dataset.waterState==='adding',dipped:[...dipped]});highlightNext(station,next);onPhaseChange(next.id==='complete'?'complete':!completed?'burn':ready?'litmus':'water');if(next.instruction&&next.id!=='water')tell(next.instruction);}
 function dip(p){
  if(!ready||dipped.has(p))return false;
  const paper=station.querySelector('[data-bench-paper="'+p+'"]'),tip=paper.querySelector('.paper-tip');
  dipped.add(p);paper.classList.add('dipped');paper.style.left=(p==='red'?16:22)+'%';paper.style.top='60%';tip.style.height='30%';tip.style.background=litmusResult(d.kind,p);tip.style.opacity='1';
  tell(dipped.size===1?'浸水端已完成測試，再放入另一張試紙。':d.kind==='base'?'紅紙浸水端變藍；藍紙不變 → 鹼性。':d.kind==='acid'?'藍紙浸水端變紅；紅紙不變 → 酸性。':'兩張試紙浸水端皆無明顯變色。');
  if(dipped.size===2){station.dataset.waterState='tested';onComplete();}guide();return true;
 }
 for(const p of ['red','blue']){
  const paper=station.querySelector('[data-bench-paper="'+p+'"]'),tip=paper.querySelector('.paper-tip');
  bindDrop(paper,station.querySelector('[data-bench-liquid]'),{disabled:()=>!ready,anchor:[.5,.96],keep:true,onMove:(hit,r,z)=>{tip.style.height=(hit?Math.min(r.height*.65,Math.max(0,r.bottom-z.top))/r.height*100:0)+'%';tip.style.background=litmusResult(d.kind,p);tip.style.opacity=hit?'1':'0';},onDrop:()=>dip(p),onMiss:()=>tell('把試紙下端移進杯中，再放手。',true)});
 }
 if(!completed)return;
 function add(source){
  if(ready||station.dataset.waterState==='adding')return false;
  station.dataset.waterState='adding';source.setAttribute('aria-disabled','true');zone.hidden=true;guide();
  {source.style.left=((147-29)/760*100)+'%';source.style.top=((277-207)/430*100)+'%';source.classList.add('spoon-pouring');tell(key==='Cu'?'將少量黑色氧化層加入水中，銅片仍留匙上。':'燃燒匙傾斜，冷卻後的產物落入水中……');}
  delay(()=>{if(!board.isConnected)return;ready=true;station.dataset.waterState='ready';onWaterAdded();if(!gas){source.innerHTML=scopeMarkup(spoonIllustration(key,{empty:key!=='Cu'})+'<span>'+(key==='Cu'?'銅片留在匙上':'空匙')+'</span>','empty-spoon-'+key);source.classList.remove('spoon-pouring');source.classList.add('spoon-empty');source.style.left=((235-29)/760*100)+'%';source.style.top=((340-207)/430*100)+'%';}
   if(['Cu','Mg','Zn'].includes(key))station.querySelector('[data-bench-sediment]').setAttribute('visibility','visible');
   for(const paper of station.querySelectorAll('[data-bench-paper]'))paper.setAttribute('aria-disabled','false');tell(d.text+' 現在拖動兩張石蕊試紙。');guide();
  },2300);
 }
 board.classList.add('wet-connected');
 const source=document.createElement('div');source.className='combustion-spoon bench-product-spoon';source.dataset.benchProduct='';source.setAttribute('aria-label','燃燒匙上的'+(key==='Cu'?'黑色氧化層':'燃燒產物'));
 let x=spoonOrigin?spoonOrigin[0]:key==='P'?560:320,y=spoonOrigin?spoonOrigin[1]:key==='P'?283:224;
 source.style.left=((x-29)/760*100)+'%';source.style.top=((y-205)/430*100)+'%';source.innerHTML=scopeMarkup(spoonIllustration(key,{oxide:true,cool:true})+'<span>拖曳產物到杯口</span>','product-spoon-'+key);station.append(source);source.setAttribute('aria-disabled','false');
 guide();
 bindDrop(source,zone,{anchor:[.181,.9],onMove:hit=>{source.classList.toggle('spoon-over-water',hit);if(hit)status.hidden=true;},disabled:()=>ready||station.dataset.waterState==='adding',onDrop:()=>add(source),onMiss:()=>tell('差一點！把亮起的匙端移到杯口，再放手。',true)});
 return {add(){return add(source);},dip,moveProduct([x,y]){source.style.left=((x-29)/760*100)+'%';source.style.top=((y-205)/430*100)+'%';},movePaper(p,t){const paper=station.querySelector('[data-bench-paper="'+p+'"]');paper.style.left=((p==='red'?2:6)+(p==='red'?14:16)*t)+'%';paper.style.top=(43+17*t)+'%';},get state(){return {ready,dipped:[...dipped]};}};
}
