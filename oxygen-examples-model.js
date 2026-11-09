export const oxygenExamples={
 carbon:{title:'碳和氧化銀一起加熱，氧會到哪裡？',tab:'碳 ＋ 氧化銀',equation:'2Ag₂O ＋ C → 4Ag ＋ CO₂',donor:'氧化銀',receiver:'碳',oxidized:'碳',reduced:'氧化銀',source:'2Ag₂O',destination:'CO₂',before:'深色氧化銀＋黑色碳粉',after:'灰色、帶金屬光澤的銀',conclusion:'碳得到氧，變成二氧化碳；氧化銀失去氧，留下銀。',activity:'碳的對氧活性比銀大。這個總反應呈現氧由氧化銀轉移到碳；氧化銀單獨受熱也能分解。',atoms:{Ag:4,C:1,O:2}},
 magnesium:{title:'鎂放進二氧化碳，還能繼續燃燒嗎？',tab:'鎂 ＋ 二氧化碳',equation:'2Mg ＋ CO₂ → 2MgO ＋ C',donor:'二氧化碳',receiver:'鎂',oxidized:'鎂',reduced:'二氧化碳',source:'CO₂',destination:'2MgO',before:'銀白色鎂帶＋無色 CO₂',after:'白色氧化鎂與黑色碳',conclusion:'鎂從二氧化碳取得氧，所以放進 CO₂ 仍會繼續燃燒；CO₂ 失去氧，留下碳。',activity:'鎂的對氧活性比碳大。碳難以用同樣的奪氧方式，把氧化鎂變回鎂。',atoms:{Mg:2,C:1,O:2}}
};
const clamp=x=>Math.max(0,Math.min(1,x));
export function oxygenExampleFrame(value,reduced=false){
 const t=clamp(Number(value)||0),preparation=clamp(t/.3),heat=clamp((t-.3)/.16),travel=clamp((t-.46)/.3);
 const move=reduced?(travel===1?1:0):travel*travel*(3-2*travel);
 return {time:t,preparation,heat,travel:move,glow:t<.36?0:t<.76?Math.sin(clamp((t-.36)/.4)*Math.PI):0,stage:t<.05?'before':t<.3?'prepare':t<.46?'heat':t<.76?'react':t<1?'cool':'complete',complete:t===1};
}
// One clock controls the photographic apparatus, light, residue and oxygen trail.
// The lit ribbon crosses above the rim before it is lowered into the gas jar.
export function magnesiumExperimentFrame(value){
 const t=clamp(Number(value)||0),ease=p=>{p=clamp(p);return p*p*(3-2*p);},part=(a,b)=>ease((t-a)/(b-a));
 // Keep the jaw centered over the opening during vertical entry and withdrawal.
 // The same physical tongs keep one size while moving from the bench to the jar.
 let jawX=64,jawY=90,angle=5;const scale=.55;
 if(t<.10){const p=part(.02,.075);jawX=64+13*p;jawY=90-6*p;}
 else if(t<.18){const p=part(.10,.18);jawX=77-57*p;jawY=84-59*p;angle=5-79*p;}
 else if(t<.30){jawX=20;jawY=25;angle=-74;}
 else if(t<.35){jawX=20;jawY=25-25*part(.30,.35);angle=-74;}
 else if(t<.40){jawX=20+30*part(.35,.40);jawY=0;angle=-74;}
 else if(t<.79){jawX=50;jawY=44*part(.40,.46);angle=-74;}
 else if(t<.845){jawX=50;jawY=44*(1-part(.79,.845));angle=-74;}
 else if(t<.88){jawX=50+18*part(.845,.88);jawY=0;angle=-74;}
 else {const p=part(.88,1);jawX=68-4*p;jawY=90*p;angle=-74+79*p;}
 const holding=part(.075,.10),ribbonLength=20*scale;
 // The same ribbon stays under the jaws: close first, then lift and turn together.
 const ribbonX=t<.10?77:jawX,ribbonY=t<.10?84:jawY,ribbonAngle=78*(1-part(.10,.18));
 const x=jawX,y=jawY;

 const conversion=part(.46,.76),outside=t>=.18&&t<.46,inside=t>=.46&&t<.79;
 const ignition=part(.18,.23),extinction=1-part(.75,.80),flicker=.9+.07*Math.sin(t*721)+.03*Math.sin(t*1277);
 const glow=(outside||inside?ignition*extinction*flicker:0),settled=part(.60,.94);
 return {time:t,x,y,jawX,jawY,angle,scale,holding,ribbonX,ribbonY,ribbonAngle,tipX:jawX,tipY:jawY+ribbonLength,glow,conversion,metal:1-conversion,ash:conversion*(1-part(.76,.86)),settled,
  smoke:part(.46,.56)*(1-part(.79,.95)),inside,stage:t<.02?'before':t<.18?'pickup':t<.30?'ignite':t<.46?'transfer':t<.79?'burn':t<1?'settle':'complete',
  caption:t<.02?'坩堝鉗與鎂帶放在桌面旁；集氣瓶內是無色二氧化碳。':t<.18?'拿起坩堝鉗，夾住桌上的鎂帶。':t<.30?'先在瓶外點燃鎂帶，鎂開始發出白光。':t<.46?'把點燃的鎂帶從瓶口移入二氧化碳。':t<.79?'鎂在二氧化碳中仍持續燃燒，發出耀眼白光。':'瓶底留下白色氧化鎂和黑色碳。'};
}
export function freshOxygenExamples(){return {version:2,selected:'carbon',observed:[],answers:{},practiceAnswers:{}};}
export function restoreOxygenExamples(raw){
 const s=freshOxygenExamples();if(raw?.version!==2)return s;
 if(oxygenExamples[raw.selected])s.selected=raw.selected;
 s.observed=[...new Set((Array.isArray(raw.observed)?raw.observed:[]).filter(k=>Object.hasOwn(oxygenExamples,k)))];
 for(const key of s.observed)if([0,1].includes(raw.answers?.[key]))s.answers[key]=raw.answers[key];
 for(const key of Object.keys(oxygenExamples))if(Number.isInteger(raw.practiceAnswers?.[key])&&raw.practiceAnswers[key]>=0&&raw.practiceAnswers[key]<4)s.practiceAnswers[key]=raw.practiceAnswers[key];
 return s;
}
export const oxygenExampleReady=(s,key)=>Object.hasOwn(oxygenExamples,key)&&s.observed.includes(key)&&(key==='carbon'||s.answers[key]===0);
export const oxygenExamplesReady=s=>Object.keys(oxygenExamples).every(key=>oxygenExampleReady(s,key));
export const carbonOxygenQuiz={question:'2Ag₂O ＋ C → 4Ag ＋ CO₂ 中，氧從哪裡移到哪裡？',options:['從氧化銀移到碳；氧化銀被還原，碳被氧化','從碳移到銀；碳被還原，銀被氧化','氧沒有轉移，只是所有物質變熱','氧離開氧化銀後消失，沒有形成新物質'],answer:0,reason:'氧由反應前的 Ag₂O 轉到產物 CO₂。氧化銀失去氧被還原；碳得到氧被氧化。'};
export const oxygenExampleQuiz={question:'鎂為什麼能在二氧化碳中繼續燃燒？',options:['鎂能從 CO₂ 取得氧；鎂被氧化，CO₂ 被還原','CO₂ 只是一般空氣，裡面一定有大量氧氣','氧化鎂把氧給碳，所以鎂一直生成','鎂沒有被氧化，只是溫度高而發光'],answer:0,reason:'鎂的對氧活性比碳大。2Mg ＋ CO₂ → 2MgO ＋ C，氧從 CO₂ 移到鎂；鎂被氧化，CO₂ 被還原。'};
export function oxygenLedger(key,progress){
 const e=oxygenExamples[key],f=oxygenExampleFrame(progress);
 return {source:2*(1-f.travel),destination:2*f.travel,total:2,atoms:{...e.atoms}};
}
