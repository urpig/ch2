// Clickable textbook-style cutaway. Products follow the current recipe, not click order.
export function furnaceAnimationSteps({result:r,recipe:p,air}){
 const hot=!!air&&p.coke>0;
 return [
  {name:'原料入爐',zone:'charge',enabled:p.ore+p.coke+p.lime>0,formula:[p.ore?'Fe₂O₃':null,p.coke?'C':null,p.lime?'CaCO₃':null].filter(Boolean).join(' ＋ ')||'尚未投入原料',label:'投入的原料（這一步沒有化學反應）',products:[],text:'鐵礦石、焦炭、石灰石從爐頂加入，逐漸向下移動。點選爐身的標籤，看看原料接下來變成什麼。'},
  {name:'焦炭燃燒',zone:'burn',enabled:hot,formula:'C + O₂ → CO₂',products:['CO₂','熱'],text:hot?'熱空氣帶入氧氣，焦炭燃燒，生成 CO₂ 並放出熱。熱讓高爐中的反應能持續進行。':!air?'沒有鼓入熱空氣，缺少燃燒所需的氧氣。開啟「鼓入熱空氣」後再試。':'沒有焦炭，缺少燃料。加入焦炭後再試。'},
  {name:'生成還原氣體',zone:'gas',enabled:hot,formula:'CO₂ + C → 2CO',products:['CO'],text:hot?'高溫下，CO₂ 與焦炭反應，生成向上流動的 CO。CO 接著會帶走氧化鐵中的氧。':'缺少焦炭或熱空氣，無法提供這個模型所需的高溫與碳源。'},
  {name:'還原鐵礦',zone:'reduce',enabled:r.reduced>0,formula:'Fe₂O₃ + 3CO → 2Fe + 3CO₂',products:['Fe','CO₂'],text:r.reduced>0?'Fe₂O₃ 失去氧，生成鐵；CO 得到氧，形成 CO₂。鐵繼續下降，在更熱的下部熔化成鐵水。'+(r.unreduced?'這份配方仍有部分礦石未還原。':''):'這一爐沒有還原出鐵。需要鐵礦石、焦炭與熱空氣，請檢查配方。'},
  {name:'石灰石分解',zone:'lime',enabled:hot&&p.lime>0,formula:'CaCO₃ → CaO + CO₂',products:['CaO','CO₂'],condition:'加熱',text:hot&&p.lime>0?'石灰石受熱分解，留下 CaO，同時放出 CO₂。CaO 接著會與礦石中的雜質反應。':!p.lime?'這一爐沒有石灰石，因此不會產生用來除雜質的 CaO。加入石灰石後再試。':'沒有足夠的加熱條件，石灰石尚未在本模型中分解。'},
  {name:'形成爐渣',zone:'slag',enabled:r.slag>0,formula:'CaO + SiO₂ → CaSiO₃',products:['CaSiO₃'],text:r.slag>0?'鐵礦石夾帶二氧化矽 SiO₂ 等雜質。CaO 與 SiO₂ 反應形成爐渣，浮在鐵水上面。':'沒有形成爐渣。需要含雜質的礦石、石灰石，以及焦炭和熱空氣提供的加熱條件。'},
  {name:'打開出渣口',zone:'slagTap',enabled:r.slag>0,formula:'CaO + SiO₂ → CaSiO₃',products:['CaSiO₃'],label:'爐渣的來源反應；排出本身不是化學反應',text:r.slag>0?'上層爐渣從較高的出渣口流出，把雜質帶走。這裡用 CaSiO₃ 代表爐渣，實際成分更複雜。':'這一爐沒有可排出的爐渣。檢查石灰石、礦石與加熱條件後，再點出渣口。'},
  {name:'打開出鐵口',zone:'ironTap',enabled:r.reduced>0,formula:'Fe₂O₃ + 3CO → 2Fe + 3CO₂',products:['Fe'],label:'鐵的來源反應；流出本身不是化學反應',text:r.reduced>0?'下層鐵水從較低的出鐵口流出。它是含碳與其他雜質的生鐵，並不是純鐵。':'這一爐沒有可流出的鐵水。加入鐵礦石、焦炭並鼓入熱空氣後，再點出鐵口。'}
 ];
}

