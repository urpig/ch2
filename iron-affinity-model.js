export const ironCandidates={
 C:{name:'碳',canReduce:true,oxide:'二氧化碳 CO₂',equation:'2Fe₂O₃ + 3C → 4Fe + 3CO₂',colour:'#303d38'},
 Zn:{name:'鋅',canReduce:true,oxide:'氧化鋅 ZnO',equation:'Fe₂O₃ + 3Zn → 2Fe + 3ZnO',colour:'#9baeb0'},
 Sn:{name:'錫',canReduce:false,colour:'#bec7c1'},
 Cu:{name:'銅',canReduce:false,colour:'#b87347'}
};
export function freshIronTrials(){return {selected:'C',predictions:{},results:{},phase:'ready'};}
export function chooseIronTrial(s,id){if(!ironCandidates[id])return false;s.selected=id;s.phase=s.results[id]?'done':'ready';return true;}
export function predictIronTrial(s,value,id=s.selected){if(!ironCandidates[id]||s.phase==='running'||s.results[id]||typeof value!=='boolean')return false;s.predictions[id]=value;return true;}
export function beginIronTrial(s){if(s.phase!=='ready')return false;s.phase='running';return true;}
export function finishIronTrial(s){if(s.phase!=='running')return false;s.results[s.selected]=true;s.phase='done';return true;}
export function restoreIronTrials(raw,observed=[]){const s=freshIronTrials();if(ironCandidates[raw?.selected])s.selected=raw.selected;for(const id of Object.keys(ironCandidates)){if(typeof raw?.predictions?.[id]==='boolean')s.predictions[id]=raw.predictions[id];if(observed.includes(id))s.results[id]=true;}s.phase=s.results[s.selected]?'done':'ready';return s;}
