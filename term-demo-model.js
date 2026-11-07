export function freshTermDemo() {
 return {version:7,exampleObserved:false,exampleTraced:false};
}

export const termWorkedReady = state => state.exampleObserved && state.exampleTraced;
export function restoreTermDemo(raw) {
 const state=freshTermDemo();
 if(![5,6,7].includes(raw?.version))return state;
 state.exampleObserved=raw.exampleObserved===true;
 state.exampleTraced=state.exampleObserved && raw.exampleTraced===true;
 return state;
}

const transferStart = .2;
const transferDuration = .5;
const transferEnd = transferStart+transferDuration;

const sampleTiming = {
 before: 0, oxide: .035, zinc: .18, mixing: .325,
 heating: .44, reacting: .62, cooling: .84, complete: 1
};
const sampleTimeline = Object.entries(sampleTiming);
const interval = (time,start,end)=>Math.max(0,Math.min(1,(time-start)/(end-start)));
const ease = fraction=>fraction*fraction*(3-2*fraction);

function samplePour(progress,reducedMotion) {
 return {
  lift:reducedMotion?0:ease(interval(progress,0,.43))*(1-ease(interval(progress,.77,1))),
  tilt:reducedMotion?0:ease(interval(progress,.34,.57))*(1-ease(interval(progress,.73,.86))),
  falling:reducedMotion?0:interval(progress,.44,.82),
  loaded:reducedMotion?Number(progress>=.74):ease(interval(progress,.54,.78))
 };
}

// One clock drives the apparatus, the close-up, and the oxygen model.
export function termExperimentFrame(value,reducedMotion=false) {
 const time = interval(Number(value)||0,0,1);
 const [stage] = sampleTimeline.findLast(([,start])=>time>=start);
 const oxide = samplePour(interval(time,sampleTiming.oxide,sampleTiming.zinc),reducedMotion);
 const zinc = samplePour(interval(time,sampleTiming.zinc,sampleTiming.mixing),reducedMotion);
 const mixing = interval(time,sampleTiming.mixing,sampleTiming.heating);
 const reacting = interval(time,sampleTiming.reacting,sampleTiming.cooling);
 const cooling = interval(time,sampleTiming.cooling,sampleTiming.complete);
 const oxygenTime = reacting===0?0:reacting===1?1:transferStart+transferDuration*reacting;
 const {travel} = termDemoFrame(oxygenTime,true,reducedMotion);
 return {
  stage,oxide,zinc,oxygenTime,travel,
  mixed:reducedMotion?Number(mixing===1):ease(mixing),
  stir:reducedMotion?0:Math.sin(mixing*Math.PI*2),
  stirDepth:reducedMotion?0:Math.sin(mixing*Math.PI),
  warmth:travel*(1-cooling),
  glow:interval(reacting,0,.13)*(1-interval(reacting,.78,1)),
  glowPosition:reducedMotion?50:9+reacting*82
 };
}

// The particle model tracks the same oxygen before and after heating.
export function termDemoFrame(value,reacts,reducedMotion=false) {
 const time = Math.max(0,Math.min(1,Number(value)||0));
 const progress = time>=transferEnd ? 1 : Math.max(0,(time-transferStart)/transferDuration);
 const fraction = reacts ? progress : 0;
 const travel = reducedMotion ? Number(fraction>=1) : fraction*fraction*(3-2*fraction);
 return {time,travel,left:32+travel*46,top:53-(reducedMotion?0:Math.sin(travel*Math.PI)*24),stage:time>=1?'complete':time<transferStart?'before':reacts&&time<transferEnd?'transfer':'observing'};
}
