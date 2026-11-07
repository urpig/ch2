// Shared playback control: pause the animation without moving its clock.
export function observationTimeline(){
 return `<div class="observation-timeline" role="group" aria-label="動畫播放控制" aria-disabled="true"><button type="button" data-time-toggle aria-pressed="false" disabled>暫停</button></div>`;
}

export function bindObservationTimeline(root,{onPause=()=>{},onResume=()=>{}}={}){
 const bar=root.querySelector('.observation-timeline'),button=bar.querySelector('[data-time-toggle]');
 let paused=false,running=false;
 function update(){
  bar.setAttribute('aria-disabled',String(!running));button.disabled=!running;
  button.textContent=paused?'繼續':'暫停';button.setAttribute('aria-pressed',String(paused));
 }
 button.onclick=()=>{
  if(!running)return;
  paused=!paused;update();if(paused)onPause();else onResume();
 };
 update();
 return {start(){running=true;paused=false;update();},finish(){running=false;paused=false;update();},reset(){running=false;paused=false;update();},dispose(){button.onclick=null;}};
}
