// Qualitative teaching time: pause when the card or browser is hidden.
export function createFoodPlayback({onTime=()=>{},onState=()=>{},initialTime=0,initialPaused=false,duration=12000,maxFrameGapMs=250,requestFrame=callback=>requestAnimationFrame(callback),cancelFrame=id=>cancelAnimationFrame(id),now=()=>performance.now()}={}){
 let elapsed=Math.max(0,Math.min(4,Number(initialTime)||0))/4*duration,active=false,paused=!!initialPaused,alive=true,frame=null,last=0,generation=0;
 const state=()=>({active,paused,complete:elapsed>=duration,running:active&&!paused&&elapsed<duration});
 function stop(){generation++;if(frame!==null)cancelFrame(frame);frame=null;}
 function schedule(){if(!alive||frame!==null||!state().running)return;last=now();const token=generation;frame=requestFrame(time=>tick(time,token));}
 function tick(time,token){if(!alive||token!==generation)return;frame=null;if(!state().running)return;elapsed=Math.min(duration,elapsed+Math.max(0,Math.min(maxFrameGapMs,time-last)));last=time;onTime(elapsed/duration*4);if(elapsed>=duration)onState(state());else{const next=generation;frame=requestFrame(time=>tick(time,next));}}
 function refresh(){stop();onState(state());schedule();}
 onTime(elapsed/duration*4);onState(state());
 return {setActive(value){if(!alive||active===!!value)return;active=!!value;refresh();},pause(){if(!alive||paused)return;paused=true;refresh();},resume(){if(!alive||!paused)return;paused=false;refresh();},seek(value){if(!alive)return;elapsed=Math.max(0,Math.min(4,Number(value)||0))/4*duration;stop();onTime(elapsed/duration*4);onState(state());schedule();},replay(){if(!alive)return;elapsed=0;paused=false;stop();onTime(0);onState(state());schedule();},dispose(){if(!alive)return;alive=false;stop();}};
}
