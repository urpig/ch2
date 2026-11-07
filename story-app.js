import {notebookMarkup} from './story-dialogue.js';
import {mountIronAffinity,resetIronAffinity} from './iron-affinity-workshop.js';
import {mountTerminology} from './terminology.js';
import {mountStoryEnding} from './story-ending.js';
import {createPracticeArea} from './chapter-practice.js';
import {mountForgePrep,savedIronComparison} from './forge-prep.js';
import {upgradeInteractiveLab} from './lab-upgrade.js';
import {lessons,materialCases,freshState,restoreState,isReady,isMastered,migrateLegacy,migrateEight} from './journey-cards.js';
import {mountBurn} from './hands-on-burn.js';
import {mountCombustionLesson} from './combustion-lesson.js';
import {mountNarrative} from './narrative-labs.js';
const $=id=>document.getElementById(id),storageKey='lost-forge-hands-on-7-v3';
let raw={},canStore=true,current='card-1',prepProgress={},lifeCount=0,lifeObserved=false;try{raw=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{canStore=false;}
let legacy={};try{legacy=JSON.parse(localStorage.getItem('lost-forge-hands-on-9-v1')||'{}');}catch{}
let previousEight={};try{previousEight=JSON.parse(localStorage.getItem('lost-forge-hands-on-8-v2')||'{}');}catch{}
const states=lessons.map(c=>raw[c.id]?restoreState(c,raw[c.id]):Object.keys(previousEight).length?migrateEight(c,previousEight):migrateLegacy(c,legacy)),cards=[];
const visibleLessons=lessons.filter(c=>c.id!==4);
const displayNumber=c=>c.id===1?'序章':String(visibleLessons.indexOf(c)+2).padStart(2,'0');
const fromLesson=c=>({id:'card-'+c.id,number:displayNumber(c),title:c.title,act:c.act,practice:'practice-card-'+c.id,lesson:c});
const [ore,combustion,iron,furnace,blade]=visibleLessons.map(fromLesson);
const intro={id:'forge-prep',number:'01',title:'認識氧化反應',act:'工坊試煉｜從觀察開始',question:'木炭燃燒和鐵釘生鏽，都是氧化嗎？',practice:'practice-prep-a',progressKey:'oxidation'};
const activity={id:'metal-activity',number:'02',title:'比較元素活性',act:'工坊試煉｜用觀察比較',question:'在相同條件下，哪些元素比較容易反應？',practice:'practice-prep-b',progressKey:'activity'};
const transfer={id:'forge-prep-c',number:'03A',title:'氧化與還原總是一起發生',act:'跟著氧找線索｜氧的去向',question:'氧化銅的氧如果被帶走，會跑到哪裡？',practice:'practice-prep-c',progressKey:'transfer'};
const life={id:'life-redox',number:'03B',title:'生活中的氧化還原',act:'跟著氧找線索｜回到生活',question:'細胞、漂白和蘋果褐變裡，哪兩方一起改變？',practice:'practice-prep-d'};
const lessonRoute=[ore,intro,activity,combustion,transfer,life,iron,furnace,blade];
const {section:practice,addQuestion,orderQuestions}=createPracticeArea();
const ending={id:'story-ending',number:'續章',title:'鹽場的新難題'};
const review={id:practice.id,number:'練習',title:'小試身手'};
const mastered=c=>isMastered(c,states[c.id-1]);
function stepComplete(step){
 if(step.lesson)return mastered(step.lesson);
 return step===life?Boolean(lifeCount):Boolean(prepProgress[step.progressKey]);
}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(lessons.map(c=>[c.id,states[c.id-1]]))));}catch{canStore=false;}route();}
function route(){
 const completed=lessonRoute.filter(stepComplete).length;
 const total=lessonRoute.length;
 $('top-progress').textContent=$('mastery-label').textContent=completed+' / '+total;
 $('mastery-progress').max=total;
 $('mastery-progress').value=completed;
 $('route').innerHTML=[...lessonRoute,ending,review].map(step=>{
  const done=stepComplete(step);
  const ready=step.lesson?isReady(step.lesson,states[step.lesson.id-1]):step===life?lifeObserved:Boolean(prepProgress[{oxidation:'observedOxidation',activity:'observedActivity',transfer:'observedTransfer'}[step.progressKey]]);
  const icon=step===ending||step===review?'↗':done?'✓':ready?'◉':'○';
  return `<a href="#${step.id}" ${current===step.id?'aria-current="step"':''} class="${done?'mastered':''}"><span>${step.number}</span><span>${step.title}</span><i>${icon}</i></a>`;
 }).join('');
 $('storage-note').textContent=canStore?'觀察與作答進度會自動保存。':'本次可正常操作，但瀏覽器無法保存進度。';
}

