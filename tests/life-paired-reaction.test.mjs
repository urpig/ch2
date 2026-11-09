import test from 'node:test';
import assert from 'node:assert/strict';
import {lifeReactionPair,lifePairedMarkup} from '../dist/life-paired-reaction.js';
import {lifeEquationChanges,lifeEquationMarkup,showLifeEquation} from '../dist/life-equation-art.js';
test('each life example tracks both changed partners, including opposite bleaching routes',()=>{
 for(const key of ['photo','resp','peroxide','chlorine','sulfur','food']){
  const p=lifeReactionPair(key);assert.notEqual(p.oxidation.from,p.oxidation.to);assert.notEqual(p.reduction.from,p.reduction.to);
 }
 assert.equal(lifeReactionPair('photo').oxidation.from,'水 H₂O');assert.equal(lifeReactionPair('photo').oxidation.to,'氧氣 O₂');
 assert.equal(lifeReactionPair('photo').reduction.from,'二氧化碳 CO₂');
 assert.equal(lifeReactionPair('resp').oxidation.from,'葡萄糖 C₆H₁₂O₆');
 assert.match(lifeReactionPair('peroxide').reduction.from,/過氧化氫/);assert.match(lifeReactionPair('chlorine').reduction.from,/次氯酸鈉/);
 assert.match(lifeReactionPair('sulfur').oxidation.from,/二氧化硫/);assert.equal(lifeReactionPair('food').oxidation.from,'維生素 C');
 assert.throws(()=>lifeReactionPair('unknown'));
});

test('antioxidant and bleaching equations identify both partners without swapping their redox roles',()=>{
 const changes=key=>lifeEquationChanges[key].changes;
 assert.deepEqual(changes('food')[0],{from:['維他命 C','C₆H₈O₆'],to:['氧化後的維他命 C','C₆H₆O₆'],role:'oxidation'});
 assert.equal(changes('food')[1].role,'reduction');
 assert.deepEqual(changes('peroxide')[0],{from:['過氧化氫','H₂O₂'],to:['水','H₂O'],role:'reduction'});
 assert.deepEqual(changes('chlorine')[0],{from:['次氯酸鈉','NaClO'],to:['氯化鈉','NaCl'],role:'reduction'});
 assert.deepEqual(changes('sulfur')[0],{from:['二氧化硫','SO₂'],to:['硫酸根','SO₄²⁻'],role:'oxidation'});
 for(const key of ['food','peroxide','chlorine','sulfur']){
  assert.deepEqual(changes(key).map(c=>c.role).sort(),['oxidation','reduction']);
  const html=lifePairedMarkup(key,true);
  for(const c of changes(key)){
   assert.ok(html.includes(`data-equation-from="${c.from.filter(Boolean).join(' ')}"`));
   assert.ok(html.includes(`data-equation-to="${c.to.filter(Boolean).join(' ')}"`));
  }
  if(key==='food')assert.doesNotMatch(html,/反應中的氧化與還原|省略完整配平/);
  else assert.match(html,/省略完整配平/);
 }
});

test('life equations remain visible before playback and during replay',()=>{
 for(const key of ['food','peroxide','chlorine','sulfur']){
  assert.doesNotMatch(lifeEquationMarkup(key),new RegExp(`data-life-redox-equation="${key}" hidden`));
  assert.doesNotMatch(lifeEquationMarkup(key,true),new RegExp(`data-life-redox-equation="${key}" hidden`));
 }
 const equation={hidden:true};
 const scene={querySelector:()=>equation};
 showLifeEquation(scene,true);assert.equal(equation.hidden,false);
 showLifeEquation(scene,false);assert.equal(equation.hidden,false);
 assert.throws(()=>lifeEquationMarkup('unknown'));
});
test('all six life scenes wait for play and retain pause and replay without reagent drop targets',()=>{
 for(const key of ['photo','resp','peroxide','chlorine','sulfur','food']){
  const initial=lifePairedMarkup(key);
  assert.match(initial,/life-auto-observation/);
  assert.match(initial,/data-phase="ready"/);
  assert.match(initial,/data-life-retry>▶ 播放動畫/);
  assert.match(initial,/data-time-toggle/);
  assert.doesNotMatch(initial,/data-time-scrub|data-time-caption|type="range"|<progress/);
  assert.doesNotMatch(initial,/data-life-input|data-life-drop|data-life-slot|data-bio-start|拖|拿取|放到這裡/);
  assert.doesNotMatch(initial,/電子|有色物質|色素結構改變|life-pair-model/);
  assert.match(lifePairedMarkup(key,true),/data-phase="complete"/);
  if(['peroxide','chlorine','sulfur','food'].includes(key)){
   assert.match(initial,/實驗組/);assert.match(initial,/對照組/);assert.match(initial,/lab-reagent-transfer/);
  }
 }
});
