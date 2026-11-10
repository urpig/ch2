import {gasSyringe} from './gas-syringe-art.js';
import {gasChamberPort} from './life-laboratory-scene.js';

const reagents={
 peroxide:{agent:'過氧化氫',formula:'H₂O₂',impactY:234},
 chlorine:{agent:'次氯酸鈉',formula:'NaClO',impactY:276},
 vitaminc:{agent:'維生素 C 溶液',formula:'維生素 C',impactY:253},
 sulfur:{agent:'二氧化硫',formula:'SO₂'}
};
const contactSeconds=1.05;
const transferSeconds=1.9;
const segment=(value,start,end)=>Math.max(0,Math.min(1,(value-start)/(end-start)));
const smooth=t=>t*t*(3-2*t);
const mix=(a,b,t)=>a+(b-a)*t;

function beakerArt(key,suffix){
 const id='lab-beaker-'+key+'-'+suffix;
 return `<svg class="${suffix==='supply'?'bleach-supply ':''}bleach-beaker" width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
 <defs>
  <linearGradient id="${id}-water" x2="0" y2="1"><stop stop-color="#dae9e8" stop-opacity=".18"/><stop offset="1" stop-color="#a9c8d2" stop-opacity=".48"/></linearGradient>
  <clipPath id="${id}-inside"><path d="M26 23H99L97 101Q93 112 65 113Q34 111 29 101Z"/></clipPath>
 </defs>
 ${suffix==='supply'?'<ellipse cx="64" cy="114" rx="36" ry="4" fill="#12282c44"/>':''}
 <g clip-path="url(#${id}-inside)"><g class="beaker-fill" data-transfer-liquid>
  <path d="M-88 60H200V185H-88Z" fill="url(#${id}-water)"/>
  <ellipse cx="63" cy="60" rx="36" ry="4.1" fill="#edf8f6" fill-opacity=".36" stroke="#f0ffff" stroke-opacity=".65" stroke-width=".7"/>
 </g></g>
 <image class="lab-photographic-glass" href="./assets/story/life-beaker-v2.png" x="4" y="8" width="111" height="107" preserveAspectRatio="none"/>
 <rect x="30" y="79" width="34" height="17" rx="2" fill="#f5f3e7" fill-opacity=".94"/>
 <text x="47" y="90.6" text-anchor="middle" fill="#314b50" font-size="8.6" font-weight="600">${reagents[key].formula}</text>
 </svg>`;
}

export function laboratoryReagent(key){
 const {agent,formula}=reagents[key];
 return (key==='sulfur'?gasSyringe('supply'):beakerArt(key,'supply'))+
  `<strong>${key==='vitaminc'?agent:agent+' '+formula}</strong>`;
}

export function laboratoryTransfer(key){
 const gas=key==='sulfur';
 return `<svg class="lab-reagent-transfer" viewBox="0 0 760 460" preserveAspectRatio="none" aria-hidden="true">
 ${gas?'':`<g data-transfer-flow opacity="0">
  <path data-transfer-stream fill="none" stroke="#b5dce8" stroke-opacity=".6" stroke-width="4.2" stroke-linecap="round"/>
  <path data-transfer-glint fill="none" stroke="#f4ffff" stroke-opacity=".9" stroke-width="1.25" stroke-linecap="round"/>
  <ellipse data-transfer-impact cx="314" cy="${reagents[key].impactY}" fill="none" stroke="#e7faff" stroke-width="1.1"/>
  ${Array.from({length:7},(_,i)=>`<ellipse data-transfer-drop rx="${1+i%3*.36}" ry="${2.4+i%2*.8}" fill="#ebfaff" opacity="0"/>`).join('')}
 </g>`}
 <g data-transfer-tool opacity="0">${gas?gasSyringe('transfer',0):beakerArt(key,'transfer')}</g>
 </svg>`;
}

// A single clock drives the vessel, liquid surface, stream, and contact effect.
export function bindLaboratoryTransfer(scene,key,seconds){
 const stage=scene.querySelector('.life-reactor-art');
 const layer=stage.querySelector('.lab-reagent-transfer');
 const tool=layer.querySelector('[data-transfer-tool]');
 const caption=stage.querySelector('[data-lab-phase]');
 const gas=key==='sulfur',liquid=layer.querySelector('[data-transfer-liquid]');
 const flow=layer.querySelector('[data-transfer-flow]');
 const stream=flow?.querySelector('[data-transfer-stream]');
 const glint=flow?.querySelector('[data-transfer-glint]');
 const impact=flow?.querySelector('[data-transfer-impact]');
 const drops=[...layer.querySelectorAll('[data-transfer-drop]')];
 const impactY=reagents[key].impactY;
 return progress=>{
  const elapsed=progress*seconds,t=Math.min(1,elapsed/transferSeconds);
  const approach=smooth(segment(t,0,.33));
  const retreat=smooth(segment(t,.75,1));
  const travel=approach*(1-retreat);
  const active=t>0&&t<1;
  const used=smooth(segment(t,.44,.74));
  const label=progress===0?'反應前':progress===1?'觀察後':elapsed<transferSeconds?(gas?'注入氣體':'加入試劑'):'縮時觀察';
  if(caption.textContent!==label)caption.textContent=label;
  stage.toggleAttribute('data-transferring',active);
  stage.style.setProperty('--reagent-used',String(used));
  tool.setAttribute('opacity',active?'1':'0');

  if(gas){
   // The horizontal nozzle stops at the side port of the sealed chamber.
   tool.setAttribute('transform',`translate(${mix(10,gasChamberPort.x-168*.86,travel)} ${mix(204,gasChamberPort.y-65*.86,travel)}) scale(.86)`);
   layer.style.setProperty('--transfer-plunger',String(used));
   return;
  }

  const tilt=smooth(segment(t,.25,.46))*(1-smooth(segment(t,.69,.86)));
  const x=mix(36,307,travel),y=mix(247,impactY-81,travel)-Math.sin(travel*Math.PI)*16;
  tool.setAttribute('transform',`translate(${x} ${y}) rotate(${-67*tilt}) scale(.9) translate(-18 -18)`);
  const level=mix(60+27*used,18,tilt);
  liquid.setAttribute('transform',`rotate(${67*tilt} 18 18) translate(0 ${level-60})`);

  const pouring=smooth(segment(t,.44,.51))*(1-smooth(segment(t,.68,.77)));
  flow.setAttribute('opacity',String(pouring));
  if(!pouring)return;
  const reach=smooth(segment(elapsed,contactSeconds-.22,contactSeconds));
  const endX=mix(x+3,314,reach),endY=mix(y+9,impactY,reach);
  const ribbon=`M${x} ${y} Q${x+11} ${y+(endY-y)*.42} ${endX} ${endY}`;
  stream.setAttribute('d',ribbon);
  glint.setAttribute('d',ribbon);
  const spreading=segment(t,.54,.78);
  impact.setAttribute('rx',String(2+spreading*13));
  impact.setAttribute('ry',String(1+spreading*3));
  impact.setAttribute('opacity',String(reach*(1-spreading)*.8));
  drops.forEach((drop,i)=>{
   const u=segment(t,.51+i*.013,.77+i*.009),direction=i%2===0?1:-1;
   drop.setAttribute('cx',String(314+direction*u*(8+i*2.9)));
   drop.setAttribute('cy',String(impactY-Math.sin(Math.PI*u)*(4+i*1.45)+u*5));
   drop.setAttribute('opacity',String(Math.sin(Math.PI*u)*reach*.82));
  });
 };
}
