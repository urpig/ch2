export function freshRustExperiment(){return {samples:[{water:false,oil:false},{water:false,oil:false}],observed:false,answer:null};}
export function prepareRustSample(state,index,tool){
 if(state.observed||![0,1].includes(index)||!['water','oil','clear'].includes(tool))return false;
 state.answer=null;
 if(tool==='clear')state.samples[index]={water:false,oil:false};
 else state.samples[index][tool]=true;
 return true;
}
export function rustExperimentIssue(state){
 if(!state.samples.every(sample=>sample.water))return '兩把劍都要加入水，讓它們處在相同的潮濕環境。';
 const oilCount=state.samples.filter(sample=>sample.oil).length;
 if(oilCount===0)return '選一把劍塗油，另一把保持不塗油，才能比較塗油的影響。';
 if(oilCount===2)return '兩把都塗油就無法比較。清空其中一組，再只加水。';
 return '';
}
export function rustExperimentResult(state){
 if(!state.observed)return '';
 const oil=state.samples[0].oil?'A':'B',control=oil==='A'?'B':'A';
 return `${oil} 組塗油後仍有金屬光澤；${control} 組未塗油，鏽斑較多。兩組的加水量、環境與觀察時間相同。`;
}
