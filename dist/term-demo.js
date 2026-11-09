import {oxygenExamples,freshOxygenExamples,restoreOxygenExamples,oxygenExampleReady,oxygenExamplesReady} from './oxygen-examples-model.js';
import {oxygenExampleArt,paintOxygenExample} from './oxygen-examples-art.js';
import {storySpeech} from './story-dialogue.js';
import {createFoodPlayback} from './food-playback.js';

const storageKey='lost-forge-oxygen-examples-v2';
export function loadTermReview(){
 let state=freshOxygenExamples();try{state=restoreOxygenExamples(JSON.parse(localStorage.getItem(storageKey)));}catch{}
 return {state,save(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}}};
}

export function mountTermDemo(root,{review=loadTermReview(),exampleKey='carbon',sectionId='term-demo'}={}){
 if(!root)return ()=>{};
 const {state:s,save}=review,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let player=null,observer=null,paused=false,alive=true,message='';
 const notify=()=>root.dispatchEvent(new CustomEvent('term-example-progress',{bubbles:true,detail:{key:exampleKey,ready:oxygenExampleReady(s,exampleKey),allReady:oxygenExamplesReady(s)}}));
 const stop=()=>{player?.dispose();player=null;observer?.disconnect();observer=null;};
 const sync=()=>{const scene=root.querySelector('.oxygen-experiment-grid');if(!scene||!player||!alive)return;const r=scene.getBoundingClientRect();player.setActive(r.bottom>0&&r.top<innerHeight&&!document.hidden&&!document.querySelector('dialog[open]'));};
 function render(focus){
  stop();paused=false;
  const key=exampleKey,e=oxygenExamples[key],seen=s.observed.includes(key),judged=oxygenExampleReady(s,key);
  root.innerHTML=`<section class="oxygen-examples" id="${sectionId}" aria-label="從實驗與反應式追蹤氧" data-oxygen-example-key="${key}" data-glossary-skip>
   <section id="${key==='carbon'?'oxygen-example-panel':'magnesium-example-panel'}" aria-label="${e.tab}">
    <div class="oxygen-example-heading"><h3>${e.title}</h3><div class="oxygen-playback"><button type="button" class="primary" data-term-play>${seen?'↻ 重播實驗動畫':'▶ 播放實驗動畫'}</button><button type="button" class="secondary" data-term-pause disabled>暫停</button></div></div>
    <div class="oxygen-equation"><b>${e.equation}</b><span>加熱條件下的總反應</span></div>
    <div data-oxygen-scene>${oxygenExampleArt(key)}</div>
    ${key==='carbon'?'':`<section class="oxygen-judgement" ${seen?'':'hidden'} data-oxygen-judgement><h4>對照反應式：誰得到氧，誰失去氧？</h4><div>${[`${e.oxidized}被氧化；${e.reduced}被還原`,`${e.reduced}被氧化；${e.oxidized}被還原`].map((text,i)=>`<button type="button" data-oxygen-answer="${i}" aria-pressed="${s.answers[key]===i}">${text}</button>`).join('')}</div><p role="status" data-oxygen-feedback>${message}</p></section>`}
    <div class="oxygen-explanation" ${judged?'':'hidden'} data-oxygen-explanation>
     ${key==='carbon'?`<div class="story-dialogue dialogue-stack" aria-label="阿公解釋碳與氧化銀的反應">
      ${storySpeech('grandpa','「我們剛剛看到氧化銀被還原，變成銀金屬；同時，碳被氧化，變成二氧化碳。有物質被還原，就一定會有物質被氧化，氧化與還原反應必定會一起發生喔！」')}
     </div>`:`
     <div class="oxygen-role-pair"><p><b>${e.reduced} · 被還原</b>失去氧</p><p><b>${e.oxidized} · 被氧化</b>得到氧</p></div>
     ${storySpeech('grandpa','「'+e.conclusion+e.activity+'」')}
     ${storySpeech('grandpa','「'+e.donor+'是氧化劑，使'+e.receiver+'被氧化，自己被還原。'+e.receiver+'是還原劑，使'+e.donor+'被還原，自己被氧化。」')}
     `}
    </div>
   </section>
  </section>`;
  const scene=root.querySelector('[data-oxygen-scene]');paintOxygenExample(scene,key,seen?1:0,reduced);
  const play=root.querySelector('[data-term-play]'),pause=root.querySelector('[data-term-pause]');
  play.onclick=()=>{
   player?.dispose();s.observed=s.observed.filter(x=>x!==key);delete s.answers[key];save();notify();message='';
   const judgement=root.querySelector('[data-oxygen-judgement]');if(judgement)judgement.hidden=true;root.querySelector('[data-oxygen-explanation]').hidden=true;root.querySelector('.oxygen-summary')?.remove();
   play.textContent='↻ 從頭再看';pause.disabled=false;paused=false;
   player=createFoodPlayback({duration:24000,maxFrameGapMs:250,onTime:t=>paintOxygenExample(scene,key,t/4,reduced),onState:state=>{
    paused=state.paused;pause.textContent=paused?'繼續':'暫停';pause.setAttribute('aria-pressed',String(paused));pause.disabled=state.complete;
    if(state.complete){s.observed.push(key);save();if(judgement)judgement.hidden=false;root.querySelector('[data-oxygen-explanation]').hidden=!oxygenExampleReady(s,key);play.textContent='↻ 重播實驗動畫';notify();}
   }});sync();
  };
  pause.onclick=()=>{if(paused){player?.resume();sync();}else player?.pause();};
  root.querySelectorAll('[data-oxygen-answer]').forEach(button=>button.onclick=()=>{
   if(!s.observed.includes(key))return;s.answers[key]=Number(button.dataset.oxygenAnswer);
   message=s.answers[key]===0?'✓ 得氧與失氧的兩方同時改變。':`再看紅色 O 的方向：氧離開${e.donor}、移到${e.receiver}。請再選一次。`;
   save();render('[data-oxygen-answer="'+button.dataset.oxygenAnswer+'"]');
  });
  observer=new IntersectionObserver(sync);observer.observe(scene);
  notify();if(focus)root.querySelector(focus)?.focus({preventScroll:true});
 }
 document.addEventListener('visibilitychange',sync);
 const modals=new MutationObserver(sync);modals.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 render();return ()=>{alive=false;stop();modals.disconnect();document.removeEventListener('visibilitychange',sync);save();};
}
