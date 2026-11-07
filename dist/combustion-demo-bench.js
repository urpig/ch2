import {mountBurn,sampleIcon} from './hands-on-burn.js';
import {combustionDemoFrame} from './combustion-demo-model.js';

// Demonstration and practice call the same apparatus actions and renderers.
// This clock also owns delayed pours/drops, so pause freezes the whole procedure.
export function mountDemonstrationBench(root,c,key,onEvidence){
 const evidence=new Set(),cleanups=[],pending=[];
 let time=0,phase='',loaded=false,finished=false,ghost=null;
 const fired=new Set();
 const ctx={s:{selected:key},has:k=>evidence.has(k),record:k=>{evidence.add(k);onEvidence(k);},notice:()=>{},
  delay:(fn,ms)=>pending.push({at:time+ms,fn}),onCleanup:fn=>cleanups.push(fn),setCase:()=>{}};
 const bench=mountBurn(root,c,ctx,{demonstration:true});
 root.inert=true;
 const once=(id,fn)=>{if(fired.has(id))return;fired.add(id);fn();};
 const mix=(a,b,p)=>a.map((v,i)=>v+(b[i]-v)*Math.max(0,Math.min(1,p)));
 function tick(next){
  const dt=next-time;time=next;
  for(const task of [...pending])if(task.at<=time){pending.splice(pending.indexOf(task),1);task.fn();}
  const f=combustionDemoFrame(key,time),p=f.progress;
  if(phase!==f.phase){phase=f.phase;root.dataset.demoPhase=phase;}
  if(phase==='load'){
   once('pickup',()=>{
    ghost=document.createElement('div');ghost.className='combustion-demo-picked';ghost.innerHTML=sampleIcon(key,'demonstration-picked-');root.append(ghost);
   });
   const from=root.querySelector('[data-shelf-sample="'+key+'"] .specimen-vial').getBoundingClientRect(),to=root.querySelector('[data-shelf-target]').getBoundingClientRect(),r=root.getBoundingClientRect();
   const [x,y]=mix([from.x+from.width/2-r.x,from.y+from.height/2-r.y],[to.x+to.width/2-r.x,to.y+to.height/2-r.y],p);
   ghost.style.left=x/r.width*100+'%';ghost.style.top=y/r.height*100+'%';
  }
  if(!['prep','load'].includes(phase)&&!loaded){loaded=true;ghost?.remove();bench.load();}
  let a=bench.apparatus;
  if(['heat','transfer','burn'].includes(phase)){
   const point=phase==='transfer'?(p<.5?mix([320,224],[560,90],p*2):mix([560,90],[560,255],p*2-1)):phase==='burn'?(key==='S'?[560,255]:mix([320,224],[390,220],p*3)):[320,224];
   a.move(point);a.advance(dt);
  }
  if(phase==='cool'&&!finished){
   a.move(key==='S'?(p<.22?mix([560,255],[560,90],p/.22):mix([560,90],[400,335],(p-.22)/.28)):mix([390,220],[400,245],p*3));
   if(p>.55){finished=!!a.finish();a=bench.apparatus;}
  }
  const water=bench.apparatus.water;
  if(key==='Na'&&finished){
   if(phase==='pour'){water.moveProduct(mix([400,245],[147,277],p*1.6));if(p>.65)once('water',()=>water.add());}
   if(phase==='red'||phase==='blue'){const paper=phase;water.movePaper(paper,Math.min(1,p*2));if(p>.55)once(paper,()=>water.dip(paper));}
  }
  if(key==='S'&&finished){
   if(phase==='wash'){water.moveWash(mix([344,216],[560,94],p*1.5));if(p>.7)once('water',()=>water.addWater());}
   if(phase==='shake'){water.shake(560+Math.sin(p*Math.PI*6)*22);if(p>.96)water.stopShaking();}
   if(phase==='take'||phase==='retake'){
    water.movePipette(mix(phase==='take'?[390,335]:[110,381],[560,326],p*1.5));if(p>.7)once(phase,()=>water.take());
   }
   if(phase==='red'||phase==='blue'){
    const paper=root.querySelector('[data-litmus-paper="'+phase+'"]'),r=bench.apparatus.board.getBoundingClientRect(),target=paper.getBoundingClientRect();
    const point=[(target.x+target.width/2-r.x)/r.width*760,(target.y+target.height/2-r.y)/r.height*430];
    water.movePipette(mix([560,326],point,p*1.6));if(p>.68)once(phase,()=>water.spot(phase));
   }
  }
 }
 return {paint(next){while(time<next)tick(Math.min(next,time+40));},dispose(){for(const fn of cleanups.reverse())fn();pending.length=0;ghost?.remove();}};
}
