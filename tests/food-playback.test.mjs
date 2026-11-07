import test from 'node:test';
import assert from 'node:assert/strict';
import {createFoodPlayback} from '../dist/food-playback.js';
import {appleComparison} from '../dist/everyday-redox-model.js';
function clock(){let time=0,id=0;const frames=new Map(),times=[],states=[];const playback=createFoodPlayback({onTime:t=>times.push(t),onState:s=>states.push(s),requestFrame:f=>{frames.set(++id,f);return id;},cancelFrame:id=>frames.delete(id),now:()=>time});return {playback,times,states,frames,step(ms=200){time+=ms;const batch=[...frames.values()];frames.clear();batch.forEach(f=>f(time));},last:()=>times.at(-1)};}
test('autoplay advances the same observation time for both apples and stops at the final comparison',()=>{
 const c=clock();c.step(1000);assert.equal(c.last(),0);c.playback.setActive(true);for(let i=0;i<60;i++)c.step();assert.equal(c.last(),4);assert.equal(c.states.at(-1).complete,true);assert.equal(c.frames.size,0);assert.equal(appleComparison(c.last()).reserve,0);
});
test('offscreen and user pause preserve elapsed time; returning never jumps through the hidden interval',()=>{
 const c=clock();c.playback.setActive(true);c.step();const t=c.last();c.playback.setActive(false);c.step(60000);assert.equal(c.last(),t);c.playback.setActive(true);c.step();assert.ok(c.last()>t&&c.last()<1);c.playback.pause();const paused=c.last();c.step(90000);assert.equal(c.last(),paused);c.playback.resume();c.step();assert.ok(c.last()>paused&&c.last()<1);
});
test('repeated replay cannot stack frame loops, and reset/disposal invalidates even a stale queued callback',()=>{
 const c=clock();c.playback.setActive(true);c.step();const stale=[...c.frames.values()][0];for(let i=0;i<10;i++)c.playback.replay();assert.equal(c.frames.size,1);assert.equal(c.last(),0);stale(100000);assert.equal(c.last(),0);const pending=[...c.frames.values()][0];c.playback.dispose();pending(200000);assert.equal(c.last(),0);assert.equal(c.frames.size,0);c.playback.replay();assert.equal(c.frames.size,0);
});
test('continuous comparison stays bounded and protection remains limited between labelled stages',()=>{
 let previous=appleComparison(0);for(let i=1;i<=80;i++){const x=appleComparison(i/20);assert.ok(x.plain>=previous.plain&&x.protected>=previous.protected);assert.ok(x.protected<=x.plain);assert.ok(x.reserve>=0&&x.reserve<=1);previous=x;}assert.ok(appleComparison(1.5).plain>appleComparison(1).plain);assert.ok(appleComparison(1.5).plain<appleComparison(2).plain);
});

test('seeking while paused preserves review time and invalidates the previous pending frame',()=>{
 const c=clock();c.playback.setActive(true);c.step();const stale=[...c.frames.values()][0];
 c.playback.pause();c.playback.seek(2);assert.equal(c.last(),2);assert.equal(c.frames.size,0);
 stale(99999);assert.equal(c.last(),2);c.step(60000);assert.equal(c.last(),2);
 c.playback.resume();c.step();assert.ok(c.last()>2&&c.last()<2.1);
 c.playback.pause();c.playback.seek(-10);assert.equal(c.last(),0);
 c.playback.seek(100);assert.equal(c.last(),4);assert.equal(c.states.at(-1).complete,true);
});
