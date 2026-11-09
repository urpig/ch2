import {lifePairedMarkup,bindLifePairedReaction} from './life-paired-reaction.js';
import {lifeBiology,lifeBleaches,freshLife,restoreLife,lifeReady,lifeMastered,lifeRecord,recordLifeDemonstration} from './everyday-redox-model.js';
import {storySpeech} from './story-dialogue.js';
const storageKey='lost-forge-everyday-redox-v1';
const labels={photo:'光合作用',resp:'有氧呼吸',peroxide:'過氧化氫',chlorine:'次氯酸鈉',sulfur:'二氧化硫',food:'維生素 C'};
const roleName=r=>r==='oxidation'?'被氧化':'被還原';
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
 let message='',cleanup=()=>{};
 if(!caseKey)s.tab=tab;
 const group=caseKey?(lifeBiology[caseKey]?0:lifeBleaches[caseKey]?1:2):tab;
 const save=()=>review.save();
 const activeKey=()=>caseKey||(group===0?s.bio:group===1?s.bleach:'food');
 function biologyRoles(key,seen){const b=lifeBiology[key];return `<section class="life-path-task" aria-label="依反應資料配對角色"><h4>這次是誰被氧化、誰被還原？</h4><div class="bio-role-tasks">${b.paths.map((p,i)=>`<fieldset><legend>${p.from}</legend>${[['oxidation','被氧化'],['reduction','被還原']].map(([r,label])=>`<button data-bio-role="${i}:${r}" aria-pressed="${s.bioRoles[key]?.[i]===r}" ${seen?'':'disabled'}>${label}</button>`).join('')}</fieldset>`).join('')}</div><p class="life-answer-feedback" role="status">${message}</p></section>`;}
 function render(focus,fromStart=false){
  cleanup();cleanup=()=>{};const key=activeKey();let seen=(key==='food'?(s.time>=4||s.evidence.includes('food')):s.seen.includes(key)||s.evidence.includes(key))&&!fromStart;
  onCaseChange(key);
  root.innerHTML=`${!caseKey&&group<2?`<div class="life-selector" role="tablist" aria-label="${group===0?'選擇生物反應':'選擇漂白方式'}">${Object.entries(group===0?lifeBiology:lifeBleaches).map(([k,b])=>`<button id="life-tab-${k}" role="tab" aria-controls="life-panel-${group}" aria-selected="${key===k}" tabindex="${key===k?0:-1}" data-life-choice="${k}" aria-pressed="${key===k}">${group===1?({peroxide:'過氧化氫 × 豆干',chlorine:'次氯酸鈉 × 衣服',sulfur:'二氧化硫 × 竹筷'})[k]:b.name}${s.evidence.includes(k)?' ✓':''}</button>`).join('')}</div>`:''}
  <div ${!caseKey&&group<2?`role="tabpanel" id="life-panel-${group}" aria-labelledby="life-tab-${key}"`:''}>
  ${lifePairedMarkup(key,seen)}
  ${guidedExplanations[key]?`<div class="life-guided-explanation" data-life-teacher ${seen?'':'hidden'}>${storySpeech('grandpa',guidedExplanations[key])}</div>`:group===0?biologyRoles(key,seen):`
   <section class="life-path-task" aria-label="反應後的小問題">
    <h4>${labels[key]}在這次反應中，自己發生什麼變化？</h4>
    ${key==='food'&&seen?'<p class="reaction-evidence-note">維生素 C 讓褐變過程中的物質被還原。</p>':''}
    <div class="life-role-choices">${['自己被氧化','自己被還原'].map((label,i)=>`<button data-life-check="${i===0?'oxidation':'reduction'}" ${seen?'':'disabled'}>${label}</button>`).join('')}</div>
    <p class="life-answer-feedback" role="status">${message}</p>
   </section>`}
  ${group===1?`<p class="life-safety">${key==='chlorine'?'含氯漂白水不可混合酸性或含氨清潔劑。':key==='sulfur'?'二氧化硫具刺激性，只在螢幕中模擬，不自行操作。':'豆干漂白僅作氧化還原觀察，不是食品加工示範；不可自行處理或食用。'}</p>`:''}
  </div>
  ${!caseKey&&group===1&&s.evidence.includes('peroxide')&&s.evidence.includes('sulfur')?'<section class="bleach-comparison"><h4>都能褪色，角色一樣嗎？</h4><table><thead><tr><th>試劑</th><th>色素</th><th>試劑自己</th></tr></thead><tbody><tr><th>過氧化氫</th><td>被氧化</td><td>被還原</td></tr><tr><th>二氧化硫</th><td>被還原</td><td>被氧化</td></tr></tbody></table></section>':''}
`;
  cleanup=bindLifePairedReaction(root.querySelector('[data-life-observation]'),event=>{
   if(event==='start'){
    if(key==='food')s.time=0;
    s.evidence=s.evidence.filter(x=>x!==key);s.seen=s.seen.filter(x=>x!==key);delete s.bioRoles[key];seen=false;message='';
    root.querySelectorAll('[data-life-check],[data-bio-role]').forEach(button=>{button.disabled=true;button.setAttribute('aria-pressed','false');});
    const feedback=root.querySelector('.life-answer-feedback');if(feedback)feedback.textContent='';
    const teacher=root.querySelector('[data-life-teacher]');if(teacher)teacher.hidden=true;
    save();return;
   }
   if(key==='food')s.time=4;else if(!s.seen.includes(key))s.seen.push(key);
   recordLifeDemonstration(s,key);message='';render('[data-life-retry]');save();root.dispatchEvent(new CustomEvent('life-observed',{bubbles:true}));
  });
  root.querySelectorAll('[data-life-choice]').forEach(b=>b.onclick=()=>{if(group===0)s.bio=b.dataset.lifeChoice;else s.bleach=b.dataset.lifeChoice;message='';render('[data-life-choice="'+activeKey()+'"]',true);save();});
  root.querySelector('[role="tablist"]')?.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   const tabs=[...root.querySelectorAll('[role="tab"]')],i=tabs.indexOf(document.activeElement);
   if(i<0)return;event.preventDefault();
   tabs[event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length].click();
  });
  root.querySelectorAll('[data-life-check]').forEach(b=>b.onclick=()=>{
   if(!seen)return;
   const role=b.dataset.lifeCheck,correct=lifeRecord(s,key,role);
   if(key==='food'){
    message=correct?'✓ 維生素 C 自己被氧化，讓蘋果晚一點褐變。':'想想另一方被還原時，維生素 C 會怎麼變。';
   }else{
    message=correct?'✓ '+lifeBleaches[key].reason:'反應資料寫著「'+lifeBleaches[key].dye+'」。想想同時發生的另一邊，試劑自己會怎麼變？';
   }
   render('[data-life-check="'+role+'"]');save();
  });
  root.querySelectorAll('[data-bio-role]').forEach(b=>b.onclick=()=>{if(!seen)return;const [path,role]=b.dataset.bioRole.split(':'),expected=lifeBiology[key].paths[+path].role;s.bioRoles[key]||={};s.bioRoles[key][path]=role;const matched=lifeBiology[key].paths.every((p,i)=>s.bioRoles[key][i]===p.role);if(matched){lifeRecord(s,key,'oxidation');message='✓ 兩種物質都配對正確。';}else message=role===expected?'這一邊配對正確，再看看另一邊。':'再對照反應資料。'+lifeBiology[key].paths[+path].from+'在這次反應中'+roleName(expected)+'。';render('[data-bio-role="'+path+':'+role+'"]');save();});
  if(focus)root.querySelector(focus)?.focus({preventScroll:true});
 }
 render(undefined,true);save();return ()=>cleanup();
}
