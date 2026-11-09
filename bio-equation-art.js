import {lifeBiology} from './everyday-redox-model.js';

// Connect each reactant to its corresponding product in the overall equation.
// These arrows identify redox roles, rather than paths taken by individual atoms.
export function biologyEquationArt(key,complete=false){
 const photo=key==='photo',data=lifeBiology[key];
 const x=[120,350,650,880];
 const terms=photo?['6CO₂','6H₂O','C₆H₁₂O₆','6O₂']:['C₆H₁₂O₆','6O₂','6CO₂','6H₂O'];
 const paths=data.paths.map((path,i)=>({...path,start:x[i],end:x[i+2],labelX:i===0?(x[1]+x[2])/2:(x[1]+x[3])/2,y:i===0?112:183,labelY:i===0?146:219}));
 return `<svg class="bio-equation-art" viewBox="0 0 1000 210" role="img" aria-label="${photo?'光合作用':'有氧呼吸'}的總反應式與氧化還原箭頭">
 <title>${data.equation}${photo?'':' ＋ 能量'}</title>
 <g class="bio-equation-formula" text-anchor="middle">${terms.map((term,i)=>`<text x="${x[i]}" y="117" data-equation-species="${i}">${term}</text>`).join('')}
 <text x="${(x[0]+x[1])/2}" y="117">＋</text><text x="${(x[1]+x[2])/2}" y="117">→</text><text x="${(x[2]+x[3])/2}" y="117">＋</text></g>
 <g data-bio-equation-paths  aria-label="氧化還原的物質去向">${paths.map(({from,to,role,start,end,labelX})=>{const above=role==='reduction',edge=above?75:132,bend=above?30:165,tip=above?-11:11;return `<g class="bio-equation-arrow is-${role}" data-equation-from="${from}" data-equation-to="${to}" role="group" aria-label="${from} ${role==='oxidation'?'被氧化成':'被還原成'} ${to}">
 <path class="bio-equation-line" d="M ${start} ${edge} V ${bend} H ${end} V ${edge}"/><path class="bio-equation-tip" d="M ${end-7} ${edge+tip} L ${end} ${edge+(above?1:-1)} L ${end+7} ${edge+tip}"/>
 <text x="${labelX}" y="${above?20:200}" text-anchor="middle">${role==='oxidation'?'氧化反應':'還原反應'}</text></g>`;}).join('')}</g></svg>
 <div class="life-equation-mobile" aria-label="兩種物質的變化">${paths.map((p,i)=>`<div class="life-equation-change is-${p.role}"><b>${p.role==='oxidation'?'氧化反應':'還原反應'}</b><div><span><strong>${terms[i]}</strong></span><i aria-hidden="true">→</i><span><strong>${terms[i+2]}</strong></span></div></div>`).join('')}</div>`;
}
