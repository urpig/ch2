export const biologyStages={
 photo:[{id:'water',label:'水 H₂O',name:'水'},{id:'co2',label:'二氧化碳 CO₂',name:'二氧化碳'}],
 resp:[{id:'glucose',label:'葡萄糖 C₆H₁₂O₆',name:'葡萄糖'},{id:'oxygen',label:'氧氣 O₂',name:'氧氣'}]
};
export function freshBiology(key,complete=false){if(!biologyStages[key])throw Error('Unknown biology scene');return {key,added:complete?biologyStages[key].map(x=>x.id):[],step:complete?2:0,phase:complete?'complete':'ready'};}
export function addBiologyReactant(s,id){if(s.phase!=='ready'||s.added.includes(id)||!biologyStages[s.key].some(x=>x.id===id))return false;s.added.push(id);s.step=s.added.length;return true;}
export function beginBiology(s){if(s.phase!=='ready'||s.added.length!==2)return false;s.phase='running';return true;}
export function finishBiologyStage(s){if(s.phase!=='running')return false;s.phase='complete';return true;}
