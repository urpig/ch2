// Teaching playback times, not real laboratory reaction times.
export const combustionDemoOrder=['Na','S'];
export const combustionDemoSamples=group=>group==='metals'?['Na']:group==='nonmetals'?['S']:combustionDemoOrder;
const common={prep:'準備樣本',load:'放上燃燒匙',heat:'加熱點燃',burn:'觀察燃燒',cool:'移開、冷卻',pour:'產物加水',dissolve:'觀察遇水',red:'測紅色石蕊',blue:'測藍色石蕊',result:'比較結果',wash:'加入蒸餾水',shake:'左右搖晃',take:'取瓶內液',retake:'再取一次液體'};
// Both demonstrations share four teaching windows: sampling 6 s,
// heating/burning/cooling 13 s, water 8 s, and litmus/results 15 s.
// Sulfur's extra transfers and pipette pickups fit inside the same windows.
const tracks={
 Na:[['prep',2500],['load',3500],['heat',3000],['burn',6500],['cool',3500],['pour',4000],['dissolve',4000],['red',5500],['blue',5500],['result',4000]],
 S:[['prep',2500],['load',3500],['heat',3000],['transfer',3000],['burn',3500],['cool',3500],['wash',4000],['shake',4000],['take',3000],['red',2500],['retake',3000],['blue',2500],['result',4000]]
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
export function combustionDemoReady(seen=[],group){return combustionDemoSamples(group).every(key=>seen.includes(key));}
export function restoreCombustionDemo(raw={},group){
 const samples=combustionDemoSamples(group),seen=[];
 for(const key of samples){if(!Array.isArray(raw.combustionDemoSeen)||!raw.combustionDemoSeen.includes(key))break;seen.push(key);}
 const sample=samples.includes(raw.combustionDemoSample)&&(samples.length===1||raw.combustionDemoSample==='Na'||seen.includes('Na'))?raw.combustionDemoSample:samples[0];
 return {combustionDemoSeen:seen,combustionMode:raw.combustionMode==='practice'&&combustionDemoReady(seen,group)?'practice':'demo',combustionDemoSample:sample};
}
