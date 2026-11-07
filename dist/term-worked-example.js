import {storySpeech} from './story-dialogue.js';
import {affinityAppearance,affinityBenchArt,mixture} from './affinity-appearance.js';
import {termDemoFrame,termExperimentFrame,freshTermDemo,termWorkedReady} from './term-demo-model.js';

export const workedTermExample = {
 metal:'鋅', symbol:'Zn', oxide:'氧化銅', donor:'Cu',
 metalOxide:'氧化鋅', releasedMetal:'銅', reacts:true, equation:'Zn + CuO → ZnO + Cu'
};

const products = affinityAppearance('Zn','CuO').after;
const greyPowder = mixture(['silver']);
const stages = {
 before: [0,'準備樣本','左邊是黑色氧化銅，右邊是銀灰色鋅粉。','空坩堝'],
 oxide: [0,'加入氧化銅','黑色氧化銅粉末落入坩堝。','黑色粉末'],
 zinc: [0,'加入鋅粉','銀灰色鋅粉落在黑色粉末旁。','兩種粉末'],
 mixing: [0,'混合粉末','兩種粉末混成深灰色。','深灰色混合物'],
 heating: [1,'加熱中','本生燈的藍色火焰加熱坩堝。','深灰色混合物'],
 reacting: [2,'正在反應','火焰熄滅後，粉末仍發亮，紅熱區逐漸擴散。','紅熱的粉末'],
 cooling: [3,'冷卻中','亮光退去，受熱偏黃的氧化鋅逐漸轉白。','氧化鋅由黃轉白'],
 complete: [3,'冷卻後','深灰色混合物裡，出現白色粉末與紅棕色固體。','白色粉末與紅棕色固體']
};

function experimentSample(animated) {
 const before = `<div class="term-mixture-before">${animated?greyPowder:mixture(['black','silver'])}</div>`;
 if (!animated) return before;
 return `<div class="term-oxide-pile">${mixture(['black'])}</div>
  <div class="term-zinc-pile">${mixture(['silver'])}</div>
  ${before}
  <div class="term-mixture-after">${mixture(products)}</div>
  <div class="term-ember"></div>`;
}

function sampleDish(contents) {
 return `<div class="free-specimen-dish" aria-hidden="true">
  <img class="free-dish-photo" src="${affinityBenchArt.dish}" alt="" draggable="false">
  <div class="free-dish-contents">${contents}</div>
 </div>`;
}

function experimentDish(title,description,animated=false) {
 return `<figure class="term-specimen ${animated?'term-specimen-live':'term-specimen-reference'}">
  <figcaption><b>${title}</b><span ${animated?'data-experiment-sample':''}>${description}</span></figcaption>
  ${sampleDish(experimentSample(animated))}
 </figure>`;
}

function workedExplanation() {
 return `<div class="term-worked-explanation" data-worked-explanation hidden aria-label="氧轉移時的變化">
  <section class="term-definition-side term-definition-loss"><h4>氧化銅</h4><p>失去氧 → <strong>被還原</strong></p><small>留下銅 Cu</small></section>
  <section class="term-definition-side term-definition-gain"><h4>鋅</h4><p>得到氧 → <strong>被氧化</strong></p><small>形成氧化鋅 ZnO</small></section>
 </div>`;
}

function sampleTray(material,label,texture) {
 return `<div class="term-sample-tray term-tray-${material}" aria-hidden="true">${sampleDish(mixture([texture]))}</div>
  <span class="term-sample-label term-label-${material}">${label}</span>`;
}

const fallingGrains = Array.from({length:32},(_,i)=>
 `<i style="--grain-x:${15+(i*43)%69}%;--grain-size:${1.5+(i*11)%7}%;--grain-start:${(i*.023).toFixed(3)};--grain-fall:${228+(i*13)%52}%"></i>`
).join('');

function experimentMarkup() {
 return `<div class="term-demonstration" data-term-experiment data-phase="before">
  <figure class="term-experiment-view">
   <figcaption><b>實驗台</b><small>自製實驗模擬</small></figcaption>
   <div class="free-real-bench term-experiment-bench">
    <img class="free-bench-photo" src="${affinityBenchArt.bench}" alt="本生燈、三腳架和坩堝" draggable="false">
    ${sampleTray('oxide','氧化銅 CuO','black')}
    ${sampleTray('zinc','鋅粉 Zn','silver')}
    <div class="free-crucible-fill" aria-hidden="true">${experimentSample(true)}</div>
    <div class="free-burner-flame" aria-hidden="true"><img src="${affinityBenchArt.flame}" alt="" draggable="false"></div>
    <img class="free-bench-occluder" src="${affinityBenchArt.bench}" alt="" draggable="false" aria-hidden="true">
    <span class="term-heat-reflection" aria-hidden="true"></span>
    <span class="term-powder-stream" aria-hidden="true">${fallingGrains}</span>
    <span class="term-stirrer" aria-hidden="true"></span>
   </div>
   <p class="term-experiment-status" role="status"><b data-experiment-stage>${stages.before[1]}</b><span data-experiment-note>${stages.before[2]}</span></p>
  </figure>
  <div class="term-observation-panes" data-worked-oxygen>
   <section class="term-specimen-comparison" aria-label="物質加熱前後對照">
    <h4>物質的前後變化</h4>
    <div class="term-specimen-pair">${experimentDish('加熱前','黑色氧化銅＋銀灰色鋅粉')}${experimentDish('加熱後','觀察加熱後的變化',true)}</div>
   </section>
   ${oxygenEvidencePanel(workedTermExample,{label:'同時看氧的去向'})}
   ${workedExplanation()}
  </div>
 </div>`;
}

