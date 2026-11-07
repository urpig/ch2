import {ironAffinityBench} from './iron-affinity-bench.js';
import {bindDrop} from './direct-manipulation.js';
import {ironCandidates,freshIronTrials,chooseIronTrial,beginIronTrial,finishIronTrial,restoreIronTrials} from './iron-affinity-model.js';
import {sampleVisual} from './specimens.js';
const storageKey='lost-forge-iron-affinity-v1';
export function resetIronAffinity(){try{localStorage.removeItem(storageKey);}catch{}}
function sampleDish(id,after,{oxideOnly=false,prefix='dish'}={}){const d=ironCandidates[id],reduced=after&&d.canReduce,powder=reduced?'#637675':'#995735',reagent=reduced?(id==='C'?'#68756a':'#dddcc9'):oxideOnly?powder:d.colour;return `<svg viewBox="0 0 280 150" role="img" aria-label="${after?(reduced?'灰黑色鐵與反應產物':'仍有紅棕色氧化鐵，沒有得到金屬鐵'):oxideOnly?'預先放好的紅棕色氧化鐵 Fe₂O₃':'紅棕色氧化鐵與'+d.name+'，加熱前'}"><defs><linearGradient id="dish-${prefix}-${id}-${after}" x2="0" y2="1"><stop stop-color="#fffef5"/><stop offset=".25" stop-color="#eef0e5"/><stop offset=".55" stop-color="#cad4c8"/><stop offset=".82" stop-color="#a6bab1"/><stop offset="1" stop-color="#f7f5e8"/></linearGradient></defs><ellipse cx="141" cy="132" rx="103" ry="10" fill="#385c4920"/><path d="M31 79Q43 134 140 136Q237 134 249 79Z" fill="url(#dish-${prefix}-${id}-${after})" stroke="#91a79a"/><path d="M44 102Q140 151 236 102M62 119Q140 146 219 119" stroke="#718d8260" stroke-width="1.2" fill="none"/><path d="M44 89Q48 110 65 119" stroke="#fffff3" stroke-width="3" fill="none" opacity=".8"/><ellipse cx="140" cy="79" rx="109" ry="34" fill="#edf0df" stroke="#8fa89c"/><ellipse cx="140" cy="82" rx="98" ry="27" fill="${powder}"/>${Array.from({length:350},(_,i)=>{const angle=i*2.3999,r=Math.sqrt((i+1)/351),x=140+Math.cos(angle)*94*r,y=82+Math.sin(angle)*24*r;return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${.35+i%5*.24}" fill="${i%5===0?'#fff9df':i%5===1?'#242e2d':i%3?powder:reagent}" opacity="${.35+i%4*.18}"/>`;}).join('')}<path d="M36 77Q140 128 244 77" fill="none" stroke="#ffffed" stroke-width="3" opacity=".8"/>${reduced&&id==='C'?'<path d="M124 45q-10-14 2-26m16 25q-5-18 7-30m10 30q11-13 2-24" stroke="#91a493" fill="none" stroke-width="2" opacity=".6"/><text x="140" y="13" text-anchor="middle" fill="#627a68" font-size="10">CO₂ · 無色氣體，箭頭示意</text>':''}</svg>`;}
export function mountIronAffinity(root,ctx){let raw=null;try{raw=JSON.parse(localStorage.getItem(storageKey)||'null');}catch{}let state=restoreIronTrials(raw,Object.keys(ironCandidates).filter(id=>ctx.has('iron-'+id))),alive=true,runId=0;
 const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify({selected:state.selected}));}catch{}};
 function render(){const id=state.selected,d=ironCandidates[id],done=state.phase==='done',running=state.phase==='running';
 root.innerHTML=`<section class="iron-affinity-workshop" data-trial-phase="${state.phase}" aria-label="四種材料還原氧化鐵的比較實驗"><header><div><small>04 / 先挑幫手</small><h3>誰能拿走氧化鐵的氧？</h3></div><b>${Object.keys(state.results).length} / 4 已觀察</b></header>

 <button type="button" class="studio-enter" data-enter-iron>進入實驗台，取用四種材料 ↘</button><div class="iron-rack-shell specimen-shelf"><div class="iron-rack-heading shelf-heading"><b>鐵匠的樣本架</b><span>抓取材料 → 加入氧化鐵 → 比較產物</span></div><div class="iron-candidate-rack iron-drag-rack shelf-rail" role="group" aria-label="抓取碳、鋅、錫、銅">${Object.entries(ironCandidates).map(([k,v])=>`<div class="iron-rack-item ${k===id?'selected':''}"><div class="iron-reagent" data-iron-reagent="${k}" aria-label="${v.name}樣本"><div class="specimen-vial">${sampleVisual(k,false,true,'iron-rack-'+k,{form:{C:'carbon',Zn:'powder',Sn:'block',Cu:'sheet'}[k]})}</div></div><div class="iron-candidate-label"><b>${k} <span>${v.name}</span></b><small>${state.results[k]?'✓ 已觀察':'抓取樣本 ↓'}</small></div></div>`).join('')}</div>
 </div>${ironAffinityBench({id,name:d.name,colour:d.colour,phase:state.phase,canReduce:d.canReduce,dish:sampleDish})}
 <div class="iron-trial-actions"><span data-iron-status role="status">${running?'正在觀察反應…':done?'可選另一種材料，換一份新氧化鐵比較。':'把樣本拖進坩堝，觀察反應。'}</span></div>
 ${done?`<div class="iron-trial-result" role="status"><b>觀察結果：${d.canReduce?'取回金屬鐵':'未取回金屬鐵'}</b><div class="iron-oxygen-trace" aria-label="氧的去向">${d.canReduce?`<span>氧化鐵失氧 → 鐵</span><span>${d.name}得氧 → ${id==='C'?'CO₂':'ZnO'}</span>`:'<span>氧仍留在氧化鐵 Fe₂O₃ 中</span>'}</div></div>`:''}
 <details class="iron-trial-records" ${Object.keys(state.results).length?'open':''}><summary>已完成的觀察</summary><table><thead><tr><th>材料</th><th>觀察：能否取回鐵</th><th>對氧活性線索</th></tr></thead><tbody>${Object.entries(ironCandidates).filter(([k])=>state.results[k]).map(([k,v])=>`<tr><th>${v.name} ${k}</th><td>${v.canReduce?'能，氧化鐵失氧':'不能，沒有得到金屬鐵'}</td><td>${k} ${v.canReduce?'＞':'＜'} Fe</td></tr>`).join('')}</tbody></table></details>
 </section>`;
 root.querySelector('[data-enter-iron]').onclick=()=>root.querySelector('.iron-rack-heading').scrollIntoView({block:'start',behavior:'instant'});

 function addMaterial(candidate){
  if(state.phase==='running')return;
  if(state.selected!==candidate)chooseIronTrial(state,candidate);
  if(state.phase==='done')state.phase='ready';
  if(!beginIronTrial(state))return;
  const token=++runId,selected=state.selected;
  save();render();
  ctx.delay(()=>{
   if(!alive||runId!==token||state.selected!==selected)return;
   finishIronTrial(state);ctx.record('iron-'+selected);save();render();
  },3000);
 }

 root.querySelectorAll('[data-iron-reagent]').forEach(item=>{const candidate=item.dataset.ironReagent;bindDrop(item,()=>root.querySelector('[data-iron-target]'),{disabled:()=>state.phase==='running',onDrop:()=>addMaterial(candidate),highlightOnPickup:false,onMiss:()=>{root.querySelector('[data-iron-status]').textContent='沒有放進坩堝，請再拖一次。';}});});
 root.querySelector('[data-iron-retry]').onclick=()=>{runId++;state.phase='ready';save();render();};
 }
 render();
 ctx.onCleanup(()=>{alive=false;runId++;});
}
