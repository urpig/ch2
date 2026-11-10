import {updateCombustionProcedure} from './combustion-procedure.js';
import {highlightNext,nextPracticeSample} from './combustion-guidance.js';
import {mountCombustion,shelfTarget} from './combustion-workbench.js';
import {combustionRecordsMarkup} from './combustion-records.js';
import {metals,nonmetals} from './model.js';
import {photographicSample,specimenDishArtwork} from './combustion-photo-art.js';
import {bindDrop} from './direct-manipulation.js';
import {materialCases,casesForLesson} from './journey-cards.js';
import {bottleSolutions} from './bottle-ph-state.js';
// Keep the historical :ph evidence key for completed saved bottle observations.
export function sampleIcon(key,prefix='tray-'){return photographicSample(key,prefix==='demonstration-picked-');}
export function mountBurn(root,c,ctx,{demonstration=false}={}){
 const {s,has,record,notice,delay}=ctx,key=s.selected,isMetal=!!metals[key],d=isMetal?metals[key]:nonmetals[key],solidRoute=isMetal||key==='P';
 if(!demonstration)updateCombustionProcedure(root,key);
 let apparatus=null,localBurned=false,localCool=true,running=false,localPoint=null;const burned=()=>localBurned,cooled=()=>localCool;
 root.innerHTML=`<div class="combustion-studio integrated-studio" aria-label="${c.sampleGroup==='metals'?'金屬':c.sampleGroup==='nonmetals'?'非金屬':''}桌面樣本與燃燒實驗台" id="combustion-studio${c.sampleGroup==='nonmetals'?'-nonmetals':''}" tabindex="-1"><div class="specimen-shelf${c.sampleGroup?' single-group':''}"></div><div class="bench-workspace"><div class="bench-sequence"><span data-process="burn">1 取樣與燃燒</span><i>→</i><span data-process="water">2 產物入水</span><i>→</i><span data-process="litmus">3 比較酸鹼性</span></div><p class="experiment-purpose" data-stage-purpose></p><div class="burn-content"></div></div></div><div class="comparison-sheet"></div>`;
 const content=root.querySelector('.burn-content'),sheet=root.querySelector('.comparison-sheet'),shelf=root.querySelector('.specimen-shelf');
 function nextSample(){const cases=casesForLesson(c),completed=cases.filter(([key])=>has(key+(bottleSolutions[key]?':ph':':wet'))).map(([key])=>key);if(c.sampleGroup&&!demonstration){const next=nextPracticeSample(c.sampleGroup,completed);return cases.find(([key])=>key===next);}const ordered=c.type==='combustion'?[...['Na','S'].map(id=>cases.find(([key])=>key===id)).filter(Boolean),...cases.filter(([key])=>!['Na','S'].includes(key))]:cases;return ordered.find(([key])=>!completed.includes(key));}
 function syncSampleGuidance(){const board=root.querySelector('.combustion-workbench');if(!board)return;const next=demonstration?key:nextSample()?.[0]||'';board.dataset.nextSample=next;for(const item of shelf.querySelectorAll('[data-shelf-sample]'))item.closest('.tabletop-specimen').toggleAttribute('data-next-specimen',item.dataset.shelfSample===next);}
 function table(){sheet.innerHTML=combustionRecordsMarkup(c.sampleGroup||c.type,has);}
 function setProcess(phase){for(const step of root.querySelectorAll('[data-process]')){const active=step.dataset.process===(phase==='load'?'burn':phase);step.classList.toggle('current-process',active);if(active)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');}}
 function renderBurn(replay=false){root.querySelector('[data-stage-purpose]').textContent='在同一台追蹤：燃燒 → 產物遇水 → 石蕊試紙觀察酸鹼性。';if(replay){localBurned=false;localCool=true;}s.tab='burn';content.innerHTML='<div data-combustion-mount></div>';apparatus=mountCombustion(content.querySelector('[data-combustion-mount]'),{key,isMetal:solidRoute,externalClock:demonstration,demonstration,autoLoad:!!s.autoLoad,spoonOrigin:burned()?localPoint:s.spoonOrigin,onCleanup:ctx.onCleanup,onProcessChange:setProcess,completed:burned()&&!replay,cool:cooled(),token:sampleIcon(key),name:d.name,delay,notice,onStart:()=>{running=true;},onComplete:point=>{localPoint=point;running=false;localBurned=true;record(key+':burn');if(key==='Zn')record('Zn:cool');renderBurn();table();},onCool:()=>{localPoint=[400,335];localCool=true;record('Zn:cool');renderBurn();table();},onWetComplete:()=>{record(key+(bottleSolutions[key]?':ph':':wet'));table();setProcess('complete');if(demonstration)return;syncSampleGuidance();const board=root.querySelector('.combustion-workbench');if(board)board.dataset.nextAction='next-sample';const next=nextSample();if(next)highlightNext(root,{id:'next-sample',tool:'[data-shelf-sample="'+next[0]+'"]',label:'下一份樣本'});}});s.autoLoad=false;s.spoonOrigin=null;renderShelf();const board=root.querySelector('.combustion-workbench');if(board?.dataset.combustionStage==='load'){const next=demonstration?[key,d.name]:nextSample();highlightNext(root,next?{id:'load',tool:'[data-shelf-sample="'+next[0]+'"]',label:c.type==='combustion'&&!['Na','S'].includes(next[0])?'選做延伸樣本':'拿取下一個樣本'}:{id:'complete'});}}
 function renderShelf(){
  const board=root.querySelector('.combustion-workbench');
  if(c.type!=='combustion'||!board){shelf.hidden=true;return;}
  board.dataset.nextSample=(demonstration?key:nextSample()?.[0])||'';shelf.hidden=false;shelf.className='specimen-shelf tabletop-specimens';board.append(shelf);
  shelf.innerHTML=[['metals','金屬'],['nonmetals','非金屬']].filter(([type])=>!c.sampleGroup||type===c.sampleGroup).map(([type,title])=>'<section class="tabletop-sample-group" aria-label="'+title+'樣本"><div class="tabletop-sample-row">'+materialCases[type].map(([k,label])=>'<div class="tabletop-specimen">'+specimenDishArtwork(k)+'<div class="tabletop-material" data-shelf-sample="'+k+'" aria-label="拿取'+label+'，放上燃燒匙">'+photographicSample(k,true)+'</div>'+specimenDishArtwork(k,true)+'<b class="tabletop-sample-label">'+label+'</b></div>').join('')+'</div></section>').join('');
  syncSampleGuidance();
  for(const item of shelf.querySelectorAll('[data-shelf-sample]'))bindDrop(item,()=>shelfTarget(root.querySelector('.combustion-workbench')),{onDrop:()=>{
   const target=shelfTarget(root.querySelector('.combustion-workbench'));ctx.setCase(item.dataset.shelfSample,true,[Number(target.dataset.spoonX),Number(target.dataset.spoonY)]);
  },onMiss:()=>notice('把樣本放進燃燒匙的凹槽裡。')});
 }

 renderBurn();table();
 return {get apparatus(){return apparatus;},load(){s.autoLoad=true;renderBurn();}};
}