export function paintTermExperiment(experiment,panel,value,reduced=false,playing=false) {
 const frame = termExperimentFrame(value,reduced);
 const style = experiment.style;
 for (const [material,pour] of [['oxide',frame.oxide],['zinc',frame.zinc]]) {
  for (const [name,amount] of Object.entries(pour)) style.setProperty('--term-'+material+'-'+name,amount);
 }
 style.setProperty('--term-mixed',frame.mixed);
 style.setProperty('--term-stir',frame.stir);
 style.setProperty('--term-stir-depth',frame.stirDepth);
 style.setProperty('--term-product-edge',frame.travel*100+'%');
 style.setProperty('--term-warmth',frame.warmth);
 style.setProperty('--term-glow',frame.glow);
 style.setProperty('--term-glow-position',frame.glowPosition+'%');
 if (panel) paintOxygenPanel(panel,workedTermExample,frame.oxygenTime,reduced,playing);
 experiment.querySelector('[data-worked-explanation]').hidden=frame.travel===0;

 if (experiment.dataset.phase===frame.stage) return;
 experiment.dataset.phase=frame.stage;
 const [,stage,note,sample] = stages[frame.stage];
 experiment.querySelector('[data-experiment-stage]').textContent=stage;
 experiment.querySelector('[data-experiment-note]').textContent=note;
 const readout=experiment.querySelector('[data-experiment-sample]');
 if(readout)readout.textContent=frame.travel===0?'等待反應':sample;
}

export function oxygenPlaybackControls(label) {
 return `<div class="term-tutor-playback">
  <button type="button" class="primary" data-term-play>${label}</button>
  <button type="button" class="secondary" data-term-pause disabled>暫停</button>
 </div>`;
}

export function workedExampleMarkup(state=freshTermDemo()) {
 const observed=state.exampleObserved, complete=termWorkedReady(state);
 return `<section class="term-worked-example" aria-labelledby="term-worked-title">
  <header class="term-tutor-heading">
   <small>阿公的示範</small>
   <h3 id="term-worked-title" tabindex="-1">鋅怎麼把銅找回來？</h3>
  </header>
  ${oxygenPlaybackControls(observed?'↻ 重播實驗動畫':'▶ 先看實驗動畫')}
  ${experimentMarkup()}
  <div data-worked-followup ${complete?'':'hidden'}>
  <p class="term-equation">${workedTermExample.equation}</p>
  <div class="story-dialogue dialogue-stack term-result-dialogue" aria-label="阿公解釋氧化還原與反應角色">
   ${storySpeech('grandpa','「我們剛剛看到氧化銅被還原，變成銅金屬；同時，鋅被氧化，變成氧化鋅。有物質被還原，就一定會有物質被氧化，氧化與還原反應必定會一起發生喔！」')}
   ${storySpeech('grandpa','「氧化銅讓鋅被氧化，自己被還原，所以氧化銅是氧化劑。鋅讓氧化銅失去氧，自己被氧化，所以鋅是還原劑。」')}
  </div>
  </div>
 </section>`;
}

function particle(label,classes) {
 return `<span class="term-ball ${classes}">${label}</span>`;
}

export function oxygenEvidencePanel(example,{label,after=false,animated=false,roles=[],roleRow=false}={}) {
 const labels = [
  [example.oxide,example.donor+'O',example.releasedMetal,example.donor],
  [example.metal,example.symbol,example.metalOxide,example.symbol+'O']
 ];
 const lane = ([before,formula,product,productFormula],i) => {
  const role=i===0?'oxidant':'reductant', placed=roles.includes(role);
  return `<span><b data-before>${before} <small>${formula}</small></b>${example.reacts?`<b data-after>${product} <small>${productFormula}</small></b>`:''}
   ${roleRow?`<em class="term-role-pin" ${placed?'':'aria-hidden="true"'}>${i===0?'氧化劑':'還原劑'}</em>`:''}</span>`;
 };
 return `<figure class="term-evidence-card" ${animated?'data-term-animated':''} data-phase="${after?'complete':'before'}">
  <figcaption><b>${label}</b><small data-term-phase></small></figcaption>
  <div class="term-lanes">${labels.map(lane).join('')}</div>
  <div class="term-particles" aria-hidden="true">
   <span class="term-track"></span>
   <span class="term-bond term-bond-old"></span><span class="term-bond term-bond-new"></span>
   ${particle(example.donor,'term-base-donor term-ball-'+example.donor)}
   ${particle(example.symbol,'term-base-receiver term-ball-'+example.symbol)}
   ${particle('O','term-ball-oxygen')}
  </div>
 </figure>`;
}

export function paintOxygenPanel(panel,example,value,reduced=false,playing=false) {
 const frame = termDemoFrame(value,example.reacts,reduced);
 panel.style.setProperty('--oxygen-left',frame.left+'%');
 panel.style.setProperty('--oxygen-top',frame.top+'%');
 panel.style.setProperty('--old-bond',String(1-frame.travel));
 panel.style.setProperty('--new-bond',String(frame.travel));
 panel.style.setProperty('--oxygen-travel-glow',reduced?0:Math.sin(frame.travel*Math.PI));
 const animated=panel.hasAttribute('data-term-animated');
 const phase=frame.stage==='before'&&playing?'starting':frame.stage;
 panel.dataset.phase=phase;
 panel.querySelector('[data-term-phase]').textContent = frame.stage==='complete'?(example.reacts?'氧移動了':'氧留在原處'):playing?(animated?'加熱中':'追蹤紅色 O'):animated?'等待播放':'紅球 O 代表氧';
}
