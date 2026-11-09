import test from 'node:test';
import assert from 'node:assert/strict';
import {combustionDemoDuration,combustionDemoFrame,combustionDemoReady,restoreCombustionDemo} from '../dist/combustion-demo-model.js';
import {combustionRecordsMarkup} from '../dist/combustion-records.js';
import {freshState,restoreState,lessons} from '../dist/journey-cards.js';
import {combustionProcedureSteps} from '../dist/combustion-procedure.js';
import {lifeCaseGroups} from '../dist/everyday-redox-model.js';
import {lifePairedMarkup} from '../dist/life-paired-reaction.js';

test('metal and gas instructions describe their actual distinct water and litmus routes',()=>{
 const sodium=combustionProcedureSteps('Na'),sulfur=combustionProcedureSteps('S');
 assert.equal(sodium.title,'金屬的實驗步驟');assert.equal(sulfur.title,'非金屬的實驗步驟');
 assert.match(sodium.steps[2][1],/燃燒匙上的產物加入清水/);
 assert.match(sodium.steps[3][1],/下端浸入水中/);
 assert.doesNotMatch(sodium.steps.flat().join(''),/集氣瓶|滴管/);
 assert.match(sulfur.steps[1][1],/點燃.*集氣瓶/);
 assert.match(sulfur.steps[2][1],/蒸餾水.*左右搖晃.*氣體溶於水/);
 assert.match(sulfur.steps[3][1],/重新取液.*藍色石蕊/);
 for(const key of ['C','CO'])assert.equal(combustionProcedureSteps(key).title,sulfur.title);
 for(const key of ['Cu','Mg','Zn'])assert.equal(combustionProcedureSteps(key).title,sodium.title);
 const phosphorus=combustionProcedureSteps('P');
 assert.equal(phosphorus.title,sulfur.title);
 assert.match(phosphorus.steps[1].join(''),/白色固體微粒/);
 assert.match(phosphorus.steps[2][1],/燃燒匙上的產物加入清水/);
 assert.doesNotMatch(phosphorus.steps.flat().join(''),/氣體溶於水/);
});

