import {observationCases,transferCases,transferOxygen} from './inquiry-model.js';
import {bindReactantPickup} from './life-reactant-drag.js';
import {createOxidationFire} from './oxidation-fire.js';
const oxidationTypes={fast:'劇烈的氧化',slow:'緩和的氧化'};
const atom=(kind,label)=>`<span class="reaction-atom reaction-atom-${kind}">${label}</span>`;

function evidenceGas(burning){
 const formula=burning?'CO₂':'O₂';
 return `<div class="evidence-gas">${[1,2,3].map(index=>`
  <span class="evidence-molecule evidence-molecule-${index}">${formula}</span>`).join('')}</div>`;
}

function corrosionMask(){
 const sites=[
  [.215,.287,.046,.092,-9,.17],
  [.222,.375,.035,.076,13,.31],
  [.284,.306,.053,.055,-24,.29],
  [.341,.304,.063,.052,11,.16],
  [.416,.273,.065,.055,-11,.23],
  [.484,.256,.055,.065,25,.30],
  [.546,.245,.07,.055,-21,.13],
  [.619,.226,.062,.059,18,.27],
  [.676,.217,.047,.057,-22,.35],
  [.731,.195,.061,.05,6,.19],
  [.779,.183,.04,.042,-18,.34]
 ];
 return `<svg class="evidence-mask-defs" width="0" height="0" aria-hidden="true"><defs>
  <mask id="evidence-corrosion" maskContentUnits="objectBoundingBox">
   ${sites.map(([x,y,w,h,angle,delay])=>`<g transform="translate(${x} ${y}) scale(${w} ${h}) rotate(${angle})">
    <path class="evidence-corrosion-patch" style="--rust-delay:${delay}" fill="white"
     d="M-.98-.17L-.78-.37-.9-.55-.63-.52-.48-.83-.2-.77-.09-.99.07-.77.27-.91.45-.69.72-.73.77-.47.97-.24.84-.03 1 .21.78 .26.77 .49.55 .52.38 .81.16 .73-.09 .94-.25 .74-.51 .83-.58 .57-.85 .51-.76 .26-1 .12Z"/>
   </g>`).join('')}
  </mask>
 </defs></svg>`;
}

function evidenceScene(id,time,{start,end},seen){
 const burning=id==='burn';
 const effect=burning
  ? `<svg class="evidence-mask-defs" width="0" height="0" aria-hidden="true"><defs>
    <filter id="evidence-coal-colors" color-interpolation-filters="sRGB">
     <feColorMatrix type="saturate" values="0"/>
     <feComponentTransfer>
      <feFuncR type="table" tableValues=".19 .82 1 1 1"/>
      <feFuncG type="table" tableValues=".012 .20 .46 .69 .92"/>
      <feFuncB type="table" tableValues=".018 .048 .14 .37 .77"/>
     </feComponentTransfer>
    </filter>
    <filter id="evidence-ember-colors" color-interpolation-filters="sRGB">
     <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  2.6 0 -3 0 -.49"/>
    </filter>
   </defs></svg>
   <div class="evidence-photo evidence-coal-heat"></div>
   <div class="evidence-photo evidence-embers"></div>
   <canvas class="evidence-flame" width="368" height="226"></canvas>
   ${Array.from({length:6},(_,i)=>`<i class="evidence-spark" style="--spark-x:${41+i*11%18}%;--spark-y:${22+(i%4)*2}%;--spark-drift:${-2+(i*31%57)/10}cqw;--spark-height:${4+(i*37%58)/10}cqw;--spark-delay:${920+i*373}ms"></i>`).join('')}`
  : `<div class="evidence-photo evidence-rust-spots"></div>${corrosionMask()}`;
 const specimen=burning?'炭盆':'鐵釘';
 return `<div class="evidence-scene evidence-scene-${id}" role="group" aria-label="${specimen}放在電子秤上">
  <span class="evidence-time"><span data-evidence-mass-phase>${seen?'反應後':'反應前'}</span> · ${time}</span>
  <div class="evidence-stage">
   <div class="evidence-scale">
    <b class="evidence-readout" role="group" aria-label="電子秤的模擬讀數"><span data-evidence-mass>${(seen?end:start).toFixed(1)}</span><small>g</small></b>
   </div>
   <div class="evidence-specimen" aria-hidden="true">
    ${burning?'<div class="evidence-sample"></div>':''}<div class="evidence-photo evidence-outcome"></div>${effect}
   </div>
   <div aria-hidden="true">${evidenceGas(burning)}</div>
  </div>
 </div>`;
}

