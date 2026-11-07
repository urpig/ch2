import {freshAffinityLab,restoreAffinityLab,affinityLabReady} from './affinity-free-model.js';
import {activityQuiz,metalConditions,restoreActivityRecords,activityComparisonsComplete} from './metal-activity-model.js';
export const observationCases=[
 {id:'burn',title:'木炭燃燒',kind:'fast',time:'短時間內',before:'木炭 C ＋ 氧氣 O₂',after:'二氧化碳 CO₂',mass:{start:30,end:24}},
 {id:'rust',title:'鐵釘生鏽',kind:'slow',time:'長時間快轉',before:'鐵釘 Fe',after:'鐵鏽（含鐵的氧化物）',mass:{start:10,end:10.3},observation:'鐵鏽留在鐵釘上，秤也量到結合的氧。'}
];
export const oxidationQuiz={
 question:'木炭燃燒和鐵釘生鏽的快慢不同。哪個線索能說明兩者都是氧化？',
 options:['兩者都會立刻出現火焰','兩者都有物質與氧結合','兩者都會產生二氧化碳','兩者都只改變形狀'],
 answer:1,
 reason:'木炭中的碳很快與氧結合，鐵在潮濕空氣中也會慢慢與氧結合。'
};
export const comparisonCases=[
 {id:'carbon-iron',element:'C',name:'碳',base:'Fe',baseName:'鐵',relation:'greater',equation:'2Fe₂O₃ + 3C → 4Fe + 3CO₂',before:'碳 ＋ 氧化鐵',after:'得到金屬鐵，並形成 CO₂',evidence:'本課高溫反應資料：氧從氧化鐵移到碳。',link:['C','Fe']},
 {id:'copper-iron',element:'Cu',name:'銅',base:'Fe',baseName:'鐵',relation:'less',equation:'Cu ＋ Fe₂O₃：未取得金屬鐵',before:'銅 ＋ 氧化鐵',after:'沒有將氧化鐵還原成鐵',evidence:'配合本課已知活性資料：銅比鐵不容易與氧結合。',link:['Fe','Cu']},
 {id:'magnesium-carbon',element:'Mg',name:'鎂',base:'C',baseName:'碳',relation:'greater',equation:'2Mg + CO₂ → 2MgO + C',before:'鎂 ＋ 二氧化碳',after:'形成氧化鎂，留下碳',evidence:'點燃鎂的代表反應資料：氧從 CO₂ 移到鎂。',link:['Mg','C']}
];
export const transferCases=[
 {id:'magnesium',label:'鎂＋二氧化碳',donor:'二氧化碳',donorFormula:'CO₂',remaining:'碳 C',receiver:'鎂',receiverFormula:'2Mg',product:'氧化鎂 2MgO',count:2,atom:'Mg',kind:'magnesium',equation:'2Mg + CO₂ → 2MgO + C'},
 {id:'carbon-copper',label:'碳＋氧化銅',donor:'氧化銅',donorFormula:'2CuO',remaining:'銅 2Cu',receiver:'碳',receiverFormula:'C',product:'二氧化碳 CO₂',count:2,atom:'C',kind:'carbon',equation:'2CuO + C → 2Cu + CO₂'},
 {id:'hydrogen-copper',label:'氫氣＋氧化銅',donor:'氧化銅',donorFormula:'CuO',remaining:'銅 Cu',receiver:'氫氣',receiverFormula:'H₂',product:'水 H₂O',count:1,atom:'H₂',kind:'hydrogen',equation:'CuO + H₂ → Cu + H₂O'}
];
export function freshInquiry(){return {version:1,affinityLab:freshAffinityLab(),selected:'burn',looked:[],oxidationAnswer:null,activityCondition:'cold',activitySeen:[],activityRecords:[],activityAnswer:null,comparison:0,predictions:{},compared:[],order:[],rankChecked:false,example:'carbon-copper',transfers:{},transferTargets:{},transferRoles:[],answers:[null,null,null],life:'biology'};}
const unique=(value,ids)=>[...new Set(Array.isArray(value)?value:[])].filter(x=>ids.includes(x));
export function restoreInquiry(raw){const s=freshInquiry();if(!raw||raw.version!==1)return s;
 s.affinityLab=restoreAffinityLab(raw.affinityLab);s.selected=observationCases.some(x=>x.id===raw.selected)?raw.selected:'burn';s.looked=unique(raw.looked,observationCases.map(x=>x.id));
 if(inquiryReady(s,0)&&Number.isInteger(raw.oxidationAnswer)&&raw.oxidationAnswer>=0&&raw.oxidationAnswer<oxidationQuiz.options.length)s.oxidationAnswer=raw.oxidationAnswer;
 const conditionIds=metalConditions.map(item=>item.id);
 s.activityCondition=conditionIds.includes(raw.activityCondition)?raw.activityCondition:s.activityCondition;
 s.activitySeen=unique(raw.activitySeen,conditionIds);
 s.activityRecords=restoreActivityRecords(raw,s.activitySeen);
 if(activityComparisonsComplete(s)&&Number.isInteger(raw.activityAnswer)&&raw.activityAnswer>=0&&raw.activityAnswer<activityQuiz.options.length)s.activityAnswer=raw.activityAnswer;
 s.comparison=[0,1,2].includes(raw.comparison)?raw.comparison:0;s.compared=unique(raw.compared,comparisonCases.map(x=>x.id));for(const c of comparisonCases)if(['greater','less'].includes(raw.predictions?.[c.id]))s.predictions[c.id]=raw.predictions[c.id];
 s.order=unique(raw.order,['Mg','C','Fe','Cu']);s.rankChecked=!!raw.rankChecked&&s.order.join(',')==='Mg,C,Fe,Cu'&&s.compared.length===3;s.example=transferCases.some(x=>x.id===raw.example)?raw.example:s.example;
 for(const e of transferCases){const ids=Array.from({length:e.count},(_,i)=>i);s.transfers[e.id]=unique(raw.transfers?.[e.id],ids);const targets=unique(raw.transferTargets?.[e.id],ids);s.transferTargets[e.id]=targets.length===s.transfers[e.id].length?targets:[...s.transfers[e.id]];}s.transferRoles=unique(raw.transferRoles,transferCases.filter(e=>s.transfers[e.id].length===e.count).map(e=>e.id));
 s.answers=[0,1,2].map(i=>Number.isInteger(raw.answers?.[i])&&raw.answers[i]>=0&&raw.answers[i]<4?raw.answers[i]:null);if(!affinityLabReady(s.affinityLab))s.answers[1]=null;s.life=['biology','bleach','food'].includes(raw.life)?raw.life:'biology';return s;
}
export function inquiryReady(s,i){return i===0?observationCases.every(item=>s.looked.includes(item.id)):i===1?affinityLabReady(s.affinityLab):i===2?s.transferRoles.length>0:false;}
export function transferOxygen(s,id,source,target){const e=transferCases.find(x=>x.id===id);if(!e||![source,target].every(x=>Number.isInteger(x)&&x>=0&&x<e.count))return false;const moved=s.transfers[id]||(s.transfers[id]=[]),targets=(s.transferTargets||(s.transferTargets={}))[id]||(s.transferTargets[id]=[]);if(moved.includes(source)||targets.includes(target))return false;moved.push(source);targets.push(target);return true;}
