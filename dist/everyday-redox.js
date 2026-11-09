import {lifePairedMarkup,bindLifePairedReaction} from './life-paired-reaction.js';
import {lifeBiology,lifeBleaches,freshLife,restoreLife,lifeReady,lifeMastered,recordLifeDemonstration} from './everyday-redox-model.js';
import {storySpeech} from './story-dialogue.js';
const storageKey='lost-forge-everyday-redox-v1';
const guidedExplanations={
 food:'「加了維生素 C 的蘋果比較晚褐變，因為維生素 C 會先被氧化，讓褐變過程中的物質被還原。所以維生素 C 是還原劑。不過它會慢慢被消耗，不能永久保鮮喔！」',
 photo:'「光合作用裡，水被氧化，形成氧氣；二氧化碳被還原，用來合成葡萄糖。兩邊是一起發生的喔！接下來換看有氧呼吸，試著找出誰被氧化、誰被還原。」'
};
function loadLife(){
 try {return restoreLife(JSON.parse(localStorage.getItem(storageKey)||'null'));}
 catch {return freshLife();}
}

export function loadLifeReview(source){
 const state=loadLife();
 const report=()=>source.dispatchEvent(new CustomEvent('life-progress',{bubbles:true,detail:{observed:lifeReady(state),mastered:lifeMastered(state)}}));
 function save(){
  let saved=true;
  try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{saved=false;}
  report();
  return saved;
 }
 report();
 return {state,save,reset(){Object.assign(state,freshLife());save();}};
}

export function mountEverydayRedox(root,{tab=0,caseKey=null,review,onCaseChange=()=>{}}={}){
 const s=review.state;
 let cleanup=()=>{};
 if(!caseKey)s.tab=tab;
 const group=caseKey?(lifeBiology[caseKey]?0:lifeBleaches[caseKey]?1:2):tab;
 const save=()=>review.save();
 const activeKey=()=>caseKey||(group===0?s.bio:group===1?s.bleach:'food');
 function render(focus,fromStart=false){
  cleanup();cleanup=()=>{};const key=activeKey();let seen=(key==='food'?(s.time>=4||s.evidence.includes('food')):s.seen.includes(key)||s.evidence.includes(key))&&!fromStart;
  onCaseChange(key);
  root.innerHTML=`${!caseKey&&group<2?`<div class="life-selector" role="tablist" aria-label="${group===0?'選擇生物反應':'選擇漂白方式'}">${Object.entries(group===0?lifeBiology:lifeBleaches).map(([k,b])=>`<button id="life-tab-${k}" role="tab" aria-controls="life-panel-${group}" aria-selected="${key===k}" tabindex="${key===k?0:-1}" data-life-choice="${k}" aria-pressed="${key===k}">${group===1?({peroxide:'過氧化氫 × 豆干',chlorine:'次氯酸鈉 × 衣服',sulfur:'二氧化硫 × 竹筷'})[k]:b.name}${s.evidence.includes(k)?' ✓':''}</button>`).join('')}</div>`:''}
  <div ${!caseKey&&group<2?`role="tabpanel" id="life-panel-${group}" aria-labelledby="life-tab-${key}"`:''}>
  ${lifePairedMarkup(key,seen)}
  ${guidedExplanations[key]?`<div class="life-guided-explanation" data-life-teacher ${seen?'':'hidden'}>${storySpeech('grandpa',guidedExplanations[key])}</div>`:''}
  </div>
  ${!caseKey&&group===1&&s.evidence.includes('peroxide')&&s.evidence.includes('sulfur')?'<section class="bleach-comparison"><h4>都能褪色，角色一樣嗎？</h4><table><thead><tr><th>試劑</th><th>色素</th><th>試劑自己</th></tr></thead><tbody><tr><th>過氧化氫</th><td>被氧化</td><td>被還原</td></tr><tr><th>二氧化硫</th><td>被還原</td><td>被氧化</td></tr></tbody></table></section>':''}
`;
  cleanup=bindLifePairedReaction(root.querySelector('[data-life-observation]'),event=>{
   if(event==='start'){
    if(key==='food')s.time=0;
    s.evidence=s.evidence.filter(x=>x!==key);s.seen=s.seen.filter(x=>x!==key);delete s.bioRoles[key];seen=false;
    const teacher=root.querySelector('[data-life-teacher]');if(teacher)teacher.hidden=true;
    save();return;
   }
   if(key==='food')s.time=4;else if(!s.seen.includes(key))s.seen.push(key);
   recordLifeDemonstration(s,key);render('[data-life-retry]');save();root.dispatchEvent(new CustomEvent('life-observed',{bubbles:true}));
  });
  root.querySelectorAll('[data-life-choice]').forEach(b=>b.onclick=()=>{if(group===0)s.bio=b.dataset.lifeChoice;else s.bleach=b.dataset.lifeChoice;render('[data-life-choice="'+activeKey()+'"]',true);save();});
  root.querySelector('[role="tablist"]')?.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   const tabs=[...root.querySelectorAll('[role="tab"]')],i=tabs.indexOf(document.activeElement);
   if(i<0)return;event.preventDefault();
   tabs[event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length].click();
  });
  if(focus)root.querySelector(focus)?.focus({preventScroll:true});
 }
 render(undefined,true);save();return ()=>cleanup();
}
