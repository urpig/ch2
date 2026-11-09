import {apparatusPhoto,beakerSediment,spoonRackArtwork} from './combustion-photo-art.js';
import {solidNextAction,highlightNext} from './combustion-guidance.js';
import {bindDrop} from './direct-manipulation.js';
import {scopeMarkup} from './card-markup.js';
import {litmusResult} from './journey-cards.js';
import {spoonIllustration} from './laboratory-assets.js';
import {mountBottleAnalysis} from './bottle-analysis.js';

// Coordinates share the beaker's 760 × 430 scene, including its waterline.
export const benchLitmus={top:243,height:112,waterline:303,left:{red:122,blue:167}};
export function immersedPaperFraction(top,height=benchLitmus.height){return Math.max(0,Math.min(1,(top+height-benchLitmus.waterline)/height));}

export const waterCases={Cu:{kind:'neutral',route:'solid',text:'黑色氧化層幾乎不溶，留在杯底；銅片本體不加入。'},Mg:{kind:'base',route:'solid',text:'MgO 與水緩慢作用；可見白色固體，液相呈鹼性。'},Zn:{kind:'neutral',route:'solid',text:'冷卻後的白色 ZnO 難溶於水，兩張試紙無明顯變色。'},Na:{kind:'base',route:'solid',text:'本次燃燒的 Na₂O₂ 與水作用產生 NaOH，呈鹼性。'},P:{kind:'acid',route:'solid',text:'白色磷氧化物與足量水作用，水呈酸性。'},S:{kind:'acid',route:'gas',text:'SO₂ 在瓶內溶於水後呈酸性；氣體與水保持無色。'},C:{kind:'acid',route:'gas',text:'CO₂ 在瓶內部分溶於水，形成酸性溶液。'},CO:{kind:'neutral',route:'reference',text:'改接已知 CO 代表氣體瓶；CO 難溶於水，試紙無明顯變色。'}};

