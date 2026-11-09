import {createFoodPlayback} from './food-playback.js';
import {bindObservationTimeline} from './observation-timeline.js';

// Students start each demonstration; visibility only pauses or resumes its clock.
export function bindLifePlayback(scene,{seconds,paint,onStart,onComplete,initialComplete=false}={}){
 let player=null,disposed=false,complete=initialComplete;
 const stage=scene.querySelector('.bio-stage-art,.life-reactor-art');
 const play=scene.querySelector('[data-life-retry]');
 const controls=bindObservationTimeline(scene,{
  onPause:()=>player?.pause(),onResume:()=>player?.resume()
 });
 const isVisible=()=>{
  const r=stage.getBoundingClientRect();
  const visibleHeight=Math.min(r.bottom,innerHeight)-Math.max(r.top,0);
  return !disposed&&!document.hidden&&!scene.closest('[inert],[hidden]')&&
   !document.querySelector('dialog[open]')&&r.height>0&&visibleHeight>=Math.min(r.height*.35,200);
 };
 const visibility=()=>player?.setActive(isVisible());
 function begin(){
  if(disposed)return;
  player?.dispose();complete=false;onStart?.();
  scene.dataset.phase='running';controls.start();play.textContent='↻ 重新播放';
  // Show the experiment and the equation as one reading unit when playback starts.
  scene.scrollIntoView({block:'start',behavior:'instant'});
  player=createFoodPlayback({
   duration:matchMedia('(prefers-reduced-motion:reduce)').matches?1:seconds*1000,
   onTime:t=>paint(t/4),
   onState:state=>{
    if(disposed||complete||!state.complete)return;
    complete=true;scene.dataset.phase='complete';controls.finish();play.textContent='↻ 重播動畫';onComplete?.();
   }
  });
  visibility();
 }
 scene.dataset.phase=initialComplete?'complete':'ready';paint(initialComplete?1:0);
 play.textContent=initialComplete?'↻ 重播動畫':'▶ 播放動畫';play.onclick=begin;
 if(initialComplete)controls.finish();
 const observer=new IntersectionObserver(visibility);observer.observe(stage);
 const modalObserver=new MutationObserver(visibility);
 modalObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 window.addEventListener('scroll',visibility,{passive:true,capture:true});window.addEventListener('resize',visibility);
 document.addEventListener('visibilitychange',visibility);
 return ()=>{
  disposed=true;play.onclick=null;player?.dispose();controls.dispose();observer.disconnect();modalObserver.disconnect();
  window.removeEventListener('scroll',visibility,true);window.removeEventListener('resize',visibility);
  document.removeEventListener('visibilitychange',visibility);
 };
}
