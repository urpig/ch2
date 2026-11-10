import {mountDemonstrationBench} from './combustion-demo-bench.js';
import {updateCombustionProcedure} from './combustion-procedure.js';
import {combustionDemoDuration,combustionDemoFrame,combustionDemoReady,combustionDemoSamples} from './combustion-demo-model.js';
import {createFoodPlayback} from './food-playback.js';

export function mountCombustionDemo(root,c,ctx,{onSample,onPractice}){
 const {s,record}=ctx,samples=combustionDemoSamples(c.sampleGroup),key=s.combustionDemoSample||samples[0],name=key==='Na'?'鈉':'硫',duration=combustionDemoDuration(key);
 const seen=s.combustionDemoSeen.includes(key);
 const nextMarkup=()=>samples.length===2&&key==='Na'?'<button type="button" class="primary" data-demo-next>接著看硫的示範 →</button>':combustionDemoReady(s.combustionDemoSeen,c.sampleGroup)?'<button type="button" class="primary" data-demo-practice>換你動手，選一份'+(c.sampleGroup==='metals'?'金屬':c.sampleGroup==='nonmetals'?'非金屬':'')+'樣本 →</button>':'';
 root.innerHTML=`<section class="combustion-demonstration" aria-label="阿公示範${samples.length===1?name:'鈉與硫'}的實驗">
  <div class="combustion-demo-tools"><button type="button" class="primary" data-combustion-demo-play>${seen?'↻ 重播':'▶ 播放'}${name}的完整示範</button><button type="button" class="secondary" data-combustion-demo-pause disabled>暫停</button></div>
  <div class="combustion-demo-bench" data-demo-bench></div>
  <div class="combustion-demo-next" ${seen?'':'hidden'}>${nextMarkup()}</div>
 </section>`;
 const stage=root.querySelector('[data-demo-bench]'),play=root.querySelector('[data-combustion-demo-play]'),pause=root.querySelector('[data-combustion-demo-pause]');
 let player=null,alive=true,phase='',inView=false,committed=new Set(),completed=false,bench=null;
 updateCombustionProcedure(root,key);
 function mountBench(){bench?.dispose();bench=mountDemonstrationBench(stage,c,key,evidence=>{if(!committed.has(evidence)){committed.add(evidence);record(evidence);}});}
 mountBench();
 function paint(time){
  const frame=combustionDemoFrame(key,time);bench.paint(time);
  if(phase!==frame.phase){
   phase=frame.phase;
   const instruction=root.closest('article')?.querySelector('[data-demo-instruction]');
   if(instruction)instruction.textContent=`${name} · ${frame.label}：${frame.caption}`;
  }
 }
 function sync(){player?.setActive(alive&&inView&&!document.hidden&&!document.querySelector('dialog[open]'));}
 function updateVisibility(){const r=stage.getBoundingClientRect();inView=r.bottom>0&&r.top<innerHeight;sync();}
 function playDemo(){
  player?.dispose();player=null;completed=false;phase='';committed=new Set();mountBench();root.querySelector('.combustion-demo-next').hidden=true;
  // Reframe after rebuilding, so the sodium dish remains visible during pickup.
  const focus=stage.querySelector('.combustion-workbench');
  focus.scrollIntoView({block:'center',behavior:'instant'});
  play.textContent='↻ 從頭再看';pause.disabled=false;
  player=createFoodPlayback({duration,maxFrameGapMs:250,onTime:value=>paint(value/4*duration),onState:state=>{
   if(!alive)return;pause.textContent=state.paused?'繼續':'暫停';stage.toggleAttribute('data-paused',!state.running);for(const svg of stage.querySelectorAll('svg')){if(state.running)svg.unpauseAnimations?.();else svg.pauseAnimations?.();}
   if(!state.complete||completed)return;
   if(!committed.has(key+(key==='Na'?':wet':':ph')))return;
   completed=true;if(!s.combustionDemoSeen.includes(key))s.combustionDemoSeen.push(key);ctx.persist();
   // Show the next action without rebuilding the apparatus or losing its cooled result.
   const actions=root.querySelector('.combustion-demo-next');actions.hidden=false;
   actions.innerHTML=nextMarkup();
   const sulfur=root.querySelector('[data-demo-sample="S"]');if(sulfur)sulfur.disabled=false;pause.disabled=true;
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