export function mountBenchWater(board,{key,completed,spoonOrigin=null,delay,onCleanup=()=>{},notice,onWaterAdded=()=>{},onPhaseChange=()=>{},onComplete}){
 const d=waterCases[key],gas=d.route!=='solid';if(gas)return mountBottleAnalysis(board,{key,completed,delay,onCleanup,notice,onWaterAdded,onPhaseChange,onComplete});let ready=false;const dipped=new Set();
 const station=document.createElement('div');station.className='bench-water-station';station.dataset.waterState='empty';
 station.innerHTML=scopeMarkup(`<svg class="bench-water-art" viewBox="0 0 760 430" aria-hidden="true"><ellipse cx="147" cy="377" rx="75" ry="7" fill="#182e35" opacity=".2"/>${apparatusPhoto('beaker',77,223,140,154)}<ellipse data-beaker-mouth cx="147" cy="236" rx="67" ry="7" fill="transparent"/>${beakerSediment(key)}<text x="147" y="400" text-anchor="middle" fill="#eff6ef" font-size="12">清水 · 觀察試紙浸水端</text><g class="water-ripples"><ellipse cx="147" cy="303" rx="24" ry="3" fill="none" stroke="#f1ffff" opacity=".7"/></g>${spoonRackArtwork(675,286)}</svg><div data-bench-add class="bench-add-target drop-target" aria-label="產物加入杯口"></div><div data-bench-liquid class="bench-liquid-target"></div><div class="bench-paper-rack"><span>石蕊試紙</span></div>${['red','blue'].map(p=>`<div class="litmus-paper bench-paper ${p}" data-bench-paper="${p}" aria-disabled="true" aria-label="${p==='red'?'紅色':'藍色'}石蕊試紙"><span class="paper-fibre"></span><span class="paper-tip"></span></div>`).join('')}<div class="bench-addition" aria-hidden="true">${Array.from({length:84},(_,i)=>`<i style="--i:${i};--grain-x:${(i*37)%100}%;--grain-size:${1.8+(i%6)*.45}px;--sample-colour:${key==='Cu'?'#192924':'#fffcec'}"></i>`).join('')}</div><p class="bench-water-status" role="status" hidden></p>`, 'bench-water-'+key);
 board.append(station);
 const glass=document.createElementNS('http://www.w3.org/2000/svg','svg');
 glass.setAttribute('class','bench-water-foreground');glass.setAttribute('viewBox','0 0 760 430');glass.setAttribute('aria-hidden','true');
 glass.innerHTML='<path d="M94 303 Q151 310 210 303 V359 Q210 371 151 371 Q94 370 94 359Z" fill="#c4e6e9" fill-opacity=".17"/><ellipse cx="152" cy="303" rx="58" ry="4" fill="none" stroke="#f0ffff" stroke-opacity=".64" stroke-width="1.2"/><path d="M96 251V357Q96 369 152 369Q208 369 208 357V251" fill="none" stroke="#f1ffff" stroke-opacity=".27" stroke-width="2"/><path d="M102 309V351M201 311V350" stroke="#fff" stroke-opacity=".2" stroke-width="2"/>';
 station.append(glass);
 for(const paper of station.querySelectorAll('[data-bench-paper]'))paper.style.height=(benchLitmus.height/430*100)+'%';
 const status=station.querySelector('.bench-water-status'),zone=station.querySelector('[data-bench-add]');zone.hidden=!completed;
 function tell(t,error=false){status.textContent=t;status.hidden=!error;status.dataset.feedback=error?'error':'quiet';notice(t);}
 function guide(){const next=solidNextAction({completed,ready,adding:station.dataset.waterState==='adding',dipped:[...dipped]});highlightNext(station,next);onPhaseChange(next.id==='complete'?'complete':!completed?'burn':ready?'litmus':'water');if(next.instruction&&next.id!=='water')tell(next.instruction);}
 function dip(p){
  if(!ready||dipped.has(p))return false;
  const paper=station.querySelector('[data-bench-paper="'+p+'"]'),tip=paper.querySelector('.paper-tip');
  dipped.add(p);paper.classList.add('dipped');paper.style.left=(benchLitmus.left[p]/760*100)+'%';paper.style.top=(benchLitmus.top/430*100)+'%';tip.style.height=(immersedPaperFraction(benchLitmus.top)*100)+'%';tip.style.background=litmusResult(d.kind,p);tip.style.opacity='1';
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
  {source.style.left=((147-29)/760*100)+'%';source.style.top=((236-205)/430*100)+'%';source.classList.add('spoon-pouring');tell(key==='Cu'?'將少量黑色氧化層加入水中，銅片仍留匙上。':'燃燒匙傾斜，冷卻後的產物落入水中……');}
  delay(()=>{if(!board.isConnected)return;ready=true;station.dataset.waterState='ready';onWaterAdded();source.innerHTML=scopeMarkup(spoonIllustration(key,{empty:key!=='Cu'}),'empty-spoon-'+key);source.classList.remove('spoon-pouring','spoon-over-water','placed');source.classList.add('spoon-parked');source.style.left=((675-29)/760*100)+'%';source.style.top=((286-205)/430*100)+'%';source.tabIndex=-1;source.setAttribute('aria-disabled','true');source.setAttribute('aria-label',key==='Cu'?'銅片留在燃燒匙上，已放回右側器材架':'空燃燒匙已放回右側器材架');
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
 return {add(){return add(source);},dip,pourPoint:[147,236],moveProduct([x,y]){if(station.dataset.waterState!=='empty')return;source.style.left=((x-29)/760*100)+'%';source.style.top=((y-205)/430*100)+'%';},movePaper(p,t){const paper=station.querySelector('[data-bench-paper="'+p+'"]'),tip=paper.querySelector('.paper-tip'),target=benchLitmus.left[p]/760*100,progress=Math.max(0,Math.min(1,t)),smooth=v=>v*v*(3-2*v);if(dipped.has(p))return;const lift=smooth(Math.min(1,progress/.45)),lower=smooth(Math.max(0,(progress-.45)/.55)),top=progress<.45?43-24*lift:19+(benchLitmus.top/430*100-19)*lower,wet=immersedPaperFraction(top/100*430);paper.style.left=((p==='red'?2:6)+(target-(p==='red'?2:6))*lift)+'%';paper.style.top=top+'%';tip.style.height=(wet*100)+'%';tip.style.background=litmusResult(d.kind,p);tip.style.opacity=wet>0?'1':'0';},get state(){return {ready,dipped:[...dipped]};}};
}
