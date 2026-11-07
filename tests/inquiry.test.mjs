import test from 'node:test';
import assert from 'node:assert/strict';
import {freshInquiry,restoreInquiry,inquiryReady,transferOxygen,transferCases,oxidationQuiz} from '../dist/inquiry-model.js';
import {evidenceStudio} from '../dist/inquiry-studios.js';
import {activityQuiz,activityReaction,activitySamples,metalConditions,activityComparisonsComplete,activityComparisonReady} from '../dist/metal-activity-model.js';
import {metalActivityMarkup} from '../dist/metal-activity.js';

test('all sixteen samples can be tested in the five supported conditions in teaching order',()=>{
 assert.deepEqual(metalConditions.map(item=>item.id),['cold','hot','dilute','concentrated','aqua']);
 assert.deepEqual(activitySamples.map(sample=>sample.symbol),['K','Na','Ca','Mg','Al','C','Zn','Cr','Fe','Sn','Pb','Cu','Hg','Ag','Pt','Au']);
 for(const {symbol} of activitySamples){
  for(const {id} of metalConditions){
   const {effect,label,observation}=activityReaction(symbol,id);
   assert.ok(effect&&label&&observation,`Missing observation for ${symbol} in ${id}`);
  }
 }
 assert.equal(activityReaction('Au','invalid'),null);
 assert.equal(activityReaction('H','concentrated'),null);
 assert.equal(activityReaction('Fe','steam'),null);
 assert.equal(activityReaction('invalid','cold'),null);
 assert.equal(activityQuiz.options.length,4);
});

test('activity observations distinguish changes due to the sample and reagent',()=>{
 assert.equal(activityReaction('Na','cold').effect,'rapid');
 assert.equal(activityReaction('Mg','cold').effect,'still');
 assert.equal(activityReaction('Mg','hot').effect,'slow');
 assert.equal(activityReaction('Zn','dilute').effect,'gas');
 assert.equal(activityReaction('Cu','dilute').effect,'still');
 assert.equal(activityReaction('Cu','concentrated').effect,'blue');
 assert.equal(activityReaction('Fe','concentrated').effect,'passivated');
 assert.equal(activityReaction('Au','concentrated').effect,'still');
 assert.equal(activityReaction('Au','aqua').effect,'gold');
 assert.equal(activityReaction('Ag','aqua').effect,'coating');
});

test('routine water and acid results keep the beaker intact and only sodium with hydrochloric acid offers an incident demo',()=>{
 const s=freshInquiry();
 assert.doesNotMatch(metalActivityMarkup(s),/data-activity-broken/);
 const observation=(symbol,condition)=>metalActivityMarkup({...s,activityCondition:condition,activityRecords:[{symbol,condition}]});
 for(const symbol of ['K','Na']){
  for(const condition of ['cold','hot']){
   assert.equal(activityReaction(symbol,condition).hazard,'water-reactive');
   assert.doesNotMatch(observation(symbol,condition),/data-activity-broken|data-activity-incident/);
  }
 }
 assert.match(observation('K','cold'),/淡紫色火焰/);
 assert.match(observation('Na','cold'),/熔成小球/);
 for(const symbol of ['K','Na','Ca']){
  for(const condition of ['dilute','concentrated','aqua']){
   assert.equal(activityReaction(symbol,condition).hazard,'acid-splash');
   const markup=observation(symbol,condition);
   assert.doesNotMatch(markup,/data-activity-broken/);
   assert.equal(markup.includes('data-activity-incident'),symbol==='Na'&&condition==='dilute');
  }
  for(const condition of ['concentrated','aqua']){
   assert.equal(activityReaction(symbol,condition).effect,'violent');
  }
 }
 assert.equal(activityReaction('Ca','cold').hazard,null);
 assert.doesNotMatch(observation('Ca','cold'),/data-activity-broken/);
 assert.equal(activityReaction('Cu','dilute').hazard,null);
 assert.equal(activityReaction('Au','aqua').hazard,null);
});

