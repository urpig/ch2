import {freshAffinityLab,ironComparisonEvidence} from './affinity-free-model.js';
import {mountTermDemo,loadTermReview} from './term-demo.js';
import {storySpeech,storyDialogue,definitionDialogue,notebookMarkup} from './story-dialogue.js';
import {mountEverydayRedox,loadLifeReview} from './everyday-redox.js';
import {lifeQuiz,lifeReady} from './everyday-redox-model.js';
import {prepQuizzes} from './forge-prep-model.js';
import {freshInquiry,restoreInquiry,inquiryReady,oxidationQuiz} from './inquiry-model.js';
import {evidenceStudio,bindEvidence} from './inquiry-studios.js';
import {freeAffinityMarkup,bindFreeAffinity} from './affinity-free-lab.js';
import {activityQuiz,activityComparisonsComplete} from './metal-activity-model.js';
import {metalActivityMarkup,bindMetalActivity} from './metal-activity.js';

const key='lost-forge-inquiry-v1';
export function savedIronComparison() {
 try { return ironComparisonEvidence(restoreInquiry(JSON.parse(localStorage.getItem(key))).affinityLab); }
 catch { return ironComparisonEvidence(); }
}

export function mountForgePrep({intro,activityRoot,transfer,lifeRoot},addQuestion){
 let s=freshInquiry();
 try{s=restoreInquiry(JSON.parse(localStorage.getItem(key)));}catch{}
 const lifeReview=loadLifeReview(lifeRoot),life=lifeReview.state;
 const observedOxidation=()=>inquiryReady(s,0);
 const activityCompared=()=>activityComparisonsComplete(s);
 const activityComplete=activityCompared;
 const termReview=loadTermReview();
 let termExampleReady=false;
 const transferReady=()=>termExampleReady;
 const transferQuiz=prepQuizzes[2];
 let saved=true,disposeLife=()=>{},disposeAffinity=null,disposeIntro=null,disposeActivity=null;

 function save(){
  try{localStorage.setItem(key,JSON.stringify(s));}catch{saved=false;}
  syncOxidationQuiz(s.oxidationAnswer,observedOxidation(),'分別播放木炭燃燒和鐵釘生鏽');
  syncActivityQuiz(s.activityAnswer,activityCompared(),'自由選一種樣本與條件，完成觀察後再來作答');
  syncTransferQuiz(s.answers[2],transferReady(),'播放鋅與氧化銅的實驗示範');
  const progress={
   oxidation:observedOxidation()&&s.oxidationAnswer===oxidationQuiz.answer,
   observedOxidation:observedOxidation(),
   observedActivity:activityCompared(),
   observedTransfer:transferReady(),
   activity:activityComplete()&&s.activityAnswer===activityQuiz.answer,
   transfer:transferReady()&&s.answers[2]===transferQuiz.answer
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
  id:'practice-prep-c',label:'03A · 氧化與還原總是一起發生',source:'#forge-prep-c',quiz:transferQuiz,
  onAnswer:answer=>{if(transferReady()){s.answers[2]=answer;save();}}
 });
 const syncLifeQuiz=addQuestion({
  id:'practice-prep-d',label:'03B · 生活中的氧化還原',source:'#everyday-redox',quiz:lifeQuiz,
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
  ${storyDialogue('「氧化鐵？阿公，氧化是什麼意思呀？氧化鐵跟鐵又有什麼不同？」','「物質和氧結合就叫氧化。氧化鐵是鐵和氧結合形成的新物質。分別播放木炭燃燒和鐵釘生鏽，比比看變化的快慢和秤上的重量。」')}
  <section id="forge-prep-a" class="prep-studio inquiry-studio" tabindex="-1" aria-label="認識氧化反應">
   <div data-inquiry-content></div>
  </section>
  <div data-oxidation-notes></div>`;
 const oxidationCard=intro.closest('article');
 const oxidationContent=intro.querySelector('[data-inquiry-content]');
 const oxidationNotes=intro.querySelector('[data-oxidation-notes]');

 function renderIntro(selector){
  disposeIntro?.();
  oxidationContent.innerHTML=evidenceStudio(s);
  oxidationNotes.innerHTML=(observedOxidation()?notebookMarkup('A'):'')+storageNotice();
  const update=target=>{
   const {top}=oxidationCard.getBoundingClientRect();
   const readingCard=top>=0&&top<window.innerHeight/3;
   save();
   renderIntro(target);
   if(readingCard)oxidationCard.scrollIntoView({block:'start',behavior:'instant'});
  };
  oxidationContent.querySelector('[data-prep-reset]').onclick=()=>{
   s.selected='burn';
   s.looked=[];
   s.oxidationAnswer=null;
   update('[data-prep-reset]');
  };
  disposeIntro=bindEvidence(oxidationContent,s,update);
  if(selector)focus(intro,selector);
 }

 function renderActivity(selector,rackScroll=0){
  disposeActivity?.();
  activityRoot.innerHTML=`
   ${storyDialogue('「為什麼木炭很快就燒起來了，鐵釘卻是慢慢地生鏽呢？」','「因為物質會有不同的活性！活性是物質起反應的容易程度。我們來看看不同物質遇到冷水、熱水、酸會有什麼差別！」')}
   <section class="prep-studio inquiry-studio" aria-label="元素活性實驗">
    <div class="interaction-reset-bar"><button type="button" class="card-reset" data-activity-reset>↺ 重設本卡</button></div>
    <div data-inquiry-content>${metalActivityMarkup(s)}</div>
   </section>
   ${activityComplete()?notebookMarkup('B'):''}
   ${storageNotice()}`;
  const update=(target,keepRackScroll)=>{save();renderActivity(target,keepRackScroll);};
  activityRoot.querySelector('[data-activity-reset]').onclick=()=>{
   s.activityCondition='cold';
   s.activityComparison='free';
   s.activitySeen=[];
   s.activityRecords=[];
   s.activityAnswer=null;
   update('[data-activity-reset]');
  };
  const content=activityRoot.querySelector('[data-inquiry-content]');
  disposeActivity=bindMetalActivity(content,s,update);
  content.querySelector('.activity-rack').scrollLeft=rackScroll;
  if(selector)focus(activityRoot,selector);
 }
 renderIntro();
 renderActivity();

 transfer.innerHTML=`
  ${definitionDialogue()}
  <details class="inquiry-reference" id="affinity-lab" hidden><summary>延伸比較 · 固定氧化鐵，換鋅和銅</summary>
   <div class="interaction-reset-bar"><button type="button" class="card-reset" data-affinity-reset>↺ 重設配對實驗</button></div>
   <div class="inquiry-studio" data-affinity-content></div>
  </details>
  <div data-transfer-notes hidden>
   ${notebookMarkup('C')}
  </div>`;
 const transferNotes=transfer.querySelector('[data-transfer-notes]');
 transfer.addEventListener('term-example-progress',event=>{
  const ready=event.detail.ready;
  termExampleReady=ready;
  transfer.querySelector('#affinity-lab').hidden=!ready;
  transferNotes.hidden=!transferReady();
  save();
 });
 mountTermDemo(transfer.querySelector('[data-term-demo]'),{review:termReview});

 const affinity=transfer.querySelector('#affinity-lab'),affinityContent=affinity.querySelector('[data-affinity-content]');
 function renderAffinity(selector){
  disposeAffinity?.();
  affinityContent.innerHTML=freeAffinityMarkup(s);
  disposeAffinity=bindFreeAffinity(affinityContent,s,renderAffinity);
  save();
  if(selector)focus(affinity,selector);
 }
 affinity.addEventListener('toggle',()=>{
  if(affinity.open){if(!disposeAffinity)renderAffinity();}
  else {disposeAffinity?.();disposeAffinity=null;}
 });
 affinity.querySelector('[data-affinity-reset]').onclick=()=>{
  s.affinityLab=freshAffinityLab();
  renderAffinity('[data-affinity-reset]');
 };
 function routeAffinity(){
  if(location.hash!=='#affinity-lab')return;
  affinity.open=true;
  if(!disposeAffinity)renderAffinity();
 }
 routeAffinity();
 window.addEventListener('hashchange',routeAffinity);

 const lifeTabs=[['biology','葉子與細胞'],['bleach','實驗室漂白'],['food','蘋果保鮮']];
 const lifeIntroductions={
  photo:['<span data-glossary-skip>「氧化還原反應真神奇，生活中哪裡也能看到氧化還原反應呀？」</span>','「生活中到處都是喔，我們來看看下面的這些例子。」'],
  resp:['「我們的身體也像葉子一樣，會做氧化還原反應嗎？」','「會呀。細胞靠有氧呼吸利用養分。我們看動畫，比較葡萄糖和氧氣最後形成了什麼。」'],
  peroxide:['「這兩塊豆干一樣，左邊加了過氧化氫會怎麼樣？」','「我們看示範。左邊加入過氧化氫，右邊保留原樣。比較顏色，再看看反應資料。」'],
  chlorine:['「衣服上的色斑也能這樣去掉嗎？」','「這次換成次氯酸鈉。看看左邊加入試劑後，和右邊原樣有什麼不同。」'],
  sulfur:['「換成二氧化硫，也會和剛才的漂白一樣嗎？」','「看看氣體注入密閉罩後，竹筷的顏色怎麼變。再和過氧化氫比一比，反應的角色一樣嗎？」'],
  food:['「剛才讓東西褪色，這次能讓蘋果維持原色嗎？」','「我們只在左邊加入維生素 C，讓兩邊等一樣久。看看哪一片蘋果比較快變褐。」']
 };
 const lifeKey=()=>s.life==='biology'?life.bio:s.life==='bleach'?life.bleach:'food';
 function showLifeIntroduction(key){
  const [question,reply]=lifeIntroductions[key];
  lifeRoot.querySelector('[data-life-introduction]').innerHTML=storyDialogue(question,reply);
 }
 function renderLife(selector){
  disposeLife();
  lifeRoot.innerHTML=`
   <div data-life-introduction></div>
   <section class="prep-studio inquiry-studio" aria-label="生活案例">
    <div class="interaction-reset-bar"><button type="button" class="card-reset" data-life-reset-all>↺ 重設生活卡</button></div>
    <div data-inquiry-content>
     <div class="redox-examples" role="group" aria-label="日常生活中的氧化還原情境">${lifeTabs.map(([id,label])=>`<button data-redox-example="${id}" aria-pressed="${s.life===id}">${label}</button>`).join('')}</div>
     <div id="everyday-redox" class="life-integrated" tabindex="-1"></div>
    </div>
   </section>
   <div data-life-notes ${lifeReady(life)?'':'hidden'}>
    ${notebookMarkup('D')}
   </div>`;
  lifeRoot.querySelectorAll('[data-redox-example]').forEach(button=>button.onclick=()=>{
   s.life=button.dataset.redoxExample;
   save();
   renderLife(`[data-redox-example="${s.life}"]`);
  });
  lifeRoot.querySelector('[data-life-reset-all]').onclick=()=>{
   lifeReview.reset();
   renderLife('[data-life-reset-all]');
  };
  showLifeIntroduction(lifeKey());
  disposeLife=mountEverydayRedox(lifeRoot.querySelector('#everyday-redox'),{tab:lifeTabs.findIndex(([id])=>id===s.life),review:lifeReview,onCaseChange:showLifeIntroduction});
  if(selector)focus(lifeRoot,selector);
 }
 lifeRoot.addEventListener('life-progress',()=>{
  syncLifeQuiz(life.answer,lifeReady(life),'完成生活案例的觀察');
  lifeRoot.querySelector('[data-life-notes]')?.toggleAttribute('hidden',!lifeReady(life));
 });
 renderLife();
}
