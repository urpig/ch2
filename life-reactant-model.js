// Each item is a supply of a substance, not one molecule or a measured dose.
const definitions={
 photo:{zone:'葉綠體',inputs:[['co2','二氧化碳 CO₂','來自空氣'],['water','水 H₂O','由根部吸收並運送']],condition:'陽光照射中 · 葉綠素參與',note:'水與二氧化碳經過多步反應形成產物；拖曳表示物質進入反應，不是葉片的實際運輸路徑。'},
 resp:{zone:'細胞反應區',inputs:[['glucose','葡萄糖 C₆H₁₂O₆','養分'],['oxygen','氧氣 O₂','參與有氧呼吸']],condition:'細胞內 · 有氧條件',note:'有氧呼吸在細胞內分多步進行，並非全部只在粒線體；這裡呈現總反應。'},
 peroxide:{zone:'豆干',inputs:[['peroxide','過氧化氫 H₂O₂','取用試劑，放到左側豆干']],condition:'相同豆干、相同觀察時間 · 比較有無過氧化氫',note:'豆干原有色素參與反應。僅用於辨認氧化還原，不是食品加工示範；不可自行處理或食用。'},
 chlorine:{zone:'衣服',inputs:[['chlorine','次氯酸鈉 NaClO','取用試劑，放到左側衣服']],condition:'相同色斑、相同觀察時間 · 比較有無次氯酸鈉',note:'色素原本就在衣服上；圖示只代表適用於含氯漂白的材質與色素。'},
 sulfur:{zone:'竹筷處理罩',inputs:[['sulfur','二氧化硫 SO₂','取用氣體，加入左側密閉罩']],condition:'密閉模擬 · 二氧化硫是無色氣體',note:'以適用色素的還原漂白為例，並非所有竹材成分都發生相同反應；不提供製備或實作方法。'},
 food:{zone:'蘋果切面反應區',inputs:[['intermediate','褐變中間產物','切面原有物質反應後產生'],['vitaminc','維生素 C','幫助延緩褐變']],condition:'相同蘋果、空氣與溫度',note:'褐變中間產物來自切面內的反應，並非保鮮時要加入的成分；圖卡將它抽出來，方便追蹤配對。'}
};
export function lifeLabDefinition(key){const d=definitions[key];if(!d)throw new Error('Unknown life reaction: '+key);return {...d,inputs:d.inputs.map(([id,label,hint])=>({id,label,hint}))};}
export function freshLifeMix(key,complete=false){const d=lifeLabDefinition(key);return {key,added:complete?d.inputs.map(x=>x.id):[],phase:complete?'complete':'ready'};}
export function addLifeReactant(state,id){
 const d=lifeLabDefinition(state.key);
 if(state.phase!=='ready'||!d.inputs.some(x=>x.id===id)||state.added.includes(id))return false;
 state.added.push(id);if(d.inputs.every(x=>state.added.includes(x.id)))state.phase='running';return true;
}
export function finishLifeMix(state){if(state.phase!=='running')return false;state.phase='complete';return true;}