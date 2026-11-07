export function storySpeech(who,text,expression=who==='kui'?'curious':'gentle'){
 return `<div class="story-speech story-speech--${who}"><span class="story-portrait story-portrait--${who}" data-expression="${expression}" aria-hidden="true"></span><p><b>${({kui:'小葵',grandpa:'阿公',emperor:'皇上'})[who]}</b>${text}</p></div>`;
}
export function storyDialogue(question,reply){
 return `<div class="story-dialogue" aria-label="小葵與阿公的對話">${storySpeech('kui',question)}${storySpeech('grandpa',reply)}</div>`;
}
export function definitionDialogue(){return `<section class="prep-definitions inquiry-definitions" aria-label="從燃燒產物追蹤氧"><div class="story-dialogue dialogue-stack">${storySpeech('kui','「剛才銅片變黑了。阿公，能把它變回原來的銅嗎？」')}${storySpeech('grandpa','「可以！像鋅這樣活性比銅大的金屬，就能把氧化銅的氧拿走。氧化銅失去氧、變回銅，這個變化就叫還原反應。」')}</div><div data-term-demo></div></section>`;}

const notes={
 1:['赤鐵礦主要含氧化鐵 Fe₂O₃；含有鐵元素，但不是金屬鐵。','敲碎、磨細只改變大小；沒辦法讓鐵礦變成可以用的鐵。'],
 2:['燃燒是劇烈的氧化；銅加熱形成黑色氧化銅，沒有明顯火焰也能被氧化。','火焰顏色、產物外觀和反應式要一起看；變色不一定代表生成新物質。','氧化物遇水不一定都反應。石蕊用來比較酸鹼性：酸使藍色石蕊變紅，鹼使紅色石蕊變藍。'],
 3:['對氧活性由大到小為 C ＞ Zn ＞ Fe ＞ Sn ＞ Cu。','在這次高溫模擬中，碳、鋅能帶走氧化鐵的氧，留下金屬鐵。'],
 4:['Fe₂O₃ + 3CO → 2Fe + 3CO₂（合適高溫）。氧轉移了，原子種類與總數沒有改變。','氧化鐵失氧被還原，是氧化劑；CO 得氧被氧化，是還原劑。','CO 是化合物，不列在元素活性表中。它在合適條件下能再接受氧，形成 CO₂。'],
 5:['焦炭燃燒供熱，並參與生成 CO；CO 是高爐中還原氧化鐵的重要幫手。','石灰石受熱分解產生 CaO，與酸性雜質形成熔渣；除雜與還原的工作不同。','熔渣與鐵水分層排出；生鐵含碳量較高，還要進一步處理與選材。'],
 6:['生鐵含碳較高，通常硬而脆；熟鐵含碳很低，較柔軟、容易變形。','合適鋼材與熱處理能兼顧硬度與韌性；不是含碳越多越適合做刀。','比較材料要控制刀形與施力條件；彎折試驗觀察變形、斷裂，不能直接當作硬度測量。'],
 A:['燃燒快、明顯放熱。生鏽慢、看不到火焰。','兩者都有物質與氧結合，都是氧化。'],
 B:['活性是物質起化學反應的傾向。用相同條件比較，鈉比鎂容易和冷水反應。','換溫度或試劑，結果也會變。鎂與熱水的反應較明顯，銅可與濃硝酸反應，金可用王水溶解。','對氧活性是元素與氧結合的傾向。接著比較不同材料加熱遇到氧時的變化。'],
 C:['得到氧叫氧化，失去氧叫還原，氧化反應必定伴隨著還原反應。','氧化劑使對方被氧化，自己被還原。','還原劑使對方被還原，自己被氧化。'],
 D:['光合作用中，水被氧化，二氧化碳被還原。有氧呼吸中，葡萄糖被氧化，氧氣被還原。','過氧化氫、次氯酸鈉讓色素被氧化。二氧化硫能讓某些色素被還原。','維生素 C 會先被氧化，讓蘋果晚一點褐變。'],
 end:['氧化是生命活動的一部分；活性氧過多、超過身體防禦能力時，可能造成氧化壓力。','維生素 C、E 在發揮還原作用時，自己也會被氧化；抗氧化不是把所有氧拿走。','化學上的抗氧化作用，不等於已證實能延緩人體老化；白藜蘆醇等成分仍要看人體研究證據。']
};
function affinityMnemonic(){return `<section class="affinity-mnemonic" aria-label="活性表小口訣"><h4>活性表小口訣</h4><p class="affinity-mnemonic-verse">賈娜蓋美旅，探新個鐵，喜牽情，童恭迎薄金！</p><p class="affinity-mnemonic-story">賈娜要蓋一間美麗的旅館，所以探訪新的一個摩鐵，他喜歡幫人牽情緣，讓小花童恭迎薄金！</p><p class="affinity-mnemonic-order"><span>本課對氧活性比較 · 由大到小</span>鉀、鈉、鈣、鎂、鋁、碳、鋅、鉻、鐵、錫、鉛、氫、銅、汞、銀、鉑、金</p></section>`;}
export const notebookTitle='小葵的研究紀錄';
export function notebookMarkup(key){return `<aside class="kui-notebook" aria-label="${notebookTitle}"><header><span class="story-portrait story-portrait--kui" data-expression="thinking" aria-hidden="true"></span><div><h3>${notebookTitle}</h3></div></header><ul>${notes[key].map(line=>`<li>${line}</li>`).join('')}</ul>${key==='B'?affinityMnemonic():''}</aside>`;}
