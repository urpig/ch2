import test from 'node:test';
import assert from 'node:assert/strict';
import {lifeReactionPair,lifePairedMarkup} from '../dist/life-paired-reaction.js';
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
