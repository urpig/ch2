// Representative heated, oxygen-excluded comparisons; not a temperature/kinetics simulator.
export const affinityElements=[
 {id:'Mg',name:'鎂',rank:3,oxide:'MgO',metal:1,oxygen:1,form:'solid'},
 {id:'C',name:'碳',rank:5,oxide:'CO2',metal:1,oxygen:2,form:'solid'},
 {id:'Zn',name:'鋅',rank:6,oxide:'ZnO',metal:1,oxygen:1,form:'solid'},
 {id:'Fe',name:'鐵',rank:8,oxide:'FeO',metal:1,oxygen:1,form:'solid'},
 {id:'Cu',name:'銅',rank:12,oxide:'CuO',metal:1,oxygen:1,form:'solid',control:true}
];
export const affinityOxides=[
 {id:'MgO',element:'Mg',name:'氧化鎂',metal:1,oxygen:1,powder:'white'},
 {id:'ZnO',element:'Zn',name:'氧化鋅',metal:1,oxygen:1,powder:'white'},
 {id:'Fe2O3',element:'Fe',name:'氧化鐵',metal:2,oxygen:3,powder:'red'},
 {id:'CuO',element:'Cu',name:'氧化銅',metal:1,oxygen:1,powder:'black'}
];
const gcd=(a,b)=>b?gcd(b,a%b):a;
export const chemicalLabel=formula=>formula.replace(/[0-9]/g,d=>'₀₁₂₃₄₅₆₇₈₉'[+d]);
export const pairId=(element,oxide)=>element+'|'+oxide;
export function affinityReaction(element,oxide){
 const e=affinityElements.find(x=>x.id===element),o=affinityOxides.find(x=>x.id===oxide);
 if(!e||!o)return null;
 const base=affinityElements.find(x=>x.id===o.element),id=pairId(element,oxide);
 // Same-element mixtures can involve other oxide states, so they cannot be labelled "no redox".
 if(e.id===o.element)return {id,element,oxide,kind:'same',reacts:null,title:'同一種元素，無法比較活性',reason:'換成不同元素的氧化物，再比較誰能拿走氧。'};
 // Only the selected classroom comparisons are modelled here; the full
 // reference series is not a general oxide-reduction calculator.
 const relation=e.rank<base.rank?e.id+' ＞ '+base.id:base.id+' ＞ '+e.id;
 if(e.rank>base.rank)return {id,element,oxide,kind:'unchanged',reacts:false,title:'未取回金屬'+base.name,reason:e.name+'與'+o.name+'加熱後，未取回金屬'+base.name+'。',relation};
 const carbonMonoxide=element==='C'&&oxide==='ZnO',product=carbonMonoxide?'CO':e.oxide,oxygen=carbonMonoxide?1:e.oxygen;
 const count=oxygen*o.oxygen/gcd(oxygen,o.oxygen);
 const recipient=count/oxygen,donor=count/o.oxygen;
 const lhs=[{formula:e.formula||e.id,n:recipient*e.metal},{formula:o.id,n:donor}];
 const rhs=[{formula:product,n:recipient},{formula:base.id,n:donor*o.metal}];
 const equation=[lhs,rhs].map(side=>side.map(x=>(x.n===1?'':x.n)+chemicalLabel(x.formula)).join(' + ')).join(' → ');
 return {id,element,oxide,kind:'reacted',reacts:true,title:'發生氧化還原反應',reason:e.name+'得到氧；'+o.name+'失去氧，留下'+base.name+'。',relation,product,metal:base.id,lhs,rhs,equation,gas:element==='C'?product:null,powder:product==='FeO'?'black':element==='C'?null:'white'};
}
export const ironComparisonOxide='Fe2O3';
export const ironComparisonElements=['Zn','Cu'];
export function ironComparisonEvidence(lab) {
 return ironComparisonElements.map(element=>lab?.records?.includes(pairId(element,ironComparisonOxide))?affinityReaction(element,ironComparisonOxide):null);
}
export function freshAffinityLab(){return {version:1,element:null,oxide:null,phase:'ready',records:[],comparison:false};}
export function restoreAffinityLab(raw){
 const s=freshAffinityLab();if(raw?.version!==1)return s;
 s.element=affinityElements.some(x=>x.id===raw.element)?raw.element:null;
 s.oxide=affinityOxides.some(x=>x.id===raw.oxide)?raw.oxide:null;
 s.records=[...new Set(Array.isArray(raw.records)?raw.records:[])].filter(id=>{if(typeof id!=='string')return false;const parts=id.split('|');if(parts.length!==2)return false;const [a,b]=parts;return affinityReaction(a,b)?.kind!=='same'&&!!affinityReaction(a,b);});
 s.comparison=raw.comparison===true && s.oxide===ironComparisonOxide;
 if(raw.phase==='done'&&s.records.includes(pairId(s.element,s.oxide)))s.phase='done';
 return s;
}
export function loadAffinitySample(s,type,id){
 if(!['ready','done'].includes(s.phase) || s.comparison && type==='oxide' && id!==ironComparisonOxide)return false;
 const list=type==='element'?affinityElements:type==='oxide'?affinityOxides:[];
 if(!list.some(x=>x.id===id))return false;s.phase='ready';s[type]=id;return true;
}
export function canHeatAffinity(s){return s.phase==='ready'&&!!s.element&&!!s.oxide&&affinityReaction(s.element,s.oxide)?.kind!=='same';}
export function beginAffinityHeat(s){if(!canHeatAffinity(s))return false;s.phase='heating';return true;}
export function finishAffinityHeat(s){if(s.phase!=='heating')return false;const r=affinityReaction(s.element,s.oxide);if(!r||r.kind==='same')return false;s.phase='done';if(!s.records.includes(r.id))s.records.push(r.id);return true;}
export function affinityLabReady(s){if(ironComparisonEvidence(s).every(Boolean))return true;const results=(s?.records||[]).map(id=>affinityReaction(...id.split('|'))).filter(Boolean);return results.length>=3&&results.some(r=>r.reacts)&&results.some(r=>r.reacts===false);}
