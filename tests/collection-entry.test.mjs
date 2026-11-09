import test from 'node:test';
import assert from 'node:assert/strict';
import {enterCollectionJar,leaveCollectionJar,collectionMouth} from '../dist/combustion-transfer-paths.js';

test('spoon and pipette clear the mouth before entering and leaving vertically',()=>{
 for(const [from,depth] of [[[320,224],255],[[180,300],326]]){
  assert.deepEqual(enterCollectionJar(from,depth,0),from);
  assert.deepEqual(enterCollectionJar(from,depth,1),[560,depth]);
  assert.deepEqual(leaveCollectionJar(from,depth,0),[560,depth]);
  assert.deepEqual(leaveCollectionJar(from,depth,1),from);
  let previous=enterCollectionJar(from,depth,0);
  for(let i=1;i<=1000;i++){
   const p=i/1000,point=enterCollectionJar(from,depth,p);
   if(p>=2/3&&point[1]>collectionMouth.y)assert.equal(point[0],collectionMouth.x);
   if(point[0]!==previous[0]&&point[0]!==collectionMouth.x)assert.equal(point[1],collectionMouth.clearance);
   assert.ok(Math.hypot(point[0]-previous[0],point[1]-previous[1])<3);
   previous=point;
   const out=leaveCollectionJar(from,depth,p);
   if(p<=1/3&&out[1]>collectionMouth.y)assert.equal(out[0],collectionMouth.x);
  }
 }
});
