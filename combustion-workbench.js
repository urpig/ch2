import {combustionNextAction,highlightNext} from './combustion-guidance.js';
import {mountReactionObservations} from './combustion-observations.js';
import {laboratoryBackground,spoonIllustration,alcoholLamp} from './laboratory-assets.js';
import {mountBenchWater} from './bench-water.js';
import {createCombustionAtmosphere} from './combustion-atmosphere.js';
import {bindFreeSpoon} from './direct-manipulation.js';
import {spoonNearFlame,spoonInJar,spoonBottlePlacement,newSpoonHeating,advanceSpoonHeating,spoonTiming} from './spoon-heating.js';
import {scopeMarkup} from './card-markup.js';
import {gasCollectionBottle} from './glass-bottle.js';
import {sulfurGasFlow} from './sulfur-gas-flow.js';
const atmospherePool=new WeakMap();
function mobileSpecimenFallback(key){
 if(key==='Cu')return '';
 const carbon=key==='C'||key==='CO',colour=({Mg:'#fffff0',Zn:'#70cbbc',Na:'#ffc247',S:'#4c80ff',P:'#fff3d7'})[key]||'#f26c24';
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion:reduce)').matches;
 return `<svg class="mobile-specimen-fallback" viewBox="0 0 160 230" aria-hidden="true"><defs><radialGradient id="specimen-halo"><stop stop-color="${colour}" stop-opacity=".5"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient><linearGradient id="specimen-sheet" x2="0" y2="1"><stop stop-color="${colour}" stop-opacity="0"/><stop offset=".4" stop-color="${colour}" stop-opacity=".5"/><stop offset="1" stop-color="${colour}" stop-opacity=".8"/></linearGradient></defs><g transform="translate(29 200)">${carbon?'<ellipse cy="-1" rx="16" ry="6" fill="#f36b29" opacity=".65"/>':`<ellipse cy="-21" rx="29" ry="40" fill="url(#specimen-halo)"/><path d="M-12 0C-20 -15 -5 -24 -6 -40Q-5 -55 2 -64C0 -48 14 -39 12 -27Q23 -12 11 0Z" fill="url(#specimen-sheet)">${reduced?'':'<animate attributeName="d" dur=".91s" repeatCount="indefinite" values="M-12 0C-20 -15 -5 -24 -6 -40Q-5 -55 2 -64C0 -48 14 -39 12 -27Q23 -12 11 0Z;M-12 0C-19 -14 -10 -24 -3 -40Q3 -53 -1 -68C8 -50 14 -37 11 -27Q19 -12 11 0Z;M-12 0C-20 -15 -5 -24 -6 -40Q-5 -55 2 -64C0 -48 14 -39 12 -27Q23 -12 11 0Z"/>'}</path>`}${['Mg','Zn','P'].includes(key)?Array.from({length:6},(_,i)=>`<ellipse class="oxide-smoke" style="--duration:2.8s;--delay:${-i*.4}s;--dx:${i%2?24:-18}px" cx="0" cy="-15" rx="${10+i}" ry="${13+i}" fill="#f4f3eb" opacity="0"/>`).join(''):''}</g></svg>`;
}

// The landing area follows the bowl students can actually see, including cooling and pouring.
export function shelfTarget(board){
 if(!board)return null;const target=board.querySelector('[data-shelf-target]');if(!target)return null;
 const selectors=['.analysis-spoon:not([hidden]) [data-spoon-bowl]','.analysis-spoon-rest:not([hidden]) [data-spoon-bowl]','[data-bench-product] [data-spoon-bowl]','[data-spoon] [data-spoon-bowl]','.spoon-rest [data-spoon-bowl]','.combustion-fixed-spoon [data-spoon-bowl]'];
 let bowl;for(const selector of selectors){const candidate=board.querySelector(selector),r=candidate?.getBoundingClientRect();if(r?.width>0&&r?.height>0){bowl=r;break;}}
 if(!bowl)return null;const rect=board.getBoundingClientRect(),x=(bowl.x+bowl.width/2-rect.x)/rect.width*760,y=(bowl.y+bowl.height/2-rect.y)/rect.height*430;
 target.style.left=(x/760*100-5.5)+'%';target.style.top=(y/430*100-6)+'%';target.dataset.spoonX=x;target.dataset.spoonY=y;return target;
}

