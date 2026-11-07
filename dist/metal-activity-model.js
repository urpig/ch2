import {oxygenAffinitySeries} from './forge-prep-model.js';

export const activitySamples=oxygenAffinitySeries.filter(({symbol})=>symbol!=='H');

export const metalConditions=[
 {id:'cold',name:'冷水',label:'冷水'},
 {id:'hot',name:'熱水',label:'熱水'},
 {id:'dilute',name:'稀酸',label:'稀鹽酸'},
 {id:'concentrated',name:'濃酸',label:'室溫濃硝酸'},
 {id:'aqua',name:'王水',label:'王水'}
];

export const activityComparisons=[
 {id:'samples',title:'同樣是冷水，換兩種樣本',fixed:'保持冷水相同',changed:'改變樣本',
  prompt:'先讓鈉和鎂都遇到冷水。條件相同，才能比較這兩種樣本。',
  question:'同樣的冷水裡，哪一種樣本的氣泡比較明顯？',
  trials:[{symbol:'Na',condition:'cold'},{symbol:'Mg',condition:'cold'}]},
 {id:'temperature',title:'同樣是鎂，換冷水和熱水',fixed:'保持鎂樣本相同',changed:'改變水溫',
  prompt:'這次都用鎂，只把冷水換成熱水。看看水溫會不會影響反應。',
  question:'同樣是鎂，水溫改變後，氣泡有什麼不同？',
  trials:[{symbol:'Mg',condition:'cold'},{symbol:'Mg',condition:'hot'}]}
];

export function activityComparisonReady(records,id){
 const comparison=activityComparisons.find(item=>item.id===id);
 return !!comparison&&comparison.trials.every(trial=>records.some(record=>record.symbol===trial.symbol&&record.condition===trial.condition));
}

export function activityComparisonsComplete(s){
 return (s.activityRecords||[]).some(record=>activitySamples.some(sample=>sample.symbol===record.symbol)&&metalConditions.some(condition=>condition.id===record.condition));
}

export const activityQuiz={
 question:'在同樣的冷水裡，鈉很快冒氣泡，鎂的反應很不明顯。這組觀察能支持哪個說法？',
 options:['在這組條件下，鈉比鎂容易反應','鈉有氣泡，就代表一定看得到火焰','鎂對冷水反應不明顯，所以任何條件下都不會反應','兩種金屬顏色相近，所以活性一樣'],
 answer:0,
 reason:'用相同條件比較，鈉比鎂容易和冷水反應。換成熱水時，鎂也能慢慢放出氫氣。'
};

const still=['still','樣本外觀在這段時間內沒有明顯改變。'];
const passivated=['passivated','表面形成保護層，金屬沒有持續明顯溶解。這叫鈍化。'];
const acidGas=['gas','金屬表面冒出氫氣，樣本逐漸溶解，產物留在溶液中。'];
const nitric=['dissolve','硝酸氧化金屬，樣本逐漸溶解。'];
const nitricBrown=['brown','樣本逐漸溶解，可見棕色的二氧化氮。'];
const aquaDissolve=['dissolve','王水會氧化並溶解這種金屬，樣本逐漸變小。'];
const vigorousAcid=['violent','接觸含水強酸時可能劇烈放熱、產氣，使酸液噴濺。金屬逐漸被消耗，溶液中仍有反應產物。','acid-splash'];
const stableFilm=['protected','表面的氧化膜保護了金屬，短時間外觀變化很小。'];
const potassiumWater=['rapid','鉀在水面快速冒出氫氣，可能出現淡紫色火焰。鉀逐漸被消耗，水中留下氫氧化鉀。','water-reactive'];
const sodiumWater=['rapid','鈉在水面快速滑動、冒出氫氣，熔成小球後逐漸變小。水中留下氫氧化鈉。','water-reactive'];

