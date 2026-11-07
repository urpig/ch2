import {activitySamples,activityReaction,metalConditions} from './metal-activity-model.js';
import {specimenArt} from './oxygen-affinity.js';
import {affinityBenchArt} from './affinity-appearance.js';
import {bindReactantPickup} from './life-reactant-drag.js';
import {playActivitySpray} from './activity-spray.js';
import {storySpeech} from './story-dialogue.js';

const names=Object.fromEntries(activitySamples.map(({symbol,name})=>[symbol,name]));
const conditionLabel=id=>metalConditions.find(item=>item.id===id).label;
const sameTrial=(a,b)=>a?.symbol===b?.symbol&&a?.condition===b?.condition;
const spriteOrder=['K','Na','Ca','Mg','Al','C','Zn','Cr','Fe','Sn','Pb','Cu','Hg','Ag','Pt','Au'];
const liquidColors={cloudy:'#edf4ef',blue:'#48b9ee',green:'#53bdab',gold:'#ffd449'};
const bubbleCounts={rapid:27,violent:32,cloudy:14,gas:12,slow:5};
const remaining={rapid:0,violent:0,cloudy:0,gas:0,slow:.62,dissolve:0,'slow-dissolve':.65,brown:0,blue:0,green:0,gold:0};
const hazardLabels={
 'water-reactive':'快速放熱 · 有起火或噴濺風險',
 'acid-splash':'酸液可能劇烈噴濺'
};
// NOAA CAMEO Chemicals lists sodium–hydrochloric acid explosions without specifying the concentration.
const hasIncidentDemo=trial=>trial.symbol==='Na'&&trial.condition==='dilute';
// Cut the flying glass from the rim and sidewalls of the intact beaker photo.
const glassFragments=[
 {outline:'33.5% 30%,36.9% 25.4%,44% 24.3%,41.5% 27.6%,37.5% 28.4%,35.1% 31.8%',pivot:'38.8% 27.4%',x:-30,rise:-21,land:47,spin:-156},
 {outline:'52.5% 24.2%,59.5% 24.8%,63.2% 26.6%,62.3% 28.9%,57% 27.2%,53.6% 27.1%',pivot:'58.6% 26.6%',x:31,rise:-24,land:51,spin:177},
 {outline:'36.5% 34.8%,40.5% 31.2%,41.5% 41.6%,38.2% 47.1%,36.5% 44.8%',pivot:'38.4% 39.1%',x:-26,rise:-16,land:41,spin:-115},
 {outline:'56.1% 35.4%,62.4% 31.1%,62.6% 43.7%,59.8% 50.3%,56.7% 45.9%',pivot:'59.8% 41%',x:27,rise:-19,land:38,spin:122},
 {outline:'36.8% 56.9%,41.9% 59.7%,40.4% 68.6%,37.1% 72.3%',pivot:'38.7% 63.7%',x:-34,rise:-27,land:21,spin:-160},
 {outline:'57.6% 57.5%,62.6% 56.4%,62.5% 67.5%,59.3% 70.8%,55.6% 65.3%',pivot:'59.6% 63.1%',x:34,rise:-27,land:21,spin:168}
];

function sampleSprite(symbol){
 const index=spriteOrder.indexOf(symbol);
 if(index===-1)return '';
 return `<span class="activity-specimen" style="--specimen-col:${index%4};--specimen-row:${Math.floor(index/4)}"></span>`;
}

function safetyNote(condition,symbol,incident=false){
 if(incident)return '爆炸風險示意 · 酸液與碎片可能飛散';
 const hazard=symbol?activityReaction(symbol,condition).hazard:null;
 if(hazard)return `危險示意 · ${hazardLabels[hazard]}`;
 return condition==='concentrated'||condition==='aqua'?'強腐蝕性 · 僅限螢幕模擬':'';
}

