import test from 'node:test';
import assert from 'node:assert/strict';
import {freshTermDemo,restoreTermDemo,termDemoFrame,termExperimentFrame,termWorkedReady} from '../dist/term-demo-model.js';
import {workedExampleMarkup,workedTermExample} from '../dist/term-worked-example.js';

test('zinc demonstration completion requires observing the experiment and its synchronized oxygen transfer',()=>{
 assert.equal(termWorkedReady(freshTermDemo()),false);
 assert.equal(termWorkedReady({...freshTermDemo(),exampleObserved:true}),false);
 assert.equal(termWorkedReady({...freshTermDemo(),exampleObserved:true,exampleTraced:true}),true);
 assert.equal(workedTermExample.symbol,'Zn');
 const initial=workedExampleMarkup();
 assert.match(initial,/<div data-worked-followup hidden>/);
 assert.match(initial,/data-worked-explanation hidden/);
 assert.match(initial,/物質加熱前後對照/);
 assert.match(initial,/data-term-experiment/);
 assert.doesNotMatch(initial,/youtube|<iframe|data-term-film/i);
 for(const part of ['term-powder-stream','term-stirrer','free-burner-flame'])assert.ok(initial.includes(part));
 const complete=workedExampleMarkup({...freshTermDemo(),exampleObserved:true,exampleTraced:true});
 assert.match(complete,/<div data-worked-followup >/);
 assert.match(complete,/Zn \+ CuO → ZnO \+ Cu/);
 assert.match(complete,/story-speech--grandpa/);
 assert.match(complete,/所以氧化銅是氧化劑/);
 assert.match(complete,/所以鋅是還原劑/);
 assert.doesNotMatch(complete,/data-term-view|換成鎂|回到你的練習|term-example-agents/);
});

test('restoring old magnesium practice cannot reopen it or count it as zinc observation',()=>{
 const oldPractice={version:6,view:'practice',step:2,observed:['magnesium','copper'],gain:true,loss:true,roles:['reductant','oxidant'],activity:true};
 assert.deepEqual(restoreTermDemo(oldPractice),freshTermDemo());
 assert.equal(restoreTermDemo({...oldPractice,exampleTraced:true}).exampleTraced,false);
 assert.deepEqual(restoreTermDemo({...oldPractice,exampleObserved:true,exampleTraced:true}),{...freshTermDemo(),exampleObserved:true,exampleTraced:true});
 assert.deepEqual(restoreTermDemo({version:3,exampleObserved:true,exampleTraced:true}),freshTermDemo());
 assert.deepEqual(restoreTermDemo(null),freshTermDemo());
 assert.deepEqual(restoreTermDemo({...freshTermDemo(),exampleObserved:true,exampleTraced:true}),{...freshTermDemo(),exampleObserved:true,exampleTraced:true});
});

test('the lab prepares samples, heats, reacts with the oxygen model, and keeps the cooled result',()=>{
 const before=termExperimentFrame(0);
 assert.equal(before.stage,'before');
 assert.equal(before.oxide.loaded,0);
 assert.equal(before.zinc.loaded,0);

 const oxide=termExperimentFrame(.135);
 assert.equal(oxide.stage,'oxide');
 assert.ok(oxide.oxide.lift>0 && oxide.oxide.falling>0 && oxide.oxide.loaded>0);
 assert.equal(oxide.zinc.loaded,0);
 assert.equal(oxide.travel,0);
 const zinc=termExperimentFrame(.28);
 assert.equal(zinc.stage,'zinc');
 assert.equal(zinc.oxide.loaded,1);
 assert.ok(zinc.zinc.lift>0 && zinc.zinc.loaded>0);
 assert.equal(zinc.travel,0);
 const mixing=termExperimentFrame(.38);
 assert.equal(mixing.stage,'mixing');
 assert.equal(mixing.zinc.loaded,1);
 assert.ok(mixing.mixed>0 && mixing.mixed<1 && mixing.stirDepth>0);
 assert.equal(mixing.travel,0);

 const heating=termExperimentFrame(.54);
 assert.equal(heating.stage,'heating');
 assert.equal(heating.mixed,1);
 assert.equal(heating.glow,0);
 assert.equal(heating.travel,0);
 const reacting=termExperimentFrame(.73);
 assert.equal(reacting.stage,'reacting');
 assert.equal(reacting.travel,termDemoFrame(reacting.oxygenTime,true).travel);
 assert.ok(reacting.glow>0 && reacting.warmth>0);
 const cooling=termExperimentFrame(.91);
 assert.equal(cooling.stage,'cooling');
 assert.equal(cooling.travel,1);
 assert.equal(cooling.glow,0);
 assert.ok(cooling.warmth>0 && cooling.warmth<1);
 const complete=termExperimentFrame(1);
 assert.equal(complete.stage,'complete');
 assert.equal(complete.travel,1);
 assert.equal(complete.warmth,0);

 assert.equal(termExperimentFrame(.135,true).oxide.lift,0);
 assert.equal(termExperimentFrame(.38,true).stirDepth,0);
 assert.equal(termExperimentFrame(.73,true).travel,0);
 assert.equal(termExperimentFrame(.84,true).travel,1);
});

test('red oxygen moves only for the reacting pair and reduced motion does not sweep',()=>{
 assert.equal(termDemoFrame(.12,true).travel,0);
 assert.equal(termDemoFrame(0,true).left,32);
 assert.equal(termDemoFrame(1,true).left,78);
 assert.equal(termDemoFrame(.45,true).travel,.5);
 assert.equal(termDemoFrame(1,false).left,32);
 assert.equal(termDemoFrame(.45,true,true).travel,0);
 assert.equal(termDemoFrame(1,true,true).travel,1);
 assert.equal(termDemoFrame(1,true,true).top,53);
});