export function combustionArtwork(key,stage,isMetal,cool=true,spoonOrigin=null){
 const active=['ignite','react'].includes(stage),finished=stage==='done',loaded=stage!=='load',inJar=!isMetal&&['react','done'].includes(stage),x=finished&&spoonOrigin?spoonOrigin[0]:inJar?560:320,y=finished&&spoonOrigin?spoonOrigin[1]:inJar?283:224;
 const colours={Cu:'#c5774d',Mg:'#c5ced0',Zn:'#8e9caa',Na:'#c6cecf',S:'#e6c332',P:'#8e382d',C:'#262625',CO:'#262625'},products={Cu:'#242a29',Mg:'#eeeede',Zn:cool?'#f0ecdc':'#e4c83b',Na:'#e6d89c',P:'#ebece7'};
 const drawSpoon=loaded&&!['loaded','transfer'].includes(stage);
 const solid=finished?products[key]||'#242625':colours[key],carbon=['C','CO'].includes(key),flame=key==='S'?'#427dff':key==='Na'?'#ffbc24':key==='Zn'?'#68dec6':'#fff5d5';
 const ribbon='<path d="M-19 -7Q-4 -18 7 -9T22 -6L20 -1Q4 -7 -2 -3T-20 -2Z" fill="'+solid+'" stroke="#f7faf5" stroke-width="1"/>';
 const lump='<path d="M-12 -10L5 -14 15 -7 12 1 -9 2Z" fill="'+solid+'" stroke="#dce2dd"/><path d="M-12 -10L6 -6 15 -7M6 -6L4 1" stroke="#83969c" fill="none"/>';
 const rawSample=!finished&&key==='Mg'?ribbon:!finished&&key==='Na'?lump:key==='Cu'?`<path d="M-21 -9L19 -12 25 -1 -14 3Z" fill="${solid}" stroke="${finished?'#454e48':'#f4bc87'}" stroke-width="1.2"/>`:finished&&!carbon?'<ellipse cx="0" cy="-4" rx="23" ry="8" fill="'+solid+'"/>'+Array.from({length:200},(_,i)=>{const a=i*2.39996,r=Math.sqrt((i+.5)/200);return `<ellipse cx="${Math.cos(a)*23*r}" cy="${-5+Math.sin(a)*7*r}" rx="${.3+i%4*.18}" ry="${.2+i%3*.15}" fill="${i%4===0?'#fffef4':i%4===1?'#a9ada1':solid}"/>`;}).join(''):Array.from({length:carbon?7:20},(_,i)=>`<path d="M${i%7*5-17} ${-4-Math.floor(i/7)*3}l4 -3 4 2 -2 4 -5 1Z" fill="${solid}" opacity="${.7+i%3*.15}"/>`).join('');
 const residue=finished&&key==='S'?'':finished&&carbon?'<g transform="scale(.45)">'+rawSample+'</g>':rawSample;
 const sample=active&&carbon?'<g class="carbon-consuming">'+rawSample+'</g>':active&&!carbon?'<g class="reactant-surface">'+rawSample+'</g><g class="reaction-coat" fill="'+(products[key]||'#eeeede')+'">'+Array.from({length:20},(_,i)=>'<ellipse cx="'+(i%7*5-16)+'" cy="'+(-3-Math.floor(i/7)*3)+'" rx="4" ry="2.5"/>').join('')+'</g>':residue;
 const particles=active&&(key==='P'||key==='Mg'||key==='Zn')?Array.from({length:key==='P'?25:10},(_,i)=>`<ellipse class="oxide-smoke" style="--delay:${-i*.23}s;--dx:${Math.sin(i*2)*50}px;--duration:${2.1+i%4*.3}s" cx="${x}" cy="${y-19}" rx="${8+i%5*2}" ry="${11+i%4*2}" fill="#f5f4ed" opacity=".0" filter="url(#vapour)"/>`).join(''):'';
 const tongue=(cx,cy,colour,scale=1)=>`<g class="flame-art" transform="translate(${cx} ${cy}) scale(${scale})"><ellipse cx="0" cy="-20" rx="28" ry="35" fill="${colour}" opacity=".18" filter="url(#radiance)"/><path fill="${colour}" opacity=".88" filter="url(#flame-warp)" d="M-17 0Q-24 -18 -9 -34Q2 -48 0 -67Q23 -37 14 -23Q30 -10 14 0Z"><animate attributeName="d" dur=".62s" repeatCount="indefinite" values="M-17 0Q-24 -18 -9 -34Q2 -48 0 -67Q23 -37 14 -23Q30 -10 14 0Z;M-17 0Q-27 -18 -6 -38Q11 -50 8 -73Q29 -40 12 -24Q23 -11 14 0Z;M-17 0Q-24 -18 -9 -34Q2 -48 0 -67Q23 -37 14 -23Q30 -10 14 0Z"/></path><path d="M-8 -1Q-13 -15 0 -33Q13 -16 7 -1Z" fill="#e7f2ff" opacity=".8"/></g>`;
 return `<svg class="combustion-art" viewBox="0 0 760 430" role="img" aria-label="${isMetal?'酒精燈與金屬燃燒匙':'燃燒匙、酒精燈與玻璃集氣瓶'}"><defs>
 <linearGradient id="bench" x2="0" y2="1"><stop stop-color="#e5e8e2"/><stop offset="1" stop-color="#b5c1b8"/></linearGradient><linearGradient id="steel" x2="1" y2=".25"><stop stop-color="#475458"/><stop offset=".22" stop-color="#d7e0df"/><stop offset=".35" stop-color="#627a80"/><stop offset=".4" stop-color="#89989b"/><stop offset=".44" stop-color="#eff7f5"/><stop offset=".48" stop-color="#6b7e82"/><stop offset=".58" stop-color="#f8fbf8"/><stop offset="1" stop-color="#697b81"/></linearGradient>
 <linearGradient id="glass" x2="1" y2="0"><stop stop-color="#a8c8d2" stop-opacity=".42"/><stop offset=".12" stop-color="#f5ffff" stop-opacity=".42"/><stop offset=".16" stop-color="#efffff" stop-opacity=".64"/><stop offset=".19" stop-color="#9dbcb9" stop-opacity=".12"/><stop offset=".26" stop-color="#c6e2e3" stop-opacity=".04"/><stop offset=".73" stop-color="#f8ffff" stop-opacity=".04"/><stop offset=".89" stop-color="#e9ffff" stop-opacity=".4"/><stop offset="1" stop-color="#7eafb9" stop-opacity=".52"/></linearGradient>
 <radialGradient id="dish"><stop stop-color="#364247"/><stop offset=".68" stop-color="#9dabae"/><stop offset=".84" stop-color="#35484e"/><stop offset=".88" stop-color="#dce2df"/><stop offset=".94" stop-color="#fafffc"/><stop offset="1" stop-color="#596c72"/></radialGradient><radialGradient id="ember"><stop stop-color="#ffe3a1"/><stop offset=".2" stop-color="#f86f22"/><stop offset="1" stop-color="#6c2114"/></radialGradient>
 <filter id="radiance" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9"/></filter><filter id="vapour" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter><filter id="flame-warp" x="-60%" y="-30%" width="220%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".035 .07" numOctaves="2" seed="4"><animate attributeName="baseFrequency" dur="1.3s" values=".035 .07;.045 .09;.035 .07" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
 <clipPath id="jar-clip"><path d="M523 85H597V128Q641 148 644 175V323Q644 347 560 347Q476 347 476 323V175Q479 148 523 128Z"/></clipPath></defs>
 ${laboratoryBackground()}
 ${alcoholLamp(!finished)}<text class="lamp-label" x="320" y="402" text-anchor="middle" fill="#e5efe9" font-size="13">酒精燈</text>
 ${!isMetal?gasCollectionBottle(key):''}
 ${drawSpoon?`<g ${inJar?'clip-path="url(#jar-clip)"':''}>${inJar&&active?`<ellipse cx="560" cy="280" rx="80" ry="85" fill="${flame}" opacity=".1" filter="url(#radiance)"/>`:''}${particles}</g><g class="combustion-fixed-spoon" transform="translate(${x} ${y})"><g transform="translate(-29 -205)">${spoonIllustration(key,{oxide:finished,cool,progress:active})}</g>${carbon&&active?`<path d="M-13 -3L-8 -9 -3 -2 3 -10 9 -1 16 -5" fill="none" stroke="url(#ember)" stroke-width="3" class="ember-pulse"/>`:''}${active&&!carbon&&key!=='Cu'?tongue(0,-5,flame,key==='Mg'?.65:key==='S'?.8:1):''}${active&&key==='Mg'?'<ellipse cy="-10" rx="27" ry="20" fill="white" opacity=".85" filter="url(#radiance)"/>':''}</g>`:''}
 ${finished&&key==='P'?'<path d="M491 328Q560 338 627 327L623 335Q560 347 496 337Z" fill="#e8e9e3" opacity=".8"/>':''}
 ${finished&&products[key]?`<g class="product-closeup" transform="translate(${isMetal?555:145} ${isMetal?205:112})"><rect x="-91" y="-74" width="182" height="133" rx="10" fill="#f7f8f1" stroke="#a7b6a5"/><text y="-51" text-anchor="middle" font-size="12" fill="#5b705d">產物放大觀察</text><ellipse cy="5" rx="65" ry="22" fill="url(#dish)"/><g transform="translate(0 5) scale(2.1)">${residue}</g><text y="44" text-anchor="middle" font-size="12" fill="#465f50">${{Cu:'黑色表層',Mg:'白色固體',Zn:cool?'冷卻後：白色':'仍熱：黃色',Na:'淡黃色產物',P:'白色固體微粒'}[key]}</text></g>`:''}
 ${finished?`<text class="combustion-product-note" x="${x}" y="${y+42}" text-anchor="middle" fill="#465f50" font-size="13">${{Cu:'紅棕銅片 → 黑色表層',Mg:'留下白色氧化鎂',Zn:cool?'白色氧化鋅':'熱的氧化鋅：黃色',Na:'淡黃色氧化產物',S:'SO₂ 留在瓶內；氣體無色',P:'白煙逐漸沉降為白色固體',C:'CO₂ 留在瓶內；氣體無色',CO:'可能含 CO、CO₂ 及剩餘碳'}[key]}</text>`:''}</svg>`;
}

