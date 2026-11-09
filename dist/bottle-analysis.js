import {photographicLid,photographicWash,photographicPipette} from './combustion-photo-art.js';
import {bindDrop,bindFreeInstrument,inside} from './direct-manipulation.js';
import {scopeMarkup} from './card-markup.js';
import {restingSpoon} from './bottle-analysis-art.js';
import {newBottleLitmus,bottleLitmusStep,bottleLitmusResult,bottleNextAction,litmusColours} from './bottle-ph-state.js';

export function mountBottleAnalysis(board,{key,completed,delay,onCleanup=()=>{},notice,onWaterAdded=()=>{},onPhaseChange=()=>{},onComplete}){
 if(!completed)return;
 board.dataset.bottleAnalysis=key;
 let state=newBottleLitmus(),alive=true,committed=false,lastShake=560,shakingHeld=false,dropping=false,lidReady=false,lidOpening=false;
 const releases=[];
 const station=document.createElement('div');station.className='bottle-analysis';
 station.innerHTML=scopeMarkup(`<svg class="bottle-analysis-art" viewBox="0 0 760 430" aria-hidden="true"><defs><linearGradient id="control-glass"><stop stop-color="#86a9b4" stop-opacity=".5"/><stop offset=".15" stop-color="#fff" stop-opacity=".5"/><stop offset=".4" stop-color="#e3f6f9" stop-opacity=".04"/><stop offset=".85" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#779da9" stop-opacity=".5"/></linearGradient></defs>
 <g data-absorption-water visibility="hidden"><path data-jar-water d="M483 314Q560 318 637 314V326Q637 342 560 342Q483 342 483 326Z" fill="#b9e0e8" fill-opacity=".2" stroke="#badbe3" stroke-width=".8"/><path d="M491 329Q560 344 628 329" fill="none" stroke="#f1ffff" opacity=".65"/><ellipse cx="560" cy="316" rx="76" ry="5" fill="#e5ffff" fill-opacity=".17"/></g>
 <g class="bottle-pour-stream" fill="none" stroke-linecap="round">
  <path d="M560 87C562 151 554 248 560 315" stroke="#b1d8e5" stroke-width="4"/>
  <path d="M560 87C562 151 554 248 560 315" stroke="#f6ffff" stroke-width="1.3" stroke-dasharray="24 7 9 5"/>
 </g>
 <g class="bottle-pour-ripples" fill="none" stroke="#f0ffff" stroke-width="1.3">
  <ellipse cx="560" cy="316" rx="34" ry="4"/><ellipse cx="560" cy="317" rx="29" ry="3.5"/>
 </g>
 <text x="560" y="215" text-anchor="middle" fill="#4d6b70" font-size="12">${key==='CO'?'另取已知 CO 代表瓶':key==='S'?'SO₂ 留在瓶內 · 氣體無色':'CO₂ 留在瓶內 · 氣體無色'}</text>
 <path transform="translate(-75 -35)" d="M232 346H278L286 356H224Z" fill="#667f83" stroke="#bfd0cf"/><path transform="translate(-75 -35)" d="M230 170H280M236 170V346M274 170V346" fill="none" stroke="#7a949a" stroke-width="3"/>
 </svg>
 <div class="analysis-spoon-rest spoon-rest">${restingSpoon()}</div>
 <div class="analysis-lid auto-lid" data-analysis-lid aria-label="自動開合的玻璃片瓶蓋">${photographicLid()}</div>
 <div class="analysis-mouth drop-target" data-analysis-mouth><span>瓶口 ↓</span></div>
 <div class="analysis-wash" data-analysis-wash aria-label="蒸餾水洗瓶；把細口拖到集氣瓶瓶口">${photographicWash()}</div>
 <div class="analysis-shaker" data-analysis-shaker aria-label="玻璃片已扶穩；按住瓶身左右搖晃"></div>
 <div class="analysis-source sample-source" data-analysis-source="sample"></div>
 ${['sample'].map(src=>`<div class="analysis-pipette" data-pipette="${src}" aria-label="教師取液滴管；瓶內溶液">${photographicPipette()}</div>`).join('')}
 <div class="ph-paper-tray bottle-litmus-tray"><b>瓶內液體 · 紅、藍石蕊試紙</b>${['red','blue'].map(paper=>`<div class="ph-paper-cell"><span>${paper==='red'?'紅色':'藍色'}石蕊試紙</span><div class="ph-paper bottle-litmus-strip" data-litmus-paper="${paper}" role="img" aria-label="${paper==='red'?'紅色':'藍色'}石蕊試紙，尚未滴液"><i></i></div></div>`).join('')}</div>
 <p class="bottle-analysis-status" role="status" hidden></p>`,'bottle-litmus-'+key);
 board.append(station);
 const panel=document.createElement('section');panel.className='ph-record-panel bottle-result-panel';panel.setAttribute('aria-label','瓶內溶液的石蕊試紙紀錄');panel.innerHTML='<div class="ph-record-intro"><b>看試紙，留下觀察</b><span>同一支滴管取瓶內液體，分別滴到紅、藍石蕊試紙；每滴一次後再取液。</span></div><div class="litmus-observations"><output data-litmus-record="red">紅色石蕊：尚未滴液</output><output data-litmus-record="blue">藍色石蕊：尚未滴液</output></div>';
 board.insertAdjacentElement('afterend',panel);
 const lid=station.querySelector('[data-analysis-lid]'),wash=station.querySelector('[data-analysis-wash]'),shaker=station.querySelector('[data-analysis-shaker]'),mouth=station.querySelector('[data-analysis-mouth]'),baseJar=board.querySelector('[data-collection-bottle]'),water=station.querySelector('[data-absorption-water]');
 const messages={pour:'燃燒已結束，已自動取匙並示意冷卻。把蒸餾水加入瓶內。',shake:'瓶蓋已自動蓋好。按住瓶身左右搖晃，讓水接觸瓶內氣體。',test:'玻璃片已自動移開。取瓶內液體，滴到桌上的紅、藍石蕊試紙。',complete:key==='CO'?'紅、藍石蕊皆無明顯變色；遇水性質不代表還原能力。':'藍色石蕊變紅，紅色石蕊不變；瓶內溶液呈酸性。'};
 function say(t,error=false){const feedback=station.querySelector('.bottle-analysis-status');feedback.textContent=t;feedback.hidden=!error;feedback.dataset.feedback=error?'error':'quiet';notice(t);}
 function dispatch(event){const before=state;state=bottleLitmusStep(state,event);if(before!==state)show();}
 function enable(tool,yes){tool.classList.toggle('unavailable',!yes);tool.setAttribute('aria-disabled',String(!yes));tool.tabIndex=yes?0:-1;}
 function onWaterAddedIfReady(){if(state.water)onWaterAdded();}
 function show(){
  onWaterAddedIfReady();
  onPhaseChange(state.phase==='test'?'litmus':state.phase==='complete'?'complete':'water');station.dataset.phase=state.phase;station.dataset.shake=String(Math.round(state.shake));water.setAttribute('visibility',state.water?'visible':'hidden');
  lid.classList.toggle('is-covered',state.phase==='shake'||shakingHeld);lid.tabIndex=-1;enable(wash,state.phase==='pour');enable(shaker,state.phase==='shake'||shakingHeld);mouth.hidden=state.phase!=='pour';
  if(state.phase==='test'&&!shakingHeld&&!lidOpening){lidOpening=true;delay(()=>{if(!alive||!board.isConnected)return;lidReady=true;show();},500);}
  const tool=station.querySelector('[data-pipette=sample]');enable(tool,state.phase==='test'&&lidReady);tool.classList.toggle('charged',state.loaded);tool.dataset.loaded=String(state.loaded);
  for(const paper of ['red','blue']){
   const strip=station.querySelector('[data-litmus-paper='+paper+']'),name=paper==='red'?'紅色':'藍色';
   const result=bottleLitmusResult(key,paper),resultName=result==='red'?'紅色':'藍色';
   strip.dataset.spotted=String(state.spotted[paper]);
   strip.setAttribute('aria-label',name+'石蕊試紙，'+(state.spotted[paper]?(result===paper?'保持'+name:'滴液處變成'+resultName):'尚未滴液'));
   strip.querySelector('i').style.background=state.spotted[paper]?litmusColours[result]:'transparent';
   panel.querySelector('[data-litmus-record='+paper+']').textContent=name+'石蕊：'+(state.spotted[paper]?(result===paper?'顏色不變':'滴液處變成'+resultName):'尚未滴液');
  }
  const next=bottleNextAction(state);station.dataset.next=next.id;
  station.querySelectorAll('.analysis-next-tool,.analysis-next-target').forEach(el=>{el.classList.remove('analysis-next-tool','analysis-next-target');el.removeAttribute('data-next-label');});
  if(next.tool&&(state.phase!=='test'||lidReady)){const el=station.querySelector(next.tool);el.classList.add('analysis-next-tool');el.dataset.nextLabel=next.id==='water'?'拿洗瓶 · 加水讓氣體溶解':next.label;}
  if(next.target)station.querySelector(next.target).classList.add('analysis-next-target');
  say(next.instruction||messages[state.phase]);
  if(state.phase==='complete'&&!committed){committed=true;onComplete();}
 }
 function addWater(){
  if(state.phase!=='pour')return false;
  station.classList.add('pouring');dispatch({type:'water'});
  delay(()=>{if(!alive||!board.isConnected)return;station.classList.remove('pouring');wash.style.left=(355/760*100)+'%';wash.style.top=(200/430*100)+'%';wash.style.transform='';},650);return true;
 }
 function moveShaker(p,held){
  shakingHeld=held;lid.classList.toggle('is-covered',state.phase==='shake'||held);const dx=p[0]-560,transform=`translate(${dx} 0)`;
  baseJar.setAttribute('transform',transform);water.setAttribute('transform',transform);lid.style.translate=(dx/760*board.getBoundingClientRect().width)+'px 0';
  station.querySelector('[data-jar-water]').setAttribute('d',`M483 ${314+dx*.12}Q560 ${318-dx*.2} 637 ${314-dx*.12}V326Q637 342 560 342Q483 342 483 326Z`);
  if(held&&state.phase==='shake')dispatch({type:'shake',distance:p[0]-lastShake});lastShake=p[0];if(!held&&state.phase!=='shake')show();
 }
 function spot(paper){
  if(state.phase!=='test'||!state.loaded||dropping||state.spotted[paper])return false;
  dropping=true;tool.classList.add('dispensing');
  delay(()=>{if(!alive||!board.isConnected)return;tool.classList.remove('dispensing');dropping=false;dispatch({type:'spot',paper,key});if(state.phase!=='complete')say('已留下這張試紙的觀察。回瓶內再取液，測另一張石蕊試紙。');},450);return true;
 }
 releases.push(bindDrop(wash,mouth,{anchor:[.89,.1],keep:true,disabled:()=>state.phase!=='pour',onDrop:addWater,onMiss:()=>say('把洗瓶的細口移到集氣瓶瓶口，再放手。',true)}));
 releases.push(bindFreeInstrument(shaker,board,{position:[560,215],offset:[84,135],bounds:[535,585,215,215],instrumentClass:'free-bottle-shaker',onMove:moveShaker,onRelease:()=>[560,215]}));
 const tool=station.querySelector('[data-pipette=sample]');
 releases.push(bindFreeInstrument(tool,board,{position:[180,300],offset:[22,291],bounds:[30,720,300,415],instrumentClass:'free-pipette',onRelease:p=>{
  if(state.phase!=='test'||!lidReady||dropping)return;
  const r=station.getBoundingClientRect(),point={x:r.left+p[0]/760*r.width,y:r.top+p[1]/430*r.height};
  if(!state.loaded){
   if(inside(point,station.querySelector('[data-analysis-source=sample]').getBoundingClientRect())){dispatch({type:'take'});say('已取瓶內液體。把滴管尖端移到一張尚未滴液的石蕊試紙上方。');}
   else say('先把滴管尖端伸入瓶底液體，取少量液體。',true);
   return;
  }
  const strip=[...station.querySelectorAll('[data-litmus-paper]')].find(el=>inside(point,el.getBoundingClientRect()));
  if(!strip){say('把尖端對準紅色或藍色石蕊試紙，讓液滴落在紙上。',true);return;}
  const paper=strip.dataset.litmusPaper;
  if(state.spotted[paper]){say('這張已經測過了，請滴在另一張石蕊試紙上。',true);return;}
  spot(paper);
 }}));
 onCleanup(()=>{alive=false;for(const f of releases)f();baseJar.removeAttribute('transform');});show();
 return {addWater,shake:x=>moveShaker([x,215],true),stopShaking:()=>moveShaker([560,215],false),take:()=>{if(lidReady)dispatch({type:'take'});},spot,
  moveWash([x,y]){wash.style.left=((x-89)/760*100)+'%';wash.style.top=((y-16)/430*100)+'%';wash.style.transform='';},
  movePipette([x,y]){tool.style.left=((x-22)/760*100)+'%';tool.style.top=((y-291)/430*100)+'%';},
  get state(){return {...state,spotted:{...state.spotted}};}};
}
