import test from 'node:test';
import assert from 'node:assert/strict';
import {bindLifePlayback} from '../dist/life-autoplay.js';

function environment(t,{complete=false}={}){
 let time=0,id=0,top=900,finished=0,started=0;
 const frames=new Map(),events=new Map(),paints=[];
 const toggle={disabled:true,setAttribute(){}},play={};
 const bar={setAttribute(){},querySelector:()=>toggle};
 const stage={getBoundingClientRect:()=>({top,bottom:top+400,height:400}),scrollIntoView(){top=200;}};
 const scene={dataset:{},scrollIntoView(){top=100;},closest:()=>null,querySelector:s=>s==='.observation-timeline'?bar:s==='[data-life-retry]'?play:stage};
 const descriptors=new Map();
 function stub(key,value){descriptors.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});}
 stub('window',{addEventListener:(key,fn)=>events.set(key,fn),removeEventListener:key=>events.delete(key)});
 stub('document',{hidden:false,querySelector:()=>null,addEventListener:(key,fn)=>events.set(key,fn),removeEventListener:key=>events.delete(key)});
 stub('innerHeight',800);stub('matchMedia',()=>({matches:false}));
 stub('IntersectionObserver',class{observe(){}disconnect(){}});stub('MutationObserver',class{observe(){}disconnect(){}});
 stub('requestAnimationFrame',fn=>{frames.set(++id,fn);return id;});stub('cancelAnimationFrame',id=>frames.delete(id));
 t.mock.method(performance,'now',()=>time);
 t.after(()=>{for(const [key,descriptor]of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
 const dispose=bindLifePlayback(scene,{seconds:1,initialComplete:complete,paint:p=>paints.push(p),onStart:()=>started++,onComplete:()=>finished++});
 return {scene,frames,paints,toggle,play,dispose,get finished(){return finished;},get started(){return started;},
  view(y){top=y;events.get('scroll')?.();},
  step(ms=100){time+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));}
 };
}

test('life scenes remain before reaction until play, then respect pause and offscreen time',t=>{
 const e=environment(t);
 e.step();e.view(200);e.step(10000);
 assert.equal(e.scene.dataset.phase,'ready');assert.equal(e.frames.size,0);assert.equal(e.paints.at(-1),0);assert.equal(e.started,0);
 assert.equal(e.play.textContent,'▶ 播放動畫');
 e.play.onclick();e.step();assert.equal(e.scene.dataset.phase,'running');assert.equal(e.started,1);
 const progress=e.paints.at(-1);assert.ok(progress>0);
 e.toggle.onclick();e.step(10000);assert.equal(e.paints.at(-1),progress);
 e.toggle.onclick();e.view(1000);e.step(10000);assert.equal(e.paints.at(-1),progress);
 e.view(200);e.step();assert.ok(e.paints.at(-1)>progress&&e.paints.at(-1)<.3);
 for(let i=0;i<12;i++)e.step();
 assert.equal(e.finished,1);assert.equal(e.scene.dataset.phase,'complete');assert.equal(e.paints.at(-1),1);assert.equal(e.toggle.disabled,true);
 e.view(1000);e.view(200);e.step();assert.equal(e.finished,1);
 e.play.onclick();assert.equal(e.paints.at(-1),0);assert.equal(e.started,2);assert.equal(e.scene.dataset.phase,'running');
 e.dispose();assert.equal(e.frames.size,0);
});

test('restored results replay from the start and disposal cancels pending frames',t=>{
 const final=environment(t,{complete:true});
 final.view(200);final.step();assert.equal(final.frames.size,0);assert.equal(final.paints.at(-1),1);
 assert.equal(final.toggle.disabled,true);assert.equal(final.play.textContent,'↻ 重播動畫');
 final.play.onclick();assert.equal(final.paints.at(-1),0);assert.equal(final.started,1);
 final.dispose();
 const replay=environment(t);replay.view(200);replay.play.onclick();replay.step();
 const pending=[...replay.frames.values()][0],progress=replay.paints.at(-1);
 replay.dispose();pending(100000);
 assert.equal(replay.paints.at(-1),progress);assert.equal(replay.finished,0);assert.equal(replay.play.onclick,null);
});