// Observations use the representative conditions shown in the card.
const reactions={
 cold:{
  K:potassiumWater,Na:sodiumWater,
  Ca:['cloudy','鈣放出氫氣，生成的氫氧化鈣使水變白濁。'],
  Mg:['still','鎂在冷水中反應很慢，短時間幾乎看不到氣泡。'],
  Al:stableFilm,C:still,Zn:still,Cr:stableFilm,
  Fe:['still','短時間外觀變化不明顯。鐵鏽需要氧氣、水與較長時間形成。'],
  Sn:still,Pb:still,Cu:still,Hg:still,Ag:still,Pt:still,Au:still
 },
 hot:{
  K:potassiumWater,Na:sodiumWater,
  Ca:['cloudy','鈣放出氫氣，生成氫氧化鈣。'],
  Mg:['slow','鎂表面慢慢冒出氫氣，形成氫氧化鎂。'],
  Al:stableFilm,C:still,Zn:still,Cr:stableFilm,Fe:still,Sn:still,Pb:still,Cu:still,Hg:still,Ag:still,Pt:still,Au:still
 },
 dilute:{
  K:['rapid','鉀與稀鹽酸快速放熱、產生氫氣，酸液可能噴濺。','acid-splash'],
  Na:['rapid','鈉與稀鹽酸快速放熱、產生氫氣，酸液可能噴濺。','acid-splash'],
  Ca:['gas','鈣迅速放出氫氣，金屬逐漸變小，酸液可能噴濺。','acid-splash'],
  Mg:acidGas,
  Al:['slow','鋁的氧化膜受酸作用後，鋁可放出氫氣。'],
  C:still,Zn:acidGas,
  Cr:['slow','鉻的表面狀態影響起始速度，與鹽酸反應可放出氫氣。'],
  Fe:['slow','鐵緩慢放出氫氣，樣本逐漸溶解。'],
  Sn:['slow','錫與稀鹽酸反應較慢，可放出氫氣。'],
  Pb:['coating','鉛表面可形成難溶的氯化鉛，之後反應受阻。'],
  Cu:still,Hg:still,Ag:still,Pt:still,Au:still
 },
 concentrated:{
  K:vigorousAcid,Na:vigorousAcid,Ca:vigorousAcid,
  Mg:nitric,Al:passivated,
  C:['conditional','這裡使用塊狀石墨。濃硝酸對碳的作用會受形態與溫度影響。'],
  Zn:nitric,Cr:passivated,Fe:passivated,
  Sn:['coating','錫被氧化，生成白色、難溶的含水氧化錫。'],
  Pb:nitric,
  Cu:['blue','銅逐漸溶解，可見棕色二氧化氮。反應後的含銅溶液呈藍色。'],
  Hg:nitricBrown,Ag:nitricBrown,Pt:still,Au:still
 },
 aqua:{
  K:vigorousAcid,Na:vigorousAcid,Ca:vigorousAcid,
  Mg:aquaDissolve,Al:aquaDissolve,
  C:['conditional','石墨的變化取決於形態與處理條件，本卡保留塊狀外觀。'],
  Zn:aquaDissolve,Cr:aquaDissolve,Fe:aquaDissolve,
  Sn:['conditional','錫可受混酸作用，溶解程度和殘留物受試劑與條件影響。'],
  Pb:['conditional','鉛可受混酸作用，含氯的溶液也可能留下難溶的氯化鉛。'],
  Cu:['green','銅逐漸溶解。含銅溶液的顏色會受氯離子影響，這裡以藍綠色呈現。'],
  Hg:aquaDissolve,
  Ag:['coating','銀的表面可形成白色氯化銀，妨礙下方的銀繼續反應。'],
  Pt:['slow-dissolve','王水能溶解鉑，但較慢。溫度與樣本形態會影響變化。'],
  Au:['gold','金逐漸溶解，溶液因溶入金的化合物而呈黃色。']
 }
};

const labels={
 still:'短時間無明顯變化',protected:'表面受保護',passivated:'表面鈍化',conditional:'視條件而定',
 rapid:'快速反應',violent:'劇烈反應風險',
 cloudy:'放出氫氣 · 水變白濁',slow:'緩慢反應',gas:'放出氫氣',
 coating:'生成固體表層',
 dissolve:'逐漸溶解','slow-dissolve':'緩慢溶解',brown:'溶解 · 產生棕色氣體',blue:'溶解 · 溶液呈藍色',
 green:'溶解 · 溶液呈藍綠色',gold:'溶解 · 溶液呈黃色'
};

export function activityReaction(symbol,condition){
 if(!metalConditions.some(item=>item.id===condition)||!activitySamples.some(sample=>sample.symbol===symbol))return null;
 const [effect,observation,hazard=null]=reactions[condition][symbol];
 return {effect,observation,label:labels[effect],hazard};
}

export function restoreActivityRecords(raw,seen){
 const records=Array.isArray(raw.activityRecords)?raw.activityRecords:[raw.activityTrials?.[1],raw.activityTrials?.[0]];
 const restored=[];
 for(const record of records){
  if(!record||!seen.includes(record.condition)||!activityReaction(record.symbol,record.condition))continue;
  if(restored.some(item=>item.symbol===record.symbol&&item.condition===record.condition))continue;
  restored.push({symbol:record.symbol,condition:record.condition});
 }
 return restored;
}
