import test from 'node:test';
import assert from 'node:assert/strict';
import {affinityElements,affinityOxides,affinityReaction,freshAffinityLab,restoreAffinityLab,loadAffinitySample,canHeatAffinity,beginAffinityHeat,finishAffinityHeat,affinityLabReady,ironComparisonEvidence} from '../dist/affinity-free-model.js';
import {affinityAppearance} from '../dist/affinity-appearance.js';

function composition(side){const total={};for(const {formula,n} of side){for(const m of formula.matchAll(/([A-Z][a-z]?)(\d*)/g))total[m[1]]=(total[m[1]]||0)+n*Number(m[2]||1);}return total;}
function run(e,o,s=freshAffinityLab()){loadAffinitySample(s,'oxide',o);loadAffinitySample(s,'element',e);assert.equal(beginAffinityHeat(s),true);assert.equal(finishAffinityHeat(s),true);return s;}

test('five classroom elements and four oxides give bounded outcomes; positive equations conserve atoms',()=>{
 assert.deepEqual(affinityElements.map(x=>x.id),['Mg','C','Zn','Fe','Cu']);
 assert.deepEqual(affinityOxides.map(x=>x.id),['MgO','ZnO','Fe2O3','CuO']);
 assert.equal(affinityElements.length*affinityOxides.length,20);
 let positive=0,negative=0,same=0;
 for(const e of affinityElements)for(const o of affinityOxides){const r=affinityReaction(e.id,o.id);assert.ok(r);if(r.kind==='same'){same++;assert.equal(r.reacts,null);continue;}assert.equal(typeof r.reacts,'boolean');if(r.reacts){positive++;assert.deepEqual(composition(r.lhs),composition(r.rhs),r.equation);assert.equal(r.lhs[0].formula,e.formula||e.id);assert.equal(r.lhs[1].formula,o.id);assert.equal(r.rhs[1].formula,o.element);}}
 for(const e of affinityElements)for(const o of affinityOxides)if(affinityReaction(e.id,o.id).reacts===false)negative++;
 assert.equal(positive,9);assert.equal(negative,7);assert.equal(same,4);
 assert.equal(affinityReaction('C','ZnO').gas,'CO');assert.equal(affinityReaction('Fe','CuO').product,'FeO');
 assert.equal(affinityReaction('Cu','Fe2O3').reacts,false);assert.equal(affinityReaction('C','MgO').reacts,false);
 assert.equal(affinityReaction('Xe','Fe2O3'),null);
});

test('heating requires two distinct substances; order is free, animation cannot award early or duplicate evidence',()=>{
 const s=freshAffinityLab();assert.equal(beginAffinityHeat(s),false);loadAffinitySample(s,'oxide','CuO');assert.equal(canHeatAffinity(s),false);loadAffinitySample(s,'element','Fe');assert.equal(canHeatAffinity(s),true);assert.equal(finishAffinityHeat(s),false);assert.deepEqual(s.records,[]);assert.equal(beginAffinityHeat(s),true);assert.equal(loadAffinitySample(s,'element','Mg'),false);assert.equal(beginAffinityHeat(s),false);assert.equal(finishAffinityHeat(s),true);assert.equal(finishAffinityHeat(s),false);assert.deepEqual(s.records,['Fe|CuO']);
 s.phase='ready';run('Fe','CuO',s);assert.equal(s.records.length,1);
 const equal=freshAffinityLab();loadAffinitySample(equal,'element','Fe');loadAffinitySample(equal,'oxide','Fe2O3');assert.equal(canHeatAffinity(equal),false,'same-element oxides must not be called no-redox evidence');
});

test('completed comparisons survive restoration; interrupted heating returns to ready without evidence',()=>{
 const s=run('Mg','Fe2O3');assert.equal(restoreAffinityLab(s).phase,'done');s.phase='heating';s.element='C';s.oxide='CuO';const restored=restoreAffinityLab(s);assert.equal(restored.phase,'ready');assert.deepEqual(restored.records,['Mg|Fe2O3']);
 const invalid=restoreAffinityLab({version:1,element:'Xe',oxide:'bad',phase:'done',records:['Xe|CuO','Fe|Fe2O3','Cu|Fe2O3','Cu|Fe2O3','C|CuO|invalid',null]});assert.equal(invalid.element,null);assert.equal(invalid.oxide,null);assert.equal(invalid.phase,'ready');assert.deepEqual(invalid.records,['Cu|Fe2O3']);
});

test('all retained materials can be heated and restored; copper is an explicit no-reduction control',()=>{
 for(const e of affinityElements){const oxide=e.id==='Cu'?'Fe2O3':'CuO',s=run(e.id,oxide);assert.equal(s.phase,'done');assert.equal(restoreAffinityLab(s).element,e.id);assert.deepEqual(restoreAffinityLab(s).records,[e.id+'|'+oxide]);}
 assert.equal(affinityElements.find(e=>e.id==='Cu').control,true);
 for(const o of affinityOxides.filter(o=>o.element!=='Cu'))assert.equal(affinityReaction('Cu',o.id).reacts,false);
});

