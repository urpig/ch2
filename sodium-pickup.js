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
 const grooves=Array.from({length:15},(_,i)=>{const x=58+i*2.7,y=-89-i*3.05;return '<path d="M'+x+' '+y+'l5.2 4.6"/>';}).join('');
 return `<defs><linearGradient id="sodium-forceps-steel" x1="0" y1="0" x2="1" y2=".35"><stop stop-color="#38474c"/><stop offset=".17" stop-color="#c6d0d2"/><stop offset=".35" stop-color="#f0f3f2"/><stop offset=".48" stop-color="#78888d"/><stop offset=".68" stop-color="#dbe1e2"/><stop offset="1" stop-color="#647479"/></linearGradient></defs>
 <g data-pickup-forceps><path d="M99 -137Q105 -146 111 -137L110 -129L102 -130Z" fill="url(#sodium-forceps-steel)" stroke="#58696e" stroke-width=".5"/>
 <g data-pickup-rear-jaw><path d="M-12 -3L-13 -13L57 -104Q82 -131 102 -141L107 -136Q84 -117 67 -94L-7 -10L-7 -3Z" fill="url(#sodium-forceps-steel)" stroke="#526267" stroke-width=".6"/><path d="M-10 -12L63 -103L102 -138" stroke="#f0f5f5" stroke-opacity=".8" stroke-width=".8" fill="none"/><g stroke="#526065" stroke-width=".65" opacity=".72">${grooves}</g></g>
 <g data-pickup-front-jaw><path d="M10 -3L10 -12L76 -111Q93 -135 104 -141L111 -136Q96 -117 86 -98L17 -9L16 -2Z" fill="url(#sodium-forceps-steel)" stroke="#53656b" stroke-width=".6"/><path d="M15 -10L82 -109L108 -137" stroke="#fbffff" stroke-opacity=".85" stroke-width=".8" fill="none"/><path d="M10 -5L17 -4M11 -7L19 -6M13 -9L20 -8" stroke="#34494f" stroke-width=".65"/><g transform="translate(14 1)" stroke="#526065" stroke-width=".65" opacity=".65">${grooves}</g></g></g>`;
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