const blastHotspots=[
 ['原料入爐','三種原料由此加入',3,3],
 ['焦炭燃燒','生成 CO₂ ＋ 熱',3,65],
 ['生成 CO','還原氣體向上走',3,46],
 ['還原鐵礦','生成 Fe ＋ CO₂',3,27],
 ['石灰石分解','生成 CaO ＋ CO₂',74,23],
 ['形成爐渣','除去 SiO₂ 雜質',74,43],
 ['出渣口','上層・爐渣流出',74,63],
 ['出鐵口','下層・鐵水流出',74,83]
];

function furnaceAnimationMarkup(){
 const rocks=Array.from({length:24},(_,i)=>`<use data-feed="${['ore','coke','lime'][i%3]}" href="#blast-${['ore','coke','lime'][i%3]}-rock" x="${315+(i%4)*23}" y="${101+Math.floor(i/4)*30}" width="33" height="27" transform="rotate(${i%3*13-13} ${330+(i%4)*23} ${114+Math.floor(i/4)*30})"/>`).join('');
 return `<div class="observation-heading"><span>點一點，讓高爐動起來</span><b id="furnace-state">自由探索</b></div>
 <p class="blast-instruction"><span>☝</span> 點圖上的標籤或爐內區域，看產物移動與反應式。</p>
 <div class="blast-diagram">
 <svg class="blast-svg" viewBox="0 0 720 480" preserveAspectRatio="xMidYMid meet" role="group" aria-label="可點選的工業高爐剖面圖">
 <defs>
  <radialGradient id="blast-ore-shade" cx=".3" cy=".2"><stop stop-color="#c18760"/><stop offset=".55" stop-color="#94533c"/><stop offset="1" stop-color="#4e3027"/></radialGradient>
  <radialGradient id="blast-coke-shade" cx=".25" cy=".2"><stop stop-color="#72756a"/><stop offset=".45" stop-color="#3b403a"/><stop offset="1" stop-color="#151d19"/></radialGradient>
  <radialGradient id="blast-lime-shade" cx=".25" cy=".2"><stop stop-color="#fff7df"/><stop offset=".55" stop-color="#d5cfb9"/><stop offset="1" stop-color="#95947e"/></radialGradient>
  <symbol id="blast-ore-rock" viewBox="0 0 50 40"><path d="M4 27C0 22 5 17 8 15C7 8 14 5 19 7C22 0 32 3 35 8C44 5 48 13 45 18C53 23 46 34 40 34C33 41 26 34 23 37C16 40 13 34 9 34C4 35 1 31 4 27Z" fill="url(#blast-ore-shade)"/><path d="M10 16Q15 12 20 14L25 9M19 30L25 21L34 17M31 27L40 30" fill="none" stroke="#4e2a21" stroke-width="2" opacity=".55"/><g fill="#e8b07d" opacity=".55"><circle cx="12" cy="18" r="2"/><circle cx="26" cy="12" r="2.5"/><circle cx="38" cy="16" r="1.5"/><circle cx="29" cy="29" r="1.5"/><circle cx="15" cy="26" r="1"/></g></symbol>
  <symbol id="blast-coke-rock" viewBox="0 0 50 40"><path d="M3 22Q1 15 9 13Q7 5 18 6Q25 0 30 7Q41 3 43 14Q51 19 45 25Q49 34 36 34Q30 41 22 36Q10 39 9 32Q0 31 3 22Z" fill="url(#blast-coke-shade)"/><g fill="#0e1713" stroke="#8a9080" stroke-opacity=".38" stroke-width="1.3"><ellipse cx="12" cy="19" rx="4" ry="3"/><ellipse cx="25" cy="11" rx="4" ry="2.5"/><ellipse cx="34" cy="21" rx="5" ry="4"/><ellipse cx="23" cy="29" rx="3" ry="4"/><ellipse cx="40" cy="29" rx="2.5" ry="2"/><circle cx="20" cy="21" r="2"/></g></symbol>
  <symbol id="blast-lime-rock" viewBox="0 0 50 40"><path d="M4 24Q0 18 7 14Q9 5 19 7Q23 1 32 6Q42 4 44 14Q51 22 43 29Q42 37 32 34Q22 40 18 35Q6 37 7 30Q1 28 4 24Z" fill="url(#blast-lime-shade)"/><path d="M10 18L20 15L28 9M16 29L27 23L37 25" stroke="#989983" opacity=".6" fill="none"/><path d="M10 13Q17 8 22 12M29 13L36 15" stroke="#fff9e9" stroke-width="3" fill="none" opacity=".8"/></symbol>
  <linearGradient id="blast-metal"><stop stop-color="#263f3f"/><stop offset=".34" stop-color="#748d80"/><stop offset=".6" stop-color="#54796b"/><stop offset="1" stop-color="#243c3b"/></linearGradient>
  <linearGradient id="blast-brick"><stop stop-color="#967b60"/><stop offset=".45" stop-color="#e1cba6"/><stop offset="1" stop-color="#aa8c66"/></linearGradient>
  <linearGradient id="blast-hot" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5e4d3d"/><stop offset=".5" stop-color="#87543b"/><stop offset="1" stop-color="#db7a35"/></linearGradient>
  <radialGradient id="blast-fire"><stop stop-color="#fff3ad"/><stop offset=".48" stop-color="#ffbc46"/><stop offset="1" stop-color="#e64629" stop-opacity="0"/></radialGradient>
  <linearGradient id="blast-melt" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0a0"/><stop offset=".4" stop-color="#f6ab48"/><stop offset="1" stop-color="#d85028"/></linearGradient>
  <pattern id="blast-bricks" width="20" height="12" patternUnits="userSpaceOnUse"><path d="M0 0H20M0 12H20M10 0V12" stroke="#6e5339" opacity=".3" fill="none"/></pattern>
  <clipPath id="blast-chamber"><path d="M336 92L294 286L312 406H424L442 286L400 92Z"/></clipPath>
 </defs>
 <path d="M0 0H720V480H0Z" fill="#e9eee3"/>
 <g stroke="#acbba3" stroke-width=".7" opacity=".32" fill="none"><path d="M0 70H720M0 140H720M0 210H720M0 280H720M80 0V350M160 0V350M240 0V350M320 0V350M400 0V350M480 0V350M560 0V350M640 0V350M0 350H720M0 382H720M0 422H720M0 470H720M360 350L0 480M360 350L180 480M360 350V480M360 350L540 480M360 350L720 480"/></g>
 <ellipse cx="369" cy="447" rx="122" ry="17" fill="#536948" opacity=".18"/>
 <g stroke="#526f7a" fill="none"><path d="M275 95V431M459 95V431M275 128H459M275 390H459" stroke-width="11"/><path d="M275 128L459 390M459 128L275 390" stroke-width="3" opacity=".45"/></g>
 <path d="M173 121L318 38H367" stroke="#5f6a62" stroke-width="12" fill="none"/><path d="M173 109L318 26H367" stroke="#869287" stroke-width="6" fill="none"/>
 <use href="#blast-ore-rock" x="312" y="12" width="41" height="30"/><use href="#blast-coke-rock" x="249" y="50" width="37" height="28"/>
 <path d="M330 65H294V43H267M405 65H443V36" stroke="#536e66" stroke-width="13" fill="none"/>
 <path class="blast-exhaust" d="M330 65H294V43H267M405 65H443V36" stroke="#eee7ce" stroke-width="5" stroke-dasharray="9 12" fill="none"/>
 <path d="M323 50V91L275 284L298 421H438L461 284L413 91V50Z" fill="url(#blast-metal)" stroke="#334c43" stroke-width="2"/>
 <path d="M330 87L284 286L305 415H431L452 286L406 87Z" fill="url(#blast-brick)"/>
 <path d="M330 87L284 286L305 415H431L452 286L406 87Z" fill="url(#blast-bricks)"/>
 <path d="M336 92L294 286L312 406H424L442 286L400 92Z" fill="url(#blast-hot)"/>
 <path d="M323 50Q368 35 413 50L405 66H331Z" fill="#839486" stroke="#314a40"/>
 <g clip-path="url(#blast-chamber)">
  <g class="blast-charge-flow">${rocks}</g>
  <ellipse class="blast-heat" cx="368" cy="332" rx="89" ry="82" fill="url(#blast-fire)"/>
  <g class="blast-flames" fill="#ffce64"><path d="M301 349Q318 302 329 334Q338 308 345 348Z"/><path d="M388 350Q398 314 407 333Q420 296 435 350Z"/></g>
  <path class="blast-iron-reservoir" d="M300 379Q368 374 435 379V408H300Z" fill="url(#blast-melt)"/>
  <path class="blast-slag-reservoir" d="M300 359Q368 354 435 359V379H300Z" fill="#aca27a"/>
  <g class="blast-gas-flow" fill="none" stroke="#f9e7b5" stroke-width="4" stroke-dasharray="8 14"><path d="M341 340Q322 280 341 227T351 109"/><path d="M393 337Q411 278 395 221T387 106"/></g>
 </g>
 <path d="M217 331H299M437 331H493" stroke="#4d6970" stroke-width="17"/><path class="blast-air" d="M217 331H299M493 331H437" stroke="#f7b36b" stroke-width="7" stroke-dasharray="9 12"/>
 <text x="222" y="357" fill="#7c583d" font-size="13">熱空氣 →</text>
 <path d="M431 365H488L503 382M425 398H471L491 438" stroke="#526c64" stroke-width="13" fill="none"/>
 <g class="blast-slag-stream"><path d="M431 365H488L503 382" stroke="#c4b48b" stroke-width="7" stroke-dasharray="13 5" fill="none"/><ellipse cx="504" cy="385" rx="22" ry="7" fill="#b4a67d"/></g>
 <g class="blast-iron-stream"><path d="M425 398H471L491 438" stroke="#ffc261" stroke-width="7" stroke-dasharray="14 5" fill="none"/><ellipse cx="493" cy="442" rx="28" ry="8" fill="url(#blast-melt)"/></g>
 <path d="M300 422H436L444 443H293Z" fill="#728078" stroke="#455b50"/>
 <g class="blast-layer-labels" fill="#fff8dc" font-size="13" text-anchor="middle"><text x="368" y="372">上層 · 爐渣</text><text x="368" y="399">下層 · 鐵水</text></g>
 <g class="blast-leaders" fill="none" stroke="#73917c" stroke-width="1.5"><path d="M190 42H240L328 62"/><path d="M190 337H218"/><path d="M190 246H269L324 271"/><path d="M190 156H274L330 179"/><path d="M534 139H477L406 224"/><path d="M534 235H478L421 355"/><path d="M534 332H514L488 365"/><path d="M534 427H517L487 433"/></g>
 <g class="blast-zone-ring" fill="none" stroke="#ffeeb0" stroke-width="2"><ellipse data-highlight="charge" cx="368" cy="88" rx="43" ry="20"/><ellipse data-highlight="burn" cx="368" cy="328" rx="70" ry="30"/><ellipse data-highlight="gas" cx="368" cy="274" rx="65" ry="25"/><ellipse data-highlight="reduce" cx="368" cy="181" rx="48" ry="40"/><ellipse data-highlight="lime" cx="368" cy="229" rx="57" ry="27"/><ellipse data-highlight="slag" cx="368" cy="367" rx="64" ry="13"/><ellipse data-highlight="slagTap" cx="493" cy="376" rx="28" ry="21"/><ellipse data-highlight="ironTap" cx="487" cy="428" rx="32" ry="26"/></g>
 <g class="blast-zone-targets" fill="transparent" aria-hidden="true"><path data-blast-step="0" d="M323 40H414V109H323Z"/><path data-blast-step="3" d="M331 117H404L419 207H315Z"/><path data-blast-step="4" d="M315 207H419L429 248H307Z"/><path data-blast-step="2" d="M307 248H429L440 294H296Z"/><path data-blast-step="1" d="M296 294H440V352H296Z"/><path data-blast-step="5" d="M309 352H429V379H309Z"/><path data-blast-step="6" d="M431 352H524V391H431Z"/><path data-blast-step="7" d="M425 391H525V459H425Z"/></g>
 <g data-blast-particles aria-hidden="true"></g>
 </svg>
 <div class="blast-hotspots" role="group" aria-label="點選高爐部位">${blastHotspots.map(([name,hint,x,y],i)=>`<button type="button" class="blast-hotspot" data-blast-step="${i}" aria-label="${name}" aria-pressed="false" style="--spot-x:${x}%;--spot-y:${y}%"><span class="blast-number">${i+1}</span><span><b>${name}</b><small>${hint}</small></span></button>`).join('')}</div>
 </div>
 <div class="blast-formula-board" aria-live="polite"><div class="blast-board-heading"><b data-blast-title>先點一個部位，開始探索</b><span data-blast-condition>可直接點選</span></div><div data-blast-formula class="equation">原料進去後，會變成什麼？</div><div data-blast-products class="blast-products"></div><small data-blast-label>點選後，這裡會同步顯示反應式。</small><p data-blast-description>先試試「還原鐵礦」，再點「出鐵口」，觀察鐵如何從礦石變成鐵水。</p></div>
 <div class="blast-playback"><button type="button" class="secondary" data-blast-toggle disabled>暫停動態</button><button type="button" class="secondary" data-blast-replay disabled>重看這一步</button><button type="button" class="secondary" data-blast-tour>自動導覽</button><span data-blast-position>自由點選，不必照順序</span></div>
 <p class="model-note blast-timing-note">各部位依本次配方呈現。氣體為無色，圖中的標籤用來追蹤產物；時間、大小與爐內位置為教學示意。</p>`;
}

