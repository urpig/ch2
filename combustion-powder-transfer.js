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
 overlay.innerHTML=`<defs><linearGradient id="transfer-spatula-steel" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f4f7f5"/><stop offset=".22" stop-color="#b9c5c6"/><stop offset=".42" stop-color="#f7faf7"/><stop offset=".59" stop-color="#82969a"/><stop offset="1" stop-color="#465c62"/></linearGradient><radialGradient id="transfer-spoon-bowl" cx=".39" cy=".28" r=".8"><stop stop-color="#475d64"/><stop offset=".36" stop-color="#8f9fa2"/><stop offset=".65" stop-color="#c9d2d0"/><stop offset=".85" stop-color="#f0f5f0"/><stop offset="1" stop-color="#62777b"/></radialGradient></defs><g data-transfer-spatula><path d="M16 -3C38 -4 76 -4 111 -5Q122 -5 123 -1Q122 3 112 3L20 2Z" fill="url(#transfer-spatula-steel)" stroke="#52696f" stroke-width=".7"/><path d="M25 -2L113 -3Q118 -3 120 -1" fill="none" stroke="#f9fcf8" stroke-width=".9"/><path d="M-20 -3C-20 -10 -6 -14 8 -10Q22 -7 20 -1C19 5 8 10 -7 7Q-19 5 -20 -3Z" fill="url(#transfer-spatula-steel)" stroke="#536970" stroke-width=".8"/><ellipse cx="0" cy="-3" rx="18" ry="7.2" fill="url(#transfer-spoon-bowl)" stroke="#e6edeb" stroke-width="1.1"/><path d="M-16 -5Q-11 -10 2 -9M-15 1Q-5 6 9 3" fill="none" stroke="#fff" stroke-width=".8" opacity=".75"/><path d="M-17 2Q-9 8 4 7" fill="none" stroke="#3a5058" stroke-width=".7" opacity=".7"/></g><g data-transfer-powder>${combustionSpecimen(key,{x:-15,y:-14,width:30,height:14,prefix:'spatula-powder'})}</g>`;
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
