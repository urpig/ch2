import {mountBurn} from './hands-on-burn.js';
import {mountCombustionDemo} from './combustion-demo.js';
import {combustionDemoReady,restoreCombustionDemo} from './combustion-demo-model.js';

export function mountCombustionLesson(root,c,ctx){
 const {s}=ctx;Object.assign(s,restoreCombustionDemo(s));
 const ready=combustionDemoReady(s.combustionDemoSeen),practice=s.combustionMode==='practice'&&ready;
 root.innerHTML=`<div class="combustion-lesson"><nav class="combustion-lesson-tabs" aria-label="先看示範，再自己操作"><button type="button" data-combustion-mode="demo" aria-current="${practice?'false':'step'}">1 先看阿公示範</button><button type="button" data-combustion-mode="practice" aria-current="${practice?'step':'false'}" ${ready?'':'disabled'}>2 換你自己操作</button></nav><div data-combustion-lesson-content></div></div>`;
 const remount=(focusSelector)=>{ctx.setCase(s.selected,false);if(focusSelector)root.querySelector(focusSelector)?.focus({preventScroll:true});};
 root.querySelectorAll('[data-combustion-mode]').forEach(button=>button.onclick=()=>{if(button.dataset.combustionMode==='practice'&&!combustionDemoReady(s.combustionDemoSeen))return;s.combustionMode=button.dataset.combustionMode;remount('[aria-current="step"]');});
 const content=root.querySelector('[data-combustion-lesson-content]');
 if(practice)mountBurn(content,c,ctx);
 else mountCombustionDemo(content,c,ctx,{
  onSample:(key,auto)=>{s.combustionDemoSample=key;s.combustionDemoAutoPlay=auto;remount('[data-combustion-demo-play]');},
  onPractice:()=>{if(!combustionDemoReady(s.combustionDemoSeen))return;s.combustionMode='practice';s.selected='Mg';remount('[data-combustion-mode="practice"]');root.querySelector('[data-combustion-lesson-content]').scrollIntoView({block:'start',behavior:'instant'});}
 });
 const sync=()=>{root.querySelector('[data-combustion-mode="practice"]').disabled=!combustionDemoReady(s.combustionDemoSeen);};
 root.addEventListener('combustion-demo-progress',sync);ctx.onCleanup(()=>root.removeEventListener('combustion-demo-progress',sync));
}