function createCard(step){
 const article=document.createElement('article');
 article.id=step.id;
 article.dataset.card=step.id;
 article.className='exploration-card';
 article.tabIndex=-1;
 article.setAttribute('aria-labelledby',step.id+'-title');
 $('lesson').append(article);
 cards.push(article);
 return article;
}
const nextLabel={
 'card-1':'先認識氧化反應','forge-prep':'02 比較元素活性','metal-activity':'03 觀察燃燒與產物','card-2':'追蹤氧去了哪裡','forge-prep-c':'到生活中找氧化還原',
 'life-redox':'回到礦石，找出能取回鐵的材料','card-3':'把取回鐵的線索帶進高爐','card-6':'獻上寶劍，聽見新的難題'
};
function chapterFooter(step){
 const i=lessonRoute.indexOf(step),previous=lessonRoute[i-1],next=lessonRoute[i+1]||ending;
 return `<footer class="chapter-footer">${previous?`<a class="previous" href="#${previous.id}">← 上一張</a>`:''}<a class="next" href="#${next.id}">${nextLabel[step.id]||'前往 '+next.number+' '+next.title} <b>→</b></a></footer>`;
}
function mountInquiryCard(step){
 const article=createCard(step);
 article.classList.add('inquiry-lesson');
 article.innerHTML=`<header class="chapter-header"><div class="chapter-kicker"><span>${step.act}</span><span>${step.number}</span></div><h2 id="${step.id}-title">${step.title}</h2><p class="core-question">${step.question}</p></header><div class="chapter-body"></div>${chapterFooter(step)}`;
 return article.querySelector('.chapter-body');
}
function combustionProcedure(){
 return '<section class="combustion-procedure" aria-label="實驗步驟"><h3>實驗步驟</h3><ol></ol><p class="combustion-procedure-current" data-demo-instruction role="status" aria-live="polite"></p></section>';
}
function mount(step){
 const c=step.lesson;
 const article=createCard(step);
 article.classList.add('hands-card');
 let s=states[c.id-1],epoch=0,timers=new Set(),cleanup=[];
 const syncQuiz=addQuestion({
  id:step.practice,label:step.number+' · '+c.title,source:'#'+article.id,quiz:c.quiz,
  onAnswer:answer=>{if(!isReady(c,s))return;s.quizOpen=true;s.answer=answer;syncQuiz(answer);save();}
 });
 const find=selector=>article.querySelector(selector),has=k=>s.evidence.includes(k);
 function cancel(){epoch++;for(const t of timers)clearTimeout(t);timers.clear();for(const f of cleanup)f();cleanup=[];}
 function delay(fn,ms){const token=epoch;const t=setTimeout(()=>{timers.delete(t);if(token===epoch&&article.isConnected)fn();},matchMedia('(prefers-reduced-motion:reduce)').matches?Math.min(ms,80):ms);timers.add(t);}
 function record(k){if(!c.required.includes(k))return;if(!has(k))s.evidence.push(k);sync();save();}
 function notice(t){const status=find('.observation-status');if(status)status.textContent=t;}
 function renderLab(){cancel();notice('先讀取場景，再直接拖動物件，看看發生什麼。');const context={s,has,record,notice,delay,persist:save,setCase:(key,autoLoad,spoonOrigin=null)=>{s.selected=key;s.autoLoad=autoLoad;s.spoonOrigin=spoonOrigin;renderLab();save();},onCleanup:f=>cleanup.push(f)};if(c.id===3){mountIronAffinity(find('.interactive-lab'),{...context,comparison:savedIronComparison});return;}if(c.type==='combustion')mountCombustionLesson(find('.interactive-lab'),c,context);else if(['metals','nonmetals'].includes(c.type))mountBurn(find('.interactive-lab'),c,context);else mountNarrative(find('.interactive-lab'),c,context);cleanup.push(upgradeInteractiveLab(find('.interactive-lab'),c,context));find('.case-rack')?.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===s.selected)));}
 function render(){article.innerHTML=`<header class="chapter-header"><div class="chapter-kicker"><span>${c.act}</span><div class="chapter-actions">${c.id===1?'':`<span>${c.day} · ${step.number} / ${blade.number}</span>`}</div></div><h2 id="${article.id}-title">${c.title}</h2><p class="core-question">${c.question}</p></header><div class="chapter-body"><div class="story-scene-intro ${c.id===1?'with-forge-scene':''}">${c.id===1?$('locked-forge-scene').innerHTML:''}<div class="story-scene-copy">${c.opening?`<p class="opening">${c.opening}</p>`:''}<div class="story-dialogue" aria-label="小葵與阿公的對話">${c.dialogue.map(([who,line])=>`<div class="story-speech story-speech--${who}"><span class="story-portrait story-portrait--${who}" data-expression="${c.portraits[who]}" aria-hidden="true"></span><p><b>${who==='kui'?'小葵':'阿公'}</b>${line}</p></div>`).join('')}</div></div></div><div data-prediction-activity >${c.type==='combustion'?combustionProcedure():`<div class="interaction-instruction"><span class="hand-icon">↔</span><p>${c.task}</p></div>`}${materialCases[c.type]&&!['combustion','redox','steel'].includes(c.type)?`<div class="case-rack" role="group" aria-label="選擇代表案例">${materialCases[c.type].map(([key,label])=>`<button data-case="${key}" aria-pressed="${s.selected===key}"><span class="case-symbol">${({CO:'C',ZnCu:'Zn',CuZn:'Cu',alone:'CuO',carbon:'C',wrought:'Fe',pig:'Fe–C',steel:'鋼',normal:'①',stress:'②'})[key]||key}</span><span>${label}</span></button>`).join('')}</div>`:''}<div class="interactive-lab-frame"><div class="interaction-reset-bar"><button type="button" class="card-reset" data-reset aria-label="重設${step.number}：${c.title}">↺ 重設本卡</button></div><div class="interactive-lab"></div></div>${[1,2,3,5,6].includes(c.id)?'':'<p class="observation-status" aria-live="polite"></p>'}</div>${notebookMarkup(c.id)}</div>${chapterFooter(step)}`;
 find('.case-rack')?.addEventListener('click',e=>{const b=e.target.closest('[data-case]');if(!b)return;s.selected=b.dataset.case;s.tab='burn';renderLab();save();});
 find('[data-enter-studio]')?.addEventListener('click',()=>{find('.combustion-studio').scrollIntoView({block:'start',behavior:'instant'});find('.combustion-studio').focus({preventScroll:true});});
 article.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',()=>{cancel();if(c.id===3)resetIronAffinity();s=freshState(c);states[c.id-1]=s;render();save();notice('已重設本卡，可以重新操作。');find('.interaction-reset-bar [data-reset]').focus({preventScroll:true});}));
 renderLab();sync();}
 function sync(){
  const ready=isReady(c,s);
  find('.kui-notebook').hidden=!ready;
  const keys=c.coreRequired||c.required;
  const missing=keys.filter(k=>!has(k)).map(k=>c.id===6?({pig:'生鐵',steel:'鋼鐵',wrought:'熟鐵'})[k]+'刀的卸載結果':c.labels[c.required.indexOf(k)]);
  syncQuiz(s.answer,ready,missing.length?'還差 '+missing.join('、')+'。回看操作完成後再來作答。':'');
 }

 render();window.addEventListener('pagehide',cancel);
}

