import {paintTermExperiment,workedExampleMarkup} from './term-worked-example.js';
import {createFoodPlayback} from './food-playback.js';
import {freshTermDemo,restoreTermDemo,termWorkedReady} from './term-demo-model.js';

// Retain completed zinc observations from earlier versions, without their removed practice route.
const termDemoKey='lost-forge-five-terms-v2';
export function loadTermReview(){
 const state=freshTermDemo();
 try{Object.assign(state,restoreTermDemo(JSON.parse(localStorage.getItem(termDemoKey))));}catch{}
 const save=()=>{try{localStorage.setItem(termDemoKey,JSON.stringify(state));}catch{}};
 return {state,save};
}

export function mountTermDemo(root,{review=loadTermReview()}={}){
 if(!root)return ()=>{};
 const {state:s,save}=review;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let player=null,observer=null,inView=false,paused=false;
 const notify=()=>root.dispatchEvent(new CustomEvent('term-example-progress',{bubbles:true,detail:{ready:termWorkedReady(s)}}));
 const sync=()=>player?.setActive(inView&&!document.hidden&&!document.querySelector('dialog[open]'));
 const stop=()=>{player?.dispose();player=null;observer?.disconnect();observer=null;};
 const focus=selector=>root.querySelector(selector)?.focus({preventScroll:true});
 function render(){
  stop();
  if(s.exampleObserved&&!s.exampleTraced){s.exampleObserved=false;save();}
  root.innerHTML=`<section class="term-tutor" id="term-demo" aria-label="氧化還原的實驗示範" data-glossary-skip>
   <div class="term-tutor-body">
    <div class="term-tutor-tools"><button type="button" class="card-reset" data-term-reset>↺ 重新開始</button></div>
    ${workedExampleMarkup(s)}
   </div>
  </section>`;
  root.querySelector('[data-term-reset]').onclick=()=>{
   Object.assign(s,freshTermDemo());save();render();focus('[data-term-play]');
  };
  const experiment=root.querySelector('[data-term-experiment]'),right=root.querySelector('.term-evidence-card');
  const play=root.querySelector('[data-term-play]'),pause=root.querySelector('[data-term-pause]');
  paintTermExperiment(experiment,right,termWorkedReady(s)?1:0,reduced);
  const updateVisibility=()=>{
   const r=experiment.getBoundingClientRect();
   inView=r.bottom>0&&r.top<innerHeight;
  };
  updateVisibility();
  observer=new IntersectionObserver(()=>{if(experiment.isConnected){updateVisibility();sync();}});
  observer.observe(experiment);
  notify();
  play.onclick=()=>{
   player?.dispose();
   s.exampleObserved=false;s.exampleTraced=false;save();notify();
   root.querySelector('[data-worked-followup]').hidden=true;
   paintTermExperiment(experiment,right,0,reduced);
   if(experiment.getBoundingClientRect().bottom>innerHeight||!inView){
    play.closest('.term-tutor-playback').scrollIntoView({block:'start',behavior:'instant'});
    updateVisibility();
   }
   pause.disabled=false;play.textContent='↻ 從頭再看';
   player=createFoodPlayback({
    duration:24000,maxFrameGapMs:250,
    onTime:value=>paintTermExperiment(experiment,right,value/4,reduced,true),
    onState:state=>{
     paused=state.paused;experiment.toggleAttribute('data-paused',!state.running);
     pause.textContent=state.paused?'繼續':'暫停';
     pause.setAttribute('aria-pressed',String(state.paused));
     if(!state.complete)return;
     const focusHere=document.activeElement===play||document.activeElement===pause;
     s.exampleObserved=true;s.exampleTraced=true;save();render();
     if(focusHere)focus('[data-term-play]');
    }
   });
   sync();
  };
  pause.onclick=()=>{
   if(paused){updateVisibility();player.resume();sync();}
   else player?.pause();
  };
 }
 document.addEventListener('visibilitychange',sync);
 const modalObserver=new MutationObserver(sync);
 modalObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 render();
 return ()=>{stop();modalObserver.disconnect();document.removeEventListener('visibilitychange',sync);save();};
}
