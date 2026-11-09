import test from 'node:test';
import assert from 'node:assert/strict';
import {stabilityTrials,stabilityPairs,recordStabilityPair,recordStabilityComparison,freshStability,restoreStability,stabilityReady,stabilityFrame,stabilityQuiz} from '../dist/oxide-stability-model.js';
import {biologyEquationArt} from '../dist/bio-equation-art.js';
import {stabilityMarkup} from '../dist/oxide-stability.js';
import {chapterSequence} from '../dist/lesson-sequence.js';

test('oxide stability compares the four substances without making every heated substance burn',()=>{
 assert.deepEqual(stabilityTrials.map(t=>t.id),['heat-mg','heat-mgo','heat-ag','heat-ag2o']);
 assert.deepEqual(stabilityTrials.map(t=>t.kind),['formation','unchanged-oxide','unchanged-metal','decomposition']);
 assert.deepEqual(stabilityTrials.map(t=>t.reacts),[true,false,false,true]);
 for(const trial of stabilityTrials){
  const first=stabilityFrame(trial.id,0),mid=stabilityFrame(trial.id,.5),last=stabilityFrame(trial.id,1);
  assert.equal(first.change,0);assert.equal(first.heat,0);assert.equal(last.heat,0);assert.equal(last.complete,true);
  assert.equal(last.oxygen,trial.reacts?1:0);
  if(trial.reacts)assert.ok(mid.oxygen>0&&mid.oxygen<1);else assert.equal(mid.oxygen,0);
  if(trial.kind==='formation')assert.ok(mid.glow>0);else assert.equal(mid.glow,0,'heating an oxide or silver is not a magnesium flash');
 }
 const [mg,mgo,ag,ag2o]=stabilityTrials;
 assert.equal(mg.equation,'2Mg ＋ O₂ → 2MgO');
 assert.equal(ag2o.equation,'2Ag₂O → 4Ag ＋ O₂');
 assert.deepEqual(mgo.materials,['white','white']);assert.deepEqual(ag.materials,['silver-piece','silver-piece']);
 assert.deepEqual(ag2o.materials,['black','silver']);assert.match(ag2o.after,/灰色、帶金屬光澤/);
 assert.match(ag2o.during,/無色氧氣/);assert.equal(mgo.equation,'MgO：不反應');
});

test('two shared-table comparisons preserve independent pair completion',()=>{
 assert.deepEqual(stabilityPairs.map(p=>p.trials),[['heat-mg','heat-ag'],['heat-mgo','heat-ag2o']]);
 const state=freshStability();
 // A partial playback is not an observation until the shared clock completes.
 assert.equal(stabilityReady(state),false);assert.equal(state.observed.length,0);
 recordStabilityPair(state,'elements');assert.deepEqual(new Set(state.observed),new Set(['heat-mg','heat-ag']));
 recordStabilityPair(state,'elements');assert.equal(state.observed.length,2);assert.equal(stabilityReady(state),false);
 const restored=restoreStability(state);recordStabilityComparison(restored);assert.equal(stabilityReady(restored),true);
 recordStabilityComparison(restored);recordStabilityPair(restored,'invalid');assert.equal(restored.observed.length,4);
 for(const p of [0,.2,.5,.8,1]){
  const frames=stabilityTrials.map(t=>stabilityFrame(t.id,p));
  assert.equal(new Set(frames.map(f=>f.heat)).size,1,'all four samples share the same heat timeline');
  assert.ok(frames.every(f=>f.complete===(p===1)));
 }
 const markup=stabilityMarkup();assert.equal((markup.match(/role="tab" /g)||[]).length,2);
 for(const trial of stabilityTrials)assert.ok(markup.includes(`data-stability-station="${trial.id}"`));
 assert.equal((markup.match(/class="stability-shared-photo"/g)||[]).length,2,'one continuous tabletop per pair');
 assert.equal((markup.match(/data-stability-play>/g)||[]).length,2,'each pair has its own playback');
 assert.match(markup,/data-stability-pair="oxides" hidden/);
 assert.doesNotMatch(markup,/class="free-real-bench"/,'no repeated full bench inside each specimen card');
});

test('four new observations are required and retired transfer progress cannot unlock the new practice',()=>{
 const s=freshStability();assert.equal(stabilityReady(s),false);
 s.observed=['heat-mg','heat-mgo','heat-ag'];assert.equal(stabilityReady(s),false);
 s.observed.push('heat-ag2o');assert.equal(stabilityReady(s),true);
 assert.equal(stabilityQuiz.options.length,4);
 assert.equal(restoreStability({selected:'heat-ag2o',observed:['heat-mg'],answer:stabilityQuiz.answer}).answer,null);
 assert.deepEqual(restoreStability({selected:'keep',observed:['keep','form-mg','take','invalid'],answer:1}),freshStability());
 assert.deepEqual(restoreStability({selected:'heat-ag2o',observed:['heat-ag2o','heat-mg','heat-mg','invalid'],answer:1}),{selected:'heat-ag2o',observed:['heat-mg','heat-ag2o'],answer:null});
 assert.equal(restoreStability({...s,answer:1}).answer,1);
 assert.equal(restoreStability({...s,answer:9}).answer,null);
 assert.equal(restoreStability(null).observed.length,0);
 const position=chapterSequence.findIndex(c=>c.id==='card-8');
 assert.equal(chapterSequence[position+1].id,'oxide-stability');assert.equal(chapterSequence[position+1].number,'04');
 assert.match(stabilityMarkup(),/氧化鎂很安定/);assert.match(stabilityMarkup(),/氧化銀不安定/);
 assert.doesNotMatch(stabilityMarkup(),/反應完都很安定|銅 Cu|氧化銅/);
});

test('the biology bracket arrows match each reactant to its correct product and role',()=>{
 const expected={photo:[['二氧化碳 CO₂','葡萄糖 C₆H₁₂O₆','reduction'],['水 H₂O','氧氣 O₂','oxidation']],resp:[['葡萄糖 C₆H₁₂O₆','二氧化碳 CO₂','oxidation'],['氧氣 O₂','水 H₂O','reduction']]};
 for(const [key,paths] of Object.entries(expected)){
  const ready=biologyEquationArt(key),complete=biologyEquationArt(key,true);
  assert.doesNotMatch(ready,/data-bio-equation-paths hidden/);assert.doesNotMatch(complete,/data-bio-equation-paths hidden/);
  for(const [from,to,role] of paths)assert.ok(complete.includes(`class="bio-equation-arrow is-${role}" data-equation-from="${from}" data-equation-to="${to}"`));
  assert.equal((complete.match(/class="bio-equation-tip"/g)||[]).length,2);
 }
});