export function evidenceStudio(s){
 return `<div id="oxidation-comparison" class="evidence-comparison">
 <div class="evidence-comparison-headings">
  ${observationCases.map(({id,kind,time})=>`<header class="evidence-case-heading evidence-case-heading--${id==='burn'?'burn':'rust'}"><i class="evidence-heading-symbol" aria-hidden="true">${kind==='fast'?'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2c1 5-2 6-1 9 1-1 2-2 3-4 4 4 6 8 4 12-2 4-11 5-14-1C2 13 6 8 9 5c-1 4 0 5 1 6 3-3 4-5 3-9Z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 5 3-2 4 4-3 3Zm4 4 9 11-3-1L8 11M3 18h4m-2-2v4M16 3v3m-1.5-1.5h3"/></svg>'}</i><h4 id="evidence-heading-${id}">${oxidationTypes[kind]}反應：${kind==='fast'?'燃燒':'生鏽'}</h4><span>${time}</span></header>`).join('')}
 </div><div class="evidence-pair" aria-label="左邊木炭燃燒，右邊鐵釘生鏽">
 ${observationCases.map(({id,title,time,before,after,mass})=>{
  const seen=s.looked.includes(id),difference=mass.end-mass.start;
  const change=`${difference<0?'↓ 少了':'↑ 多了'} ${Math.abs(difference).toFixed(1)} g`;
  return `<section class="evidence-player" data-evidence-player="${id}" data-phase="${seen?'after':'ready'}" aria-labelledby="evidence-heading-${id}">
   ${evidenceScene(id,time,mass,seen)}
   <section class="evidence-inspector" aria-label="${title}的反應前後">
    <div class="substance-before-after"><div><small>反應前</small><b>${before}</b></div><span aria-hidden="true">→</span><div><small>反應後</small><b data-evidence-product>${seen?after:'播放後顯示'}</b></div></div>
    <p class="evidence-mass-summary"><span>原本是 ${mass.start.toFixed(1)} g</span><b data-evidence-mass-change>${seen?change:'只秤固體'}</b></p>
   </section>
   <div class="evidence-playback" role="group" aria-label="${title}的播放控制">
    <button type="button" class="primary evidence-play" data-play-evidence="${id}" aria-label="${seen?'重播':'播放'}${title}動畫">${seen?'↻ 重播動畫':'▶ 播放動畫'}</button>
   </div>
  </section>`;
 }).join('')}</div></div>`;
}