function liquidBurst(incident){
 const shards=incident?glassFragments.map(({outline,pivot,x,rise,land,spin},index)=>
  `<i class="activity-glass-fragment" style="--glass-outline:polygon(${outline});--glass-pivot:${pivot};--glass-x:${x}%;--glass-rise:${rise}%;--glass-land:${land}%;--glass-spin:${spin}deg;--glass-flight:${860+index%3*75}ms"></i>`
 ).join(''):'';
 return `<div class="activity-burst${incident?' is-rupturing':''}">
  <span class="activity-burst-impact"></span>
  <span class="activity-burst-mist"><i></i><i></i><i></i></span>
  <canvas class="activity-splash" data-activity-splash></canvas>${shards}</div>`;
}

function sceneEffects(condition,trial,phase,incident=false){
 const result=trial?activityReaction(trial.symbol,condition):null;
 const effect=result?.effect;
 const hazard=result?.hazard;
 const underway=phase==='running';
 const showChange=underway||phase==='after';
 const surface=hazard==='water-reactive';
 const sample=trial&&sampleSprite(trial.symbol);
 const showForceps=sample&&trial.symbol!=='Hg'&&phase!=='after';
 const melts=surface&&trial.symbol==='Na'&&underway;
 const tinted=showChange?liquidColors[effect]:null;
 const bubbles=underway&&!incident?(bubbleCounts[effect]||0):0;
 const fumes=underway&&['blue','brown'].includes(effect);
 const phaseChange=underway&&tinted;
 const shrink=remaining[effect]??1;
 return `
  ${incident&&showChange?'<span class="activity-broken-beaker" data-activity-broken></span>':''}
  ${incident?'':`<span class="activity-liquid${tinted?' is-tinted':''}${condition==='aqua'?' is-aqua':''}"${tinted?` style="--activity-liquid-color:${tinted}"`:''}></span>`}
  ${sample?`<span class="activity-material${surface?' floats':''}${incident?' is-scattering':''}${melts?' is-melting':''}${showChange&&effect==='coating'?' is-coated':''}" style="--activity-sample-after:${shrink};--activity-sample-opacity:${shrink===0?0:1}">${sample}${melts?'<span class="activity-molten-sodium"></span>':''}</span>`:''}
  ${phaseChange?`<span class="activity-diffusion" style="--diffusion-color:${tinted}"><i></i><i></i></span>`:''}
  ${showForceps?'<span class="activity-forceps"></span>':''}
  ${sample&&underway&&!incident?'<span class="activity-ripple"><i></i><i></i></span>':''}
  ${bubbles?`<span class="activity-bubbles${surface?' floats':''}">${Array.from({length:bubbles},(_,i)=>`<i style="--bubble-x:${42+i*17%19}%;--bubble-size:${2+i%7*.61}px;--bubble-drift:${(i*27%40)-20}px;--bubble-rise:${78+i*7%26}%;--bubble-delay:${540+i*39}ms;--bubble-time:${480+i%5*86}ms"></i>`).join('')}</span>`:''}
  ${underway&&surface&&trial.symbol==='K'?`<img class="activity-potassium-flame" src="${affinityBenchArt.flame}" alt="" draggable="false">`:''}
  ${fumes?'<span class="activity-fumes"><i></i><i></i><i></i><i></i><i></i></span>':''}
  ${sample&&showChange&&!incident?'<span class="activity-glass-glint"></span>':''}
  ${underway&&hazard==='acid-splash'?liquidBurst(incident):''}`;
}

function observationMarkup(trial,phase,incident=false){
 if(!trial)return '<b>觀察樣本和器皿裡的變化</b><p>留意氣泡、顏色和樣本外觀。</p>';
 const {symbol,condition}=trial;
 const sample=names[symbol]+' '+symbol;
 const result=activityReaction(symbol,condition);
 if(incident)return '<b>鈉接觸鹽酸 · 爆炸風險示意</b><p>安全資料記載鈉接觸鹽酸曾發生爆炸，反應強弱會隨條件改變。畫面示意嚴重時酸液噴濺、玻璃破裂的風險。</p>';
 if(phase==='after')return `<b>${sample} · ${result.label}</b><p>${result.observation}</p>${hasIncidentDemo(trial)?'<button type="button" data-activity-incident>觀看爆炸風險示意</button>':''}`;
 if(phase==='running')return `<b>正在觀察 ${sample} ＋ ${conditionLabel(condition)}</b>`;
 return `<b>加入前 · ${sample}</b>`;
}

