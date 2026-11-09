import {storyDialogue,storySpeech,notebookMarkup} from './story-dialogue.js';
import {affinityBenchArt,mixture} from './affinity-appearance.js';
import {createFoodPlayback} from './food-playback.js';
import {stabilityTrials,stabilityPairs,recordStabilityPair,restoreStability,stabilityFrame,stabilityReady,stabilityQuiz} from './oxide-stability-model.js';
import {chapterNumber} from './lesson-sequence.js';

function material(kind,place){
 if(kind==='magnesium')return `<svg class="stability-metal-piece" viewBox="166 251 395 112" aria-hidden="true"><defs><clipPath id="stability-mg-${place}"><path d="M174 266Q373 357 554 261L550 309Q384 398 174 300Z"/></clipPath></defs><image href="./assets/story/elements/specimen-Mg.webp" width="600" height="450" clip-path="url(#stability-mg-${place})"/></svg>`;
 if(kind==='silver-piece')return `<svg class="stability-metal-piece" viewBox="96 76 414 290" aria-hidden="true"><defs><clipPath id="stability-ag-${place}"><path d="M104 186L141 147L183 125L211 82L244 84L280 109L305 111L335 135L369 140L390 156L424 166L455 193L474 225L497 252L501 281L483 309L443 323L410 339L371 344L336 352L288 357L259 353L220 338L186 324L161 307L137 281L127 249L104 222Z"/></clipPath></defs><image href="./assets/story/elements/specimen-Ag.webp" width="600" height="450" clip-path="url(#stability-ag-${place})"/></svg>`;
 return mixture([kind]);
}
function specimenDish(kind,label,place){
 return `<figure class="stability-dish"><div class="free-specimen-dish"><img class="free-dish-photo" src="${affinityBenchArt.dish}" alt="" draggable="false"><div class="free-dish-contents">${material(kind,place)}</div></div><figcaption>${label}</figcaption></figure>`;
}
function oxygenTrack(trial){
 const prefix='stability-'+trial.id;
 const atom=(x,y,symbol,attributes='')=>`<g ${attributes}><circle cx="${x}" cy="${y}" r="24" fill="url(#${prefix}-${symbol==='O'?'red':'metal'})"/><text x="${x}" y="${y+8}" class="stability-atom-letter">${symbol}</text></g>`;
 const bond=(x1,y1,x2,y2,attributes='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="stability-atom-bond" ${attributes}/>`;
 let content='';
 if(trial.kind==='decomposition'){
  content=`<text x="155" y="28" text-anchor="middle" data-stability-left-name>氧化銀 Ag₂O</text><text x="430" y="28" text-anchor="middle" data-stability-right-name></text>
   ${[85,150].map(y=>bond(90,y,210,y,'data-stability-breaking')+atom(90,y,'Ag')+atom(150,y,'Ag')+atom(210,y,'O',`data-stability-moving="${y===85?0:1}"`)).join('')}
   ${bond(402,117,458,117,'data-stability-forming opacity="0"')}`;
 }else if(trial.kind==='unchanged-oxide'){
  content=`<text x="280" y="28" text-anchor="middle">氧化鎂 MgO</text>${[85,150].map(y=>bond(245,y,306,y)+atom(245,y,'Mg')+atom(306,y,'O')).join('')}`;
 }else{
  const metal=trial.element;
  content=`<text x="150" y="28" text-anchor="middle" data-stability-left-name>${metal==='Mg'?'鎂 Mg':'銀 Ag'}</text><text x="430" y="28" text-anchor="middle" data-stability-right-name>氧氣 O₂</text>
   ${[85,150].map(y=>bond(150,y,211,y,'data-stability-forming opacity="0"')+atom(150,y,metal)).join('')}
   ${bond(402,117,458,117,'data-stability-breaking')}
   ${[402,458].map((x,i)=>atom(x,117,'O',`data-stability-moving="${i}"`)).join('')}`;
 }
 return `<svg class="stability-oxygen" viewBox="0 0 560 220" role="img" aria-label="${trial.label}加熱時的氧原子組成示意"><defs><radialGradient id="${prefix}-red"><stop stop-color="#f7c1b2"/><stop offset=".5" stop-color="#ce5144"/><stop offset="1" stop-color="#842821"/></radialGradient><radialGradient id="${prefix}-metal"><stop stop-color="#e1eae6"/><stop offset=".5" stop-color="#9fb5b3"/><stop offset="1" stop-color="#536e73"/></radialGradient></defs>${content}<text x="280" y="204" text-anchor="middle" class="stability-oxygen-note" data-stability-oxygen-note>${trial.oxygenBefore}</text></svg>`;
}
function paintOxygen(panel,trial,frame,reduced){
 if(!panel.querySelector('.stability-oxygen-card'))return;
 const motion=reduced?(frame.complete&&trial.reacts?1:0):frame.oxygen;
 panel.querySelectorAll('[data-stability-moving]').forEach((ball,i)=>{
  const [x,y]=trial.kind==='decomposition'?[(i===0?192:248)*motion,(i===0?32:-33)*motion]:[(-191-i*56)*motion,(-32+i*65)*motion];
  ball.setAttribute('transform',`translate(${x} ${y})`);
 });
 panel.querySelectorAll('[data-stability-breaking]').forEach(b=>b.setAttribute('opacity',String(1-motion)));
 panel.querySelectorAll('[data-stability-forming]').forEach(b=>b.setAttribute('opacity',String(motion)));
 const left=panel.querySelector('[data-stability-left-name]'),right=panel.querySelector('[data-stability-right-name]');
 if(trial.kind==='formation'){
  left.textContent=motion===1?'氧化鎂 MgO':'鎂 Mg';right.textContent=motion===1?'':'氧氣 O₂';
 }else if(trial.kind==='decomposition'){
  left.textContent=motion===1?'銀 Ag':'氧化銀 Ag₂O';right.textContent=motion>0?'氧氣 O₂':'';
 }
 panel.querySelector('[data-stability-oxygen-note]').textContent=frame.complete?trial.oxygenAfter:frame.progress>=.32?trial.oxygenDuring:trial.oxygenBefore;
}
export function stabilityMarkup(){
 return `${storyDialogue('「阿公，我們剛剛看到活性大的鎂很容易就燒起來了，那氧化鎂也一樣嗎？」','「元素和它的氧化物，是不同的物質喔！<br>活性大的物質，氧化之後會變安定，例如鎂。<br>活性小的物質，氧化之後反而會變不安定，例如銀。<br>我們來用鎂跟銀做比較看看。」')}
 <section class="stability-studio" aria-label="比較鎂、氧化鎂、銀與氧化銀的加熱結果" data-glossary-skip>
 <header class="stability-toolbar"><b>對氧活性：鎂 Mg ＞ 銀 Ag</b><button type="button" class="card-reset" data-stability-reset>↺ 重設本卡</button></header>
 <div id="stability-panel" class="stability-shared-view" data-stability-panel>
  <div class="stability-tabs" role="tablist" aria-label="選擇元素或氧化物的比較">${stabilityPairs.map((pair,i)=>`<button type="button" role="tab" id="stability-tab-${pair.id}" data-stability-tab="${pair.id}" aria-controls="stability-pair-${pair.id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${pair.id==='elements'?'1 元素：鎂與銀':'2 氧化物：氧化鎂與氧化銀'}</button>`).join('')}</div>
  ${stabilityPairs.map((pair,i)=>`<section id="stability-pair-${pair.id}" role="tabpanel" aria-labelledby="stability-tab-${pair.id}" data-stability-pair="${pair.id}" ${i?'hidden':''}>
   <div class="stability-playbar"><b>${pair.title}</b><div><button type="button" class="primary" data-stability-play>▶ 同時開始加熱</button><button type="button" class="secondary" data-stability-pause disabled>暫停</button></div></div>
   <div class="stability-shared-layout">${sharedBench(pair)}<div class="stability-detail-pair">${pair.trials.map(id=>pairedObservation(stabilityTrials.find(t=>t.id===id))).join('')}</div></div>
   <div class="stability-trial-result" data-stability-result hidden>${storySpeech('grandpa',pair.id==='elements'?'「鎂的活性大，較不安定，加熱後會被氧化成氧化鎂。<br>銀的活性小，較安定，加熱後不反應。」':'「鎂原本很不安定，但氧化鎂卻很安定。<br>銀原本很安定，但氧化銀卻很不安定，加熱後就會失去氧。」')}</div>
  </section>`).join('')}
 </div>
 <section class="stability-conclusion" data-stability-conclusion hidden aria-label="四種物質的比較結果"><h3>元素和它的氧化物，特性不同</h3>
 <div class="stability-table-scroll"><table><thead><tr><th>對氧活性</th><th>元素加熱後</th><th>氧化物加熱後</th></tr></thead><tbody>
 <tr><th scope="row">鎂 Mg：活性大</th><td><b>鎂不安定</b><br>易氧化成氧化鎂</td><td><b>氧化鎂很安定</b><br>不易還原回去變回鎂</td></tr>
 <tr><th scope="row">銀 Ag：活性小</th><td><b>銀很安定</b><br>不易氧化成氧化銀</td><td><b>氧化銀不安定</b><br>易還原回去變回銀</td></tr></tbody></table></div>
 </section></section>
 ${notebookMarkup('stability')}`;
}

function sharedBench(pair){
 const bench='./assets/affinity-lab/paired-heating-bench-v1.png';
 return `<figure class="stability-shared-bench"><div class="stability-bench-labels">${pair.trials.map(id=>`<b>${stabilityTrials.find(t=>t.id===id).label}</b>`).join('')}</div><div class="stability-shared-photo" role="img" aria-label="同一張實驗桌上，兩組坩堝、三腳架與本生燈並排加熱">
  <img class="stability-bench-plate" src="${bench}" alt="" draggable="false">
  ${pair.trials.map((id,i)=>{const t=stabilityTrials.find(t=>t.id===id);return `<div class="stability-heating-station station-${i}" data-stability-station="${id}" style="--reaction-change:0"><div class="free-crucible-fill"><div data-free-before>${material(t.materials[0],id+'-bench-before')}</div><div data-free-after>${material(t.materials[1],id+'-bench-after')}</div></div><div class="stability-shared-flame" data-stability-flame><img src="${affinityBenchArt.flame}" alt="" draggable="false"></div><div class="stability-reaction-glow" data-stability-glow></div></div>`;}).join('')}
  <img class="stability-bench-front" src="${bench}" alt="" aria-hidden="true" draggable="false">
  <b class="stability-phase" data-stability-phase>加熱前</b>
 </div>${pair.id==='elements'?'':`<figcaption>${pair.trials.map(id=>`<p data-stability-bench-caption="${id}">${stabilityTrials.find(t=>t.id===id).before}</p>`).join('')}</figcaption>`}</figure>`;
}

function pairedObservation(t){
 const [before,after]=t.materials,p=t.id;
 return `<section class="stability-case" data-stability-case="${p}"><h4>${t.label}</h4>
   <section class="stability-before-after"><h4>物質的前後變化</h4><div>${specimenDish(before,'加熱前',p+'-compare-before')}<figure class="stability-dish"><div class="free-specimen-dish"><img class="free-dish-photo" src="${affinityBenchArt.dish}" alt="" draggable="false"><div class="free-dish-contents"><div data-stability-before-mixture>${material(before,p+'-compare-live-before')}</div><div data-stability-after-mixture>${material(after,p+'-compare-live-after')}</div></div></div><figcaption data-stability-result-label>加熱前</figcaption></figure></div></section>
   <p class="stability-case-equation" data-stability-equation hidden>${t.id==='heat-mg'?'<b class="stability-reaction-label">有反應</b>':''}${t.equation}</p></section>`;
}

export function mountOxideStability(root,addQuestion){
 const storageKey='lost-forge-oxide-stability-v2';
 let s=restoreStability(null),clock=null,paused=false,running=false;
 try{s=restoreStability(JSON.parse(localStorage.getItem(storageKey)));}catch{}
 root.innerHTML=stabilityMarkup();
 const panel=root.querySelector('[data-stability-panel]'),conclusion=root.querySelector('[data-stability-conclusion]');
 let selected=stabilityPairs.find(p=>p.trials.includes(s.selected))?.id||'elements';
 const progress=Object.fromEntries(stabilityPairs.map(p=>[p.id,p.trials.every(id=>s.observed.includes(id))?1:0]));
 const pairView=id=>panel.querySelector('[data-stability-pair="'+id+'"]');
 const syncQuiz=addQuestion({id:'practice-oxide-stability',label:chapterNumber('oxide-stability')+' · 氧化物的安定性',source:'#oxide-stability',quiz:stabilityQuiz,onAnswer:answer=>{if(stabilityReady(s)){s.answer=answer;save();}}});
 function save(){
  try{localStorage.setItem(storageKey,JSON.stringify(s));}catch{}
  const observed=stabilityReady(s);conclusion.hidden=!observed;
  syncQuiz(s.answer,observed,'觀察兩組比較：鎂與銀、氧化鎂與氧化銀');
  root.dispatchEvent(new CustomEvent('oxide-stability-progress',{bubbles:true,detail:{observed,mastered:observed&&s.answer===stabilityQuiz.answer}}));
 }
 function controls(){
  const view=pairView(selected),play=view.querySelector('[data-stability-play]'),pause=view.querySelector('[data-stability-pause]');
  play.disabled=running;play.textContent=progress[selected]===1?'↻ 重播這組比較':progress[selected]>0?'▶ 繼續加熱比較':'▶ 同時開始加熱';
  pause.disabled=!running;pause.textContent=paused?'繼續觀察':'暫停';pause.setAttribute('aria-pressed',String(paused));
  panel.classList.toggle('is-paused',paused);
 }
 function paint(id,p){
  progress[id]=p;const group=pairView(id);group.dataset.phase=p===1?'complete':p===0?'ready':'playing';
  for(const trialId of stabilityPairs.find(pair=>pair.id===id).trials){
   const t=stabilityTrials.find(trial=>trial.id===trialId),f=stabilityFrame(t.id,p),view=group.querySelector('[data-stability-case="'+t.id+'"]'),station=group.querySelector('[data-stability-station="'+t.id+'"]');
   station.style.setProperty('--reaction-change',String(f.change));
   view.querySelector('[data-stability-after-mixture]').style.opacity=String(f.change);
   view.querySelector('[data-stability-before-mixture]').style.opacity=String(1-f.change);
   station.querySelector('[data-stability-flame]').style.opacity=String(f.heat);
   station.querySelector('[data-stability-glow]').style.opacity=String(f.glow*.94);
   group.querySelector('[data-stability-phase]').textContent=f.stage;
   const caption=group.querySelector('[data-stability-bench-caption="'+t.id+'"]');if(caption)caption.textContent=f.complete?t.after:p<.32?t.before:t.during;
   view.querySelector('[data-stability-result-label]').textContent=p===0?'加熱前':f.complete?'冷卻後':'觀察中';
   view.querySelector('[data-stability-equation]').hidden=!f.complete;
   paintOxygen(view,t,f,matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  group.querySelector('[data-stability-result]').hidden=p!==1;
  if(p===1&&running&&id===selected){running=false;paused=false;clock?.pause();recordStabilityPair(s,id);save();}
  controls();
 }
 function visibility(){
  if(!clock)return;const rect=pairView(selected).getBoundingClientRect();
  clock.setActive(!document.hidden&&!document.querySelector('dialog[open]')&&rect.bottom>0&&rect.top<innerHeight);
 }
 for(const pair of stabilityPairs){const view=pairView(pair.id);
 view.querySelector('[data-stability-play]').onclick=()=>{
  clock?.dispose();paused=false;running=true;
  clock=createFoodPlayback({duration:12000,initialTime:progress[selected]===1?0:progress[selected]*4,onTime:value=>paint(pair.id,value/4)});visibility();controls();
 };
 view.querySelector('[data-stability-pause]').onclick=()=>{paused=!paused;if(paused)clock?.pause();else clock?.resume();controls();};
 }
 function select(id){
  clock?.dispose();clock=null;running=false;paused=false;selected=id;s.selected=stabilityPairs.find(p=>p.id===id).trials[0];
  for(const tab of panel.querySelectorAll('[data-stability-tab]')){const active=tab.dataset.stabilityTab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;pairView(tab.dataset.stabilityTab).hidden=!active;}
  controls();save();
 }
 const tabs=[...panel.querySelectorAll('[data-stability-tab]')];
 tabs.forEach((tab,i)=>{tab.onclick=()=>select(tab.dataset.stabilityTab);tab.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;select(tabs[next].dataset.stabilityTab);tabs[next].focus();};});
 root.querySelector('[data-stability-reset]').onclick=()=>{clock?.dispose();clock=null;running=false;paused=false;s=restoreStability(null);for(const pair of stabilityPairs)paint(pair.id,0);select('elements');};
 const modal=new MutationObserver(visibility);modal.observe(document.body,{attributes:true,attributeFilter:['open'],subtree:true,childList:true});
 window.addEventListener('scroll',visibility,{passive:true});document.addEventListener('visibilitychange',visibility);
 window.addEventListener('pagehide',()=>{clock?.dispose();modal.disconnect();window.removeEventListener('scroll',visibility);document.removeEventListener('visibilitychange',visibility);},{once:true});
 for(const pair of stabilityPairs)paint(pair.id,progress[pair.id]);select(selected);
}
