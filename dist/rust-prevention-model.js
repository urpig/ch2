export const rustComparisons={
 basic:{label:'上油與加水',cases:['normal','oil','wet']}
};
export const rustEnvironments={
 normal:{name:'一般環境 · 對照組',condition:'接觸空氣中的水氣',result:'表面出現分散的鏽斑',explain:'空氣中的水氣與氧氣，讓鐵逐漸生鏽。'},
 oil:{name:'塗油 · 實驗組',condition:'完整油膜，外界同樣潮濕',result:'油膜下仍保有金屬光澤',explain:'油膜隔開水和氧氣，減緩生鏽。'},
 wet:{name:'加水 · 實驗組',condition:'水留在表面，也接觸空氣',result:'大片鏽斑擴散，表面變粗糙',explain:'水與氧氣同時接觸鐵，讓生鏽更明顯。'}
};
const clamp=x=>Math.max(0,Math.min(1,x));
export function rustPreventionFrame(key,progress){
 const t=clamp(Number(progress)||0),reaction=Math.pow(clamp((t-.12)/.88),.78);
 const speed={normal:.48,oil:0,wet:1};
 return {progress:t,preparation:clamp(t/.12),corrosion:reaction*(speed[key]??0),water:key==='wet'?1:0,barrier:key==='oil'?'oil':null,complete:t===1};
}