function benchActions(phase,incident=false){
 return `<button type="button" data-activity-before>${incident?'回到一般觀察':phase==='before'?'看觀察結果':'回看加入前'}</button>
  <button type="button" data-activity-replay>↻ ${incident?'重播風險示意':'重播觀察'}</button>`;
}

function shownTrial(s){
 const latest=s.activityRecords[0];
 return latest?.condition===s.activityCondition?latest:null;
}

export function metalActivityMarkup(s){
 const condition=s.activityCondition;
 const trial=shownTrial(s);
 const phase=trial?'after':'ready';
 const safety=safetyNote(condition,trial?.symbol);
 return `<div class="metal-activity">
  <div class="inquiry-question"><p aria-label="元素對氧活性排列"><strong>活性大小：</strong>鉀 ＞ 鈉 ＞ 鈣 ＞ 鎂 ＞ 鋁 ＞ 碳 ＞ 鋅 ＞ 鉻 ＞ 鐵 ＞ 錫 ＞ 鉛 ＞ 氫 ＞ 銅 ＞ 汞 ＞ 銀 ＞ 鉑 ＞ 金</p></div>
  ${storySpeech('grandpa','「活性大的物質，如鉀、鈉，遇到冷水就會反應。有些活性較小的金屬要用酸，像金就要用王水才能溶解喔！接下來，我先示範把鉀放到冷水裡。」')}
  <p><button type="button" class="primary" data-activity-demo>▶ 看阿公示範：鉀 ＋ 冷水</button></p>
  <section class="activity-bench" aria-label="元素活性比較實驗">

   <div class="activity-controls">
    <h5><span>1</span> 選反應條件</h5>
    <div class="activity-conditions" role="group" aria-label="選擇反應條件">${metalConditions.map((item,i)=>`<button type="button" data-activity-condition="${item.id}" aria-pressed="${item.id===condition}"><small aria-hidden="true">${s.activitySeen.includes(item.id)?'✓':String(i+1).padStart(2,'0')}</small><span>${item.name}</span></button>`).join('')}</div>
   </div>
   <div class="activity-workspace">
    <div class="activity-shelf">
     <div class="activity-shelf-head"><h5><span>2</span> 放入樣本</h5><div class="activity-rack-nav" aria-label="瀏覽樣本"><button type="button" data-rack-back aria-label="前一批樣本">‹</button><button type="button" data-rack-forward aria-label="下一批樣本">›</button></div></div>
     <p class="activity-pick-help">拖進燒杯，或先點樣本再點燒杯。</p>
     <div class="activity-rack" role="group" aria-label="元素樣本">${activitySamples.map(({symbol,name})=>`<button class="activity-pick" type="button" data-activity-sample="${symbol}" aria-label="${name} ${symbol}" aria-pressed="false"><span class="activity-pick-photo">${specimenArt(symbol)}</span><span class="activity-pick-name"><b>${name}</b> ${symbol}</span><span class="activity-lift-art" aria-hidden="true">${sampleSprite(symbol)||specimenArt(symbol)}</span></button>`).join('')}</div>
    </div>
    <section class="activity-stage" data-activity-stage data-phase="${phase}" aria-label="觀察台">
     <header class="activity-stage-head">
      <div class="activity-stage-title"><small>觀察台</small><b>玻璃燒杯 · ${conditionLabel(condition)}</b></div>
      <div class="activity-stage-controls"><span data-activity-phase>${trial?'觀察結果':'等待樣本'}</span><div class="activity-actions" data-activity-actions ${trial?'':'hidden'}>${benchActions(phase)}</div></div>
     </header>
     <div class="activity-camera">
      <div class="activity-effects" data-activity-effects aria-hidden="true">${sceneEffects(condition,trial,phase)}</div>
      <button type="button" class="activity-target" data-activity-target aria-label="把樣本放入燒杯" aria-describedby="activity-observation"><span>放入燒杯 ↓</span></button>
      <span class="activity-hazard" data-activity-hazard ${safety?'':'hidden'}>${safety}</span>
     </div>
     <div class="activity-readout">
      <div id="activity-observation">${observationMarkup(trial,phase)}</div>
      <p class="activity-live" data-activity-message role="status"></p>
     </div>
    </section>
   </div>
  </section>
 </div>`;
}