test('activity progress restores valid free observations and rejects invalid answers',()=>{
 const steam={symbol:'Fe',condition:'steam'};
 const cold={symbol:'Na',condition:'cold'};
 const raw={...freshInquiry(),activityCondition:'steam',activitySeen:['cold','steam','unknown','cold'],activityRecords:[steam,cold],activityAnswer:0};
 const partial=restoreInquiry(raw);
 assert.equal(partial.activityCondition,'cold');
 assert.deepEqual(partial.activitySeen,['cold']);
 assert.deepEqual(partial.activityRecords,[cold]);
 assert.equal(partial.activityAnswer,0);
 const complete=restoreInquiry({...raw,activityCondition:'hot',activitySeen:['cold','hot'],activityRecords:[cold,{symbol:'Mg',condition:'cold'},{symbol:'Mg',condition:'hot'}]});
 assert.equal(complete.activityCondition,'hot');
 assert.equal(complete.activityAnswer,0);
 assert.equal(restoreInquiry({...complete,activityAnswer:4}).activityAnswer,null);
 assert.deepEqual(restoreInquiry({version:1}).activitySeen,[]);
});

test('activity keeps distinct observations across condition changes and migrates both legacy trays',()=>{
 const s=restoreInquiry({version:1,activityCondition:'aqua',activitySeen:['cold','hot'],activityTrials:[{symbol:'Na',condition:'cold'},{symbol:'Mg',condition:'hot'}]});
 assert.equal(s.activityCondition,'aqua');
 const [latest,prior]=s.activityRecords;
 assert.deepEqual(latest,{symbol:'Mg',condition:'hot'});
 assert.deepEqual(prior,{symbol:'Na',condition:'cold'});
 const records=[{symbol:'H',condition:'cold'},{symbol:'unknown',condition:'cold'},{symbol:'Au',condition:'aqua'},latest,latest,prior,{symbol:'Fe',condition:'cold'}];
 assert.deepEqual(restoreInquiry({...s,activityRecords:records}).activityRecords,[latest,prior,{symbol:'Fe',condition:'cold'}]);
 assert.deepEqual(restoreInquiry({version:1,activitySeen:['cold','hot']}).activityRecords,[]);
});

test('saved inquiry cannot skip evidence and old ranking credit cannot finish the new free laboratory',()=>{
 const s=restoreInquiry({...freshInquiry(),looked:['burn','burn','unknown'],sorted:['burn','ice'],order:['Mg','C','Fe','Cu'],rankChecked:true,compared:['carbon-iron']});
 assert.deepEqual(s.looked,['burn']);assert.equal(inquiryReady(s,0),false);assert.equal(inquiryReady(s,1),false);
 const full=restoreInquiry({...s,compared:['carbon-iron','copper-iron','magnesium-carbon'],rankChecked:true});assert.equal(inquiryReady(full,1),false);
 full.affinityLab.records=['C|Fe2O3','Cu|Fe2O3','Fe|CuO'];assert.equal(inquiryReady(restoreInquiry(full),1),true);
 assert.equal(restoreInquiry({...full,order:['Cu','Fe','C','Mg']}).rankChecked,false);
});

test('legacy oxidation records keep credit for charcoal and rust observations',()=>{
 const all=['burn','rust','breath','ice'];
 const activityRecords=[{symbol:'Mg',condition:'hot'}];
 const saved=restoreInquiry({version:1,tab:1,selected:'ice',looked:all,sorted:all,activitySeen:['cold','hot'],activityRecords,activityAnswer:0});
 assert.deepEqual(saved.looked,['burn','rust']);
 assert.equal(saved.selected,'burn');
 assert.equal(inquiryReady(saved,0),true);
 assert.equal(saved.oxidationAnswer,null);
 assert.equal(saved.activityAnswer,0);
 assert.deepEqual(saved.activityRecords,activityRecords);
 assert.equal(restoreInquiry({...saved,oxidationAnswer:oxidationQuiz.answer}).oxidationAnswer,oxidationQuiz.answer);
 assert.equal(restoreInquiry({...saved,looked:['burn','breath','ice'],oxidationAnswer:oxidationQuiz.answer}).oxidationAnswer,null);
});

