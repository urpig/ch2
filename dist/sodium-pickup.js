import {sodiumSpecimen,sodiumOnDish,sodiumOnSpoon} from './sodium-specimen.js';

const smooth=p=>{const n=Math.max(0,Math.min(1,p));return n*n*(3-2*n);};
const lerp=(a,b,p)=>a+(b-a)*smooth(p);
const mix=(a,b,p)=>a.map((v,i)=>lerp(v,b[i],p));
const section=(p,a,b)=>(p-a)/(b-a);

// The specimen stays on the dish until the jaws close. After release it stays
// on the spoon while the empty forceps retreat, including when playback pauses.
export function sodiumPickupPose(progress,source,destination){
 const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
 const lifted=[source[0],source[1]-46],above=[destination[0],destination[1]-36];
 let piece=source,tool=[source[0]+15,source[1]-70],angle=45,gap=20,stage='approach';
 if(p<.18){tool=mix(tool,source,section(p,0,.18));angle=lerp(45,0,section(p,0,.18));}
 else if(p<.27){tool=source;angle=0;gap=lerp(20,0,section(p,.18,.27));stage='grip';}
 else if(p<.43){piece=mix(source,lifted,section(p,.27,.43));tool=piece;angle=0;gap=0;stage='lift';}
 else if(p<.72){piece=mix(lifted,above,section(p,.43,.72));tool=piece;angle=0;gap=0;stage='carry';}
 else if(p<.86){piece=mix(above,destination,section(p,.72,.86));tool=piece;angle=0;gap=0;stage='lower';}
 else if(p<.93){piece=destination;tool=piece;angle=0;gap=lerp(0,20,section(p,.86,.93));stage='release';}
 else{piece=destination;tool=mix(destination,[destination[0]+65,destination[1]-57],section(p,.93,1));angle=lerp(0,12,section(p,.93,1));gap=20;stage='withdraw';}
 const sizeProgress=smooth(section(p,.43,.72));
 return {stage,piece:[...piece],tool:[...tool],angle,gap,sizeProgress,lifted:p>=.27,landed:p>=.86,toolOpacity:p<.93?1:1-smooth(section(p,.93,1))};
}

function forcepsArtwork(){
 return '<g data-pickup-forceps><g data-pickup-rear-jaw><image href="./assets/story/metal-activity/forceps.png" x="-8" y="-55" width="180" height="60" transform="rotate(-35)" preserveAspectRatio="xMidYMid meet"/></g><g data-pickup-front-jaw></g></g>';
}

export function mountSodiumPickup(board){
 const source=board.querySelector('[data-shelf-sample="Na"]'),target=board.querySelector('[data-shelf-target]');
 const overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');
 overlay.setAttribute('viewBox','0 0 760 430');overlay.setAttribute('aria-hidden','true');overlay.classList.add('combustion-sodium-pickup');
 overlay.innerHTML=`${forcepsArtwork()}<g data-pickup-shadow><ellipse rx="19" ry="4" fill="#172729" opacity=".22"/></g><g data-pickup-piece>${sodiumSpecimen(-50,-36,100,72,'sodium-in-forceps')}</g>`;
 // Forceps sit behind the solid; the near jaw overlaps its side at the grip.
 const tool=overlay.querySelector('[data-pickup-forceps]'),piece=overlay.querySelector('[data-pickup-piece]'),shadow=overlay.querySelector('[data-pickup-shadow]'),rear=overlay.querySelector('[data-pickup-rear-jaw]'),front=overlay.querySelector('[data-pickup-front-jaw]');
 const nearTool=document.createElementNS('http://www.w3.org/2000/svg','g');
 nearTool.append(front);overlay.append(nearTool);
 board.append(overlay);
 function paint(progress=0){
  const r=board.getBoundingClientRect(),from=source.getBoundingClientRect(),to=target.getBoundingClientRect(),scale=r.width/760;
  if(!scale||!from.width)return;
  const sourceCenter=[(from.left+from.width*(sodiumOnDish.x+sodiumOnDish.width/2)/160-r.left)/scale,(from.bottom-from.width/160*(120-sodiumOnDish.y-sodiumOnDish.height/2)-r.top)/scale];
  const destination=[(to.left+to.width/2-r.left)/scale,(to.top+to.height/2-r.top)/scale+sodiumOnSpoon.y+sodiumOnSpoon.height/2-205];
  const pose=sodiumPickupPose(progress,sourceCenter,destination),width=lerp(from.width/160*sodiumOnDish.width/scale,sodiumOnSpoon.width,pose.sizeProgress),height=width*72/100;
  overlay.dataset.pickupStage=pose.stage;
  source.classList.toggle('sample-in-transfer',pose.lifted);
  piece.setAttribute('transform',`translate(${pose.piece.join(' ')}) scale(${width/100})`);piece.setAttribute('visibility',pose.lifted?'visible':'hidden');
  const toolTransform=`translate(${pose.tool[0]} ${pose.tool[1]-height*.1}) rotate(${pose.angle})`;
  for(const part of [tool,nearTool]){part.setAttribute('transform',toolTransform);part.setAttribute('opacity',String(pose.toolOpacity));}
  rear.setAttribute('transform',`rotate(${-pose.gap*.13} 105 -138)`);front.setAttribute('transform',`rotate(${pose.gap*.13} 105 -138)`);
  shadow.setAttribute('transform',`translate(${pose.piece[0]} ${pose.piece[1]+height*.43}) scale(${width/34})`);shadow.setAttribute('visibility',pose.landed?'visible':'hidden');
 }
 paint(0);
 return {paint,dispose(){overlay.remove();source.classList.remove('sample-in-transfer');}};
}
