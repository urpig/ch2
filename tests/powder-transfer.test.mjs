import test from 'node:test';
import assert from 'node:assert/strict';
import {powderTransferPose} from '../dist/combustion-powder-transfer.js';

const source=[65,300],target=[320,224];
test('powder remains on its dish until the spatula scoops it',()=>{
 assert.equal(powderTransferPose(.1,source,target).loaded,false);
 assert.deepEqual(powderTransferPose(.2,source,target).powder,source);
 assert.ok(powderTransferPose(.3,source,target).powder[1]<source[1]);
});
test('powder reaches the bowl before the empty spatula withdraws',()=>{
 const pouring=powderTransferPose(.8,source,target),released=powderTransferPose(.88,source,target),end=powderTransferPose(1,source,target);
 assert.equal(pouring.stage,'pour');assert.ok(pouring.fall>0&&pouring.fall<1);
 assert.deepEqual(released.powder,target);assert.deepEqual(end.powder,target);assert.equal(end.opacity,0);
});
test('spatula and sample move continuously through all transfer phases',()=>{
 for(const boundary of [.2,.3,.7,.88]){
  const before=powderTransferPose(boundary-1e-6,source,target),after=powderTransferPose(boundary+1e-6,source,target);
  assert.ok(Math.hypot(...before.tool.map((n,i)=>n-after.tool[i]))<.01);
  assert.ok(Math.hypot(...before.powder.map((n,i)=>n-after.powder[i]))<.01);
 }
});
