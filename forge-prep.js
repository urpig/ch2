import {ironComparisonEvidence} from './affinity-free-model.js';
import {mountTermDemo,loadTermReview} from './term-demo.js';
import {storySpeech,storyDialogue,definitionDialogue,notebookMarkup} from './story-dialogue.js';
import {mountEverydayRedox,loadLifeReview} from './everyday-redox.js';
import {lifeQuiz,lifeReady,lifeCaseGroups} from './everyday-redox-model.js';
import {oxygenExamples,oxygenExampleQuiz,carbonOxygenQuiz,oxygenExampleReady} from './oxygen-examples-model.js';
import {freshInquiry,restoreInquiry,inquiryReady,oxidationQuiz} from './inquiry-model.js';
import {evidenceStudio,bindEvidence} from './inquiry-studios.js';
import {activityQuiz,activityComparisonsComplete} from './metal-activity-model.js';
import {metalActivityMarkup,bindMetalActivity} from './metal-activity.js';
import {chapterNumber} from './lesson-sequence.js';

const key='lost-forge-inquiry-v1';
export function savedIronComparison() {
 try { return ironComparisonEvidence(restoreInquiry(JSON.parse(localStorage.getItem(key))).affinityLab); }
 catch { return ironComparisonEvidence(); }
}

export function mountForgePrep({intro,activityRoot,transfer,magnesiumRoot,lifeRoot},addQuestion){
 let s=freshInquiry();
 try{s=restoreInquiry(JSON.parse(localStorage.getItem(key)));}catch{}
 if(s.transferLessonRevision!==2)s.answers[2]=null;
 s.transferLessonRevision=2;
 const lifeReview=loadLifeReview(lifeRoot),life=lifeReview.state;
 const observedOxidation=()=>inquiryReady(s,0);
 const activityCompared=()=>activityComparisonsComplete(s);
 const activityComplete=activityCompared;
 const termReview=loadTermReview();
 const transferReady=()=>oxygenExampleReady(termReview.state,'carbon');
 const magnesiumReady=()=>oxygenExampleReady(termReview.state,'magnesium');
 const transferQuiz=carbonOxygenQuiz;
 // The previous combined card's practice question belongs to the magnesium lesson.
 if(magnesiumReady()&&termReview.state.practiceAnswers.magnesium===undefined&&Number.isInteger(s.answers[2]))termReview.state.practiceAnswers.magnesium=s.answers[2];
 let saved=true,disposeLife=()=>{},disposeIntro=null,disposeActivity=null;

 function save(){
  try{localStorage.setItem(key,JSON.stringify(s));}catch{saved=false;}
  syncOxidationQuiz(s.oxidationAnswer,observedOxidation(),'分別播放木炭燃燒和鐵釘生鏽');
  syncActivityQuiz(s.activityAnswer,activityCompared(),'自由選一種樣本與條件，完成觀察後再來作答');
  syncTransferQuiz(termReview.state.practiceAnswers.carbon??null,transferReady(),'觀察碳與氧化銀的反應，並判斷氧的去向');
  syncMagnesiumQuiz(termReview.state.practiceAnswers.magnesium??null,magnesiumReady(),'觀察鎂在二氧化碳中的燃燒，並判斷氧的去向');
  const progress={
   oxidation:observedOxidation()&&s.oxidationAnswer===oxidationQuiz.answer,
   observedOxidation:observedOxidation(),
   observedActivity:activityCompared(),
   observedTransfer:transferReady(),
   observedMagnesium:magnesiumReady(),
   activity:activityComplete()&&s.activityAnswer===activityQuiz.answer,
   transfer:transferReady()&&termReview.state.practiceAnswers.carbon===transferQuiz.answer,
   magnesium:magnesiumReady()&&termReview.state.practiceAnswers.magnesium===oxygenExampleQuiz.answer
  };
  intro.dispatchEvent(new CustomEvent('prep-progress',{bubbles:true,detail:progress}));
 }
 const syncOxidationQuiz=addQuestion({
  id:'practice-prep-a',label:'01 · 認識氧化反應',source:'#forge-prep-a',quiz:oxidationQuiz,
  onAnswer:answer=>{if(observedOxidation()){s.oxidationAnswer=answer;save();}}
 });
 const syncActivityQuiz=addQuestion({
  id:'practice-prep-b',label:'02 · 比較元素活性',source:'#metal-activity',quiz:activityQuiz,
  onAnswer:answer=>{if(activityCompared()){s.activityAnswer=answer;save();}}
 });
 const syncTransferQuiz=addQuestion({
  id:'practice-prep-c',label:chapterNumber('forge-prep-c')+' · 氧化與還原總是一起發生',source:'#forge-prep-c',quiz:transferQuiz,
  onAnswer:answer=>{if(transferReady()){termReview.state.practiceAnswers.carbon=answer;termReview.save();save();}}
 });
 const syncMagnesiumQuiz=addQuestion({
  id:'practice-prep-c-magnesium',label:chapterNumber('magnesium-co2')+' · 鎂在二氧化碳中繼續燃燒',source:'#magnesium-co2',quiz:oxygenExampleQuiz,
  onAnswer:answer=>{if(magnesiumReady()){termReview.state.practiceAnswers.magnesium=answer;termReview.save();save();}}
 });
 const syncLifeQuiz=addQuestion({
  id:'practice-prep-d',label:chapterNumber('life-redox')+' · 生活中的氧化還原',source:'#everyday-redox',quiz:lifeQuiz,
  onAnswer:answer=>{if(lifeReady(life)){life.answer=answer;lifeReview.save();}}
 });

 function focus(root,selector,scroll=false){
  const target=root.querySelector(selector);
  if(!target)return;
  if(scroll)target.scrollIntoView({block:'start',behavior:'instant'});
  target.focus({preventScroll:true});
 }
 const storageNotice=()=>saved?'':'<p class="prep-footer" role="status">瀏覽器暫時無法保存進度。</p>';

 intro.innerHTML=`
  ${storyDialogue('「氧化鐵？阿公，氧化是什麼意思呀？氧化鐵跟鐵又有什麼不同？」','「物質和氧結合的過程就叫氧化。氧化鐵是鐵和氧結合形成的新物質。氧化反應有分成劇烈的跟緩慢的。」')}
  <section id="forge-prep-a" class="prep-studio inquiry-studio" tabindex="-1" aria-label="認識氧化反應">
   <div data-inquiry-content></div>
  </section>
  <div data-oxidation-notes></div>`;
 const oxidationContent=intro.querySelector('[data-inquiry-content]');
 const oxidationNotes=intro.querySelector('[data-oxidation-notes]');

 function renderOxidationNotes(){
  oxidationNotes.innerHTML=(observedOxidation()?storyDialogue('「阿公，為什麼木炭燃燒後變輕了，鐵釘生鏽後卻變重了呢？」','「因為木炭燃燒時，碳會跟氧結合成二氧化碳飄走，所以變輕了。鐵釘生鏽則是因為氧會跑到鐵釘裡面，跟鐵結合形成鐵鏽，所以變重了。」')+notebookMarkup('A'):'')+storageNotice();
 }
 function renderIntro(){
  disposeIntro?.();
  oxidationContent.innerHTML=evidenceStudio(s);
  renderOxidationNotes();
  disposeIntro=bindEvidence(oxidationContent,s,()=>{save();renderOxidationNotes();});
 }

 function renderActivity(selector,rackScroll=0,demo=false){
  disposeActivity?.();
  activityRoot.innerHTML=`
   ${storyDialogue('「為什麼木炭很快就燒起來了，鐵釘卻是慢慢地生鏽呢？」','「這是因為木炭跟鐵的活性不同，活性是物質起反應的容易程度。我們來看看不同物質遇到冷水、酸會有什麼差別！」')}
   <section class="prep-studio inquiry-studio" aria-label="元素活性實驗">
    <div data-inquiry-content>${metalActivityMarkup(s)}</div>
   </section>
   ${activityComplete()?notebookMarkup('B'):''}
   ${storageNotice()}`;
  const update=(target,keepRackScroll,playDemo=false)=>{save();renderActivity(target,keepRackScroll,playDemo);};
  const content=activityRoot.querySelector('[data-inquiry-content]');
  disposeActivity=bindMetalActivity(content,s,update,{demo});
  content.querySelector('.activity-rack').scrollLeft=rackScroll;
  if(selector)focus(activityRoot,selector);
 }
 renderIntro();
 renderActivity();

 transfer.innerHTML=`
  ${definitionDialogue()}
  <div data-transfer-notes hidden>
   ${notebookMarkup('Ccarbon')}
  </div>`;
 const transferNotes=transfer.querySelector('[data-transfer-notes]');
 magnesiumRoot.innerHTML=storySpeech('grandpa','「我們剛剛看到碳能拿走氧化銀中的氧，讓銀還原，此時的碳就叫做還原劑；反之氧化銀讓碳氧化變成二氧化碳，氧化銀就叫做氧化劑。接下來我們看看以下反應，誰是氧化劑誰又是還原劑呢？」')+'<div data-magnesium-demo></div><div data-oxygen-comparison></div><div data-magnesium-notes>'+notebookMarkup('Cmagnesium')+'</div>';
 const magnesiumNotes=magnesiumRoot.querySelector('[data-magnesium-notes]');
 const comparison=magnesiumRoot.querySelector('[data-oxygen-comparison]');
 comparison.innerHTML=`<section class="oxygen-summary"><h3>把兩組反應放在一起看</h3><p class="oxygen-activity-order">對氧活性：鎂 ＞ 碳 ＞ 銀</p><p>較容易得氧的元素，能在合適條件下取走另一種氧化物的氧；它形成的氧化物，通常較難用這類奪氧方式還原。</p><div class="oxygen-summary-table"><table><thead><tr><th>代表反應</th><th>還原劑(被氧化)</th><th>氧化劑(被還原)</th></tr></thead><tbody>${Object.values(oxygenExamples).map(d=>`<tr><th>${d.equation}</th><td>${d.oxidized}</td><td>${d.reduced}</td></tr>`).join('')}</tbody></table></div></section>`;
 function syncOxygenLessons(){
  transferNotes.hidden=!transferReady();
  magnesiumNotes.hidden=false;
  comparison.hidden=false;
  save();
 }
 transfer.addEventListener('term-example-progress',syncOxygenLessons);
 magnesiumRoot.addEventListener('term-example-progress',syncOxygenLessons);
 mountTermDemo(transfer.querySelector('[data-term-demo]'),{review:termReview,exampleKey:'carbon'});
 mountTermDemo(magnesiumRoot.querySelector('[data-magnesium-demo]'),{review:termReview,exampleKey:'magnesium',sectionId:'magnesium-demo'});

 const lifeIntroductions={
  photo:['「阿公，植物怎麼把水和二氧化碳變成養分？這裡也有氧化還原嗎？」','「有呀！光合作用中，水被氧化，二氧化碳被還原。先看植物用了什麼、產生什麼，再切到有氧呼吸，比較兩個反應。」'],
  resp:['「我們的身體也像葉子一樣，會做氧化還原反應嗎？」','「會呀。細胞靠有氧呼吸利用養分。我們看動畫，比較葡萄糖和氧氣最後形成了什麼。」'],
  peroxide:['「這兩塊豆干一樣，左邊加了過氧化氫會怎麼樣？」','「我們看示範。左邊加入過氧化氫，右邊保留原樣。比較顏色，再看看反應資料。」'],
  chlorine:['「衣服上的色斑也能這樣去掉嗎？」','「這次換成次氯酸鈉。看看左邊加入試劑後，和右邊原樣有什麼不同。」'],
  sulfur:['「換成二氧化硫，也會和剛才的漂白一樣嗎？」','「看看氣體注入密閉罩後，竹筷的顏色怎麼變。再和過氧化氫比一比，反應的角色一樣嗎？」'],
  food:['「氧化劑？還原劑？人家說維他命 C 跟 E 是抗氧化劑，那抗氧化劑是什麼呀？」','「抗氧化劑這種東西會代替別人被氧化，只要在蘋果上面塗上抗氧化劑就能讓蘋果不會變黃喔！」']
 };
 function renderLife(selector){
  disposeLife();
  const groups=lifeCaseGroups;
  lifeRoot.innerHTML=`
   <div id="everyday-redox" class="life-experiments-stack">
    ${groups.map(([id,title,cases])=>`<section class="life-case-group" id="life-${id}" aria-label="${title}"><h3>${title}</h3><div data-life-dialogue="${id}"></div><div class="prep-studio inquiry-studio life-integrated" data-life-group="${id}"></div></section>`).join('')}
   </div>
   <div data-life-notes ${lifeReady(life)?'':'hidden'}>${notebookMarkup('D')}</div>`;
  const disposers=[];
  for(const target of lifeRoot.querySelectorAll('[data-life-group]')){
   const group=target.dataset.lifeGroup;
   disposers.push(mountEverydayRedox(target,{
    ...(group==='vitamin'?{caseKey:'food'}:{tab:group==='biology'?0:1}),review:lifeReview,
    onCaseChange:key=>{lifeRoot.querySelector(`[data-life-dialogue="${group}"]`).innerHTML=storyDialogue(...lifeIntroductions[key]);}
   }));
  }
  disposeLife=()=>disposers.forEach(dispose=>dispose());
  if(selector)focus(lifeRoot,selector);
 }
 lifeRoot.addEventListener('life-progress',()=>{
  syncLifeQuiz(life.answer,lifeReady(life),'完成生活案例的觀察');
  lifeRoot.querySelector('[data-life-notes]')?.toggleAttribute('hidden',!lifeReady(life));
 });
 renderLife();
}
