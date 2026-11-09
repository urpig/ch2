import test from 'node:test';
import assert from 'node:assert/strict';
import {sodiumPickupPose} from '../dist/sodium-pickup.js';

const source=[430,365],destination=[320,215];
const pose=p=>sodiumPickupPose(p,source,destination);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);

test('sodium remains on the dish until the forceps close, then lifts before carrying',()=>{
 for(const p of [0,.1,.18,.23,.269]){
  assert.deepEqual(pose(p).piece,source);
  assert.equal(pose(p).lifted,false);
 }
 assert.equal(pose(.27).gap,0);
 const raised=pose(.4);
 assert.equal(raised.piece[0],source[0]);
 assert.ok(raised.piece[1]<source[1]-35);
 assert.equal(raised.gap,0);
 const carried=pose(.57);
 assert.ok(carried.piece[0]<source[0]&&carried.piece[0]>destination[0]);
 assert.ok(carried.piece[1]<source[1]);
});

test('release keeps sodium on the spoon as the empty forceps open and withdraw',()=>{
 for(const p of [.86,.9,.95,1]){
  assert.deepEqual(pose(p).piece,destination);
  assert.equal(pose(p).landed,true);
  assert.equal(pose(p).sizeProgress,1);
 }
 assert.ok(pose(.9).gap>pose(.86).gap);
 assert.ok(distance(pose(.98).tool,destination)>40);
 assert.equal(pose(1).toolOpacity,0);
});

test('pickup has continuous handoffs between approach, grip, lift, carry and release',()=>{
 for(const boundary of [.18,.27,.43,.72,.86,.93]){
  const before=pose(boundary-1e-6),after=pose(boundary+1e-6);
  assert.ok(distance(before.piece,after.piece)<.001,`piece at ${boundary}`);
  assert.ok(distance(before.tool,after.tool)<.001,`forceps at ${boundary}`);
  assert.ok(Math.abs(before.gap-after.gap)<.001);
  assert.ok(Math.abs(before.angle-after.angle)<.001);
 }
});

test('pausing is deterministic and restarting restores the closed-loop starting pose',()=>{
 const first=pose(.57);
 pose(.99);
 assert.deepEqual(pose(.57),first);
 assert.deepEqual(pose(-1),pose(0));
 assert.deepEqual(pose(NaN),pose(0));
 assert.deepEqual(pose(2),pose(1));
 assert.deepEqual(source,[430,365]);
 assert.deepEqual(destination,[320,215]);
});