export function bindMetalActivity(root,s,update,{demo=false}={}){
 const stage=root.querySelector('[data-activity-stage]');
 const target=stage.querySelector('[data-activity-target]');
 const effects=stage.querySelector('[data-activity-effects]');
 const camera=stage.querySelector('.activity-camera');
 const observation=stage.querySelector('#activity-observation');
 const hazardBadge=stage.querySelector('[data-activity-hazard]');
 const phaseLabel=stage.querySelector('[data-activity-phase]');
 const actions=stage.querySelector('[data-activity-actions]');
 const rack=root.querySelector('.activity-rack');
 const status=stage.querySelector('[data-activity-message]');
 const picks=[...rack.querySelectorAll('[data-activity-sample]')];
 const nav=[root.querySelector('[data-rack-back]'),root.querySelector('[data-rack-forward]')];
 const condition=s.activityCondition;
 let selected=null,timer=null,suppressClick=false;
 let showingIncident=false;
 let stopSpray=()=>{};

 function showSafety(symbol,incident=false){
  const note=safetyNote(condition,symbol,incident);
  hazardBadge.textContent=note;
  hazardBadge.hidden=!note;
 }

 function select(symbol,moveFocus=false){
  selected=symbol;
  for(const pick of picks){
   const picked=pick.dataset.activitySample===selected;
   pick.classList.toggle('is-picked',picked);
   pick.setAttribute('aria-pressed',String(picked));
  }
  stage.classList.toggle('has-sample',!!selected);
  showSafety(selected??shownTrial(s)?.symbol,!selected&&showingIncident);
  status.textContent=selected?`已拿取${names[selected]}。點器皿放入，也可按 Enter。`:'';
  if(selected&&moveFocus)target.focus({preventScroll:true});
 }

 function paint(trial,phase,incident=false){
  stopSpray();
  showingIncident=incident;
  stage.dataset.phase=phase;
  phaseLabel.textContent={before:'加入前',running:'觀察中',after:'觀察結果'}[phase];
  effects.innerHTML=sceneEffects(condition,trial,phase,incident);
  const splash=effects.querySelector('[data-activity-splash]');
  if(splash)stopSpray=playActivitySpray(splash,{aqua:condition==='aqua',rupture:incident});
  observation.innerHTML=observationMarkup(trial,phase,incident);
  showSafety(trial.symbol,incident);
  actions.hidden=phase==='running';
  if(!actions.hidden)actions.innerHTML=benchActions(phase,incident);
 }

 function run(trial,focusSelector,incident=false){
  if(timer!==null||!trial)return;
  const hazard=activityReaction(trial.symbol,condition).hazard;
  const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:hazard==='acid-splash'?3400:2700;
  select(null);
  stage.style.setProperty('--activity-trial-duration',`${duration}ms`);
  paint(trial,'running',incident);
  camera.scrollIntoView({block:'nearest',behavior:'instant'});
  stage.setAttribute('aria-busy','true');
  const buttons=root.querySelectorAll('.metal-activity button');
  buttons.forEach(button=>button.setAttribute('aria-disabled','true'));
  status.textContent='觀察樣本與器皿裡的變化。';
  timer=setTimeout(()=>{
   timer=null;
   if(incident){
    buttons.forEach(button=>button.removeAttribute('aria-disabled'));
    stage.removeAttribute('aria-busy');
    paint(trial,'after',true);
    status.textContent='爆炸風險示意播放完畢。可回到一般觀察。';
    stage.querySelector(focusSelector).focus({preventScroll:true});
    return;
   }
   s.activityRecords=[trial,...s.activityRecords.filter(record=>!sameTrial(record,trial))];
   if(!s.activitySeen.includes(trial.condition))s.activitySeen.push(trial.condition);
   update(focusSelector,rack.scrollLeft);
  },duration);
 }

 const place=symbol=>run({symbol,condition},'[data-activity-target]');
 root.querySelector('[data-activity-demo]').onclick=()=>{
  if(timer!==null)return;
  s.activityCondition='cold';
  update('[data-activity-demo]',rack.scrollLeft,true);
 };
 function miss(){
  showSafety(shownTrial(s)?.symbol,showingIncident);
  status.textContent='還沒放進燒杯。把樣本拖到玻璃杯上，再放手。';
 }

 const drags=picks.map(pick=>{
  const symbol=pick.dataset.activitySample;
  pick.addEventListener('pointerdown',event=>{
   if(event.button!==0||timer!==null)return;
   suppressClick=false;
   if(selected)select(null);
   showSafety(symbol);
  });
  pick.addEventListener('keydown',event=>{
   if(!['Enter',' '].includes(event.key))return;
   event.preventDefault();
   event.stopImmediatePropagation();
   if(!event.repeat&&timer===null)select(symbol,true);
  });
  const drag=bindReactantPickup(pick,target,{
   disabled:()=>timer!==null,
   liftPreview:true,
   onDrop:()=>{suppressClick=true;place(symbol);},
   onMiss:()=>{suppressClick=true;miss();},
   onCancel:()=>showSafety(shownTrial(s)?.symbol,showingIncident)
  });
  pick.onclick=()=>{
   if(!suppressClick&&timer===null)select(symbol,true);
   suppressClick=false;
  };
  return drag;
 });
 root.querySelectorAll('[data-activity-condition]').forEach(button=>button.onclick=()=>{
  const next=button.dataset.activityCondition;
  if(timer!==null||next===condition)return;
  s.activityCondition=next;
  update(`[data-activity-condition="${next}"]`,rack.scrollLeft);
 });
 target.onclick=()=>{
  if(timer!==null)return;
  if(selected)place(selected);
  else status.textContent='先從樣本架選一種元素，再放入器皿。';
 };
 stage.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(timer!==null||!button)return;
  const trial=shownTrial(s);
  if(button.hasAttribute('data-activity-replay'))run(trial,'[data-activity-replay]',showingIncident);
  if(button.hasAttribute('data-activity-incident'))run(trial,'[data-activity-replay]',true);
  if(button.hasAttribute('data-activity-before')){
   select(null);
   paint(trial,showingIncident||stage.dataset.phase==='before'?'after':'before');
   actions.querySelector('[data-activity-before]').focus({preventScroll:true});
  }
 });
 function syncRackNav(){
  nav[0].disabled=rack.scrollLeft<2;
  nav[1].disabled=rack.scrollLeft+rack.clientWidth>=rack.scrollWidth-2;
 }
 nav.forEach((button,index)=>button.onclick=()=>{
  if(timer===null)rack.scrollBy({left:(index?1:-1)*rack.clientWidth,behavior:'smooth'});
 });
 rack.addEventListener('scroll',syncRackNav);
 window.addEventListener('resize',syncRackNav);
 syncRackNav();
 root.onkeydown=event=>{
  if(event.key==='Escape'&&timer===null){
   const previous=selected;
   drags.forEach(drag=>drag.cancel());
   select(null);
   if(previous)rack.querySelector(`[data-activity-sample="${previous}"]`).focus({preventScroll:true});
  }
 };
 if(demo)run({symbol:'K',condition:'cold'},'[data-activity-demo]');
 return ()=>{
  clearTimeout(timer);
  stopSpray();
  drags.forEach(dispose=>dispose());
  window.removeEventListener('resize',syncRackNav);
  root.onkeydown=null;
 };
}
