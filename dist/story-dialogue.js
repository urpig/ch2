export function storySpeech(who,text,expression=who==='kui'?'curious':'gentle'){
 return `<div class="story-speech story-speech--${who}"><span class="story-portrait story-portrait--${who}" data-expression="${expression}" aria-hidden="true"></span><p><b>${({kui:'小葵',grandpa:'阿公',emperor:'皇上'})[who]}</b>${text}</p></div>`;
}
export function storyDialogue(question,reply){
 return `<div class="story-dialogue" aria-label="小葵與阿公的對話">${storySpeech('kui',question)}${storySpeech('grandpa',reply)}</div>`;
}
export function definitionDialogue(){return `<section class="prep-definitions inquiry-definitions" aria-label="從燃燒產物追蹤氧"><div class="story-dialogue dialogue-stack">${storySpeech('kui','「阿公，銀現在很貴耶，我們可以把氧化銀變回原來的銀金屬嗎？」')}${storySpeech('grandpa','「可以！像碳這樣活性比銀大的物質，就能把氧化銀的氧拿走。氧化銀失去氧、變回銀，這個變化就叫還原反應。」')}</div><div data-term-demo></div></section>`;}

const notes={
 1:['鐵礦石主要含氧化鐵 Fe₂O₃；含有鐵元素，但不是金屬鐵。','敲碎、磨細只改變大小；沒辦法讓鐵礦變成可以用的鐵。'],
 2:['金屬得到氧，形成氧化物；銅加熱變成黑色氧化銅，沒有明顯火焰也能被氧化。','鈉燃燒的產物遇水後呈鹼性，使紅色石蕊變藍。','CuO、ZnO 難溶於水；試紙不變色，不能直接判定氧化物是中性。'],
 3:['對氧活性由大到小為 C ＞ Zn ＞ Fe ＞ Sn ＞ Cu。','在這次高溫模擬中，碳、鋅能帶走氧化鐵的氧，留下金屬鐵。'],
 4:['Fe₂O₃ + 3CO → 2Fe + 3CO₂（合適高溫）。氧轉移了，原子種類與總數沒有改變。','氧化鐵失氧被還原，是氧化劑；CO 得氧被氧化，是還原劑。','CO 是化合物，不列在元素活性表中。它在合適條件下能再接受氧，形成 CO₂。'],
 5:['焦炭燃燒供熱，並參與生成 CO；CO 是高爐中還原氧化鐵的重要幫手。','石灰石受熱分解產生 CaO，與雜質SiO₂形成熔渣。','熔渣與鐵水分層排出，熔渣在上，生鐵在下'],
 6:['生鐵含碳較高，通常硬而脆；熟鐵含碳很低，較柔軟、容易變形。'],
 7:['鐵在水與氧氣共同存在時容易生鏽；酸會加速鐵的腐蝕。','保持乾燥，或以完整油膜、漆膜隔開水和氧氣，能減緩生鏽。'],
 8:['硫、紅磷和碳燃燒時得到氧，形成氧化物。','硫與碳燃燒的氣體產物，先加水並搖晃，再取液測試紙。','這些非金屬的燃燒產物與水作用後呈酸性，使藍色石蕊變紅。'],
 A:['燃燒快、明顯放熱。生鏽慢、看不到火焰。','氧化反應過程中，秤上物質的質量會改變。'],
 B:['活性是物質起化學反應的傾向。','活性大的物質，如鉀、鈉，遇到冷水就會反應；活性小的物質，例如金，則需要用王水才能溶解。'],
 stability:['鎂活性大，易反應，氧化物較安定。','銀活性小，不易反應，氧化物較不安定。','元素與其氧化物的安定程度相反。'],
 C:['2Ag₂O ＋ C → 4Ag ＋ CO₂：氧從氧化銀移到碳；碳被氧化，氧化銀被還原。','2Mg ＋ CO₂ → 2MgO ＋ C：氧從 CO₂ 移到鎂；鎂被氧化，CO₂ 被還原。','鎂 ＞ 碳 ＞ 銀。鎂能從 CO₂ 得到氧而繼續燃燒；碳難以照樣還原氧化鎂。','氧化劑使對方被氧化，自己被還原；還原劑使對方被還原，自己被氧化。'],
 Ccarbon:['2Ag₂O ＋ C → 4Ag ＋ CO₂：氧從氧化銀移到碳；碳被氧化，氧化銀被還原。','氧化與還原反應必定會一起發生。'],
 Cmagnesium:['鎂可以在二氧化碳當中燃燒，氧從 CO₂ 移到鎂；鎂被氧化，CO₂ 被還原。','鎂 ＞ 碳 ＞ 銀。鎂能從 CO₂ 得到氧而繼續燃燒；碳難以照樣還原氧化鎂。','氧化劑會讓別人氧化，自己被還原。','還原劑會讓別人還原，自己被氧化。'],
 D:['光合作用中，水被氧化，二氧化碳被還原。有氧呼吸中，葡萄糖被氧化，氧氣被還原。','過氧化氫、次氯酸鈉讓色素被氧化。二氧化硫能讓某些色素被還原。','維生素 C 會先被氧化，讓蘋果晚一點褐變。'],
 end:['氧化是生命活動的一部分；活性氧過多、超過身體防禦能力時，可能造成氧化壓力。','維生素 C、E 在發揮還原作用時，自己也會被氧化；抗氧化不是把所有氧拿走。','化學上的抗氧化作用，不等於已證實能延緩人體老化；白藜蘆醇等成分仍要看人體研究證據。']
};
function affinityMnemonic(){return `<section class="affinity-mnemonic" aria-label="活性表小口訣"><h4>活性表小口訣</h4><p class="affinity-mnemonic-verse"><span class="affinity-mnemonic-group"><span class="affinity-mnemonic-elements"><span>鉀</span><span>鈉</span><span>鈣</span><span>鎂</span><span>鋁</span></span><span class="affinity-mnemonic-words">賈娜蓋美旅<i>，</i></span></span><span class="affinity-mnemonic-group"><span class="affinity-mnemonic-elements"><span>碳</span><span>鋅</span><span>鉻</span><span>鐵</span></span><span class="affinity-mnemonic-words">探新個鐵<i>，</i></span></span><span class="affinity-mnemonic-group"><span class="affinity-mnemonic-elements"><span>錫</span><span>鉛</span><span>氫</span></span><span class="affinity-mnemonic-words">喜牽情<i>，</i></span></span><span class="affinity-mnemonic-group"><span class="affinity-mnemonic-elements"><span>銅</span><span>汞</span><span>銀</span><span>鉑</span><span>金</span></span><span class="affinity-mnemonic-words">童恭迎薄金<i>！</i></span></span></p><p class="affinity-mnemonic-story">賈娜要蓋一間美麗的旅館，所以探訪新的一個摩鐵，他喜歡幫人牽情緣，讓小花童恭迎薄金！</p></section>`;}
export const notebookTitle='小葵的研究紀錄';
export function notebookMarkup(key){return `<aside class="kui-notebook" aria-label="${notebookTitle}"><header><span class="story-portrait story-portrait--kui" data-expression="thinking" aria-hidden="true"></span><div><h3>${notebookTitle}</h3></div></header><ul>${notes[key].map(line=>`<li>${line}</li>`).join('')}</ul>${key==='B'?affinityMnemonic():''}</aside>`;}
