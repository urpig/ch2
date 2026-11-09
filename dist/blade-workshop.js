import {chapterNumber} from './lesson-sequence.js';
import {createFoodPlayback} from './food-playback.js';
import {observationTimeline,bindObservationTimeline} from './observation-timeline.js';
import {scopeMarkup} from './card-markup.js';
import {fineSword,bladeMachine} from './finishing-art.js';
import {bladeResponse,bladeCurve,bladeReleaseFrame} from './finishing-model.js';
import {bindWorkbenchDrag,bindLoadGrip} from './finishing-input.js';
export const bladeCases={pig:{name:'生鐵',carbon:'3.5%',result:'脆裂',detail:'生鐵較硬脆，本例受力後裂開。'},steel:{name:'鋼鐵',carbon:'0.8%',result:'回彈',detail:'本例鋼刀經適當熱處理，鬆手後回彈。'},wrought:{name:'熟鐵',carbon:'0.01%',result:'留下彎曲',detail:'熟鐵較軟，本例鬆手後留下彎曲。'}};
export function bladeIcon(){return fineSword();}
export function mountBlade(root,c,{s,record,notice,has,onCleanup}){
 let key=null,phase='empty',frame=0,alive=true,liveBend=0;const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 root.innerHTML=scopeMarkup(`<section class="finish-studio blade-studio" tabindex="-1" aria-label="刀材試驗台"><header class="finish-top"><div><small>${chapterNumber('card-6')} / 材料工坊</small><b>不同含碳量的鐵所打造的刀，哪一把才撐得住？</b></div><span>同形狀 · 相同示意負荷</span></header><div class="finish-rack">${Object.entries(bladeCases).map(([k,d],i)=>`<div class="finish-sample" data-blade-sample="${k}" aria-label="${d.name}刀材"><div><b>${i+1} ${d.name}</b><span>${d.carbon} 碳</span></div>${scopeMarkup(fineSword(),'rack-'+k)}<small data-blade-tag="${k}">${has(k)?'✓ 已比較；可再試':'抓起刀身，放上支點 ↓'}</small></div>`).join('')}</div><div class="finish-machine">${scopeMarkup(bladeMachine(),'machine')}<div class="finish-blade-target" data-blade-target><span>刀身放這裡</span></div><div class="finish-load-grip" data-load-grip aria-label="施力把手；向下拉至標線再放開，鍵盤用上下鍵或 End 後 Enter 鬆開" aria-disabled="true"><i></i><b>↓ 拉下</b></div><div class="finish-live-step" data-blade-step>① 拖上刀材　→　② 拉到標線　→　③ 鬆開看結果</div></div><div class="finish-result" aria-live="polite"><b data-blade-title>先試生鐵，再比較鋼鐵與熟鐵。</b><p data-blade-description>拖一把刀到兩個支點上。</p></div><div class="finish-results-grid">${Object.entries(bladeCases).map(([k,d])=>`<div data-result-card="${k}" class="finish-record ${has(k)?'recorded':''}"><b>${d.name} <small>${d.carbon} C</small></b><span class="blade-record-phase">鬆手後</span><svg viewBox="0 0 210 45" aria-hidden="true"><path class="result-baseline" d="M15 18H195"/><path data-result-line d="${has(k)?resultPath(k):'M15 18H195'}"/></svg><span data-blade-record="${k}">${has(k)?d.result:'等待試驗'}</span></div>`).join('')}</div><section class="blade-comparison-decision" data-blade-decision ${['pig','steel','wrought'].every(has)?'':'hidden'}><div class="blade-shared-review"><button type="button" data-blade-compare-replay>↻ 並排重播鬆手前後</button>${observationTimeline()}</div><h4>根據三份結果，你會選哪一種刀材？</h4>${Object.entries(bladeCases).map(([k,d])=>`<button data-select-blade="${k}">${d.name}</button>`).join('')}<p data-blade-decision-feedback role="status">比較鬆手後的裂開、回彈與永久彎曲，再作選擇。</p></section></section>`,'finish-blade');
 const q=sel=>root.querySelector(sel),board=q('.finish-machine'),grip=q('[data-load-grip]');
 const setText=(sel,text)=>q(sel).textContent=text;
 function press(offset){q('[data-press-head]').setAttribute('transform',`translate(0 ${offset})`);q('[data-press-rod]').setAttribute('height',String(78+offset));}
 function shape(bend,split=0){
  liveBend=bend;
  const paths=bladeCurve(bend),ridge=q('[data-flex-ridge]');
  q('[data-flex-blade]').setAttribute('d',paths.edge);
  ridge.setAttribute('d',paths.ridge);
  ridge.setAttribute('opacity',String(.72+Math.min(.28,Math.abs(bend)*.007)));
  q('[data-flex-grain]').setAttribute('d',paths.ridge);
  q('[data-blade-whole]').toggleAttribute('hidden',split>0);
  q('[data-broken-blade]').toggleAttribute('hidden',split===0);
  if(split>0){
   q('[data-break-left]').setAttribute('transform',`rotate(${3*split} 242 270)`);
   q('[data-break-right]').setAttribute('transform',`translate(${9*split} 0) rotate(${-3*split} 718 270)`);
   q('[data-blade-fragments]').setAttribute('transform',`translate(0 ${48*split**2})`);
  }
 }
 function mount(k){cancelAnimationFrame(frame);key=k;s.selected=k;phase='mounted';shape(0);q('[data-mounted-blade]').removeAttribute('hidden');q('[data-blade-target]').classList.add('loaded');grip.setAttribute('aria-disabled','false');grip.style.transform='';press(0);setText('[data-blade-title]',bladeCases[k].name+'刀已就位');setText('[data-blade-description]','把右側把手拉到標線後鬆開。');setText('[data-blade-step]','② 向下拉右側把手；看刀身怎麼變');root.querySelectorAll('[data-blade-sample]').forEach(e=>e.classList.toggle('selected',e.dataset.bladeSample===k));notice('刀已架好。拉到金色標線，鬆手後觀察。');}
 for(const item of root.querySelectorAll('[data-blade-sample]'))onCleanup(bindWorkbenchDrag(item,{visualSelector:'svg',targets:()=>[q('[data-blade-target]')],onDrop:()=>mount(item.dataset.bladeSample),onMiss:()=>notice('把刀身拖到試驗機中央的兩個支點之間。')}));
 onCleanup(bindLoadGrip(grip,board,{travelFraction:.3182,enabled:()=>phase==='mounted',onMove:value=>{if(phase!=='mounted')return;const response=bladeResponse(key,value);shape(response.bend);press(response.bend);grip.classList.toggle('release-ready',value>=.85);grip.querySelector('b').textContent=value>=.85?'現在放手':'↓ 拉下';setText('[data-blade-step]',value>=.85?'③ 已到標線，鬆開看看刀身':'② 繼續拉到金色標線，再鬆開');},onRelease:value=>{
 grip.classList.remove('release-ready');grip.querySelector('b').textContent='↓ 拉下';
 const response=bladeResponse(key,value,true);if(!response.complete){shape(0);press(0);setText('[data-blade-step]','未到標線；再拉一次，才能公平比較');notice('這次還沒到比較負荷。再拉到金色標線後鬆開。');return;}
 phase='unloading';grip.setAttribute('aria-disabled','true');const current=key,start=performance.now(),from=liveBend,duration=reduced?0:850;setText('[data-blade-step]','③ 已鬆手，觀察卸載後的刀身');
 const animate=t=>{
  if(!alive||current!==key)return;
  const p=duration?Math.min(1,(t-start)/duration):1;
  const motion=bladeReleaseFrame(current,from,response.bend,p);
  shape(motion.bend,motion.split);
  press(motion.press);
  if(p<1){frame=requestAnimationFrame(animate);return;}
  phase='done';record(current);highlightNextBlade();
  q('[data-blade-decision]').hidden=!['pig','steel','wrought'].every(has);
  const d=bladeCases[current];
  setText('[data-blade-title]',d.name+'刀 · '+d.result);
  setText('[data-blade-description]',d.detail);
  setText('[data-blade-step]','直接從上架取另一把刀，接著比較 ↑');
  setText(`[data-blade-tag="${current}"]`,'✓ 已比較；可再試');
  setText(`[data-blade-record="${current}"]`,d.result);
  const row=q(`[data-result-card="${current}"]`);
  row.classList.add('recorded');
  row.querySelector('[data-result-line]').setAttribute('d',resultPath(current));
  notice(d.detail);
 };
 frame=requestAnimationFrame(animate);
 }}));
 let comparisonPlayback=null;
 const comparisonControls=bindObservationTimeline(q('.blade-shared-review'),{onPause:()=>comparisonPlayback?.pause(),onResume:()=>comparisonPlayback?.resume()});
 function reviewBlades(p){
  if(!['pig','steel','wrought'].every(has))return;
  const label=p===0?'受力到標線':p===1?'鬆手後':'鬆手中';
  for(const key of Object.keys(bladeCases)){
   const row=q(`[data-result-card="${key}"]`);
   row.querySelector('[data-result-line]').setAttribute('d',resultPath(key,p));
   row.querySelector('.blade-record-phase').textContent=label;
   row.querySelector('[data-blade-record]').textContent=p===1?bladeCases[key].result:'正在比較形變';
  }
 }
 q('[data-blade-compare-replay]').onclick=()=>{if(!['pig','steel','wrought'].every(has))return;comparisonPlayback?.dispose();comparisonPlayback=createFoodPlayback({duration:matchMedia('(prefers-reduced-motion:reduce)').matches?1:4000,onTime:t=>reviewBlades(t/4),onState:state=>{if(state.complete)comparisonControls.finish();}});comparisonControls.start();comparisonPlayback.setActive(true);};
 onCleanup(()=>{comparisonPlayback?.dispose();comparisonControls.dispose();});
 root.querySelectorAll('[data-select-blade]').forEach(b=>b.onclick=()=>{const k=b.dataset.selectBlade;q('[data-blade-decision-feedback]').textContent=k==='steel'?'✓ 本例選鋼材：卸載後能回彈；還要配合適當熱處理與用途。':k==='pig'?'本例生鐵在比較負荷下裂開；回看另外兩把的結果，再選一次。':'本例熟鐵鬆手後留下彎曲；回看哪一把能回彈，再選一次。';});
 function highlightNextBlade(){
  const next=Object.keys(bladeCases).find(k=>!has(k));
  root.querySelectorAll('[data-blade-sample]').forEach(item=>{const active=item.dataset.bladeSample===next;item.classList.toggle('blade-next-sample',active);item.setAttribute('aria-description',active?'下一把試驗刀材':'');});
 }
 highlightNextBlade();
 onCleanup(()=>{alive=false;cancelAnimationFrame(frame);});
}
function resultPath(key,progress=1){
 const loaded=bladeResponse(key,1).bend,rest=bladeResponse(key,1,true).bend;
 const {bend,split}=bladeReleaseFrame(key,loaded,rest,progress);
 if(split){
  const depth=18+7*split;
  return `M15 18L${105-6*split} ${depth} M${105+7*split} ${depth}L195 18`;
 }
 return `M15 18Q105 ${18+bend*1.025} 195 18`;
}
