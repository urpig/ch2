import {mountDemonstrationBench} from './combustion-demo-bench.js';
import {updateCombustionProcedure} from './combustion-procedure.js';
import {combustionDemoDuration,combustionDemoFrame,combustionDemoReady} from './combustion-demo-model.js';
import {createFoodPlayback} from './food-playback.js';

export function mountCombustionDemo(root,c,ctx,{onSample,onPractice}){
 const {s,record}=ctx,key=s.combustionDemoSample||'Na',name=key==='Na'?'鈉':'硫',duration=combustionDemoDuration(key);
 const seen=s.combustionDemoSeen.includes(key),ready=combustionDemoReady(s.combustionDemoSeen);
 root.innerHTML=`<section class="combustion-demonstration" aria-label="阿公示範鈉與硫的實驗">
  <header class="combustion-demo-heading"><div><small>阿公先做給你看</small><h3>同一套操作，比較鈉與硫</h3></div><div class="combustion-demo-samples" role="group" aria-label="選擇實驗示範"><button type="button" data-demo-sample="Na" aria-pressed="${key==='Na'}">1 鈉 ${s.combustionDemoSeen.includes('Na')?'✓':''}</button><button type="button" data-demo-sample="S" aria-pressed="${key==='S'}" ${s.combustionDemoSeen.includes('Na')?'':'disabled'}>2 硫 ${s.combustionDemoSeen.includes('S')?'✓':''}</button></div></header>
  <div class="combustion-demo-tools"><button type="button" class="primary" data-combustion-demo-play>${seen?'↻ 重播':'▶ 播放'}${name}的完整示範</button><button type="button" class="secondary" data-combustion-demo-pause disabled>暫停</button><span data-demo-step>準備樣本</span></div>
  <ol class="combustion-demo-steps" aria-label="示範步驟"><li data-demo-process="0">取樣</li><li data-demo-process="1">加熱燃燒</li><li data-demo-process="2">產物加水</li><li data-demo-process="3">測試紙</li></ol>
  <div class="combustion-demo-bench" data-demo-bench></div>
  <div class="combustion-demo-next" ${seen?'':'hidden'}>${key==='Na'?'<button type="button" class="primary" data-demo-next>接著看硫的示範 →</button>':ready?'<p>兩次都用紅、藍石蕊比較：鈉的產物加水呈鹼性，硫的產物溶於水呈酸性。</p><button type="button" class="primary" data-demo-practice>換你動手，選一份樣本 →</button>':''}</div>
 </section>`;
 const stage=root.querySelector('[data-demo-bench]'),play=root.querySelector('[data-combustion-demo-play]'),pause=root.querySelector('[data-combustion-demo-pause]');
 let player=null,alive=true,phase='',inView=false,committed=new Set(),completed=false,bench=null;
 updateCombustionProcedure(root,key);
 function mountBench(){bench?.dispose();bench=mountDemonstrationBench(stage,c,key,evidence=>{if(!committed.has(evidence)){committed.add(evidence);record(evidence);}});}
 mountBench();
 function paint(time){
  const frame=combustionDemoFrame(key,time);bench.paint(time);
  if(phase!==frame.phase){
   phase=frame.phase;root.querySelector('[data-demo-step]').textContent=frame.label;
   const instruction=root.closest('article')?.querySelector('[data-demo-instruction]');
   if(instruction)instruction.textContent=`${name} · ${frame.label}：${frame.caption}`;
   const process=frame.index<2?0:['heat','transfer','burn','cool'].includes(frame.phase)?1:['pour','dissolve','wash','shake'].includes(frame.phase)?2:3;
   root.querySelectorAll('[data-demo-process]').forEach(item=>{if(Number(item.dataset.demoProcess)===process)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
  }
 }
 function sync(){player?.setActive(alive&&inView&&!document.hidden&&!document.querySelector('dialog[open]'));}
 function updateVisibility(){const r=stage.getBoundingClientRect();inView=r.bottom>0&&r.top<innerHeight;sync();}
 function playDemo(){
  root.querySelector('.combustion-demo-tools').scrollIntoView({block:'start',behavior:'instant'});
  player?.dispose();player=null;completed=false;phase='';committed=new Set();mountBench();root.querySelector('.combustion-demo-next').hidden=true;
  play.textContent='↻ 從頭再看';pause.disabled=false;
  player=createFoodPlayback({duration,maxFrameGapMs:250,onTime:value=>paint(value/4*duration),onState:state=>{
   if(!alive)return;pause.textContent=state.paused?'繼續':'暫停';stage.toggleAttribute('data-paused',!state.running);for(const svg of stage.querySelectorAll('svg')){if(state.running)svg.unpauseAnimations?.();else svg.pauseAnimations?.();}
   if(!state.complete||completed)return;
   if(!committed.has(key+(key==='Na'?':wet':':ph')))return;
   completed=true;if(!s.combustionDemoSeen.includes(key))s.combustionDemoSeen.push(key);ctx.persist();
   // Show the next action without rebuilding the apparatus or losing its cooled result.
   const actions=root.querySelector('.combustion-demo-next');actions.hidden=false;
   if(key==='Na')actions.innerHTML='<button type="button" class="primary" data-demo-next>接著看硫的示範 →</button>';
   else actions.innerHTML='<p>鈉的產物加水呈鹼性；硫的產物溶於水呈酸性。接著換你選樣本試試。</p><button type="button" class="primary" data-demo-practice>換你動手，選一份樣本 →</button>';
   root.querySelector('[data-demo-sample="S"]').disabled=false;pause.disabled=true;
   root.dispatchEvent(new CustomEvent('combustion-demo-progress',{bubbles:true}));bindNext();
  }});
  updateVisibility();
 }
 function bindNext(){root.querySelector('[data-demo-next]')?.addEventListener('click',()=>onSample('S',true),{once:true});root.querySelector('[data-demo-practice]')?.addEventListener('click',onPractice,{once:true});}
 play.onclick=playDemo;pause.onclick=()=>{if(pause.textContent==='繼續')player?.resume();else player?.pause();};
 root.querySelectorAll('[data-demo-sample]').forEach(button=>button.onclick=()=>onSample(button.dataset.demoSample,false));
 bindNext();paint(0);
 const observer=new IntersectionObserver(updateVisibility);observer.observe(stage);document.addEventListener('visibilitychange',sync);
 const modalObserver=new MutationObserver(sync);modalObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 ctx.onCleanup(()=>{alive=false;player?.dispose();observer.disconnect();modalObserver.disconnect();bench?.dispose();document.removeEventListener('visibilitychange',sync);});
 if(s.combustionDemoAutoPlay){s.combustionDemoAutoPlay=false;playDemo();}
}
