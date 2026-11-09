import test from 'node:test';
import assert from 'node:assert/strict';
import {scienceTerms,dictionaryChapters,dictionarySources,primerTerms} from '../dist/terminology-data.js';
import {dictionaryTermById,filterScienceTerms,matchScienceTerms} from '../dist/terminology-model.js';

test('dictionary records and lesson links are complete without ambiguous identifiers',()=>{
 assert.equal(dictionaryTermById.size,scienceTerms.length);
 const chapters=new Set(dictionaryChapters.map(chapter=>chapter.id));
 for(const term of scienceTerms){
  for(const field of ['label','definition','example','note'])assert.ok(term[field]?.trim(),`${term.id} missing ${field}`);
  assert.ok(term.chapters.length,term.id);
  term.chapters.forEach(chapter=>assert.ok(chapters.has(chapter),`${term.id}: ${chapter}`));
  term.related.forEach(id=>assert.ok(dictionaryTermById.has(id),`${term.id}: ${id}`));
  assert.ok(dictionarySources[term.source]?.url.startsWith('https://'),term.id);
 }
 for(const chapter of chapters){assert.ok(filterScienceTerms('',chapter).length);assert.ok(primerTerms[chapter]);}
 for(const primer of Object.values(primerTerms))for(const id of primer.flat())assert.ok(dictionaryTermById.has(id),id);
});
test('formula and spacing searches accept classroom notation without accepting markup',()=>{
 assert.equal(filterScienceTerms('Fe2O3')[0].id,'ironoxide');
 assert.equal(filterScienceTerms('Ｆｅ₂Ｏ₃')[0].id,'ironoxide');
 assert.ok(filterScienceTerms('維 生 素Ｃ').some(term=>term.id==='vitaminc'));
 assert.deepEqual(filterScienceTerms('<img src=x onerror=alert(1)>'),[]);
 assert.ok(!filterScienceTerms('白藜蘆醇','ore').length);
 assert.deepEqual(filterScienceTerms('白藜蘆醇'),[]);
 assert.ok(filterScienceTerms('CO','furnace').some(term=>term.id==='carbonmonoxide'));
});
test('inline terms prefer complete concepts and never turn chemical formula fragments into buttons',()=>{
 assert.deepEqual(matchScienceTerms('氧化還原反應與抗氧化劑、氧化銅').map(match=>match.term),['redox','antioxidant','copperoxide']);
 assert.deepEqual(matchScienceTerms('Fe₂O₃ + 3CO → 2Fe + 3CO₂'),[]);
 assert.deepEqual(matchScienceTerms('維生素 C 和維生素 E').map(match=>match.term),['vitaminc']);
});
test('key distinctions remain explicit instead of teaching a misleading shortcut',()=>{
 assert.match(dictionaryTermById.get('oxidation').definition,/物質得到氧/);
 assert.match(dictionaryTermById.get('reduction').definition,/氧化物失去氧/);
 for(const id of ['oxidation','reduction','redox','oxidizer','reducingagent'])assert.doesNotMatch(dictionaryTermById.get(id).definition,/電子/);
 assert.match(dictionaryTermById.get('reducingagent').definition,/自己被氧化/);
 assert.match(dictionaryTermById.get('neutral').note,/未溶解/);
 assert.match(dictionaryTermById.get('hardness').note,/不能直接量出硬度/);
 assert.match(dictionaryTermById.get('rust').note,/不是單一純/);
 assert.match(dictionaryTermById.get('antioxidant').note,/不代表.*永久保鮮/);
});

test('dictionary navigation uses current visible lesson numbers without removed-card links',()=>{
 assert.deepEqual(dictionaryChapters.map(c=>c.label.split(' · ')[0]),['序章','01','02','03A','03B','04','05','05B','06','07','08','09']);
 assert.deepEqual(dictionaryChapters.slice(2,9).map(c=>c.target),['metal-activity','card-2','card-8','oxide-stability','forge-prep-c','magnesium-co2','life-redox']);
 assert.ok(!dictionaryChapters.some(c=>['card-4','epilogue-antioxidants'].includes(c.target)));
 assert.equal(dictionaryChapters.find(c=>c.id==='furnace').target,'card-5');
 assert.equal(dictionaryChapters.find(c=>c.id==='blade').target,'card-6');
});
