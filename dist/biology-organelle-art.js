import {moleculeDefinitions,moleculeFragment} from './bio-molecule-art.js';

const fieldSpecks=[
 [74,160,14],[165,88,22],[287,111,10],[418,66,16],[589,104,15],[755,86,32],
 [856,159,18],[921,318,33],[100,385,23],[69,441,11],[368,480,16],[602,487,9],[901,459,14]
];

export function organelleArt(key){
 const photo=key==='photo',prefix=key+'-particles';
 const asset=photo?'./assets/story/chloroplast-cutaway-v2.png':'./assets/story/mitochondrion-cutaway-v2.png';
 const molecule=(name,kind,x,y,scale)=>`<g data-bio-molecule="${name}" opacity="0" aria-hidden="true"><g transform="translate(${x} ${y}) scale(${scale})">${moleculeFragment(kind,prefix)}</g></g>`;
 return `<svg class="${photo?'photo-detailed-art':'resp-matched-art'}" viewBox="0 0 960 560" role="img" aria-label="${photo?'葉片內葉綠體的立體剖面放大示意':'細胞內粒線體的立體剖面放大示意'}">
 ${moleculeDefinitions(prefix)}
 <defs>
  <radialGradient id="${key}-field" cx="47%" cy="46%" r="72%">
   <stop stop-color="${photo?'#9caa6b':'#a39070'}"/><stop offset=".56" stop-color="${photo?'#4e6853':'#5e6f61'}"/>
   <stop offset="1" stop-color="#152e2e"/>
  </radialGradient>
  <radialGradient id="${key}-speck"><stop stop-color="#fff9ca" stop-opacity=".29"/><stop offset="1" stop-color="#f8eac8" stop-opacity="0"/></radialGradient>
  <radialGradient id="${key}-shadow"><stop stop-color="#071e1e" stop-opacity=".49"/><stop offset="1" stop-color="#071e1e" stop-opacity="0"/></radialGradient>
  <radialGradient id="${key}-observation-light" cx="${photo?'29%':'54%'}" cy="${photo?'25%':'42%'}">
   <stop stop-color="${photo?'#fff2ac':'#ffdeb2'}" stop-opacity=".5"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/>
  </radialGradient>
  ${photo?`<linearGradient id="photo-beam" x2=".85" y2="1">
   <stop stop-color="#fff1b1" stop-opacity=".58"/><stop offset="1" stop-color="#ffeaaa" stop-opacity="0"/>
  </linearGradient>`:''}
 </defs>
 <rect width="960" height="560" fill="url(#${key}-field)"/>
 <g aria-hidden="true">${fieldSpecks.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${key}-speck)"/>`).join('')}</g>
 <ellipse cx="479" cy="435" rx="402" ry="45" fill="url(#${key}-shadow)"/>
 <image data-bio-organelle class="bio-organelle" href="${asset}" x="63" y="98" width="834" height="335" preserveAspectRatio="xMidYMid meet"/>
 ${photo?`<g data-bio-beam opacity=".25" fill="url(#photo-beam)" aria-hidden="true">
  <path d="M24 0H92L528 362L342 339Z"/><path d="M112 0H143L634 310L503 302Z"/>
  <path d="M-12 26L28 0L359 290L194 316Z" opacity=".53"/>
 </g>`:''}
 <ellipse data-bio-light cx="478" cy="252" rx="410" ry="184" fill="url(#${key}-observation-light)" opacity="0" style="mix-blend-mode:screen"/>
 ${molecule('input-one',photo?'water':'glucose',100,422,.79)}
 ${molecule('input-two',photo?'co2':'oxygen',711,422,.79)}
 ${molecule('output-one',photo?'oxygen':'co2',100,422,.9)}
 ${molecule('output-two',photo?'glucose':'water',711,415,.9)}
 </svg>`;
}
