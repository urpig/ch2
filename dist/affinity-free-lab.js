import {affinityElements,affinityOxides,chemicalLabel,affinityReaction,freshAffinityLab,loadAffinitySample,canHeatAffinity,beginAffinityHeat,finishAffinityHeat,affinityLabReady,ironComparisonOxide,ironComparisonElements,ironComparisonEvidence} from './affinity-free-model.js';
import {affinityReference,specimenArt} from './oxygen-affinity.js';
import {bindReactantPickup} from './life-reactant-drag.js';
import {createFoodPlayback} from './food-playback.js';
import {affinityAppearance,affinityBenchArt,materialAssets,mixture,powderAssets} from './affinity-appearance.js';

const powder=x=>`<img class="free-oxide-photo" src="${powderAssets[x]}" alt="" draggable="false">`;
function specimen(x,type){if(type==='element')return specimenArt(x.id);return `<span class="free-weighing-dish" role="img" aria-label="${x.name}粉末"><img src="${materialAssets[x.powder]}" alt="" draggable="false"></span>`;}
function rack(list,type,selected,{locked=false,suggested=null}={}){return `<section class="free-sample-rack free-${type}-rack" aria-label="${type==='element'?'元素':'氧化物'}樣本架"><header><span>${locked?'已固定氧化鐵':list.length+' 種'}</span><h4>${type==='element'?'元素':'金屬氧化物'}</h4></header><div class="free-rack-items" tabindex="0" aria-label="${list.length} 種${type==='element'?'元素':'金屬氧化物'}">${list.map(x=>`<button type="button" class="free-sample ${selected===x.id?'is-loaded':''} ${suggested===x.id?'free-suggested':''}" ${locked?'disabled':''} data-free-sample="${x.id}" data-free-kind="${type}" aria-label="拖曳${x.name} ${chemicalLabel(x.formula||x.id)}${x.control?'，對照材料，':''}進反應區"><span class="free-sample-object">${specimen(x,type)}</span><span class="free-sample-name"><b>${x.name}</b><small>${chemicalLabel(x.formula||x.id)}</small>${x.control?'<em class="free-control-label">對照材料</em>':''}</span><i aria-hidden="true">${selected===x.id?'✓':'⋮⋮'}</i></button>`).join('')}</div></section>`;}
function nearView(a,done){return `<section class="free-specimen-comparison ${done?'is-done':''}" data-free-comparison aria-label="加熱前後的樣本近看"><header><b>樣本近看</b><small>材質外觀重建</small></header><div class="free-comparison-pair"><figure><figcaption><span>01</span><b>加熱前</b></figcaption><div class="free-specimen-dish"><img class="free-dish-photo" src="${affinityBenchArt.dish}" alt="" draggable="false"><div class="free-dish-contents">${mixture(a.before)}</div></div><p>${a.beforeText}</p></figure><figure class="free-live-specimen"><figcaption><span>02</span><b data-free-near-title>${done?'冷卻後':'等待加熱'}</b></figcaption><div class="free-specimen-dish" data-free-near-art role="img" aria-label="${done?a.coolText:'加熱中的樣本'}"><img class="free-dish-photo" src="${affinityBenchArt.dish}" alt="" draggable="false"><div class="free-dish-contents"><div class="free-mixture-before">${mixture(a.before)}</div><div class="free-mixture-after">${mixture(a.after)}</div><div class="free-thermal-yellow" aria-hidden="true">${powder('white')}</div><div class="free-near-glow" aria-hidden="true"></div></div></div><p data-free-near-caption>${done?a.coolText:'開始加熱後，在這裡近看變化。'}</p></figure></div></section>`;}
function resultMarkup(r){const e=affinityElements.find(x=>x.id===r.element),o=affinityOxides.find(x=>x.id===r.oxide),base=affinityElements.find(x=>x.id===o.element);
 return `<section class="free-trial-result ${r.reacts?'has-reaction':'no-reaction'}" aria-label="本次反應結果"><header><span>${r.reacts?'✓':'—'}</span><div><small>${e.name} ＋ ${o.name} · 加熱後冷卻觀察</small><h4>${r.title}</h4></div><b class="free-relation">${r.relation}</b></header>${r.reacts?`<div class="free-role-pair"><p><b>${e.name}</b><span>得到氧 · 被氧化</span></p><i>← 氧轉移</i><p><b>${o.name}</b><span>失去氧 · 被還原</span></p></div><strong class="free-trial-equation">${r.equation}</strong><p>產物包含${base.name} ${base.id}、${chemicalLabel(r.product)}${r.metal==='Zn'?'（鋅以冷卻後外觀呈現）':''}。</p>`:`<p>${r.reason}</p>`}${r.condition?`<p class="free-trial-condition">${r.condition}</p>`:''}</section>`;
}
function recordsMarkup(lab){const results=lab.records.map(id=>affinityReaction(...id.split('|')));return `<section class="free-lab-records" aria-label="我的比較紀錄"><header><h4>我的比較紀錄</h4><b>${results.length} 組</b></header>${results.length?`<div class="free-record-scroll"><table><thead><tr><th>元素</th><th>氧化物</th><th>加熱結果</th><th>活性線索</th></tr></thead><tbody>${results.map(r=>`<tr><td>${chemicalLabel(affinityElements.find(e=>e.id===r.element).formula||r.element)}</td><td>${chemicalLabel(r.oxide)}</td><td class="${r.reacts?'record-reacted':'record-unchanged'}">${r.reacts?'有反應':'未取回金屬'}</td><td>${r.relation}</td></tr>`).join('')}</tbody></table></div>`:'<p>選一組材料，留下第一份結果。</p>'}<p class="free-evidence-goal">${affinityLabReady(lab)?'✓ 已比較有反應與未取回金屬的情況。':'完成上方的鋅、銅對照，或自由比較至少 3 組，包含有反應和未取回金屬的結果。'}</p></section>`;}
function comparisonGuide(lab,evidence,suggested) {
 const finished=evidence.every(Boolean);
 const next=affinityElements.find(x=>x.id===suggested);
 return `<section class="free-controlled-task" aria-label="固定氧化鐵的比較">
  <div class="free-controlled-head"><div><h4>固定右邊，只換左邊</h4><p>${lab.comparison?(next?(lab.element===next.id?'材料已備妥。按「開始加熱」，再觀察冷卻後的樣本。':'右邊已放好氧化鐵。從左邊拖入'+next.name+'，再加熱。'):'兩次都用氧化鐵。比較哪一次有取回鐵。'):'兩次都用氧化鐵。第一次加鋅，第二次換成銅。'}</p></div>
  <button type="button" class="card-reset" data-free-guide aria-pressed="${lab.comparison}">${lab.comparison?'切回自由配對':'固定氧化鐵，開始比較'}</button></div>
  <div class="free-controlled-results">${ironComparisonElements.map((element,i)=>{
   const name=affinityElements.find(x=>x.id===element).name, result=evidence[i];
   const art=result&&affinityAppearance(element,ironComparisonOxide);
   return `<figure><figcaption><b>${i+1}　${name} ＋ 氧化鐵</b><span>${result?(result.reacts?'✓ 取回鐵':'未取回鐵'):'待觀察'}</span></figcaption>
   ${art?`<div class="free-controlled-dishes"><span>加熱前${mixture(art.before)}</span><b aria-hidden="true">→</b><span>冷卻後${mixture(art.after)}</span></div><p>${art.coolText}</p>`:'<p>加熱完成後，這裡會留下結果。</p>'}</figure>`;
  }).join('')}</div>
  ${finished?'<p>這兩份結果會留到 03，幫你預測碳和錫。</p>':''}
 </section>`;
}
export function freeAffinityMarkup(s){
 const lab=s.affinityLab||(s.affinityLab=freshAffinityLab());
 const e=affinityElements.find(x=>x.id===lab.element),o=affinityOxides.find(x=>x.id===lab.oxide);
 const r=affinityReaction(lab.element,lab.oxide),a=affinityAppearance(lab.element,lab.oxide),done=lab.phase==='done';
 const evidence=ironComparisonEvidence(lab),suggested=lab.comparison?ironComparisonElements[evidence.findIndex(x=>!x)]:null;
 const nextSample=done?affinityElements.find(x=>x.id===suggested):null;
 return `<section class="free-affinity-lab" aria-label="自由配對的對氧活性實驗">
  <div class="inquiry-question"><small>延伸 / 把氧轉移用在金屬比較</small><h3>選一種元素，再選一種氧化物</h3><p>左右各拖入一份樣本，再加熱比較。也可以固定右邊的氧化鐵，只換左邊的元素。</p></div>
  ${comparisonGuide(lab,evidence,suggested)}
  <div class="free-lab-layout">${rack(affinityElements,'element',lab.element,{suggested})}
   <div class="free-lab-workspace ${done?'is-done':''}" data-free-workspace>
    <div class="free-real-bench ${done?'is-done':''}" data-free-bench aria-label="寫實坩堝與高溫加熱器">
     <img class="free-bench-photo" src="${affinityBenchArt.bench}" alt="白色陶瓷坩堝放在金屬三腳架上，下方有本生燈，桌邊放著坩堝鉗" draggable="false">
     <div class="free-bench-tools"><span>高溫代表反應</span><button type="button" class="card-reset" data-free-new>↺ 清空樣本</button></div>
     <div class="free-crucible-fill" aria-hidden="true"><div data-free-before>${mixture(a.before)}</div><div data-free-after>${mixture(a.after)}</div><div class="free-thermal-yellow">${powder('white')}</div></div>
     <div class="free-burner-flame" aria-hidden="true"><img src="${affinityBenchArt.flame}" alt="" draggable="false"></div>
     <img class="free-bench-occluder" src="${affinityBenchArt.bench}" alt="" draggable="false" aria-hidden="true">
     <div class="free-sample-glow" aria-hidden="true"></div>
     <div class="free-gas-indicator" data-free-gas hidden><span>${r?.gas?chemicalLabel(r.gas):''} · 無色氣體</span><i>↑</i><i>↑</i><i>↑</i></div>
     <button type="button" class="free-crucible-target" data-free-drop tabindex="-1" aria-label="將元素及氧化物拖入反應區"><span>${!e&&!o?'拖入樣本':!e?'還缺元素':!o?'還缺氧化物':done?'冷卻後產物':'兩種材料已備妥'}</span></button>
     <p class="free-heat-stage" data-free-stage>${done?'冷卻後 · 比較樣本':'尚未加熱'}</p>
    </div>
    <div class="free-charge-list">${[['element',e],['oxide',o]].map(([type,x])=>`<div><small>${type==='element'?'元素':'氧化物'}</small><b>${x?x.name+' '+chemicalLabel(x.formula||x.id):'尚未放入'}</b><button type="button" data-free-return="${type}" ${!x || lab.comparison&&type==='oxide'?'disabled':''} aria-label="放回${x?.name||'樣本'}">×</button></div>`).join('')}</div>
    <div class="free-heating-controls"><button type="button" class="primary" data-free-heat ${done||canHeatAffinity(lab)?'':'disabled'}>${done?'↻ 重看加熱變化':'開始加熱'}</button><button type="button" class="secondary" data-free-pause hidden>暫停觀察</button><span data-free-status role="status">${r?.kind==='same'?r.title+'，請換一種材料。':done?(nextSample?'本次結果已留下。接著換成'+nextSample.name+'。':'拖入新樣本可替換，另一份會保留，方便比較。'):e&&o?'準備好了，按下加熱。':!e&&!o?'從左右樣本架各拖一份，放進白色坩堝。':!e?'還缺元素：從左側拖一份進坩堝。':'還缺氧化物：從右側拖一份進坩堝。'}</span>${nextSample?`<button type="button" class="text-button" data-free-next-sample="${nextSample.id}">到樣本架拿${nextSample.name} ↑</button>`:''}</div>
    <div class="free-heat-track" aria-hidden="true"><i data-free-heat-progress style="width:${done?100:0}%"></i></div>
    ${nearView(a,done)}
   </div>${rack(affinityOxides,'oxide',lab.oxide,{locked:lab.comparison})}
  </div><div data-free-result>${done&&r?resultMarkup(r):''}</div>${recordsMarkup(lab)}
  <details class="inquiry-reference"><summary>查閱元素對氧活性表</summary>${affinityReference(s.referenceElement||'Fe')}</details>
  <p class="free-model-scope">本台為螢幕模擬；各組採代表加熱條件。</p>
 </section>`;
}

