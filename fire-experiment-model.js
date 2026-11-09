// Each trial starts with the same burning oil pan. Time is qualitative, not seconds in a real fire.
export const fireMethods={
 water:{label:'加水',result:'水一加入，油滴被帶到空中，火焰向上竄、向外擴散。'},
 lid:{label:'蓋鍋蓋、關閉熱源',result:'鍋蓋隔開空氣，熱源關閉，鍋內的火焰逐漸熄滅。'}
};
export function freshFireExperiment(){return {method:null,observed:[],answer:null};}
export function startFireTrial(state,method){if(!fireMethods[method])return false;state.method=method;state.answer=null;return true;}
export function finishFireTrial(state){if(!fireMethods[state.method])return false;if(!state.observed.includes(state.method))state.observed.push(state.method);return true;}
export function fireExperimentReady(state){return Object.keys(fireMethods).every(method=>state.observed.includes(method));}
const clamp=x=>Math.max(0,Math.min(1,x));
export function fireExperimentFrame(method,progress=0){
 const p=clamp(progress),water=method==='water',lid=method==='lid';
 const contact=clamp((p-.18)/.17),covered=lid?clamp((p-.25)/.18):0;
 return {p,method,tool:clamp(p/.2),water:water&&p>.18&&p<.42?Math.sin((p-.18)/.24*Math.PI):0,
  splash:water?Math.sin(clamp((p-.28)/.48)*Math.PI):0,covered,heatOff:lid&&p>.42,
  flame:water?1+Math.sin(contact*Math.PI/2)*1.2:lid?1-clamp((p-.4)/.4):1,
  complete:p>=1,caption:p>=1?fireMethods[method]?.result||'':p<.18?'每次都從相同的油鍋起火狀態開始。':water?'留意水碰到熱油後，油滴與火焰往哪裡去。':p<.45?'鍋蓋蓋住鍋口，同時關閉熱源。':'保持覆蓋，觀察火焰的變化。'};
}
export const fireExperimentQuiz={
 question:'根據兩次觀察，為什麼油鍋起火不能直接澆水？',
 options:['水遇到熱油迅速汽化，會把熱油帶出鍋外，讓火勢擴大','水一碰到火就變成氧氣，提供燃燒','水能立刻降低所有油的溫度，所以一定安全','只要水夠冷，就能避免熱油噴濺'],answer:0,
 hint:'回想加水那次：火焰是縮回鍋內，還是隨噴出的油滴擴散？再試一次。',
 reason:'水遇到高溫熱油會迅速汽化膨脹，把熱油帶到空中，造成噴濺與火勢擴大。蓋住鍋口、關閉熱源能阻隔氧氣並停止供熱；保持覆蓋、等待冷卻。遇到真實火災應先遠離危險，通知大人並撥打 119。'
};