test('free exploration accepts any valid observation without guided tabs or comparison records',()=>{
 const state=freshInquiry();
 assert.equal(activityComparisonsComplete(state),false);
 state.activityRecords=[{symbol:'H',condition:'cold'}];
 assert.equal(activityComparisonsComplete(state),false);
 state.activitySeen=['aqua'];
 state.activityRecords=[{symbol:'Au',condition:'aqua'}];
 assert.equal(activityComparisonsComplete(state),true);
 const saved=restoreInquiry(state);
 assert.equal(activityComparisonsComplete(saved),true);
 const markup=metalActivityMarkup({...saved,activityComparison:'samples'});
 assert.doesNotMatch(markup,/activity-lesson-tabs|activity-comparison|組比較已觀察/);
 assert.equal((markup.match(/data-activity-sample=/g)||[]).length,16);
 assert.equal((markup.match(/data-activity-condition=/g)||[]).length,5);
 assert.doesNotMatch(metalActivityMarkup(freshInquiry()),/鈉在水面快速滑動/);
});

test('the scale reveals loss for charcoal and gain for iron after observation',()=>{
 const state=freshInquiry();
 assert.match(evidenceStudio(state),/data-evidence-mass>30\.0</);
 assert.doesNotMatch(evidenceStudio(state),/少了/);
 state.looked.push('burn');
 assert.match(evidenceStudio(state),/data-evidence-mass>24\.0</);
 assert.match(evidenceStudio(state),/少了 6\.0 g/);
 state.selected='rust';
 assert.match(evidenceStudio(state),/data-evidence-mass>10\.0</);
 assert.doesNotMatch(evidenceStudio(state),/多了/);
 state.looked.push('rust');
 assert.match(evidenceStudio(state),/data-evidence-mass>10\.3</);
 assert.match(evidenceStudio(state),/多了 0\.3 g/);
});

test('retired affinity records cannot retain quiz completion without enough supported evidence',()=>{
 const old=freshInquiry();old.answers[1]=2;old.affinityLab.records=['K|CuO','H|CuO','Cu|Fe2O3'];
 const restored=restoreInquiry(old);assert.deepEqual(restored.affinityLab.records,['Cu|Fe2O3']);assert.equal(inquiryReady(restored,1),false);assert.equal(restored.answers[1],null);
 old.affinityLab.records=['Mg|CuO','C|CuO','Cu|Fe2O3','Hg|CuO'];
 const valid=restoreInquiry(old);assert.equal(inquiryReady(valid,1),true);assert.equal(valid.answers[1],2);
});

test('oxygen is conserved across any free destination; duplicates and out-of-range moves are rejected',()=>{
 for(const e of transferCases){const s=freshInquiry();for(let i=0;i<e.count;i++){
  assert.equal(transferOxygen(s,e.id,i,e.count-1-i),true);
  assert.equal(transferOxygen(s,e.id,i,e.count-1-i),false);
  const moved=s.transfers[e.id].length;assert.equal(e.count-moved+moved,e.count);
 }
 assert.equal(transferOxygen(s,e.id,-1,0),false);assert.equal(transferOxygen(s,e.id,0,e.count),false);
 assert.equal(inquiryReady(s,2),false,'moving oxygen alone does not demonstrate the paired roles');
 s.transferRoles.push(e.id);assert.equal(inquiryReady(restoreInquiry(s),2),true);
 }
});

test('restored role credit requires all oxygen transferred and keeps the selected destinations',()=>{
 const s=freshInquiry();transferOxygen(s,'magnesium',0,1);s.transferRoles=['magnesium'];
 const partial=restoreInquiry(s);assert.deepEqual(partial.transferTargets.magnesium,[1]);assert.deepEqual(partial.transferRoles,[]);
 transferOxygen(s,'magnesium',1,0);assert.deepEqual(restoreInquiry(s).transferTargets.magnesium,[1,0]);
});
