import test from 'node:test';
import assert from 'node:assert/strict';
import {oxygenExamples,oxygenExampleFrame,magnesiumExperimentFrame,oxygenLedger,freshOxygenExamples,restoreOxygenExamples,oxygenExampleReady,oxygenExamplesReady,carbonOxygenQuiz,oxygenExampleQuiz} from '../dist/oxygen-examples-model.js';
import {rustPreventionFrame,rustComparisons} from '../dist/rust-prevention-model.js';
import {lessons,freshState,isReady,restoreState,migrateEight} from '../dist/journey-cards.js';

test('both representative equations conserve every atom and transfer two oxygens together',()=>{
 const expected={carbon:{Ag:4,C:1,O:2},magnesium:{Mg:2,C:1,O:2}};
 for(const key of Object.keys(oxygenExamples)){
  let previous=0;
  for(let i=0;i<=100;i++){
   const ledger=oxygenLedger(key,i/100);assert.deepEqual(ledger.atoms,expected[key]);
   assert.ok(Math.abs(ledger.source+ledger.destination-2)<1e-10);assert.ok(ledger.destination>=previous);previous=ledger.destination;
  }
  assert.equal(oxygenLedger(key,0).destination,0);assert.equal(oxygenLedger(key,1).source,0);
 }
 assert.equal(oxygenExampleFrame(.4).travel,0);
 assert.equal(oxygenExampleFrame(.6,true).travel,0);
 assert.equal(oxygenExampleFrame(1,true).travel,1);
});
test('magnesium ignites outside CO2, crosses above the rim, keeps burning inside and leaves a solid deposit',()=>{
 const before=magnesiumExperimentFrame(0),outside=magnesiumExperimentFrame(.25),inside=magnesiumExperimentFrame(.6),after=magnesiumExperimentFrame(1);
 assert.equal(before.glow,0);assert.equal(before.settled,0);assert.equal(before.metal,1);
 assert.equal(before.holding,0);assert.ok(before.jawX>50&&before.jawX<68&&before.jawY>80,'tongs lie fully on the bench beside the ribbon');
 const contact=magnesiumExperimentFrame(.075),gripped=magnesiumExperimentFrame(.10);
 assert.equal(contact.jawX,contact.ribbonX);assert.equal(contact.jawY,contact.ribbonY);
 assert.equal(gripped.holding,1);assert.equal(gripped.ribbonAngle,78,'close before lifting the same ribbon');
 for(let t=.1;t<=.18;t+=.001){const m=magnesiumExperimentFrame(t);assert.equal(m.ribbonX,m.jawX);assert.equal(m.ribbonY,m.jawY);}
 assert.ok(outside.tipX<32);assert.ok(outside.glow>0);assert.equal(outside.conversion,0);
 // The smaller jar opens at x=36..64%, y~40%; entry must clear the rim.
 for(let t=.35;t<=.4;t+=.001)assert.ok(magnesiumExperimentFrame(t).tipY<29);
 assert.ok(inside.tipX>37&&inside.tipX<63);assert.ok(inside.tipY>41&&inside.tipY<87);assert.ok(inside.glow>0);assert.ok(inside.metal<1);
 assert.equal(after.glow,0);assert.equal(after.metal,0);assert.equal(after.ash,0);assert.equal(after.settled,1);
 for(const t of [.46,.6,.84]){const f=magnesiumExperimentFrame(t);assert.equal(f.jawX,50);assert.equal(f.angle,-74);assert.equal(f.holding,1);}
 assert.equal(after.jawX,before.jawX,'tongs return to the right-side resting place');
 assert.equal(after.jawY,before.jawY);
 assert.equal(after.angle,before.angle);
 for(const t of [.12,.25,.38,.6,.85,1])assert.deepEqual(magnesiumExperimentFrame(t),magnesiumExperimentFrame(t),'same playback time freezes every physical effect');
 let previous=magnesiumExperimentFrame(0);
 for(let i=1;i<=1000;i++){const f=magnesiumExperimentFrame(i/1000);assert.equal(f.scale,before.scale,'tongs never change physical size');assert.ok(Math.abs(f.tipX-previous.tipX)<1.2);assert.ok(Math.abs(f.tipY-previous.tipY)<1.2);assert.ok(f.metal<=previous.metal);assert.ok(f.settled>=previous.settled);previous=f;}
});
test('carbon observation unlocks its explanation while magnesium still requires a correct judgement',()=>{
 assert.deepEqual(restoreOxygenExamples({version:7,exampleObserved:true,exampleTraced:true}),freshOxygenExamples());
 assert.deepEqual(restoreOxygenExamples({version:1,observed:['carbon','magnesium'],answers:{carbon:0,magnesium:0}}),freshOxygenExamples(),'retired copper experiment does not count as the new silver experiment');
 const s=freshOxygenExamples();assert.equal(oxygenExampleReady(s,'carbon'),false);
 s.observed=['carbon'];assert.equal(oxygenExampleReady(restoreOxygenExamples(s),'carbon'),true,'observing carbon no longer requires the removed choice');
 s.observed=['carbon','magnesium'];s.answers={magnesium:1};assert.equal(oxygenExamplesReady(s),false);
 s.answers.magnesium=0;assert.equal(oxygenExamplesReady(restoreOxygenExamples(s)),true);
 s.observed=['carbon'];assert.equal(oxygenExamplesReady(restoreOxygenExamples(s)),false);
});
test('05 and 05B keep independent observation and practice results after the split',()=>{
 const s=freshOxygenExamples();s.observed=['carbon'];s.answers.carbon=0;s.practiceAnswers={carbon:0,magnesium:2};
 const restored=restoreOxygenExamples(s);
 assert.equal(oxygenExampleReady(restored,'carbon'),true);
 assert.equal(oxygenExampleReady(restored,'magnesium'),false);
 assert.equal(oxygenExamplesReady(restored),false);
 assert.deepEqual(restored.practiceAnswers,{carbon:0,magnesium:2});
 restored.observed.push('magnesium');restored.answers.magnesium=1;
 assert.equal(oxygenExampleReady(restored,'carbon'),true,'a wrong answer in 05B does not reset 05');
 assert.equal(oxygenExampleReady(restored,'magnesium'),false);
 restored.answers.magnesium=0;assert.equal(oxygenExamplesReady(restored),true);
 assert.equal(oxygenExampleReady(restored,'unavailable'),false);
 assert.equal(carbonOxygenQuiz.options.length,4);assert.equal(oxygenExampleQuiz.options.length,4);
 assert.match(carbonOxygenQuiz.question,/Ag₂O/);assert.match(oxygenExampleQuiz.question,/二氧化碳/);
 const legacy=restoreOxygenExamples({version:2,selected:'magnesium',observed:['carbon','magnesium'],answers:{carbon:0,magnesium:0}});
 assert.equal(oxygenExamplesReady(legacy),true,'existing observed examples remain available');
 assert.deepEqual(legacy.practiceAnswers,{});
});
test('the rust comparison changes environmental exposure while sharing one elapsed clock',()=>{
 const all=[...new Set(Object.values(rustComparisons).flatMap(x=>x.cases))];
 for(const key of all){assert.equal(rustPreventionFrame(key,0).corrosion,0);assert.equal(rustPreventionFrame(key,1).complete,true);}
 assert.ok(rustPreventionFrame('wet',1).corrosion>rustPreventionFrame('normal',1).corrosion);
 assert.deepEqual(all,['normal','oil','wet']);
 assert.equal(rustPreventionFrame('oil',1).corrosion,0);
 assert.equal(rustPreventionFrame('oil',1).barrier,'oil');
 for(const key of all){let previous=0;for(let i=0;i<=100;i++){const f=rustPreventionFrame(key,i/100);assert.ok(f.corrosion>=previous);previous=f.corrosion;}}
});
test('07 completion and quiz cannot inherit older chapter records',()=>{
 const c=lessons.find(x=>x.id===7),s=freshState(c);assert.equal(c.type,'rust');assert.equal(c.quiz.options.length,4);
 assert.deepEqual(c.required,['normal','oil','wet']);
 assert.equal(isReady(c,s),false);s.evidence=[...c.required];assert.equal(isReady(c,restoreState(c,s)),true);
 assert.deepEqual(migrateEight(c,{7:{evidence:c.required,answer:c.quiz.answer}}).evidence,[]);
});
