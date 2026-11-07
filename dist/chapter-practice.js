export function createPracticeArea() {
 const section=document.createElement('section');
 section.id='chapter-practice';
 section.dataset.card=section.id;
 section.className='exploration-card chapter-practice';
 section.tabIndex=-1;
 section.setAttribute('aria-labelledby','chapter-practice-title');
 section.innerHTML=`<header class="chapter-header"><div class="chapter-kicker"><span>全章練習</span></div><h2 id="chapter-practice-title">小試身手</h2><p class="core-question">用各單元的觀察，回答下面的問題。</p></header>
 <div class="chapter-body practice-list"></div>
 <footer class="chapter-footer"><a class="previous" href="#chapter-top">回到故事起點 ↑</a></footer>`;
 const list=section.querySelector('.practice-list');

 function addQuestion({id,label,source,quiz,context='',links='',onAnswer}) {
  const card=document.createElement('section');
  card.className='prep-quiz practice-question';
  card.id=id;
  card.tabIndex=-1;
  card.setAttribute('aria-labelledby',id+'-title');
  card.innerHTML=`<header><h3 id="${id}-title">${label}</h3><a href="${source}">回看操作 ↗</a></header>
   <p class="practice-locked" hidden>完成原卡的操作後，就能作答。</p>
   <div data-question>${context}<h4>${quiz.question}</h4><div class="prep-answers">${quiz.options.map((option,i)=>`<button type="button" aria-pressed="false" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span><span>${option}</span></button>`).join('')}</div>
   <p class="prep-feedback" role="status"></p><button type="button" class="text-button" data-show-explanation hidden>看解釋</button>${links?`<div data-practice-links hidden>${links}</div>`:''}</div>`;
  list.append(card);
  const body=card.querySelector('[data-question]'), locked=card.querySelector('.practice-locked'), feedback=card.querySelector('.prep-feedback');
  const followup=card.querySelector('[data-practice-links]');
  const buttons=[...card.querySelectorAll('[data-answer]')];
  const explain=card.querySelector('[data-show-explanation]');
  explain.onclick=()=>{
   feedback.textContent=`正確答案是 ${String.fromCharCode(65+quiz.answer)}「${quiz.options[quiz.answer]}」。${quiz.explanations?.[quiz.answer]?.replace(/^對。/,'')??quiz.reason}`;
   explain.hidden=true;
  };
  buttons.forEach((button,i)=>button.addEventListener('click',()=>onAnswer(i)));
  return (answer,ready=true,remaining='')=>{
   body.hidden=!ready;
   locked.hidden=ready;
   locked.textContent=remaining||'先完成原卡的觀察，再回來用證據作答。';
   const correct=answer===quiz.answer;
   buttons.forEach((button,i)=>{
    const selected=answer===i;
    button.setAttribute('aria-pressed',String(selected));
    button.classList.toggle('correct',selected&&correct);
    button.classList.toggle('wrong',selected&&!correct);
   });
   const explanation=quiz.explanations?.[answer]?.replace(/^對。/,'')??quiz.reason;
   const hints={
    'practice-card-1':'回想敲碎後的礦石。大小和成分，哪一個改變了？',
    'practice-prep-a':'火焰和反應速度不同。再看兩組物質有沒有與氧結合。',
    'practice-prep-b':'先找出這組比較中保持相同的條件，再看鈉和鎂的氣泡。',
    'practice-card-2':'銅片加熱前後的成分是什麼？光看火焰夠不夠？',
    'practice-prep-c':'沿著同一顆氧，看它離開哪一方、到達哪一方。',
    'practice-prep-d':'回看維生素 C 的觀察。它能延緩褐變多久？它自己也會改變嗎？',
    'practice-card-3':'把四份實驗結果並排，找出真正取得鐵的材料。',
    'practice-card-5':'點開高爐的「形成熔渣」，看看石灰石的產物把什麼帶走。',
    'practice-card-6':'三把刀鬆手後，有裂開、回彈和留下彎曲。哪個說法同時符合三份證據？'
   };
   const text=answer===null?'':correct?'✓ 答對了。'+explanation:
    (quiz.hint||hints[id]||'回看這一張卡的觀察，找出支持選項的證據，再試一次。');
   if(feedback.textContent!==text) feedback.textContent=text;
   explain.hidden=!ready||answer===null||correct;
   if(followup) followup.hidden=!correct;
  };
 }
 function orderQuestions(ids) {
  for(const id of ids)list.append(list.querySelector('#'+id));
 }
 return {section,addQuestion,orderQuestions};
}
