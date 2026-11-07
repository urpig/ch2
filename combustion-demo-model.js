// Teaching playback times, not real laboratory reaction times.
export const combustionDemoOrder=['Na','S'];
const common={prep:'準備樣本',load:'放上燃燒匙',heat:'加熱點燃',burn:'觀察燃燒',cool:'移開、冷卻',pour:'產物加水',dissolve:'觀察遇水',red:'測紅色石蕊',blue:'測藍色石蕊',result:'比較結果',wash:'加入蒸餾水',shake:'左右搖晃',take:'取瓶內液',retake:'再取一次液體'};
const tracks={
 Na:[['prep',800],['load',1200],['heat',1200],['burn',2400],['cool',1600],['pour',1600],['dissolve',1300],['red',1800],['blue',1800],['result',1800]],
 S:[['prep',800],['load',1200],['heat',1200],['transfer',1300],['burn',3000],['cool',1800],['wash',1700],['shake',1500],['take',1300],['red',1500],['retake',1200],['blue',1500],['result',1800]]
};
const captions={
 Na:{prep:'先看鈉的樣子：銀白色的小塊。',load:'從樣本架取鈉，放上燃燒匙。',heat:'把匙端靠近酒精燈的火焰。',burn:'看鈉本身的黃色火焰。',cool:'移開熱源，等產物冷卻。',pour:'把冷卻後的產物加入清水。',dissolve:'產物與水作用；接著測試溶液。',red:'紅色石蕊的浸水端變藍了。',blue:'藍色石蕊的浸水端仍是藍色。',result:'紅變藍、藍不變：溶液呈鹼性。'},
 S:{prep:'換成黃色的硫粉，使用同一套觀察順序。',load:'把硫放上燃燒匙。',heat:'靠近火焰，把硫點燃。',transfer:'燃燒匙由瓶口放進集氣瓶。',burn:'硫燃燒有藍色火焰；二氧化硫氣體留在瓶內。',cool:'取出燃燒匙，等器材冷卻。',wash:'加入蒸餾水，讓二氧化硫溶進水裡。',shake:'蓋好玻璃片，左右搖晃，讓水接觸氣體。',take:'用滴管取瓶內液體。',red:'滴在紅色石蕊上，顏色不變。',retake:'回到瓶內，再取一次液體。',blue:'滴在藍色石蕊上，滴液處變紅了。',result:'藍變紅、紅不變：溶液呈酸性。'}
};
export function combustionDemoDuration(key){return tracks[key].reduce((n,[,ms])=>n+ms,0);}
export function combustionDemoFrame(key,time=0){
 const duration=combustionDemoDuration(key),elapsed=Math.max(0,Math.min(duration,Number.isFinite(time)?time:0));
 let start=0,index=0;
 for(;index<tracks[key].length-1;index++){if(elapsed<start+tracks[key][index][1])break;start+=tracks[key][index][1];}
 const [phase,ms]=tracks[key][index],progress=Math.min(1,(elapsed-start)/ms);
 const before=name=>tracks[key].findIndex(([id])=>id===name)>index;
 const burned=!before('cool'),tested=phase==='result';
 return {key,elapsed,duration,index,phase,progress,label:phase==='transfer'?'放進集氣瓶':common[phase],caption:captions[key][phase],done:elapsed===duration,
  burning:phase==='burn'||key==='S'&&phase==='transfer',burned,water:!before(key==='Na'?'dissolve':'shake'),
  redTested:!before(key==='Na'?'blue':'retake'),blueTested:tested,
  evidence:[...(burned?[key+':burn']:[]),...(tested?[key+(key==='Na'?':wet':':ph')]:[])]};
}
export function combustionDemoReady(seen=[]){return combustionDemoOrder.every(key=>seen.includes(key));}
export function restoreCombustionDemo(raw={}){
 const seen=[];for(const key of combustionDemoOrder){if(!Array.isArray(raw.combustionDemoSeen)||!raw.combustionDemoSeen.includes(key))break;seen.push(key);}
 return {combustionDemoSeen:seen,combustionMode:raw.combustionMode==='practice'&&combustionDemoReady(seen)?'practice':'demo',combustionDemoSample:raw.combustionDemoSample==='S'&&seen.includes('Na')?'S':'Na'};
}