$('lesson').addEventListener('prep-progress',e=>{prepProgress=e.detail;route();});
$('lesson').addEventListener('life-progress',e=>{lifeCount=Boolean(e.detail?.mastered);lifeObserved=Boolean(e.detail?.observed);route();});
const inquiryBodies={};
for(const step of lessonRoute){
 if(step.lesson)mount(step);
 else inquiryBodies[step.id]=mountInquiryCard(step);
}
mountForgePrep({intro:inquiryBodies[intro.id],activityRoot:inquiryBodies[activity.id],transfer:inquiryBodies[transfer.id],lifeRoot:inquiryBodies[life.id]},addQuestion);
$('card-6').before($('forged-sword-scene').content.cloneNode(true));
mountStoryEnding($('lesson')).dataset.card=ending.id;
cards.push($(ending.id));
orderQuestions(lessonRoute.map(step=>step.practice));
$('lesson').append(practice);
cards.push(practice);
route();
mountTerminology();

function activate(id){
 if(current===id)return;
 current=id;
 for(const link of $('route').querySelectorAll('a')){
  if(link.hash==='#'+id)link.setAttribute('aria-current','step');
  else link.removeAttribute('aria-current');
 }
}
const formerAnchors={'card-4':'card-5','practice-terms':'practice-prep-c'};
function alignRoute(){
 const id=location.hash.slice(1);
 if(!id)return;
 const currentId=Object.hasOwn(formerAnchors,id)?formerAnchors[id]:id;
 if(currentId!==id)history.replaceState(null,'','#'+currentId);
 const target=$(currentId),card=target?.closest('[data-card]');
 if(!card||!cards.includes(card))return;
 const scrollTarget=currentId==='forge-prep-a'?card:target;
 scrollTarget.scrollIntoView({block:'start',behavior:'instant'});
 (target.matches('[tabindex]')?target:card).focus({preventScroll:true});
 activate(card.dataset.card);
}
window.addEventListener('hashchange',alignRoute);
let frame=false;
window.addEventListener('scroll',()=>{
 if(frame)return;
 frame=true;
 requestAnimationFrame(()=>{
  frame=false;
  let active=cards[0];
  for(const card of cards){if(card.getBoundingClientRect().top>innerHeight*.25)break;active=card;}
  activate(active.dataset.card);
 });
},{passive:true});

// Images and fonts above the target can change the layout after the first frame.
const initialHash=location.hash;
const initialLayoutReady=()=>Promise.resolve(document.fonts?.ready).then(()=>requestAnimationFrame(()=>{
 if(location.hash===initialHash)alignRoute();
}));
if(document.readyState==='complete')initialLayoutReady();
else window.addEventListener('load',initialLayoutReady,{once:true});
