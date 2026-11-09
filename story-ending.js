import {chapterKicker} from './chapter-heading.js';
import {storySpeech} from './story-dialogue.js';

export const nextUnitUrl='https://urpig.github.io/ch3.1/?v=2ed4c60#homecoming';

export function mountStoryEnding(lesson){
 const section=document.createElement('section');
 section.id='story-ending';
 section.className='exploration-card story-ending';
 section.tabIndex=-1;
 section.setAttribute('aria-labelledby','story-ending-title');
 section.innerHTML=`<header class="chapter-header">${chapterKicker('10')}<h2 id="story-ending-title">皇帝眉頭深鎖的原因</h2></header>
 <div class="chapter-body"><figure class="story-ending-scene"><img src="./assets/story/sword-offering.png" width="1672" height="941" alt="小葵和阿公在宮殿中一同獻上寶劍，皇帝伸手接劍，時空裝置放在一旁的桌上。" loading="lazy"></figure>
 <p class="story-ending-intro">小葵與阿公獻上親手打造的寶劍。皇帝滿意地點頭，依約將時空裝置還給他們。</p>
 <p class="story-ending-intro">正要道別時，小葵卻看見皇帝望著桌上的奏報，眉頭緊鎖。</p>
 <div class="story-dialogue dialogue-stack" aria-label="獻劍後，皇帝與小葵、阿公的對話">
 ${storySpeech('kui','「陛下，寶劍已經完成了，您怎麼還是悶悶不樂？」','curious')}
 ${storySpeech('emperor','「近來連日大雨，鹽場受淹，曬鹽也停了，產鹽量大幅減少。百姓缺鹽，苦不堪言；新送來的白色結晶，品質又參差不齊……」')}
 ${storySpeech('kui','「阿公，我們再留下來幫一次忙，好不好？」','thinking')}
 ${storySpeech('grandpa','「好！裝置已經拿回來了，這次是我們自己決定留下。先去鹽場看看，用證據找出問題。」','gentle')}
 </div>
 <div class="story-ending-invitation"><span>下一個單元 · 電解質與酸鹼鹽</span><h3>從一把寶劍，走向一場製鹽調查。</h3><p>看起來都是透明的水，裡面藏著的物質也一樣嗎？</p><a class="next-unit-link" href="${nextUnitUrl}">接下皇帝的製鹽委託 <span aria-hidden="true">→</span></a></div>
 </div>
 <footer class="chapter-footer"><a class="previous" href="#card-7">← 回看防鏽的比較</a><a class="next" href="#chapter-practice">前往小試身手 <b>→</b></a></footer>`;
 lesson.append(section);
 return section;
}
