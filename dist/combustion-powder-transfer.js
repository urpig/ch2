import {combustionSpecimen} from './combustion-specimens.js';

const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const mix=(a,b,t)=>a.map((n,i)=>n+(b[i]-n)*ease(t));

// The concave bowl carries a small spoonful; the remaining reagent stays in its dish.
export function powderTransferPose(progress,source,target){
 const p=Math.max(0,Math.min(1,progress)),above=[target[0]-12,target[1]-35];
 let tool=source,angle=-12,powder=source,fall=0,stage='scoop';
 if(p<.2)tool=mix([source[0]+45,source[1]-18],source,p/.2);
 else if(p<.3){tool=mix(source,[source[0],source[1]-35],(p-.2)/.1);powder=tool;stage='lift';}
 else if(p<.7){tool=mix([source[0],source[1]-35],above,(p-.3)/.4);powder=tool;stage='carry';}
 else if(p<.88){tool=above;angle=-12+ease((p-.7)/.18)*42;fall=ease((p-.7)/.18);powder=mix(above,target,(p-.7)/.18);stage='pour';}
 else{tool=mix(above,[above[0]+80,above[1]-20],(p-.88)/.12);powder=target;fall=1;stage='withdraw';}
 return {tool,powder,angle,fall,stage,loaded:p>=.2,opacity:p<.88?1:1-ease((p-.88)/.12)};
}

export function mountPowderTransfer(board,key='S'){
 const source=board.querySelector(`[data-shelf-sample="${key}"]`),target=board.querySelector('[data-shelf-target]');
 const overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');
 overlay.setAttribute('viewBox','0 0 760 430');overlay.setAttribute('aria-hidden','true');overlay.classList.add('combustion-powder-transfer');
 overlay.innerHTML=`<g data-transfer-spatula><image href="./assets/story/reagent-spoon-v2.png" x="-23" y="-29" width="156" height="52" preserveAspectRatio="xMidYMid meet"/></g><g data-transfer-powder>${combustionSpecimen(key,{x:-15,y:-14,width:30,height:14,prefix:'spatula-powder'})}</g>`;
 board.append(overlay);
 const spatula=overlay.querySelector('[data-transfer-spatula]'),powder=overlay.querySelector('[data-transfer-powder]');
 function paint(p=0){
  const b=board.getBoundingClientRect(),s=source.getBoundingClientRect(),t=target.getBoundingClientRect(),scale=b.width/760;if(!scale)return;
  const from=[(s.x+s.width/2-b.x)/scale,(s.y+s.height*.65-b.y)/scale],to=[(t.x+t.width/2-b.x)/scale,(t.y+t.height/2-b.y)/scale];
  const f=powderTransferPose(p,from,to);overlay.dataset.transferStage=f.stage;
  spatula.setAttribute('transform',`translate(${f.tool.join(' ')}) rotate(${f.angle})`);spatula.setAttribute('opacity',String(f.opacity));
  powder.setAttribute('transform',`translate(${f.powder.join(' ')}) rotate(${f.fall?0:f.angle})`);powder.setAttribute('visibility',f.loaded?'visible':'hidden');
  source.classList.toggle('sample-scooped',f.loaded);
 }
 paint();return {paint,dispose(){overlay.remove();source.classList.remove('sample-scooped');}};
}
