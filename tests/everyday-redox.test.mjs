import test from 'node:test';
import assert from 'node:assert/strict';
import {freshLife,restoreLife,lifeRecord,lifeReady,lifeMastered,lifeEvidence,lifeBiology,lifeBleaches,appleComparison,recordLifeDemonstration} from '../dist/everyday-redox-model.js';

test('all life observations record playback completion without removed role controls',()=>{
 const s=freshLife();
 assert.equal(recordLifeDemonstration(s,'food'),false);s.time=3;assert.equal(recordLifeDemonstration(s,'food'),false);
 s.time=4;assert.equal(recordLifeDemonstration(s,'food'),true);
 assert.equal(recordLifeDemonstration(s,'photo'),false);s.seen.push('photo');assert.equal(recordLifeDemonstration(s,'photo'),true);
 for(const key of ['resp','peroxide','chlorine','sulfur']){
  assert.equal(recordLifeDemonstration(s,key),false);
  s.seen.push(key);assert.equal(recordLifeDemonstration(s,key),true);
 }
 assert.deepEqual(s.evidence,['food','photo','resp','peroxide','chlorine','sulfur']);assert.deepEqual(s.bioRoles,{});assert.equal(lifeReady(s),true);
 assert.deepEqual(restoreLife(s).evidence,s.evidence);
});
test('生物反應必有相反角色，光合作用水失電子，有氧呼吸葡萄糖失電子',()=>{
 for(const b of Object.values(lifeBiology))assert.deepEqual(b.paths.map(p=>p.role).sort(),['oxidation','reduction']);
 assert.equal(lifeBiology.photo.paths.find(p=>p.role==='oxidation').from,'水 H₂O');
 assert.equal(lifeBiology.resp.paths.find(p=>p.role==='oxidation').from,'葡萄糖 C₆H₁₂O₆');
});
test('不能把褪色當作所有漂白劑被還原，先觀察才能記錄',()=>{
 const s=freshLife();
 for(const [key,b] of Object.entries(lifeBleaches)){
  assert.equal(lifeRecord(s,key,b.role),false);s.seen.push(key);
  assert.equal(lifeRecord(s,key,b.role==='oxidation'?'reduction':'oxidation'),false);
  assert.equal(lifeRecord(s,key,b.role),true);
 }
 assert.equal(lifeBleaches.sulfur.role,'oxidation');assert.equal(s.evidence.length,3);
});
test('錯誤與未知反應不給分、重複正解不重複計分',()=>{
 const s=freshLife();assert.equal(lifeRecord(s,'photo','reduction'),false);assert.equal(lifeRecord(s,'garbage','oxidation'),false);
 assert.equal(lifeRecord(s,'photo','oxidation'),false);s.seen.push('photo');for(let n=0;n<10;n++)lifeRecord(s,'photo','oxidation');assert.deepEqual(s.evidence,['photo']);assert.equal(lifeReady(s),false);
});
test('保護為有限、定性、比較同一時點；必須看到後段才可回答',()=>{
 const s=freshLife();assert.equal(lifeRecord(s,'food','oxidation'),false);s.time=3;assert.equal(lifeRecord(s,'food','reduction'),false);assert.equal(lifeRecord(s,'food','oxidation'),true);
 for(let t=0;t<=4;t++){const x=appleComparison(t);assert.ok(x.protected<=x.plain);assert.ok(x.reserve>=0&&x.reserve<=1);}
 assert.equal(appleComparison(4).reserve,0);assert.ok(appleComparison(4).protected>appleComparison(3).protected);
 assert.deepEqual(appleComparison(Infinity),appleComparison(0));assert.deepEqual(appleComparison(-3),appleComparison(0));
});
test('全六份證據和正確短題才算掌握；重設及restore不虛增進度',()=>{
 const s=freshLife();s.answer=2;assert.equal(lifeMastered(s),false);assert.equal(restoreLife(s).answer,2);
 s.evidence=[...lifeEvidence];assert.equal(lifeMastered(s),true);assert.equal(lifeMastered(restoreLife(s)),true);
 const restored=restoreLife({...s,time:NaN,tab:99,bleach:'<script>',seen:['sulfur','sulfur','bad'],evidence:[...lifeEvidence,'photo','bad']});
 assert.equal(restored.tab,0);assert.equal(restored.time,0);assert.equal(restored.bleach,'peroxide');assert.deepEqual(restored.seen,['sulfur']);assert.equal(restored.evidence.length,6);
 const reset=freshLife();assert.equal(lifeReady(reset),false);assert.equal(reset.answer,null);assert.equal(s.evidence.length,6);
});

test('life review preserves an early wrong answer and rejects invalid answers',()=>{const raw={...freshLife(),answer:0},restored=restoreLife(raw);assert.equal(restored.answer,0);assert.equal(lifeMastered(restored),false);for(const answer of [-1,4,'2',null])assert.equal(restoreLife({...raw,answer}).answer,null);});
