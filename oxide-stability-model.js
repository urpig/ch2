// Qualitative observations under ordinary school-laboratory heating conditions.
// New IDs prevent the retired oxygen-transfer exercise from completing this lesson.
export const stabilityTrials=[
 {id:'heat-mg',kind:'formation',label:'鎂 Mg',pair:'活性大的元素',element:'Mg',oxide:'MgO',reacts:true,materials:['magnesium','white'],
  equation:'2Mg ＋ O₂ → 2MgO',title:'加熱鎂，會發生什麼變化？',
  before:'銀白色、有金屬光澤的鎂帶。',during:'鎂燃燒，發出明亮白光，逐漸形成白色固體。',after:'冷卻後留下白色氧化鎂。',
  oxygenBefore:'鎂與氧氣還沒有結合。',oxygenDuring:'氧正在和鎂結合。',oxygenAfter:'鎂得到氧，形成氧化鎂。',
  explanation:'鎂的活性大，較不安定，點燃後會和氧結合，形成白色氧化鎂。再加熱氧化鎂，會變回鎂嗎？'},
 {id:'heat-mgo',kind:'unchanged-oxide',label:'氧化鎂 MgO',pair:'鎂形成的氧化物',element:'Mg',oxide:'MgO',reacts:false,materials:['white','white'],
  equation:'MgO：不反應',title:'加熱氧化鎂，能變回鎂嗎？',
  before:'白色的氧化鎂粉末。',during:'粉末持續受熱，沒有變回銀白色的鎂。',after:'冷卻後仍是白色氧化鎂。',
  oxygenBefore:'氧已經和鎂結合。',oxygenDuring:'加熱中，氧仍和鎂結合。',oxygenAfter:'氧沒有離開，仍是氧化鎂。',
  explanation:'鎂的活性大，較不安定；但形成的氧化鎂很安定！在這次加熱條件下，它不會失去氧、變回鎂。'},
 {id:'heat-ag',kind:'unchanged-metal',label:'銀 Ag',pair:'活性小的元素',element:'Ag',oxide:'Ag₂O',reacts:false,materials:['silver-piece','silver-piece'],
  equation:'Ag：不反應',title:'換成銀，加熱也會燃燒嗎？',
  before:'銀白色、帶金屬光澤的銀。',during:'銀持續受熱，沒有像鎂一樣燃燒。',after:'冷卻後仍是帶金屬光澤的銀。',
  oxygenBefore:'銀與氧氣沒有結合。',oxygenDuring:'加熱中，沒有出現同樣的燃燒反應。',oxygenAfter:'銀沒有像鎂一樣和氧反應。',
  explanation:'銀的活性小，較安定，一般加熱不會像鎂那樣燃燒。那它的氧化物，也一樣安定嗎？'},
 {id:'heat-ag2o',kind:'decomposition',label:'氧化銀 Ag₂O',pair:'銀形成的氧化物',element:'Ag',oxide:'Ag₂O',reacts:true,materials:['black','silver'],
  equation:'2Ag₂O → 4Ag ＋ O₂',title:'加熱深色氧化銀，會留下什麼？',
  before:'深褐色到黑色的氧化銀粉末。',during:'深色粉末逐漸轉灰，氧化銀釋出無色氧氣。',after:'冷卻後留下灰色、帶金屬光澤的銀。',
  oxygenBefore:'氧原本和銀結合。',oxygenDuring:'氧離開氧化銀，形成氧氣。',oxygenAfter:'氧化銀失去氧，留下銀與氧氣。',
  explanation:'銀的活性小，較安定；氧化銀卻相對較不安定，受熱較容易失去氧，變成灰色、帶金屬光澤的銀，同時釋出氧氣。'}
];
export const stabilityPairs=[
 {id:'elements',trials:['heat-mg','heat-ag'],title:'同時加熱鎂與銀：哪一種會燃燒？',label:'同時加熱鎂與銀'},
 {id:'oxides',trials:['heat-mgo','heat-ag2o'],title:'同時加熱兩種氧化物：哪一種會失去氧？',label:'同時加熱氧化鎂與氧化銀'}
];
export function recordStabilityPair(state,pairId){
 const pair=stabilityPairs.find(p=>p.id===pairId);if(!pair)return;
 for(const id of pair.trials)if(!state.observed.includes(id))state.observed.push(id);
}
export function recordStabilityComparison(state){
 for(const pair of stabilityPairs)recordStabilityPair(state,pair.id);
}
export function freshStability(){return {selected:stabilityTrials[0].id,observed:[],answer:null};}
export function restoreStability(raw){
 const s=freshStability();
 if(raw&&typeof raw==='object'){
  if(stabilityTrials.some(t=>t.id===raw.selected))s.selected=raw.selected;
  if(Array.isArray(raw.observed))s.observed=stabilityTrials.filter(t=>raw.observed.includes(t.id)).map(t=>t.id);
  if(Number.isInteger(raw.answer)&&raw.answer>=0&&raw.answer<4&&stabilityReady(s))s.answer=raw.answer;
 }
 return s;
}
export function stabilityReady(s){return stabilityTrials.every(t=>s.observed.includes(t.id));}
export function stabilityFrame(id,value){
 const p=Math.max(0,Math.min(1,Number(value)||0)),trial=stabilityTrials.find(t=>t.id===id);
 const unit=(from,to)=>Math.max(0,Math.min(1,(p-from)/(to-from)));
 const change=trial?.reacts?unit(.32,.72):0,oxygen=change*change*(3-2*change);
 return {progress:p,change,oxygen,heat:unit(.08,.23)*(1-unit(.76,.9)),
  glow:trial?.kind==='formation'?Math.sin(change*Math.PI):0,
  complete:p===1,
  stage:p===0?'加熱前':p<.32?'加熱中':p<.76?(trial?.kind==='formation'?'燃燒中':trial?.kind==='decomposition'?'釋出氧氣':'持續加熱'):p<1?'冷卻觀察':'冷卻後'};
}
export const stabilityQuiz={
 question:'比較鎂、氧化鎂、銀與氧化銀的加熱結果，哪個說法正確？',
 options:[
  '鎂容易燃燒，所以氧化鎂加熱後也容易變回鎂',
  '鎂會燃燒而氧化鎂不易受熱分解；銀不燃燒，氧化銀卻能受熱釋出氧氣',
  '銀加熱不燃燒，所以氧化銀受熱也一定不變',
  '所有氧化物只要加熱，就會變回金屬'],
 answer:1,
 reason:'鎂與銀的活性不同；它們形成的氧化物也有不同特性。本次加熱中，氧化鎂仍是白色粉末，氧化銀則分解成銀和氧氣。',
 hint:'分別回看兩種氧化物：哪一種加熱後釋出氧氣、留下金屬？'
};
