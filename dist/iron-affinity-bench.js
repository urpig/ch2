import {laboratoryBackground,alcoholLamp} from './laboratory-assets.js';
import {scopeMarkup} from './card-markup.js';

export function ironAffinityBench({id,name,colour,phase,canReduce,dish}){
 const active=phase==='running',done=phase==='done';
 const backdrop=scopeMarkup(`<svg class="iron-bench-art" viewBox="0 0 760 430" role="img" aria-label="氧化鐵預先放在加熱架上的瓷坩堝，下面是酒精燈">${laboratoryBackground()}<defs><linearGradient id="iron-tripod"><stop stop-color="#334f53"/><stop offset=".4" stop-color="#e1e8df"/><stop offset=".6" stop-color="#5e787a"/><stop offset="1" stop-color="#a8bdbb"/></linearGradient><pattern id="iron-mesh" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0H5V5" fill="none" stroke="#647e7a" stroke-width=".7"/></pattern></defs><path d="M250 229L229 360M389 229L410 360M320 236L326 365" fill="none" stroke="url(#iron-tripod)" stroke-width="5"/><ellipse cx="320" cy="229" rx="80" ry="17" fill="url(#iron-mesh)" stroke="#526f70" stroke-width="4"/>${alcoholLamp(true)}<text x="320" y="404" text-anchor="middle" fill="#e7f4ee" font-size="12">酒精燈</text></svg>`,'iron-bench');
 const grains=active?Array.from({length:26},(_,i)=>`<i style="--i:${i};--grain-end:${21+i*17%58}%;--grain-radius:${1.6+i%4*.55}px"></i>`).join(''):'';
 return `<div class="iron-affinity-bench" data-phase="${phase}" data-can="${canReduce}">
 ${backdrop}
 <button type="button" class="iron-bench-model iron-bench-reset" data-iron-retry ${active?'disabled':''}>重新取一份氧化鐵</button>
 <span class="iron-oxide-label">${done?'原料：氧化鐵 Fe₂O₃':'坩堝內：氧化鐵 Fe₂O₃'}</span>
 <div class="iron-cup-target" data-iron-target aria-label="將材料拖入氧化鐵坩堝">
  ${dish(id,done,{oxideOnly:!active&&!done,prefix:'bench-cup'})}
  ${active&&canReduce?`<div class="iron-product-developing" aria-hidden="true">${dish(id,true,{prefix:'bench-changing'})}</div>`:''}
  ${active?`<div class="iron-added-grains" style="--iron-grain:${colour}" aria-hidden="true">${grains}</div>`:''}
  <span>${done?'加熱後產物':active?'材料已加入 · 反應中':'把材料拖進氧化鐵 Fe₂O₃ ↓'}</span>
 </div>
 <aside class="iron-bench-detail">
  <b>${done?'加熱前後 · 對照':active?'材料與氧化鐵正在反應':'氧化鐵已放上加熱架'}</b>
  ${active||done?`<div class="iron-bench-comparison"><figure>${dish(id,false,{prefix:'bench-before'})}<figcaption>加入${name} · 加熱前</figcaption></figure><figure>${done?dish(id,true,{prefix:'bench-after'}):'<div class="iron-bench-wait">觀察中…</div>'}<figcaption>${done?'加熱後 · 冷卻外觀':'等待比較產物'}</figcaption></figure></div>`:''}
  ${active?'<div class="iron-bench-progress"><i></i></div>':''}
 </aside>
 </div>`;
}