export function bindFreeAffinity(root,s,update){
 const lab=s.affinityLab,bench=root.querySelector('[data-free-bench]'),workspace=root.querySelector('[data-free-workspace]');
 const zone=root.querySelector('[data-free-drop]'),heat=root.querySelector('[data-free-heat]'),pause=root.querySelector('[data-free-pause]'),status=root.querySelector('[data-free-status]');
 let alive=true,playback=null,paused=false;const cleanups=[];
 const usable=()=>alive&&!root.closest('[inert]');
 for(const item of root.querySelectorAll('[data-free-sample]'))cleanups.push(bindReactantPickup(item,zone,{
  liftPreview:true,disabled:()=>!usable()||item.disabled||lab.phase==='heating',
  onDrop:()=>{if(loadAffinitySample(lab,item.dataset.freeKind,item.dataset.freeSample))update('[data-free-heat]');},
  onMiss:()=>{status.textContent='樣本還沒放進坩堝，請再拖一次。';},onCancel:()=>{status.textContent='已放回樣本架。';}
 }));
 root.querySelector('[data-free-new]').onclick=()=>{playback?.dispose();lab.element=null;lab.oxide=lab.comparison?ironComparisonOxide:null;lab.phase='ready';update('[data-free-new]');};
 root.querySelector('[data-free-guide]').onclick=()=>{
  if(!usable()||lab.phase==='heating')return;
  lab.comparison=!lab.comparison;
  if(lab.comparison){lab.element=null;lab.oxide=ironComparisonOxide;lab.phase='ready';}
  update('[data-free-guide]');
 };
 root.querySelectorAll('[data-free-return]').forEach(b=>b.onclick=()=>{if(lab.phase==='heating')return;lab.phase='ready';lab[b.dataset.freeReturn]=null;update('[data-free-heat]');});
 root.querySelector('[data-free-next-sample]')?.addEventListener('click',event=>{
  const sample=root.querySelector(`[data-free-sample="${event.currentTarget.dataset.freeNextSample}"]`);
  sample.scrollIntoView({block:'center',behavior:'instant'});sample.focus({preventScroll:true});
 });
 const visible=()=>{if(!playback)return;const r=workspace.getBoundingClientRect();playback.setActive(alive&&!document.hidden&&!document.querySelector('dialog[open]')&&r.bottom>0&&r.top<innerHeight);};
 heat.onclick=()=>{
  if(!usable())return;
  // Replaying restores the initial mixture first; previous evidence remains saved.
  if(lab.phase==='done'){lab.phase='ready';root.querySelector('[data-free-result]').innerHTML='';}
  if(!beginAffinityHeat(lab))return;
  const reaction=affinityReaction(lab.element,lab.oxide),a=affinityAppearance(lab.element,lab.oxide);
  heat.disabled=true;heat.textContent='加熱觀察中';root.querySelectorAll('[data-free-return],[data-free-sample],[data-affinity],[data-free-guide]').forEach(b=>b.disabled=true);
  pause.hidden=false;paused=false;pause.textContent='暫停觀察';workspace.classList.remove('is-done','is-paused');bench.classList.remove('is-done','is-cooling','is-reacting');
  workspace.dataset.glow=a.glow;workspace.style.setProperty('--reaction-change',0);workspace.style.setProperty('--thermal-yellow',0);
  status.textContent='加熱前的樣本保留在左邊；右邊同步近看。';
  playback?.dispose();
  playback=createFoodPlayback({duration:matchMedia('(prefers-reduced-motion:reduce)').matches?9000:14000,
   onTime:t=>{
    if(!alive)return;
    const p=t/4,hot=p>.2&&p<.76,change=Math.max(0,Math.min(1,(p-.32)/.32));
    workspace.style.setProperty('--reaction-change',reaction.reacts?change:0);
    workspace.style.setProperty('--thermal-yellow',a.yellowHot&&hot?.85:0);
    root.querySelector('[data-free-heat-progress]').style.width=(p*100)+'%';
    root.querySelector('[data-free-stage]').textContent=p<.08?'加熱前 · 留意原來的樣子':p<.32?'正在加熱':p<.76?'加熱中 · 近看變化':'熄火 · 冷卻後比較';
    const title=root.querySelector('[data-free-near-title]'),caption=root.querySelector('[data-free-near-caption]');
    title.textContent=p<.08?'加熱前':p<.76?'加熱中':'冷卻後';
    caption.textContent=p<.32?a.beforeText:p<.76?a.hotText:a.coolText;
    root.querySelector('[data-free-near-art]').setAttribute('aria-label',caption.textContent);
    workspace.classList.toggle('is-heating',p>.08&&p<.76);
    workspace.classList.toggle('is-reacting',reaction.reacts&&p>.32&&p<.68);
    workspace.classList.toggle('is-cooling',p>=.76);
    const gas=root.querySelector('[data-free-gas]');gas.hidden=!(reaction.gas&&p>.4&&p<.73);
    if(reaction.gas)gas.querySelector('span').textContent=chemicalLabel(reaction.gas)+' · 無色氣體';
   },onState:x=>{if(!alive)return;workspace.classList.toggle('is-paused',!x.running&&!x.complete);if(x.complete&&finishAffinityHeat(lab))update('[data-free-heat]');}
  });visible();
 };
 pause.onclick=()=>{paused=!paused;if(paused)playback?.pause();else playback?.resume();pause.textContent=paused?'繼續觀察':'暫停觀察';workspace.classList.toggle('is-paused',paused);};
 root.querySelectorAll('[data-affinity]').forEach(b=>b.onclick=()=>{s.referenceElement=b.dataset.affinity;update();root.querySelector('.inquiry-reference').open=true;});
 window.addEventListener('resize',visible);document.addEventListener('visibilitychange',visible);window.addEventListener('scroll',visible,{passive:true,capture:true});
 const modal=new MutationObserver(visible);modal.observe(document.body,{attributes:true,subtree:true,attributeFilter:['open']});
 return ()=>{alive=false;playback?.dispose();if(lab.phase==='heating')lab.phase='ready';cleanups.forEach(f=>f());modal.disconnect();window.removeEventListener('resize',visible);document.removeEventListener('visibilitychange',visible);window.removeEventListener('scroll',visible,true);};
}