export function bindEvidence(root,s,update){
 const duration=5200;
 const controls=[];
 for(const player of root.querySelectorAll('[data-evidence-player]')){
  const id=player.dataset.evidencePlayer,{title,after,mass:{start,end}}=observationCases.find(item=>item.id===id);
  const play=player.querySelector('[data-play-evidence]');
  let fire=null,frame=0,elapsed=0,last=0,paused=false,playing=false,alive=true;
  player.style.setProperty('--evidence-duration',duration+'ms');
  function setPaused(value){
   if(!playing||paused===value)return;
   paused=value;
   player.dataset.paused=String(paused);
   if(paused){cancelAnimationFrame(frame);frame=0;}else{last=performance.now();frame=requestAnimationFrame(weigh);}
  }
  const control={pause:()=>setPaused(true),dispose:()=>{alive=false;cancelAnimationFrame(frame);fire?.dispose();}};
  controls.push(control);
  const pauseOthers=()=>controls.forEach(other=>{if(other!==control)other.pause();});
  function finish(){
   frame=0;playing=false;paused=false;
   player.dataset.phase='after';player.removeAttribute('data-paused');
   player.querySelector('[data-evidence-mass]').textContent=end.toFixed(1);
   player.querySelector('[data-evidence-mass-phase]').textContent='反應後';
   player.querySelector('[data-evidence-product]').textContent=after;
   player.querySelector('[data-evidence-mass-change]').textContent=`${end<start?'↓ 少了':'↑ 多了'} ${Math.abs(end-start).toFixed(1)} g`;
   play.textContent='↻ 重播動畫';
   if(!s.looked.includes(id))s.looked.push(id);
   update();
  }
  function weigh(now){
   if(!alive||paused||!playing)return;
   elapsed=Math.min(duration,elapsed+Math.max(0,now-last));last=now;
   const progress=elapsed/duration;
   const [massStart,massEnd]=id==='burn'?[.2,.82]:[.24,.94];
   const amount=Math.max(0,Math.min(1,(progress-massStart)/(massEnd-massStart)));
   player.querySelector('[data-evidence-mass]').textContent=(start+(end-start)*amount).toFixed(1);
   fire?.draw(elapsed/1000,progress);
   if(progress===1)finish();else frame=requestAnimationFrame(weigh);
  }
  play.onclick=()=>{
   pauseOthers();cancelAnimationFrame(frame);elapsed=0;paused=false;playing=true;
   play.setAttribute('aria-label',`重播${title}動畫`);
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
   player.dataset.phase='ready';player.removeAttribute('data-paused');
   const canvas=player.querySelector('.evidence-flame');
   if(canvas&&!fire){fire=createOxidationFire(canvas);player.classList.toggle('has-fire-renderer',Boolean(fire));}
   player.querySelector('[data-evidence-mass]').textContent=start.toFixed(1);
   player.querySelector('[data-evidence-mass-phase]').textContent='反應中';
   player.querySelector('[data-evidence-mass-change]').textContent='只秤固體';
   player.querySelector('[data-evidence-product]').textContent='播放後顯示';
   void player.offsetWidth;
   player.dataset.phase='playing';
   play.textContent='↻ 從頭播放';
   last=performance.now();frame=requestAnimationFrame(weigh);
  };
 }
 return ()=>controls.forEach(control=>control.dispose());
}
export function transferStudio(s){const e=transferCases.find(e=>e.id===s.example),moved=s.transfers[e.id]||[],targets=s.transferTargets?.[e.id]||moved,done=moved.length===e.count,roles=s.transferRoles.includes(e.id);
 const source=j=>`<button class="oxygen-handle" data-oxygen-handle="${j}" aria-label="拿取第${j+1}個氧原子" ${moved.includes(j)?'disabled':''}>${moved.includes(j)?'<span class="oxygen-vacancy">O 已移走</span>':atom('oxygen','O')}</button>`;
 return `<div class="inquiry-question"><h3>氧移到哪裡？</h3></div><div class="transfer-example-tabs" role="group" aria-label="選擇氧轉移反應">${transferCases.map(e=>`<button data-inquiry-example="${e.id}" aria-pressed="${e.id===s.example}">${e.label}${s.transferRoles.includes(e.id)?' ✓':''}</button>`).join('')}</div>
 <section class="manual-transfer" aria-label="${e.label}的氧去向模型"><header><b>已移動 ${moved.length} / ${e.count} 顆氧</b><button class="card-reset" data-transfer-replay>↺ 重新追蹤</button></header><small class="inquiry-model-label">加熱反應的氧去向模型</small><div class="manual-transfer-board"><section class="transfer-donor"><small>氧的出發處</small><h4>${done?e.remaining:e.donor+' '+e.donorFormula}</h4><div class="transfer-source-atoms">${e.id==='magnesium'?source(0)+atom('carbon','C')+source(1):Array.from({length:e.count},(_,j)=>`<div>${atom('copper','Cu')}${source(j)}</div>`).join('')}</div><p>留在這裡的氧：<b>${e.count-moved.length}</b></p></section><div class="manual-transfer-arrow" aria-hidden="true">→</div><section class="transfer-receiver"><small>氧的目的地</small><h4>${done?e.product:e.receiver+' '+e.receiverFormula}</h4><div class="transfer-target-atoms">${Array.from({length:e.count},(_,j)=>`<div>${e.id==='magnesium'?atom('magnesium','Mg'):j===0?atom(e.kind,e.atom):''}<div class="oxygen-destination" data-oxygen-destination="${j}" role="button" tabindex="0" aria-label="第${j+1}個氧的目的地">${targets.includes(j)?atom('oxygen','O'):'<span>O 空位</span>'}</div></div>`).join('')}</div><p>來到這裡的氧：<b>${moved.length}</b></p></section></div><p class="transfer-conservation">同一批氧：${e.count-moved.length} ＋ ${moved.length} ＝ ${e.count}　<span>氧沒有消失</span></p><p class="inquiry-feedback" data-transfer-feedback role="status" ${done?'hidden':''}>${done?'':moved.length?'把最後一顆 O 放到另一個空位。':'把紅色 O 拖到右側空位，也可先點 O 再點空位。'}</p>
 ${done?`<div class="transfer-role-task"><h4>兩邊各發生什麼事？</h4>${[['donor',e.donor],['receiver',e.receiver]].map(([id,name])=>`<fieldset><legend>${name}</legend><button data-transfer-role="${id}:oxidation">得氧，被氧化</button><button data-transfer-role="${id}:reduction">失氧，被還原</button></fieldset>`).join('')}<p data-role-feedback role="status">${roles?'✓ 兩邊都配對正確。':''}</p></div>`:''}
 ${roles?`<div class="transfer-explanation"><strong>${e.equation}</strong><p>${e.donor}是氧化劑，${e.receiver}是還原劑。</p></div>`:''}</section>`;
}
export function bindTransfer(root,s,update) {
 let held=null, roles={}, timer=null;
 const disposers=[], e=transferCases.find(e=>e.id===s.example);
 const feedback=root.querySelector('[data-transfer-feedback]');
 const handles=[...root.querySelectorAll('[data-oxygen-handle]:not(:disabled)')];
 const targets=[...root.querySelectorAll('[data-oxygen-destination]')];
 const zone=root.querySelector('.transfer-target-atoms');

 root.querySelectorAll('[data-inquiry-example]').forEach(b=>b.onclick=()=>{s.example=b.dataset.inquiryExample;update();});
 function move(source,target) {
  if (!transferOxygen(s,e.id,source,target)) {
   feedback.textContent='把紅色 O 放到標有「O 空位」的圓圈裡。';
   return;
  }
  const nextHandle=Array.from({length:e.count},(_,i)=>i).find(i=>!s.transfers[e.id].includes(i));
  update(nextHandle===undefined?'[data-transfer-role]':`[data-oxygen-handle="${nextHandle}"]`);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const arrived=root.querySelector(`[data-oxygen-destination="${target}"] .reaction-atom`);
   arrived?.animate([
    {transform:'scale(.82)',filter:'brightness(1.16)'},
    {transform:'scale(1.09)',offset:.55},
    {transform:'scale(1)',filter:'brightness(1)'}
   ],{duration:360,easing:'ease-out'});
  }
 }
 for (const handle of handles) {
  const source=+handle.dataset.oxygenHandle;
  handle.onclick=()=>{
   held=source;
   handles.forEach(b=>b.setAttribute('aria-pressed',String(b===handle)));
   feedback.textContent='已拿起 O。點右邊標有「O 空位」的圓圈。';
  };
  disposers.push(bindReactantPickup(handle,zone,{
   liftPreview:true,
   onDrop:(x,y)=>{
    const target=targets.find(b=>{
     const box=b.getBoundingClientRect();
     return x>=box.left&&x<=box.right&&y>=box.top&&y<=box.bottom;
    });
    move(source,target?+target.dataset.oxygenDestination:null);
   },
   onMiss:()=>{feedback.textContent='O 已放回出發處。請再拖到右側空位。';},
   onCancel:()=>{held=null;feedback.textContent='O 已放回出發處。';}
  }));
 }
 for (const target of targets) {
  const drop=()=>{if(held!==null)move(held,+target.dataset.oxygenDestination);};
  target.onclick=drop;
  target.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();drop();}};
 }
 root.querySelectorAll('[data-transfer-role]').forEach(b=>b.onclick=()=>{
  const [side,role]=b.dataset.transferRole.split(':');
  roles[side]=role;
  root.querySelectorAll('[data-transfer-role^="'+side+':"]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===b)));
  if (!roles.donor||!roles.receiver) return;
  if (roles.donor==='reduction'&&roles.receiver==='oxidation') {
   if (!s.transferRoles.includes(e.id)) s.transferRoles.push(e.id);
   update();
  } else {
   root.querySelector('[data-role-feedback]').textContent='再看上面的氧原子數量。哪一邊從原來有氧變成 0？哪一邊的數量增加了？';
  }
 });
 root.querySelector('[data-transfer-replay]').onclick=()=>{
  s.transfers[e.id]=[]; s.transferTargets[e.id]=[];
  s.transferRoles=s.transferRoles.filter(id=>id!==e.id);s.answers[2]=null;
  s.transferPauseUntil=Date.now()+1000;update('[data-transfer-replay]');
 };
 const remaining=(s.transferPauseUntil||0)-Date.now();
 if (remaining>0) {
  handles.forEach(b=>b.disabled=true);
  feedback.textContent='已回到反應前，先看氧在哪裡。';
  timer=setTimeout(()=>{
   handles.forEach(b=>b.disabled=false);
   feedback.textContent='現在可以移動紅色 O。';
  },remaining);
 }
 return ()=>{clearTimeout(timer);disposers.forEach(dispose=>dispose());};
}
