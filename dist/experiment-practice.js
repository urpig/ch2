import {createFoodPlayback} from './food-playback.js';
import {bindReactantPickup} from './life-reactant-drag.js';
import {freshFireExperiment,startFireTrial,finishFireTrial,fireExperimentReady,fireExperimentFrame,fireExperimentQuiz,fireMethods} from './fire-experiment-model.js';
import {fireToolArt,createFireExperimentRenderer} from './fire-experiment-art.js';

export function fireExperimentMarkup(){return `<section class="fire-investigation" aria-label="探究不能用水撲滅的火災">
 <header><div><small>實驗題 · 不能用水撲滅的火災</small><h4>油鍋起火，加水能讓火變小嗎？</h4></div><button type="button" class="secondary" data-fire-reset>↺ 重新實驗</button></header>
 <p>選一種方式放到虛擬油鍋上，觀察火焰的變化。每次都從相同的起火狀態開始。</p>
 <div class="fire-experiment-layout"><div class="fire-experiment-tools" role="group" aria-label="選取模擬器材">${Object.entries(fireMethods).map(([key,method])=>`<button type="button" class="fire-experiment-tool" data-fire-tool="${key}" aria-pressed="false">${fireToolArt(key)}<b>${method.label}</b></button>`).join('')}<p>拖到油鍋，或點選器材後再點油鍋。</p></div>
 <div class="fire-experiment-stage"><button type="button" class="fire-experiment-target" data-fire-target aria-label="將選取的器材用在虛擬油鍋"><canvas role="img" aria-label="起火的油鍋，等待選擇處理方式"></canvas><span class="fire-target-label">把器材放到這裡</span><span class="fire-simulation-label">螢幕模擬</span></button><div class="fire-experiment-controls"><button type="button" class="secondary" data-fire-replay disabled>↻ 重看這次</button><button type="button" class="secondary" data-fire-pause disabled>暫停</button></div></div></div>
 <p class="fire-experiment-status" data-fire-status role="status">先選一種方式，看看火焰怎麼變。</p>
 <div class="fire-experiment-records" aria-label="你的實驗結果">${Object.entries(fireMethods).map(([key,method])=>`<div data-fire-record="${key}"><b>${method.label}</b><span>尚未試過</span></div>`).join('')}</div>
 <p class="fire-experiment-safety">這是螢幕中的探究。遇到真實火災，先遠離危險、通知大人並撥打 119。</p></section>`;}

export function mountExperimentPractice(addQuestion){
 let state=freshFireExperiment(),selected=null,player=null,running=false,paused=false;
 const cleanups=[];
 const sync=addQuestion({id:'practice-experiment',label:'實驗題 · 動手找答案',source:'#forge-prep',quiz:fireExperimentQuiz,context:fireExperimentMarkup(),onAnswer:answer=>{if(!fireExperimentReady(state)||running)return;state.answer=answer;sync(answer);}});
 const card=sync.card;if(!card)return;
 card.querySelector('header>a')?.remove();
 const root=card.querySelector('.fire-investigation'),target=root.querySelector('[data-fire-target]'),canvas=target.querySelector('canvas');
 const renderer=createFireExperimentRenderer(canvas),status=root.querySelector('[data-fire-status]'),pause=root.querySelector('[data-fire-pause]'),replay=root.querySelector('[data-fire-replay]');
 const tools=[...root.querySelectorAll('[data-fire-tool]')],answers=card.querySelectorAll('[data-answer]'),question=card.querySelector('[data-question]>h4'),choices=card.querySelector('.prep-answers');
 function update(){
  const ready=fireExperimentReady(state);root.dataset.phase=running?'playing':state.method?'result':'ready';
  for(const tool of tools){tool.disabled=running;tool.setAttribute('aria-pressed',String(selected===tool.dataset.fireTool));}
  target.disabled=running;target.querySelector('.fire-target-label').hidden=running||!!state.method;
  pause.disabled=!running;pause.textContent=paused?'繼續':'暫停';pause.setAttribute('aria-pressed',String(paused));replay.disabled=running||!state.method;
  for(const button of answers)button.disabled=!ready||running;question.hidden=choices.hidden=!ready;
  for(const record of root.querySelectorAll('[data-fire-record]')){const key=record.dataset.fireRecord;record.querySelector('span').textContent=state.observed.includes(key)?fireMethods[key].result:'尚未試過';record.classList.toggle('is-observed',state.observed.includes(key));}
 }
 function paint(p){const f=fireExperimentFrame(state.method,p);renderer?.draw(f);canvas.setAttribute('aria-label',f.complete?f.caption:'虛擬油鍋實驗：'+(state.method?fireMethods[state.method].label:'等待選擇方式'));if(running)status.textContent=f.caption;}
 const visibility=()=>{const r=target.getBoundingClientRect(),active=r.bottom>0&&r.top<innerHeight&&!document.hidden;player?.setActive(active);renderer?.setActive(active);};
 function apply(method){
  if(running||!startFireTrial(state,method))return;
  player?.dispose();selected=null;running=true;paused=false;sync(null);card.querySelector('[data-show-explanation]').hidden=true;
  paint(0);renderer?.setPaused(false);
  player=createFoodPlayback({duration:method==='water'?6500:7500,onTime:t=>paint(t/4),onState:value=>{paused=value.paused;renderer?.setPaused(paused);if(value.complete){finishFireTrial(state);running=false;status.textContent=fireMethods[method].result;sync(state.answer);}update();}});
  visibility();update();
 }
 for(const tool of tools){const key=tool.dataset.fireTool;let dropped=-Infinity;
  tool.addEventListener('click',()=>{if(running||performance.now()-dropped<400)return;selected=selected===key?null:key;status.textContent=selected?'已選取'+fireMethods[key].label+'，點選油鍋開始。':'先選一種方式。';update();});
  cleanups.push(bindReactantPickup(tool,target,{disabled:()=>running,liftPreview:true,onDrop:()=>{dropped=performance.now();apply(key);},onMiss:()=>{status.textContent='把器材放到油鍋畫面內。';},onCancel:()=>{selected=null;status.textContent='已放回器材。';update();}}));
 }
 target.onclick=()=>{if(selected)apply(selected);else status.textContent='先選左邊的水壺或鍋蓋。';};
 pause.onclick=()=>paused?player?.resume():player?.pause();replay.onclick=()=>apply(state.method);
 root.querySelector('[data-fire-reset]').onclick=()=>{player?.dispose();player=null;cleanups.forEach(fn=>fn.cancel?.());state=freshFireExperiment();selected=null;running=paused=false;paint(0);renderer?.setPaused(false);sync(null);card.querySelector('[data-show-explanation]').hidden=true;status.textContent='先選一種方式，看看火焰怎麼變。';update();};
 const observer=new IntersectionObserver(visibility);observer.observe(target);document.addEventListener('visibilitychange',visibility);
 window.addEventListener('pagehide',()=>{player?.dispose();renderer?.dispose();observer.disconnect();document.removeEventListener('visibilitychange',visibility);cleanups.forEach(fn=>fn());},{once:true});
 sync(null);paint(0);update();visibility();
}
