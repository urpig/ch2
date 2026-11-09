import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lessons,materialCases,restoreState,freshState,isReady,isMastered,migrateLegacy,litmusResult} from '../dist/journey-cards.js';
import {inside} from '../dist/direct-manipulation.js';
test('crushing the ore completes the prologue operation without requiring rotation, including saved work',()=>{
 const c=lessons.find(c=>c.id===1),s=freshState(c);s.evidence=['ore-crushed'];s.answer=c.quiz.answer;
 assert.equal(isReady(c,s),true);assert.equal(isMastered(c,s),true);
 assert.equal(isMastered(c,restoreState(c,s)),true);
 assert.equal(isReady(c,{...s,evidence:['ore']}),false);
});
test('stored lesson definitions retain their identities and one four-option quiz each',()=>{assert.equal(lessons.length,8);for(const [i,c] of lessons.entries()){assert.equal(c.id,i+1);for(const k of ['question','task','finding','explanation','bridge'])assert.ok(c[k].length>10);if([1,2,5,6,7,8].includes(c.id))assert.equal(c.opening,'');else assert.ok(c.opening.length>10);assert.equal(c.labels.length,c.required.length);assert.equal(c.quiz.options.length,4);assert.equal(new Set(c.quiz.explanations).size,4);}assert.equal(lessons.find(c=>c.id===7).type,'rust');assert.ok(!lessons.some(c=>['mass','cell'].includes(c.type)));});
test('core observations are all required while every extended material observation remains available',()=>{
 for(const c of lessons){
  const state=freshState(c);
  for(const key of c.coreRequired||c.required){assert.equal(isReady(c,state),false);state.evidence.push(key);}
  assert.equal(isReady(c,state),true);
 }
 const combustion=lessons.find(c=>c.type==='combustion');
 assert.deepEqual(combustion.coreRequired,['Na:burn','Na:wet']);
 for(const missing of combustion.coreRequired){
  const state={...freshState(combustion),evidence:combustion.required.filter(key=>key!==missing)};
  assert.equal(isReady(combustion,state),false);
 }
 for(const [key] of materialCases.metals)assert.ok(combustion.required.includes(key+':burn')&&combustion.required.includes(key+(['S','C','CO'].includes(key)?':ph':':wet')));
 assert.equal(combustion.required.length,13);
 assert.ok(combustion.required.includes('Zn:cool'));
});
test('early answers survive reload without inventing observations or mastery',()=>{for(const c of lessons){const state={...freshState(c),evidence:[...c.required.filter(key=>key!==(c.coreRequired||c.required)[0]),'bogus'],quizOpen:true,answer:c.quiz.answer,selected:'bogus'};const s=restoreState(c,state);assert.equal(isReady(c,s),false);assert.equal(s.quizOpen,true);assert.equal(s.answer,c.quiz.answer);assert.equal(isMastered(c,s),false);assert.ok(!s.evidence.includes('bogus'));const full=restoreState(c,{...state,evidence:c.required});assert.equal(full.answer,c.quiz.answer);assert.equal(isMastered(c,full),true);for(const answer of [-1,9,NaN,'1'])assert.equal(restoreState(c,{...state,answer}).answer,null);}});

test('acid, base and neutral outcomes change the correct paper only',()=>{assert.equal(litmusResult('base','red'),litmusResult('neutral','blue'));assert.equal(litmusResult('acid','blue'),litmusResult('neutral','red'));assert.notEqual(litmusResult('neutral','red'),litmusResult('neutral','blue'));});
test('drop hit testing rejects a paper above the surface and outside the vessel',()=>{const water={left:100,right:220,top:160,bottom:240};assert.equal(inside({x:160,y:159},water),false);assert.equal(inside({x:99,y:190},water),false);assert.equal(inside({x:160,y:190},water),true);assert.equal(inside({x:160,y:241},water),false);});
test('science distinctions survive consolidation',()=>{assert.match(lessons[1].explanation,/不能只按火焰亮度/);assert.match(lessons[1].explanation,/燃燒產物與水作用生成 NaOH/);assert.match(lessons[1].explanation,/ZnO 是兩性氧化物/);assert.match(lessons.find(c=>c.type==='redox').equation,/2Fe₂O₃ \+ 3C → 4Fe \+ 3CO₂/);assert.match(lessons.find(c=>c.type==='iron').equation,/Fe₂O₃ \+ 3CO → 2Fe \+ 3CO₂/);});
test('the local page has no obsolete card limitation block or reaction speed slider',()=>{const app=fs.readFileSync(new URL('../dist/story-app.js',import.meta.url),'utf8');assert.ok(!app.includes('條件與模型限制'));assert.ok(!app.includes('type="range"'));assert.match(app,/lost-forge-hands-on-7-v3/);});


test('every learning card including the prologue requires observations and a correct practice answer',()=>{for(const c of lessons){const s=freshState(c);assert.equal(isMastered(c,s),false);s.evidence=[...c.required];assert.equal(isMastered(c,s),false);s.answer=c.quiz.answer;assert.equal(isMastered(c,s),true);const restored=restoreState(c,{...s,quizOpen:true});assert.equal(restored.answer,c.quiz.answer);assert.equal(isMastered(c,restored),true);}});

test('changing the combustion question preserves observations but clears its old answer',()=>{const c=lessons.find(c=>c.id===2);const restored=restoreState(c,{evidence:c.required,quizOpen:true,answer:1});assert.deepEqual(restored.evidence,c.required);assert.equal(restored.answer,null);assert.equal(isMastered(c,restored),false);restored.answer=c.quiz.answer;assert.equal(isMastered(c,restoreState(c,restored)),true);});
