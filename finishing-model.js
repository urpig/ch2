export const clampLoad=value=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
export function bladeResponse(key,load,released=false){
 const q=clampLoad(load),valid=['pig','steel','wrought'].includes(key),complete=valid&&released&&q>=.85;
 return {load:q,complete,broken:complete&&key==='pig',bend:released?(complete&&key==='wrought'?40:0):q*({pig:9,steel:33,wrought:54}[key]||0)};
}
export function bladeCurve(bend=0){
 const b=Math.max(-5,Math.min(70,Number.isFinite(bend)?bend:0));
 return {edge:`M180 251 L242 251 Q480 ${251+b*2} 718 251 L796 263 L718 275 Q480 ${275+b*2} 242 275 L180 275 Z`,ridge:`M184 263 L242 263 Q480 ${263+b*2} 718 263 L790 263`};
}
export function bladeReleaseFrame(key,loaded,rest,progress){
 const p=clampLoad(progress);
 const settled=1-(1-p)**3;
 const press=loaded*(1-settled);
 const split=key==='pig'?1-(1-clampLoad((p-.12)/.46))**3:0;
 const bend=key==='steel'
  ? rest+loaded*Math.exp(-6*p)*(1-p)*Math.cos(3*Math.PI*p)
  : loaded+(rest-loaded)*settled;
 return {bend,press,split};
}
export function rustSurface(key,progress){const p=clampLoad(progress);return {rust:key==='damp'?Math.max(0,(p-.12)/.88):0,oil:key==='oil',moisture:key==='damp'||key==='oil'};}
