import test from 'node:test';
import assert from 'node:assert/strict';
import {biologyStages,freshBiology,addBiologyReactant,beginBiology,finishBiologyStage} from '../dist/life-biology-model.js';
import {biologyMarkup} from '../dist/life-biology-lab.js';
import {moleculeFragment} from '../dist/bio-molecule-art.js';
test('biology waits for both reactants in either order, then observes one whole reaction',()=>{
 for(const key of ['photo','resp'])for(const order of [biologyStages[key],[...biologyStages[key]].reverse()]){
  const [first,second]=order,s=freshBiology(key);
  assert.equal(beginBiology(s),false);assert.equal(finishBiologyStage(s),false);
  assert.equal(addBiologyReactant(s,first.id),true);assert.equal(s.phase,'ready');
  assert.equal(beginBiology(s),false);assert.equal(addBiologyReactant(s,first.id),false);
  assert.equal(addBiologyReactant(s,second.id),true);assert.equal(s.phase,'ready');
  assert.equal(beginBiology(s),true);assert.equal(beginBiology(s),false);
  assert.equal(addBiologyReactant(s,first.id),false);assert.equal(finishBiologyStage(s),true);
  assert.equal(s.phase,'complete');assert.equal(s.step,2);assert.equal(finishBiologyStage(s),false);
  assert.deepEqual([...s.added].sort(),freshBiology(key,true).added.sort());assert.equal(freshBiology(key).step,0);
 }
});

test('reactant molecular models have the atom composition of their labels',()=>{
 for(const [id,composition] of Object.entries({water:{H:2,O:1},co2:{C:1,O:2},oxygen:{O:2},glucose:{C:6,H:12,O:6}})){
  const atoms=[...moleculeFragment(id,'test').matchAll(/data-atom="([CHO])"/g)].map(m=>m[1]);
  assert.deepEqual(atoms.reduce((counts,atom)=>(counts[atom]=(counts[atom]||0)+1,counts),{}),composition,id);
 }
});
test('biology keeps paired outcomes without advanced mechanisms or oxygen-free respiration',()=>{
 assert.deepEqual(biologyStages.photo.map(s=>s.id),['water','co2']);
 assert.doesNotMatch(biologyMarkup('photo'),/水被氧化|二氧化碳被還原/);assert.doesNotMatch(biologyMarkup('photo'),/電子|NADPH|ATP|三碳糖|G3P|碳反應/);
 assert.doesNotMatch(biologyMarkup('resp'),/氧氣被還原/);assert.match(biologyMarkup('resp'),/有氧條件/);assert.doesNotMatch(biologyMarkup('resp'),/電子|life-pair-model/);
});
