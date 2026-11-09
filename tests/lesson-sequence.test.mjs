import test from 'node:test';
import assert from 'node:assert/strict';
import {chapterSequence,chapterNumber} from '../dist/lesson-sequence.js';
import {lessons} from '../dist/journey-cards.js';
import {dictionaryChapters} from '../dist/terminology-data.js';
import {factoryPackedBurden,factoryBurdenLayer} from '../dist/factory-art.js';

test('the split lessons, dictionary and saved IDs share the requested learning sequence',()=>{
 assert.deepEqual(chapterSequence.map(c=>c.number),['序章','01','02','03A','03B','04','05A','05B','06','07','08','09']);
 assert.equal(chapterSequence[chapterSequence.findIndex(c=>c.id==='forge-prep-c')+1].id,'magnesium-co2');
 assert.equal(chapterSequence[5].id,'oxide-stability');
 assert.equal(new Set(chapterSequence.map(c=>c.id)).size,chapterSequence.length);
 assert.ok(!chapterSequence.some(c=>[3,4].includes(c.lessonId)));
 for(const step of chapterSequence.filter(c=>c.lessonId))assert.ok(lessons.some(c=>c.id===step.lessonId));
 for(const chapter of dictionaryChapters)assert.equal(chapter.label.split(' · ')[0],chapterNumber(chapter.target));
});

test('the furnace charge forms alternating supported ore-rich and coke-rich beds',()=>{
 const rows=Array.from({length:27},(_,i)=>factoryBurdenLayer(i));
 assert.deepEqual(rows.slice(0,9),['coke','coke','coke','ore','ore','ore','coke','coke','coke']);
 const markup=factoryPackedBurden();
 const cokeRows=[...markup.matchAll(/data-burden-material="coke" data-burden-row="(\d+)"/g)].map(m=>Number(m[1]));
 assert.ok(cokeRows.length>0);assert.ok(cokeRows.every(row=>rows[row]==='coke'));
 const limeRows=[...markup.matchAll(/data-burden-material="lime" data-burden-row="(\d+)"/g)].map(m=>Number(m[1]));
 assert.ok(limeRows.length>0);assert.ok(limeRows.every(row=>rows[row]==='ore'));
 assert.ok(markup.includes('factory-coke-layers'));assert.ok(markup.includes('factory-charge-layers'));
});