// Moving labels represent bulk products, not atom models or coloured gas.
function blastParticleMarkup(zone,enabled){
 if(!enabled)return '';
 const flows={
  burn:[['CO₂','gas',368,323,348,289,342,240]],
  gas:[['CO','gas',369,274,352,223,353,162]],
  reduce:[['Fe','iron',354,173,349,282,350,391],['CO₂','gas',388,177,391,122,391,78]],
  lime:[['CaO','solid',355,222,351,293,351,361],['CO₂','gas',390,225,390,159,392,99]],
  slag:[['CaSiO₃','slag',366,337,365,352,365,366]],
  slagTap:[['CaSiO₃','slag',430,364,485,365,504,384]],
  ironTap:[['Fe','iron',427,397,471,399,493,437]]
 };
 return (flows[zone]||[]).map(([formula,kind,x,y,mx,my,tx,ty],i)=>`<g class="blast-product-particle ${kind}" style="--fx:${x}px;--fy:${y}px;--mx:${mx}px;--my:${my}px;--tx:${tx}px;--ty:${ty}px;animation-delay:${i*.2}s"><ellipse cy="0" rx="${formula==='CaSiO₃'?58:formula.length>3?30:23}" ry="15"/><text text-anchor="middle" y="5" style="font-size:${formula==='CaSiO₃'?12:14}px">${formula==='CaSiO₃'?'CaSiO₃（熔渣）':formula}</text></g>`).join('');
}