export function mountCombustion(root,{key,isMetal,autoLoad=false,spoonOrigin=null,onCleanup=()=>{},completed=false,cool=true,token,name,delay,notice,onStart,onComplete,onWetComplete,onCool,onProcessChange=()=>{}}){
 const owner=root.closest('.interactive-lab');let atmosphere=atmospherePool.get(owner);if(!atmosphere){atmosphere=createCombustionAtmosphere();if(atmosphere){atmospherePool.set(owner,atmosphere);onCleanup(()=>{atmosphere.dispose();atmospherePool.delete(owner);});}}
 const condition=(isMetal?(key==='Cu'?'空氣中加熱；銅片形成黑色表層，通常沒有自身火焰。':'空氣中加熱，觀察樣本的燃燒與產物。'):key==='CO'?'氧不足案例可能有混合產物；CO 不以有色煙呈現。':'瓶內預先充氧，用來觀察燃燒及保留產物；無色氣體不染色；移入路徑簡化示意。')+(key==='Na'||key==='P'||key==='CO'?' 此案例僅虛擬操作。':'');
 root.innerHTML=scopeMarkup(`<div class="combustion-workbench ${completed?'':'mobile-combustion'}" data-combustion-stage="${completed?'done':autoLoad?'loaded':'load'}" data-element="${key}" data-bottle-covered="${!isMetal&&completed?'true':'false'}">${combustionArtwork(key,completed?'done':'load',isMetal,cool,spoonOrigin)}<div data-shelf-target class="shelf-load-target drop-target"><span>放到燃燒匙凹槽 ↓</span></div>${completed?'':`<div class="heat-contact-zone" data-heat-zone aria-hidden="true"></div><div class="combustion-spoon" data-spoon aria-label="${autoLoad?'裝有'+name:'空的'}燃燒匙">${spoonIllustration(key,{empty:!autoLoad,progress:autoLoad})}${mobileSpecimenFallback(key)}<span>按住匙柄拖動 · 可移開</span></div>${isMetal?'':'<div class="drop-target jar-body-zone" data-jar-target><span>點燃後，拖進瓶內 ↓</span></div>'}<div class="spoon-heat-readout"><b data-heat-label></b><span data-heat-detail></span><div class="spoon-heat-progress" role="progressbar" aria-label="樣本受熱或觀察進度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></div>`}</div><p class="combustion-step" aria-live="polite"></p>`,'combustion-'+key);
 const board=root.querySelector('.combustion-workbench'),step=root.querySelector('.combustion-step');
 const feedback=document.createElement('p');feedback.className='instrument-feedback';feedback.setAttribute('role','status');feedback.hidden=true;board.append(feedback);onProcessChange(completed?'water':'burn');
 if(key==='S'&&!completed)board.insertAdjacentHTML('beforeend',sulfurGasFlow());
 const updateReaction=mountReactionObservations(board,key,{completed});updateReaction();
 if(atmosphere){board.append(atmosphere.canvas);board.classList.add('atmosphere-ready');atmosphere.update({key,stage:completed?'done':'load',isMetal,mobile:completed,bowl:spoonOrigin||[320,224],specimenActive:false});}
 mountBenchWater(board,{key,completed,cool,spoonOrigin,delay,onCleanup,notice,onCool,onWaterAdded:()=>updateReaction({waterAdded:true}),onPhaseChange:onProcessChange,onComplete:onWetComplete});
 if(completed){shelfTarget(board);step.textContent=['S','C','CO'].includes(key)?'燃燒結束並示意冷卻後，直接加水、輕搖；玻璃片自動開合。再用滴管取液，滴在桌面的紅、藍石蕊試紙上。':'觀察完成。可直接把產物加入水中，或從架上取下一份樣本。';return;}
 let state=newSpoonHeating(key,isMetal,autoLoad),point=spoonOrigin?[...spoonOrigin]:[320,224],inJar=false,held=false,alive=true,started=false,last=performance.now(),timer=0,previousMessage='';
 const spoon=board.querySelector('[data-spoon]'),label=board.querySelector('[data-heat-label]'),detail=board.querySelector('[data-heat-detail]'),meter=board.querySelector('[role="progressbar"]');
 const continueButton=document.createElement('button');continueButton.type='button';continueButton.className='combustion-observation-continue primary';continueButton.textContent='觀察完成，查看產物 →';continueButton.hidden=true;board.append(continueButton);
 continueButton.onclick=()=>{if(!alive||!state.complete||held)return;dispose();onComplete([...point]);};
 function show(){
  // Reserve the left side for the equation, clear of the collection bottle.
  board.dataset.reactionSide='left';
  board.dataset.gasProducing=String(key==='S'&&inJar&&state.ignited);
  updateReaction(state);
  const near=spoonNearFlame(point),heating=state.loaded&&!state.complete&&near;
  const stage=!state.loaded?'load':state.ignited?(isMetal||inJar?'react':'transfer'):heating?'ignite':'loaded';
  const ratio=key==='Cu'?state.heatMs/spoonTiming.copper:!state.ignited?state.heatMs/spoonTiming.ignition:isMetal?state.burnMs/spoonTiming.metal:state.observationMs/spoonTiming.nonmetal;
  const reaction=key==='Cu'?state.heatMs/spoonTiming.copper:state.ignited?(isMetal?state.burnMs/spoonTiming.metal:state.observationMs/spoonTiming.nonmetal):0;
  board.dataset.combustionStage=stage;board.dataset.bottleCovered=String(!isMetal&&inJar);board.dataset.heating=heating?'active':state.loaded?'paused':'empty';board.dataset.heatMs=Math.round(state.heatMs);board.dataset.observationMs=Math.round(state.observationMs);board.dataset.ignited=String(state.ignited);board.dataset.spoonX=point[0];board.dataset.spoonY=point[1];
  spoon.style.setProperty('--reaction-progress',String(reaction));spoon.classList.toggle('specimen-burning',state.ignited);board.querySelector('[data-heat-zone]').classList.toggle('receiving-heat',heating);
  let message;
  if(!state.loaded){label.textContent='空匙 · 可直接拖動';detail.textContent='從上架放入樣本';message='先把樣本放上匙口；按住匙柄可移動空匙。';}
  else if(!state.ignited){label.textContent=heating?'正在加熱':'已移開 · 停止加熱';detail.textContent=(key==='Cu'?'受熱示意':'點燃準備')+' '+Math.round(ratio*100)+'%';message=heating?'匙端正靠近火焰，正在加熱；拖開就停止。':'匙端已離開火焰，停止加熱；移回可接續。';}
  else{label.textContent=heating?'外部加熱中 · 樣本已點燃':'已停止加熱 · 樣本仍燃燒';detail.textContent=isMetal?'燃燒後比較產物':inJar?'瓶內觀察 '+Math.round(ratio*100)+'%':'拖進瓶身範圍即可';message=isMetal?(heating?'樣本已點燃；可以移離酒精燈，觀察持續燃燒。':'已移離酒精燈，停止外部加熱；樣本已點燃，仍在燃燒。'):inJar?'燃燒匙已在瓶內，觀察並保留產物；仍可抓住匙柄移出。':'樣本已點燃。把燃燒匙直接拖進瓶內，鬆開後觀察產物。';}
  if(state.complete){label.textContent='停留觀察';detail.textContent='看清楚後，再查看產物';message='觀察火焰顏色與反應式；看完後按「觀察完成，查看產物」。';}continueButton.hidden=!state.complete;continueButton.disabled=held;
  meter.setAttribute('aria-valuenow',String(Math.round(ratio*100)));meter.querySelector('i').style.width=(ratio*100)+'%';
  const jarTarget=board.querySelector('[data-jar-target]');if(jarTarget)jarTarget.hidden=!state.ignited||inJar;
  const next=combustionNextAction({...state,isMetal,inJar,near});highlightNext(board,next);if(next.instruction)message=next.instruction;
  if(message!==previousMessage){step.textContent=message;notice(message);previousMessage=message;}
  if(atmosphere)atmosphere.update({key,stage,isMetal,mobile:true,bowl:point,specimenActive:state.ignited}, {preserveTime:true});
  shelfTarget(board);
 }
 function tick(){
  if(!alive||!board.isConnected)return;const now=performance.now(),dt=Math.min(150,now-last);last=now;
  const before=state;
  state=advanceSpoonHeating(state,{near:spoonNearFlame(point),inJar,dt:document.hidden?0:dt});
  if(!started&&state.heatMs>0){started=true;onStart?.();}
  if(['heatMs','burnMs','observationMs','externalHeating','complete','ignited'].some(k=>state[k]!==before[k]))show();
  if(state.complete)return;if(state.loaded)timer=setTimeout(tick,40);
 }
 const releaseDrag=bindFreeSpoon(spoon,board,{position:point,onGrab:()=>{held=true;feedback.hidden=true;},onMove:(next,grabbing)=>{point=next;held=grabbing;inJar=!isMetal&&state.ignited&&spoonInJar(point);show();},onRelease:p=>{const placed=spoonBottlePlacement(p,state);inJar=!!placed;if(placed)return placed;if(state.ignited&&!isMetal){feedback.textContent='把匙端移進玻璃瓶裡，再放手。';feedback.hidden=false;}}});
 function dispose(){if(!alive)return;alive=false;clearTimeout(timer);releaseDrag();}
 onCleanup(dispose);show();tick();
}