test('scrolling life examples include all six experiments once in the requested order, with independent SVG IDs',()=>{
 const keys=lifeCaseGroups.flatMap(([, ,cases])=>cases);
 assert.deepEqual(keys,['food','photo','resp','peroxide','chlorine','sulfur']);
 const markup=keys.map(key=>lifePairedMarkup(key)).join('');
 const ids=[...markup.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(new Set(ids).size,ids.length);
 assert.equal((markup.match(/data-life-observation/g)||[]).length,6);
 assert.equal((markup.match(/data-life-retry/g)||[]).length,6);
 assert.doesNotMatch(markup,/type="range"/);
});

test('both full demonstrations prepare, ignite, cool, add water, and test both papers in order',()=>{
 for(const key of ['Na','S']){
  const phases=[],duration=combustionDemoDuration(key);
  let previous=-1;
  for(let time=0;time<=duration;time+=100){
   const frame=combustionDemoFrame(key,time);
   assert.ok(frame.index>=previous);previous=frame.index;
   if(!phases.includes(frame.phase))phases.push(frame.phase);
   if(!frame.burned)assert.deepEqual(frame.evidence,[]);
   if(frame.blueTested)assert.equal(frame.redTested,true);
  }
  assert.deepEqual(phases.slice(0,3),['prep','load','heat']);
  for(const [first,last] of [['heat','burn'],['burn','cool'],['cool','red'],['red','blue'],['blue','result']])assert.ok(phases.indexOf(first)<phases.indexOf(last));
  assert.equal(combustionDemoFrame(key,duration-1).done,false);
  assert.equal(combustionDemoFrame(key,duration).done,true);
  assert.deepEqual(combustionDemoFrame(key,duration).evidence,[key+':burn',key+(key==='Na'?':wet':':ph')]);
  assert.equal(combustionDemoFrame(key,duration).blueTested,true);
 }
});

test('both demonstrations share a moderately faster pace with time to read each observation',()=>{
 const major={prep:'sample',load:'sample',heat:'heat',transfer:'heat',burn:'heat',cool:'heat',pour:'water',dissolve:'water',wash:'water',shake:'water',take:'litmus',red:'litmus',retake:'litmus',blue:'litmus',result:'result'};
 assert.equal(combustionDemoDuration('Na'),combustionDemoDuration('S'));
 assert.equal(combustionDemoDuration('Na'),42000);
 for(const key of ['Na','S']){
  for(const [time,stage] of [[0,'sample'],[5999,'sample'],[6000,'heat'],[18999,'heat'],[19000,'water'],[26999,'water'],[27000,'litmus'],[37999,'litmus'],[38000,'result']])assert.equal(major[combustionDemoFrame(key,time).phase],stage);
  const windows=new Map();
  for(let time=0;time<combustionDemoDuration(key);time+=100){const f=combustionDemoFrame(key,time);windows.set(f.phase,(windows.get(f.phase)||0)+100);}
  for(const phase of ['prep','load','heat','burn','cool','red','blue','result'])assert.ok(windows.get(phase)>=2500,`${key} ${phase} leaves time to observe`);
 }
});

test('sulfur is transferred into the bottle before burning there, then washed and shaken before pipetting',()=>{
 const phases=[];for(let time=0;time<=combustionDemoDuration('S');time+=100){const phase=combustionDemoFrame('S',time).phase;if(!phases.includes(phase))phases.push(phase);}
 for(const [first,last] of [['transfer','burn'],['cool','wash'],['wash','shake'],['shake','take'],['red','retake'],['retake','blue']])assert.ok(phases.indexOf(first)<phases.indexOf(last));
 assert.equal(combustionDemoFrame('Na',-100).phase,'prep');
 assert.equal(combustionDemoFrame('Na',Infinity).phase,'prep');
 assert.equal(combustionDemoFrame('S',99999).done,true);
});

test('only ordered watched clips unlock independent operation; old manual evidence cannot skip demos',()=>{
 assert.equal(combustionDemoReady([]),false);assert.equal(combustionDemoReady(['Na']),false);assert.equal(combustionDemoReady(['Na','S']),true);
 assert.deepEqual(restoreCombustionDemo({combustionDemoSeen:['S'],combustionMode:'practice'}).combustionDemoSeen,[]);
 assert.equal(restoreCombustionDemo({evidence:['Na:burn','Na:wet','S:burn','S:ph'],combustionMode:'practice'}).combustionMode,'demo');
 const lesson=lessons.find(c=>c.type==='combustion');
 const saved=restoreState(lesson,{...freshState(lesson),combustionMode:'practice',combustionDemoSeen:['Na','S','S','invalid'],combustionDemoSample:'S'});
 assert.equal(saved.combustionMode,'practice');assert.deepEqual(saved.combustionDemoSeen,['Na']);assert.equal(saved.combustionDemoSample,'Na');
 assert.equal(freshState(lesson).combustionMode,'demo');assert.deepEqual(freshState(lesson).combustionDemoSeen,[]);
});

test('all seven records exist before trying them and reveal only observed fields',()=>{
 let html=combustionRecordsMarkup('combustion',()=>false);
 assert.equal((html.match(/data-record-sample=/g)||[]).length,7);
 assert.equal((html.match(/尚未測試/g)||[]).length,28);
 assert.doesNotMatch(html,/查看已完成|延伸比較|Na₂O₂|酸性<\/b>/);
 const seen=new Set(['Na:burn','S:burn','S:ph']);html=combustionRecordsMarkup('combustion',key=>seen.has(key));
 const sodium=html.match(/<tr data-record-sample="Na">[\s\S]*?<\/tr>/)[0];
 assert.match(sodium,/Na₂O₂/);assert.equal((sodium.match(/尚未測試/g)||[]).length,2);
 assert.match(html.match(/<tr data-record-sample="S">[\s\S]*?<\/tr>/)[0],/酸性/);
 assert.equal((html.match(/data-record-sample=/g)||[]).length,7);
});

test('each split laboratory unlocks after its own demonstration, without requiring the other card',()=>{
 for(const [group,key,other] of [['metals','Na','S'],['nonmetals','S','Na']]){
  assert.equal(combustionDemoReady([other],group),false);assert.equal(combustionDemoReady([key],group),true);
  const lesson=lessons.find(c=>c.sampleGroup===group);
  const restored=restoreState(lesson,{combustionDemoSeen:[key],combustionMode:'practice',combustionDemoSample:other});
  assert.equal(restored.combustionMode,'practice');assert.equal(restored.combustionDemoSample,key);
  assert.equal(freshState(lesson).combustionDemoSample,key);
  const rows=combustionRecordsMarkup(group,()=>false);
  assert.equal((rows.match(/data-record-sample=/g)||[]).length,group==='metals'?4:3);
  assert.match(rows,/尚未測試/);
 }
});