export function createFurnaceAnimation(host,{onPrepare}={}){
 host.innerHTML=furnaceAnimationMarkup();
 let config=null,steps=[],index=0,timer=0,moving=false,touring=false;
 const q=s=>host.querySelector(s);
 function stop(){clearTimeout(timer);timer=0;moving=touring=false;host.classList.remove('blast-playing');}
 function render(restartParticles=false){
  const s=steps[index];if(!s)return;
  host.dataset.blastZone=s.zone;host.dataset.stepEnabled=String(s.enabled);
  host.dataset.hasHeat=String(config.result.running);host.dataset.hasIron=String(config.result.reduced>0);host.dataset.hasSlag=String(config.result.slag>0);
  host.dataset.ironVisible=String(config.result.reduced>0&&['reduce','slag','slagTap','ironTap'].includes(s.zone));
  host.dataset.slagVisible=String(config.result.slag>0&&['slag','slagTap','ironTap'].includes(s.zone));
  host.querySelectorAll('[data-feed]').forEach(n=>n.style.display=config.recipe[n.dataset.feed]>0?'':'none');
  q('[data-blast-title]').textContent=(index+1)+' · '+s.name;
  q('[data-blast-condition]').textContent=s.enabled?(s.condition||'觀察產物'):'條件不足';
  const formula=q('[data-blast-formula]');formula.replaceChildren();
  for(const term of s.formula.replaceAll('CaSiO₃','CaSiO₃（熔渣）').split(/\s+/)){
   const token=document.createElement('span');token.className='equation-term';token.textContent=term;formula.append(token,document.createTextNode(' '));
  }
  q('[data-blast-label]').textContent=!s.enabled?'下式為原理說明；這一爐尚未發生':s.label||'這個部位的化學反應式';
  q('[data-blast-description]').textContent=s.text.replaceAll('CaSiO₃','CaSiO₃（熔渣）');
  q('[data-blast-products]').innerHTML=s.enabled?s.products.map(p=>`<span>${p==='Fe'?'鐵 Fe':p==='CaSiO₃'?'CaSiO₃（熔渣）':p==='熱'?'放出熱':p}</span>`).join(''):'<span class="no-product">本次沒有這個部位的產物</span>';
  q('#furnace-state').textContent=s.enabled?s.name:'條件不足 · '+s.name;
  q('[data-blast-toggle]').disabled=!s.enabled;q('[data-blast-toggle]').textContent=moving?'暫停動態':'繼續動態';
  q('[data-blast-replay]').disabled=false;
  q('[data-blast-position]').textContent=touring?'自動導覽 '+(index+1)+' / '+steps.length:moving?'可隨時點選其他部位':'已暫停';
  host.querySelectorAll('button[data-blast-step]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.blastStep===index)));
  host.querySelectorAll('[data-highlight]').forEach(n=>n.classList.toggle('active',s.enabled&&n.dataset.highlight===s.zone));
  if(restartParticles)q('[data-blast-particles]').innerHTML=blastParticleMarkup(s.zone,s.enabled);
  host.classList.toggle('blast-playing',moving&&s.enabled);
 }
 function schedule(){clearTimeout(timer);if(!touring)return;timer=setTimeout(()=>{if(index<steps.length-1){index++;render(true);schedule();}else{touring=false;render();}},4200);}
 function select(i,auto=false){stop();index=i;moving=true;touring=auto;render(true);schedule();}
 function prepare(i=0,auto=false){if(!config){onPrepare?.({step:i,autoplay:auto});}else select(i,auto);}
 function click(e){
  const step=e.target.closest('[data-blast-step]');
  if(step){prepare(+step.dataset.blastStep);host.scrollIntoView({behavior:'smooth',block:'start'});return;}
  if(e.target.closest('[data-blast-tour]')){prepare(0,true);host.scrollIntoView({behavior:'smooth',block:'start'});return;}
  if(!config)return;
  if(e.target.closest('[data-blast-replay]'))select(index);
  if(e.target.closest('[data-blast-toggle]')){if(moving)stop();else moving=true;render();}
 }
 host.addEventListener('click',click);
 return {
  play(next,{step=0,autoplay=false}={}){config=next;steps=furnaceAnimationSteps(next);select(step,autoplay);},
  reset(message='自由探索'){
   stop();config=null;steps=[];index=0;host.dataset.blastZone='';
   for(const key of ['ironVisible','slagVisible','hasHeat','hasIron','hasSlag','stepEnabled'])host.dataset[key]='false';
   host.querySelectorAll('[data-feed]').forEach(n=>n.style.display='');
   host.querySelectorAll('button[data-blast-step]').forEach(b=>b.setAttribute('aria-pressed','false'));
   host.querySelectorAll('[data-highlight]').forEach(n=>n.classList.remove('active'));
   q('[data-blast-particles]').innerHTML='';q('#furnace-state').textContent=message;
   q('[data-blast-title]').textContent='點選高爐部位，看看這份配方';q('[data-blast-condition]').textContent='可直接點選';
   q('[data-blast-formula]').textContent='原料進去後，會變成什麼？';q('[data-blast-products]').innerHTML='';
   q('[data-blast-label]').textContent='點選後，這裡會同步顯示反應式。';q('[data-blast-description]').textContent='先試試「還原鐵礦」，再點「出鐵口」，觀察鐵如何從礦石變成鐵水。';
   q('[data-blast-toggle]').disabled=q('[data-blast-replay]').disabled=true;q('[data-blast-toggle]').textContent='暫停動態';q('[data-blast-position]').textContent='自由點選，不必照順序';
  },
  dispose(){stop();host.removeEventListener('click',click);}
 };
}
