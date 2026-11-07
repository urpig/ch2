import {observationTimeline} from './observation-timeline.js';
import {laboratoryBackdrop} from './life-laboratory-scene.js';
import {laboratoryReagent,laboratoryTransfer,bindLaboratoryTransfer} from './lab-reagent-art.js';
import {bindLifePlayback} from './life-autoplay.js';
import {appleComparison} from './everyday-redox-model.js';

const startObservation='剛開始觀察，兩片蘋果的顏色相近。';
const endObservation='經過相同時間，左側較能保持原色，右側明顯褐變。';

export function appleMarkup(complete=false){return `<section class="apple-comparison life-manual-reaction life-auto-observation" data-life-observation data-life-reaction="food" data-phase="${complete?'complete':'ready'}" aria-label="維生素 C 與蘋果褐變對照實驗" style="--apple-browning:${complete?1:0}"><header><div><h3>維生素 C 能延緩蘋果褐變嗎？</h3><p>左側加入維生素 C，右側保留原樣。比較相同時間後的變化。</p></div><button type="button" class="text-button" data-apple-reset data-life-retry>${complete?'↻ 重播動畫':'▶ 播放動畫'}</button></header>
<div class="life-mix-workbench life-bleach-workbench"><div class="life-reactor-panel"><div class="life-reactor-condition">相同蘋果、空氣與溫度 · 只有是否加入維生素 C 不同</div><div class="life-reactor-art life-reactor-food"><div class="life-lab-room apple-lab-room">${laboratoryBackdrop(complete)}<div class="apple-groups lab-specimen-groups"><figure class="lab-experimental"><div class="apple-photo" role="img" aria-label="加入維生素 C 的蘋果"></div><figcaption><b>實驗組</b><span>加入維生素 C 溶液</span></figcaption></figure><figure class="lab-control"><div class="apple-photo" role="img" aria-label="未加維生素 C 的蘋果"></div><figcaption><b>對照組</b><span>未加維生素 C</span></figcaption></figure></div></div>${laboratoryTransfer('vitaminc')}<div class="life-reactant bleach-bench-reagent">${laboratoryReagent('vitaminc')}</div></div>${observationTimeline()}</div></div><p data-apple-status role="status">${complete?endObservation:''}</p></section>`;}

export function bindAppleComparison(scene,onComplete){
 const reset=scene.querySelector('[data-apple-reset]'),status=scene.querySelector('[data-apple-status]');
 const seconds=5.8,paintTransfer=bindLaboratoryTransfer(scene,'vitaminc',seconds);
 function paint(p) {
  const time=Math.max(0,(p-.28)/.72);
  const {plain,protected:treated}=appleComparison(time*4);
  scene.style.setProperty('--apple-control-brown',String(plain));
  scene.style.setProperty('--apple-treated-brown',String(treated*.52));
  scene.style.setProperty('--specimen-wet',String(Math.max(0,Math.min(1,(p*seconds-1.03)/.72))*(1-time)*.62));
  paintTransfer(p);
  status.textContent=p===1?endObservation:p<.4?startObservation:'縮時觀察中，右側的切面逐漸褐變。';
 }
 const dispose=bindLifePlayback(scene,{seconds,paint,initialComplete:scene.dataset.phase==='complete',onStart:()=>onComplete('start'),onComplete:()=>onComplete('complete')});
 return dispose;
}
