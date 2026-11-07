import {furnaceNextAction} from './furnace-guidance.js';
import {bindDrop} from './direct-manipulation.js';
import {scopeMarkup} from './card-markup.js';
import {factoryArt,factoryRawMaterial} from './factory-art.js';
import {createMoltenFlow} from './molten-flow.js';
import {createFactoryAtmosphere} from './factory-atmosphere.js';
export const furnaceZones=[
 ['charge','原料入爐','送料與預熱',[132,291],[15,28],'鐵礦石 ＋ 焦炭 ＋ 石灰石','原料由爐頂加入，向下移動並預熱。','ore'],
 ['burn','焦炭燃燒','熱從哪裡來？',[450,468],[85,14],'C + O₂ → CO₂ ＋ 熱','焦炭與熱風中的氧反應，生成 CO₂ 並放熱。','heat'],
 ['co','生成 CO','建立還原氣體',[450,381],[85,21.5],'CO₂ + C → 2CO','高溫下，CO₂ 與焦炭生成 CO，供還原鐵礦。','heat'],
 ['reduce','還原鐵礦','氧轉移到哪裡？',[450,263],[85,29],'Fe₂O₃ + 3CO → 2Fe + 3CO₂','高溫下，CO 得到氧變成 CO₂；氧化鐵失去氧，留下鐵。','iron'],
 ['lime','石灰石分解','先形成 CaO',[450,324],[85,36.5],'CaCO₃ → CaO + CO₂','石灰石受熱分解，生成 CaO 與 CO₂。','limeHeat'],
 ['slag','形成熔渣','雜質的去處',[451,518],[85,44],'CaO + SiO₂ → CaSiO₃','鐵礦石除了氧化鐵，還夾帶二氧化矽 SiO₂ 等雜質。石灰石分解產生的 CaO 與 SiO₂ 反應，形成熔渣。','slag'],
 ['slagTap','出渣口','較高出口',[584,514],[85,51.5],'熔渣在上層 → 排出','熔渣浮在鐵水上，由較高出口排出。','slag'],
 ['ironTap','出鐵口','較低出口',[630,561],[85,59],'下層含碳鐵水 → 生鐵','含碳鐵水由較低出口排出，得到生鐵。','iron']
].map(([id,name,tag,at,pos,formula,text,need])=>({id,name,tag,at,pos,formula,text,need}));
export function furnaceState(feeds){const heat=feeds.has('coke')&&feeds.has('air'),iron=heat&&feeds.has('ore'),slag=iron&&feeds.has('lime');return {heat,iron,slag};}
export function mountFurnace(root,c,{record,notice,delay,onCleanup}){
 const loaded=new Set();let heldFeed=null;let loading=null,selected='charge',autoPlaying=false,tour=0,alive=true,running=false,completed=false,step=-1,furthest=-1;root.dataset.furnaceFeeds='';root.dataset.furnaceLoading='';
 const labels={ore:'① 鐵礦石',coke:'② 焦炭',air:'③ 熱風管',lime:'③ 石灰石'},col={ore:'#9a6047',coke:'#303b38',lime:'#c5bda3'},hint={ore:'含 Fe₂O₃、雜質',coke:'供熱與 CO 來源',air:'接到風口',lime:'形成熔渣除雜'};
 const feedNames={ore:'鐵礦石',coke:'焦炭',lime:'石灰石'};
 const air=`<svg viewBox="0 0 140 74" aria-hidden="true"><defs><linearGradient id="air-token"><stop stop-color="#273f47"/><stop offset=".36" stop-color="#b4c3bb"/><stop offset=".56" stop-color="#56747a"/><stop offset="1" stop-color="#1d363f"/></linearGradient></defs><path d="M15 42H75Q95 42 95 20V10" fill="none" stroke="url(#air-token)" stroke-width="23"/><path d="M23 26V57M66 26V57M78 8H113" stroke="#98aea5" stroke-width="5"/><path d="M9 42H65" stroke="#d6bc7b" stroke-width="2" stroke-dasharray="7 5"/></svg>`;
 root.innerHTML=scopeMarkup(`<section class="factory-simulator" aria-label="現代高爐互動工廠"><header class="factory-topline"><div><span>BLAST FURNACE</span><b>讓整座高爐運作起來</b></div><span class="factory-live" data-factory-live>待投料</span></header><div class="factory-feed-rack" aria-label="可拖曳原料">${['ore','coke','lime'].map(k=>`<button type="button" class="factory-feed" data-feed="${k}" aria-label="${labels[k]}，${hint[k]}" title="${hint[k]}">${k==='air'?air:factoryRawMaterial(k)}<span>${labels[k]}</span><span class="factory-feed-state" data-feed-state></span></button>`).join('')}</div><div class="factory-jobs" aria-label="高爐的三項工作"><span data-furnace-job="heat"><b>供熱</b>焦炭與熱風</span><span data-furnace-job="reduce"><b>還原</b>CO 取得氧</span><span data-furnace-job="slag"><b>除雜</b>石灰石形成熔渣</span></div><div class="factory-layout"><div class="factory-stage"><div class="factory-visual">${factoryArt()}<canvas class="factory-atmosphere" aria-hidden="true"></canvas><canvas class="factory-molten" aria-hidden="true"></canvas><button type="button" class="factory-charge-target drop-target" data-charge-target><span data-charge-label>送料車 ↓</span></button><button class="factory-heater" data-factory-heat disabled aria-label="原料齊備後，從熱風管啟動加熱">加熱</button>${furnaceZones.map((z,i)=>`<button class="factory-hotspot" data-zone="${z.id}" aria-pressed="false" disabled style="left:${z.pos[0]}%;top:${z.pos[1]}%"><i>${i+1}</i><span>${z.name}<small>${z.tag}</small></span></button>`).join('')}</div><div class="factory-motion-controls" role="group" aria-label="控制高爐觀察步驟"><button type="button" data-factory-previous disabled>← 上一步</button><button type="button" data-factory-next disabled>下一步 →</button><button type="button" data-factory-pause disabled>自動播放</button><button type="button" data-factory-replay disabled>從頭觀察</button></div></div><aside class="factory-panel" aria-live="polite" aria-atomic="true"><span class="factory-panel-kicker" data-zone-kicker></span><h3 data-zone-title></h3><p class="factory-equation" data-zone-equation></p><p data-zone-description></p><div class="factory-requirement" data-zone-requirement></div><div class="factory-product-status"><div><i class="iron-dot"></i><span>含碳鐵水</span><b data-iron-status>尚未形成</b></div><div><i class="slag-dot"></i><span>熔渣分離</span><b data-slag-status>尚未形成</b></div></div><p class="factory-next-hint">看完一步，按「下一步」繼續。也可選自動播放。</p></aside></div><p class="factory-message" aria-live="polite"></p></section>`,'industrial-furnace');
 const sim=root.querySelector('.factory-simulator'),visual=root.querySelector('.factory-visual'),message=root.querySelector('.factory-message'),ring=root.querySelector('[data-zone-ring]'),fx=createFactoryAtmosphere(root.querySelector('.factory-atmosphere'));
 const focus=document.createElement('button');focus.className='studio-enter';focus.textContent='進入高爐，查看原料與整座廠房 ↘';focus.addEventListener('click',()=>sim.scrollIntoView({block:'start',behavior:'instant'}));root.prepend(focus);
 const live=document.createElement('p');live.className='factory-live-equation';live.innerHTML='<small></small><b></b>';visual.append(live);
 // Reading order is separate from physical reaction height; the leader locates the selected step.
 const guide=document.createElement('div');guide.className='factory-step-guide';guide.innerHTML='<svg viewBox="0 0 900 650" aria-hidden="true"><path class="factory-step-rail" d="M765 91V383.5"/><path data-zone-leader/><circle data-zone-point r="4"/></svg>';visual.append(guide);
 const leader=guide.querySelector('[data-zone-leader]'),point=guide.querySelector('[data-zone-point]');

 const molten=createMoltenFlow(root.querySelector('.factory-molten'));sim.classList.toggle('molten-ready',!!molten);
 const heatButton=root.querySelector('[data-factory-heat]'),pauseButton=root.querySelector('[data-factory-pause]'),replayButton=root.querySelector('[data-factory-replay]'),panel=root.querySelector('.factory-panel');
 const previousButton=root.querySelector('[data-factory-previous]'),nextButton=root.querySelector('[data-factory-next]');
 const chargeTarget=root.querySelector('[data-charge-target]');
 const chargeLabel=root.querySelector('[data-charge-label]');
 const say=t=>{message.textContent=t;notice(t);};
 const resizeTokens=()=>sim.style.setProperty('--feed-size',Math.max(36,Math.min(86,visual.getBoundingClientRect().width*.11))+'px');
 const tokenObserver=new ResizeObserver(resizeTokens);tokenObserver.observe(visual);resizeTokens();onCleanup(()=>tokenObserver.disconnect());
 const ready=()=>['ore','coke','lime'].every(k=>loaded.has(k))&&!loading;
 onCleanup(()=>{alive=false;tour++;fx?.dispose();molten?.dispose();});
 function guideNext(){
  root.querySelectorAll('.factory-guided').forEach(el=>{el.classList.remove('factory-guided');el.removeAttribute('data-next-label');});
  pauseButton.setAttribute('aria-label',pauseButton.textContent);replayButton.setAttribute('aria-label',replayButton.textContent);
  const next=step>=0?(autoPlaying?{id:'observe',label:'觀看亮起的步驟'}:step<7?{id:'step',label:'看完按下一步'}:{id:'replay',label:'從頭觀察'}):furnaceNextAction({loaded:[...loaded],loading,held:heldFeed,step});sim.dataset.nextAction=next.id;
  let tool=next.id==='feed'?root.querySelector('[data-feed="'+next.feed+'"]'):next.id==='charge'?root.querySelector('[data-charge-target]'):next.id==='heat'?heatButton:next.id==='step'?nextButton:next.id==='replay'?replayButton:next.id==='observe'&&step>=0?root.querySelector('[data-zone="'+furnaceZones[step].id+'"]'):null;
  if(tool){tool.classList.add('factory-guided');tool.dataset.nextLabel=next.label;}
  for(const el of root.querySelectorAll('[data-feed]')){
   const k=el.dataset.feed, delivered=loaded.has(k);
   el.setAttribute('aria-pressed',String(heldFeed===k));
   el.disabled=Boolean(loading)||running||completed||delivered;
   el.classList.toggle('feed-loading',loading===k);
   el.classList.toggle('feed-loaded',delivered);
   el.querySelector('[data-feed-state]').textContent=loading===k?'送入中':delivered?'✓ 已入爐':'';
  }
  chargeTarget.disabled=Boolean(loading)||running||completed||ready();
  chargeLabel.textContent=loading?feedNames[loading]+'送入中':'送料車 ↓';
  chargeTarget.setAttribute('aria-label',loading?chargeLabel.textContent:'將選取的原料放入送料車');
 }
 function paint(){
  const heating=running||step>=1,iron=step>=3,slag=step>=5;
  root.dataset.furnaceFeeds=[...loaded].join(',');root.dataset.furnacePhase=completed?'complete':running?(autoPlaying?'running':'manual'):'loading';root.dataset.furnaceStep=String(step+1);
  for(const [k,v] of Object.entries({hasOre:loaded.has('ore'),hasCoke:loaded.has('coke'),hasLime:loaded.has('lime'),hasHeat:heating,hasIron:iron,hasSlag:slag,ironTapped:step>=7,slagTapped:step>=6,sequenceStarted:step>=0}))sim.dataset[k]=v;
  fx?.set(heating);molten?.set({iron,slag,ironTapped:step>=7,slagTapped:step>=6});heatButton.disabled=!ready()||running||completed;heatButton.classList.toggle('heater-ready',ready()&&!running&&!completed);heatButton.textContent='加熱';
  pauseButton.disabled=step<0;pauseButton.textContent=autoPlaying?'暫停自動播放':'自動播放';replayButton.disabled=step<0;previousButton.disabled=step<=0;nextButton.disabled=step<0||step>=7;
  nextButton.setAttribute('aria-label',step>=0&&step<7?'下一步，第 '+(step+2)+' 步 '+furnaceZones[step+1].name:'下一步');
  root.querySelector('[data-factory-live]').textContent=step>=0?(completed&&step===7?'1–8 觀察完成':(autoPlaying?'自動播放 ':'逐步觀察 ')+(step+1)+' / 8'):loading?feedNames[loading]+'送入中':ready()?'原料齊備 · 可以加熱':'先加入三種原料';
  root.querySelector('[data-iron-status]').textContent=step>=7?'由下層出口流出':iron?'爐內形成，等待出鐵':'尚未形成';
  root.querySelector('[data-slag-status]').textContent=step>=6?'由上層出口排出':slag?'浮在鐵水上，等待出渣':'尚未形成';
  guideNext();
 }
 function inspect(index){
  const z=furnaceZones[index];selected=z.id;root.querySelectorAll('[data-furnace-job]').forEach(el=>el.classList.toggle('current',el.dataset.furnaceJob===(index===0?'':index<3?'heat':index===3||index===7?'reduce':'slag')));
  for(const [i,b] of [...root.querySelectorAll('button[data-zone]')].entries()){b.setAttribute('aria-pressed',String(i===index));b.classList.toggle('is-done',i<=furthest);b.disabled=i>furthest;}
  root.querySelector('[data-zone-kicker]').textContent=String(index+1).padStart(2,'0')+' / 8 · '+z.tag;
  root.querySelector('[data-zone-title]').textContent=z.name;root.querySelector('[data-zone-equation]').textContent=z.formula;root.querySelector('[data-zone-description]').textContent=z.text;
  const req=root.querySelector('[data-zone-requirement]');req.textContent=index===6||index===7?'分層排出，沒有新的化學反應。':'';req.hidden=!req.textContent;req.classList.add('ready');
  visual.dataset.zone=z.id;const [x,y]=z.at,[sx,sy]=[z.pos[0]*9,z.pos[1]*6.5];leader.setAttribute('d',index===0?'M'+sx+' '+sy+'V'+(y-35)+'L'+x+' '+y:'M'+sx+' '+sy+'H630L'+x+' '+y);point.setAttribute('cx',x);point.setAttribute('cy',y);
  for(const [k,v] of Object.entries({cx:x,cy:y,rx:index===0?62:index>5?36:63,ry:index>5?21:43}))ring.setAttribute(k,v);
  panel.classList.remove('step-arriving');void panel.offsetWidth;panel.classList.add('step-arriving');
 }
 function stopAutomatic(){
  autoPlaying=false;
  tour++;
 }
 function showStep(index){
  step=index;
  furthest=Math.max(furthest,index);
  if(step===7){
   const firstCompletion=!completed;
   completed=true;
   running=false;
   stopAutomatic();
   if(firstCompletion)record('air');
  }
  paint();
  inspect(step);
  say(step===7?'觀察完成。焦炭供熱、CO 帶走氧，石灰石幫忙除雜；熔渣和生鐵分開排出。':'第 '+(step+1)+' 步，'+furnaceZones[step].name+'。看完後按下一步。');
 }
 function begin(restart=false){
  if(!ready()||running&&!restart)return;
  stopAutomatic();
  running=true;
  completed=false;
  furthest=-1;
  sim.classList.remove('factory-paused');
  showStep(0);
  sim.scrollIntoView({block:'start',behavior:'instant'});
 }
 function moveStep(index){
  if(step<0||index<0||index>7||index>furthest+1)return;
  stopAutomatic();
  showStep(index);
 }
 function toggleAutomatic(){
  if(step<0)return;
  if(autoPlaying){stopAutomatic();paint();return;}
  if(step===7)begin(true);
  autoPlaying=true;
  paint();
  const token=++tour;
  let last=performance.now(),elapsed=0;
  function tick(){
   if(!alive||token!==tour||!autoPlaying)return;
   const now=performance.now();
   if(!document.hidden)elapsed+=Math.min(now-last,500);
   last=now;
   if(elapsed>=6000){
    elapsed=0;
    showStep(step+1);
    if(!autoPlaying)return;
   }
   delay(tick,100);
  }
  delay(tick,100);
 }
 function addFeed(k){
  if(!k||loaded.has(k)||loading||running||completed)return;
  heldFeed=null;loading=k;root.dataset.furnaceLoading=k;sim.classList.add('charging');paint();
  say(feedNames[k]+'送入中。');
  delay(()=>{if(!alive)return;loaded.add(k);loading=null;root.dataset.furnaceLoading='';sim.classList.remove('charging');record(k);paint();say(feedNames[k]+'已入爐。'+(ready()?'原料齊備，可以加熱。':'拿取下一種原料。'));},1900);
 }
 for(const item of root.querySelectorAll('[data-feed]')){const k=item.dataset.feed;
  bindDrop(item,chargeTarget,{disabled:()=>loaded.has(k)||loading||running||completed,highlightOnPickup:false,onMove:()=>{if(!loading&&!running&&!completed&&!loaded.has(k)){heldFeed=k;guideNext();}},onDrop:()=>addFeed(k),onMiss:()=>{heldFeed=null;paint();say('把原料放進送料車，或先點原料再點送料車。');}});
  item.addEventListener('click',()=>{if(loaded.has(k)||loading||running||completed)return;heldFeed=heldFeed===k?null:k;paint();});
 }
 chargeTarget.addEventListener('click',()=>addFeed(heldFeed));
 heatButton.addEventListener('click',()=>begin());replayButton.addEventListener('click',()=>begin(true));
 previousButton.addEventListener('click',()=>moveStep(step-1));nextButton.addEventListener('click',()=>moveStep(step+1));
 pauseButton.addEventListener('click',toggleAutomatic);
 for(const [i,b] of [...root.querySelectorAll('button[data-zone]')].entries())b.addEventListener('click',()=>{if(i<=furthest)moveStep(i);});
 root.querySelector('[data-zone-kicker]').textContent='準備開始';root.querySelector('[data-zone-title]').textContent='先備料，再加熱';root.querySelector('[data-zone-equation]').textContent='鐵礦石 ＋ 焦炭 ＋ 石灰石';root.querySelector('[data-zone-description]').textContent='加入三種原料，再按「加熱」。';root.querySelector('[data-zone-requirement]').hidden=true;paint();say('把鐵礦石、焦炭與石灰石拖進送料車；原料齊備後即可加熱。');
}