test('retired samples cannot be loaded and old records preserve only supported comparisons',()=>{
 for(const id of ['K','Na','Ca','Al','Cr','Sn','Pb','H','Hg','Ag','Pt','Au']){
  assert.equal(loadAffinitySample(freshAffinityLab(),'element',id),false);assert.equal(affinityReaction(id,'CuO'),null);
 }
 assert.equal(loadAffinitySample(freshAffinityLab(),'oxide','Al2O3'),false);
 const saved={version:1,element:'H',oxide:'CuO',phase:'done',records:['Mg|Al2O3','C|CuO','Cu|Fe2O3','K|CuO','Au|CuO','Hg|CuO','H|CuO']};
 const restored=restoreAffinityLab(saved);assert.equal(restored.element,null);assert.equal(restored.oxide,'CuO');assert.equal(restored.phase,'ready');assert.deepEqual(restored.records,['C|CuO','Cu|Fe2O3']);assert.equal(affinityLabReady(restored),false);
 restored.element='Mg';run('Mg','CuO',restored);assert.equal(affinityLabReady(restored),true);
 const removedOxide=restoreAffinityLab({...saved,element:'Mg',oxide:'Al2O3'});assert.equal(removedOxide.element,'Mg');assert.equal(removedOxide.oxide,null);assert.equal(removedOxide.phase,'ready');
});

test('the free mode notebook accepts three distinct trials with both outcomes',()=>{
 const s=freshAffinityLab();s.records=['Mg|CuO','Zn|Fe2O3','C|Fe2O3'];assert.equal(affinityLabReady(s),false);s.records.push('Cu|Fe2O3');assert.equal(affinityLabReady(s),true);assert.equal(affinityLabReady(undefined),false);
});

test('the controlled iron comparison locks the oxide and requires both specific observations',()=>{
 const s=freshAffinityLab();s.oxide='Fe2O3';s.comparison=true;
 assert.equal(loadAffinitySample(s,'oxide','CuO'),false);
 run('Zn','Fe2O3',s);
 assert.equal(affinityLabReady(s),false);
 assert.deepEqual(ironComparisonEvidence(s).map(result=>result?.reacts),[true,undefined]);
 run('Cu','Fe2O3',s);
 const restored=restoreAffinityLab(s);
 assert.equal(restored.comparison,true);
 assert.equal(restored.oxide,'Fe2O3');
 assert.deepEqual(ironComparisonEvidence(restored).map(result=>result.reacts),[true,false]);
 assert.equal(affinityLabReady(restored),true);
 assert.equal(restoreAffinityLab({...s,oxide:'CuO'}).comparison,false);
});

test('cooled copper and iron products differ visibly from their starting oxides',()=>{
 const copper=affinityAppearance('C','CuO');assert.deepEqual(copper.before,['black','black']);assert.deepEqual(copper.after,['copper']);assert.match(copper.coolText,/紅棕色銅粒/);
 const iron=affinityAppearance('C','Fe2O3');assert.deepEqual(iron.before,['red','black']);assert.deepEqual(iron.after,['iron']);assert.match(iron.coolText,/灰黑色鐵粒/);
 const zinc=affinityAppearance('Zn','CuO');assert.deepEqual(zinc.after,['white','copper']);assert.equal(zinc.yellowHot,true);assert.match(zinc.coolText,/白色/);
});

test('a thermal colour change is not falsely presented as an oxygen-transfer reaction',()=>{
 const unchanged=affinityAppearance('Cu','ZnO');assert.equal(affinityReaction('Cu','ZnO').reacts,false);assert.deepEqual(unchanged.after,unchanged.before);assert.equal(unchanged.yellowHot,true);assert.equal(unchanged.glow,'none');assert.match(unchanged.hotText,/冷卻後會恢復白色/);
 for(const e of affinityElements)for(const o of affinityOxides){const a=affinityAppearance(e.id,o.id),r=affinityReaction(e.id,o.id);assert.ok(a.before.every(Boolean));if(r.reacts===false)assert.deepEqual(a.after,a.before);if(r.reacts)assert.ok(a.after.length>0);}
});

test('replaying a completed heating trial preserves evidence without awarding a second record',()=>{
 const s=run('C','CuO');s.phase='ready';assert.equal(beginAffinityHeat(s),true);assert.deepEqual(s.records,['C|CuO']);assert.equal(finishAffinityHeat(s),true);assert.deepEqual(s.records,['C|CuO']);
});

test('after cooling, replacing one sample keeps the other as a controlled comparison',()=>{
 const s=run('Mg','CuO');assert.equal(loadAffinitySample(s,'element','Xe'),false);assert.equal(s.phase,'done');
 assert.equal(loadAffinitySample(s,'element','Fe'),true);assert.equal(s.oxide,'CuO');assert.equal(s.phase,'ready');assert.deepEqual(s.records,['Mg|CuO']);
 assert.equal(beginAffinityHeat(s),true);assert.equal(loadAffinitySample(s,'oxide','MgO'),false);assert.equal(s.oxide,'CuO');assert.equal(finishAffinityHeat(s),true);
 assert.deepEqual(s.records,['Mg|CuO','Fe|CuO']);assert.equal(loadAffinitySample(s,'oxide','MgO'),true);assert.equal(s.element,'Fe');assert.equal(s.phase,'ready');
});
