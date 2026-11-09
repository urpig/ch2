import {createFoodPlayback} from './food-playback.js';
import {rustComparisons,rustEnvironments,rustPreventionFrame} from './rust-prevention-model.js';
import {createRustSwordRenderer} from './rust-sword-renderer.js';

export function mountRust(root,c,{record,onCleanup}){
 let player=null,disposed=false,paused=false,started=false,progress=0;
 const renderers=new Map(),keys=rustComparisons.basic.cases;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 root.innerHTML=`<section class="rust-prevention" aria-label="上油與加水的寶劍防鏽對照實驗">
  <div class="rust-playback"><span>相同寶劍 · 相同觀察時間</span><div><button type="button" class="primary" data-rust-play disabled>正在準備寶劍影像</button><button type="button" class="secondary" data-rust-pause disabled>暫停</button></div></div>
  <div class="rust-sword-bench"><span class="rust-phase" data-rust-phase>觀察前</span>${keys.map(key=>`<figure class="rust-sword-tray" data-rust-case="${key}"><figcaption><b>${rustEnvironments[key].name}</b><span>${rustEnvironments[key].condition}</span></figcaption><div class="rust-sword-surface"><canvas role="img" aria-label="${rustEnvironments[key].name}：寶劍全貌與劍身放大細節"></canvas><span class="rust-macro-label">劍身放大</span></div><p data-rust-result></p></figure>`).join('')}</div>
 </section>`;
 const play=root.querySelector('[data-rust-play]'),pause=root.querySelector('[data-rust-pause]'),bench=root.querySelector('.rust-sword-bench');
 const sync=()=>{if(!player||disposed)return;const r=bench.getBoundingClientRect();player.setActive(r.bottom>0&&r.top<innerHeight&&!document.hidden&&!document.querySelector('dialog[open]'));};
 function paint(p){
  progress=p;
  root.querySelectorAll('[data-rust-case]').forEach(node=>{
   const key=node.dataset.rustCase,f=rustPreventionFrame(key,p);renderers.get(key)?.draw(f);
   node.querySelector('[data-rust-result]').textContent=f.complete?rustEnvironments[key].result:!started?'尚未生鏽的相同鐵劍':p<.12?(key==='oil'?'完整塗上一層油':key==='wet'?'讓水留在劍身表面':'保持原樣，作為對照'):'觀察鏽斑逐漸出現的位置';
  });
  root.querySelector('[data-rust-phase]').textContent=p===0?'觀察前':p<.12?'準備條件':p===1?'經過相同時間':'長時間生鏽 · 加快呈現';
 }
 paint(0);
 Promise.all(keys.map(key=>createRustSwordRenderer(root.querySelector(`[data-rust-case="${key}"] canvas`),key).then(renderer=>{
  if(disposed){renderer.dispose();return;}renderers.set(key,renderer);renderer.draw(rustPreventionFrame(key,progress));
 }))).then(()=>{if(disposed)return;play.disabled=false;play.textContent='▶ 播放對照動畫';}).catch(()=>{
  if(!disposed){play.textContent='重新載入寶劍影像';play.disabled=false;play.onclick=()=>location.reload();}
 });
 play.onclick=()=>{
  player?.dispose();started=true;paused=false;play.textContent='↻ 重播對照動畫';
  player=createFoodPlayback({duration:reduced?6000:8000,onTime:t=>paint(t/4),onState:state=>{
   paused=state.paused;pause.disabled=state.complete;pause.textContent=paused?'繼續':'暫停';pause.setAttribute('aria-pressed',String(paused));if(state.complete)keys.forEach(record);
  }});
  pause.disabled=false;sync();
 };
 pause.onclick=()=>{if(paused){player?.resume();sync();}else player?.pause();};
 const observer=new IntersectionObserver(sync);observer.observe(bench);document.addEventListener('visibilitychange',sync);
 const modalObserver=new MutationObserver(sync);modalObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 onCleanup(()=>{disposed=true;player?.dispose();observer.disconnect();modalObserver.disconnect();document.removeEventListener('visibilitychange',sync);renderers.forEach(renderer=>renderer.dispose());renderers.clear();});
}
