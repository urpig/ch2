import test from 'node:test';
import assert from 'node:assert/strict';
import {evidenceStudio} from '../dist/inquiry-studios.js';
import {freshInquiry} from '../dist/inquiry-model.js';
import {rustPreventionFrame} from '../dist/rust-prevention-model.js';
import {mountExperimentPractice} from '../dist/experiment-practice.js';
import {freshFireExperiment,startFireTrial,finishFireTrial,fireExperimentReady,fireExperimentFrame,fireExperimentQuiz} from '../dist/fire-experiment-model.js';
import {photographicSpoon,apparatusPhoto} from '../dist/combustion-photo-art.js';

test('both scale experiments keep separate controls below their observations, including partial saved progress',()=>{
 const s=freshInquiry();s.looked=['burn'];
 const html=evidenceStudio(s);
 assert.equal((html.match(/data-evidence-player=/g)||[]).length,2);
 assert.ok(html.indexOf('data-evidence-player="burn"')<html.indexOf('data-evidence-player="rust"'));
 assert.match(html,/data-evidence-mass>24\.0</);
 assert.match(html,/data-evidence-mass>10\.0</);
 assert.doesNotMatch(html,/data-observe=/);
 for(const id of ['burn','rust']){
  const panel=html.split(`data-evidence-player="${id}"`)[1].split('</section>\n  </section>')[0];
  assert.match(panel,new RegExp(`data-play-evidence="${id}"`));
  assert.doesNotMatch(panel,/data-pause-evidence|暫停/);
  assert.ok(panel.indexOf('evidence-inspector')<panel.indexOf('data-play-evidence'));
 }
 assert.doesNotMatch(html,/data-prep-reset|播放兩組|重播兩組/);
});
test('rust appears earlier and remains much stronger with water while the oil barrier stays clear',()=>{
 const normal=rustPreventionFrame('normal',.5),wet=rustPreventionFrame('wet',.5);
 assert.ok(normal.corrosion>.2);
 assert.ok(wet.corrosion>.5);
 assert.ok(wet.corrosion>normal.corrosion*2);
 assert.equal(rustPreventionFrame('oil',1).corrosion,0);
 assert.equal(rustPreventionFrame('wet',1).corrosion,1);
});
test('the fire investigation unlocks its four-choice question only after two observed methods',()=>{
 let question;mountExperimentPractice(q=>{question=q;return ()=>{};});
 assert.equal(question.id,'practice-experiment');assert.equal(fireExperimentQuiz.options.length,4);
 assert.match(question.context,/data-fire-tool="water"/);assert.match(question.context,/data-fire-tool="lid"/);
 assert.doesNotMatch(question.context,/塗油|rust-investigation/);
 const s=freshFireExperiment();assert.equal(fireExperimentReady(s),false);
 assert.equal(startFireTrial(s,'invalid'),false);assert.equal(finishFireTrial(s),false);
 startFireTrial(s,'water');assert.equal(fireExperimentReady(s),false);
 finishFireTrial(s);finishFireTrial(s);assert.deepEqual(s.observed,['water']);assert.equal(fireExperimentReady(s),false);
 startFireTrial(s,'lid');finishFireTrial(s);assert.equal(fireExperimentReady(s),true);
 assert.ok(fireExperimentFrame('water',.6).flame>fireExperimentFrame('water',0).flame);
 assert.equal(fireExperimentFrame('water',0).splash,0);assert.ok(fireExperimentFrame('water',.5).splash>0);
 assert.equal(fireExperimentFrame('lid',0).covered,0);assert.equal(fireExperimentFrame('lid',1).covered,1);
 assert.equal(fireExperimentFrame('lid',1).flame,0);assert.equal(fireExperimentFrame('lid',1).heatOff,true);
 assert.match(fireExperimentQuiz.options[fireExperimentQuiz.answer],/熱油.*火勢擴大/);
});

test('photo spoons keep the physical bowl target when empty, loaded and oxidized',()=>{
 for(const key of ['Na','Mg','Zn','Cu','S','P','C'])for(const options of [{empty:true},{progress:true},{oxide:true}]){
  const html=photographicSpoon(key,options);
  assert.match(html,/data-spoon-bowl cx="29" cy="205" rx="25"/);
  assert.match(html,/apparatus-photo-spoon/);
 }
 assert.throws(()=>apparatusPhoto('unknown',0,0,1,1));
});
