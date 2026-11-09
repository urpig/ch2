import {mountBurn,sampleIcon} from './hands-on-burn.js';
import {combustionDemoFrame} from './combustion-demo-model.js';
import {spoonTiming} from './spoon-heating.js';
import {mountSodiumPickup} from './sodium-pickup.js';
import {mountPowderTransfer} from './combustion-powder-transfer.js';
import {enterCollectionJar,leaveCollectionJar} from './combustion-transfer-paths.js';

// Demonstration and practice call the same apparatus actions and renderers.
// This clock also owns delayed pours/drops, so pause freezes the whole procedure.
export function mountDemonstrationBench(root,c,key,onEvidence){
 const evidence=new Set(),cleanups=[],pending=[];
 let time=0,phase='',loaded=false,finished=false,ghost=null;
 const fired=new Set();
 const ctx={s:{selected:key},has:k=>evidence.has(k),record:k=>{evidence.add(k);onEvidence(k);},notice:()=>{},
  delay:(fn,ms)=>pending.push({at:time+ms,fn}),onCleanup:fn=>cleanups.push(fn),setCase:()=>{}};
 const bench=mountBurn(root,c,ctx,{demonstration:true});
 function placeLid(closed=0){
  const cover=bench.apparatus.board.querySelector('[data-jar-cover]');
  if(cover){cover.style.transition='none';cover.style.transform=`translate(${110-142*closed}px,${-12+12*closed}px)`;}
 }
 if(key==='S')placeLid();
 const pickup=key==='Na'?mountSodiumPickup(bench.apparatus.board):key==='S'?mountPowderTransfer(bench.apparatus.board,key):null;
 root.inert=true;
 const once=(id,fn)=>{if(fired.has(id))return;fired.add(id);fn();};
 const mix=(a,b,p)=>a.map((v,i)=>v+(b[i]-v)*((t)=>t*t*(3-2*t))(Math.max(0,Math.min(1,p))));
 function tick(next){
  const dt=next-time;time=next;
  for(const task of [...pending])if(task.at<=time){pending.splice(pending.indexOf(task),1);task.fn();}
  const f=combustionDemoFrame(key,time),p=f.progress;
  if(phase!==f.phase){phase=f.phase;root.dataset.demoPhase=phase;}
  if(phase==='load'&&pickup)pickup.paint(p);
  if(phase==='load'&&!pickup){
   once('pickup',()=>{
    ghost=document.createElement('div');ghost.className='combustion-demo-picked';ghost.innerHTML=sampleIcon(key,'demonstration-picked-');root.append(ghost);
   });
   const source=root.querySelector('[data-shelf-sample="'+key+'"]'),from=source.getBoundingClientRect(),to=root.querySelector('[data-shelf-target]').getBoundingClientRect(),r=root.getBoundingClientRect();
   const [x,y]=mix([from.x+from.width/2-r.x,from.y+from.height/2-r.y],[to.x+to.width/2-r.x,to.y+to.height/2-r.y],p);
   source.classList.add('sample-in-transfer');ghost.style.width=from.width+'px';ghost.style.height=from.height+'px';
   ghost.style.left=x/r.width*100+'%';ghost.style.top=(y-Math.sin(Math.PI*p)*r.height*.055)/r.height*100+'%';
  }
  if(!['prep','load'].includes(phase)&&!loaded){loaded=true;ghost?.remove();pickup?.dispose();bench.load();}
  let a=bench.apparatus;
  if(['heat','transfer','burn'].includes(phase)){
   // Drive the same physical heating states at the lesson's slower pace.
   // Do not finish the native 1.7 s burn while the demo is still in its heat step.
   if(phase!=='heat')once('ignite',()=>a.advance(Math.max(0,spoonTiming.ignition-a.state.heatMs)));
   const point=phase==='transfer'?enterCollectionJar([320,224],255,p/.8):phase==='burn'?(key==='S'?[560,255]:mix([320,224],[390,220],p*3)):[320,224];
   a.move(point);
   if(phase==='heat')a.advance(Math.max(0,spoonTiming.ignition*p-a.state.heatMs));
   else if(phase==='burn')a.advance(Math.max(0,(key==='S'?spoonTiming.nonmetal:spoonTiming.metal)*p-(key==='S'?a.state.observationMs:a.state.burnMs)));
  }
  if(phase==='cool'&&!finished){
   once('burn-finished',()=>a.advance(key==='S'?spoonTiming.nonmetal:spoonTiming.metal));
   a.move(key==='S'?(p<.22?[560,255]:leaveCollectionJar([675,286],255,(p-.22)/.73)):[390,220]);
   if(p>(key==='S'?.96:.55)){finished=!!a.finish();a=bench.apparatus;}
  }
  const water=bench.apparatus.water;
  if(key==='Na'&&finished){
   if(phase==='pour'){water.moveProduct(mix([390,220],water.pourPoint,p*1.6));if(p>.65)once('water',()=>water.add());}
   if(phase==='red'||phase==='blue'){const paper=phase;water.movePaper(paper,Math.min(1,p*2));if(p>.55)once(paper,()=>water.dip(paper));}
  }
  if(key==='S'&&finished){
   if(phase==='wash'){
    const point=p<.48?mix([444,216],[560,94],p/.48):p<.77?[560,94]:mix([560,94],[444,216],(p-.77)/.23);
    water.moveWash(point);if(p>.55)once('water',()=>water.addWater());
   }
   if(phase==='shake')water.shake(560+Math.sin(p*Math.PI*6)*22);
   if(['take','red','retake','blue','result'].includes(phase))once('shake-finished',()=>water.stopShaking());
   if(phase==='take'||phase==='retake'){
    const paper=root.querySelector('[data-litmus-paper="red"]'),r=bench.apparatus.board.getBoundingClientRect(),target=paper.getBoundingClientRect();
    const from=phase==='take'?[180,300]:[(target.x+target.width/2-r.x)/r.width*760,(target.y+target.height/2-r.y)/r.height*430];
    water.movePipette(enterCollectionJar(from,326,p/.9));if(p>.92)once(phase,()=>water.take());
   }
   if(phase==='red'||phase==='blue'){
    const paper=root.querySelector('[data-litmus-paper="'+phase+'"]'),r=bench.apparatus.board.getBoundingClientRect(),target=paper.getBoundingClientRect();
    const point=[(target.x+target.width/2-r.x)/r.width*760,(target.y+target.height/2-r.y)/r.height*430];
    water.movePipette(leaveCollectionJar(point,326,p/.75));if(p>.79)once(phase,()=>water.spot(phase));
   }
   if(phase==='result'){
    const paper=root.querySelector('[data-litmus-paper="blue"]'),r=bench.apparatus.board.getBoundingClientRect(),target=paper.getBoundingClientRect();
    const from=[(target.x+target.width/2-r.x)/r.width*760,(target.y+target.height/2-r.y)/r.height*430];
    water.movePipette(mix(from,[180,300],p*3));
   }
  }
  if(key==='S')placeLid(phase==='transfer'?Math.max(0,Math.min(1,(p-.8)/.2)):phase==='burn'?1:phase==='cool'?Math.max(0,1-p/.22):0);
  if(key==='Na'&&loaded)root.querySelector('[data-shelf-sample="Na"]')?.classList.add('sample-in-transfer');
 }
 return {paint(next){while(time<next)tick(Math.min(next,time+40));},dispose(){for(const fn of cleanups.reverse())fn();pending.length=0;ghost?.remove();pickup?.dispose();}};
}
