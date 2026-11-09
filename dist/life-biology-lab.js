import {biologyStages} from './life-biology-model.js';
import {photosynthesisArt} from './photosynthesis-art.js';
import {respirationArt} from './respiration-art.js';
import {moleculeModel} from './bio-molecule-art.js';
import {observationTimeline} from './observation-timeline.js';
import {bindLifePlayback} from './life-autoplay.js';
import {biologyEquationArt} from './bio-equation-art.js';
const biologyArt=key=>key==='photo'?photosynthesisArt():respirationArt();

function biologyEquation(key,complete){
 return `<div class="life-paired-equation bio-arrow-equation">${biologyEquationArt(key,complete)}${key==='resp'?'<span class="bio-equation-energy">同時釋放能量</span>':''}</div>`;
}

export function biologyMarkup(key,complete=false){
 const photo=key==='photo',steps=biologyStages[key];
 return `<section class="life-paired-reaction life-biology-lab bio-whole life-auto-observation" data-glossary-skip data-life-observation data-life-reaction="${key}" data-phase="${complete?'complete':'ready'}" data-bio-step="${complete?2:0}" aria-label="${photo?'光合作用':'有氧呼吸'}整體反應觀察">
 <div class="reaction-heading"><div><small>觀看整體反應</small><h4>${photo?'光合作用：水與二氧化碳變成什麼？':'有氧呼吸：養分與氧氣變成什麼？'}</h4></div><div class="life-playback-actions"><button type="button" class="text-button" data-life-retry>${complete?'↻ 重播動畫':'▶ 播放動畫'}</button>${observationTimeline()}</div></div>
 <div class="life-mix-workbench">
  <div class="life-reactant-rack bio-molecule-rack"><small>反應物</small>${steps.map(s=>`<div class="bio-supply-item"><div class="bio-molecule-rest">${moleculeModel(s.id,`supply-${key}-${s.id}`)}</div><strong>${s.label}</strong></div>`).join('')}</div>
  <div class="life-reactor-panel">
   <div class="life-reactor-condition"><span>${photo?'光照、葉綠素參與':'有氧條件'}</span><small>立體放大示意</small></div>
   <div class="bio-stage-art">${biologyArt(key)}
    <div class="bio-art-labels" aria-hidden="true"><span class="bio-display-phase" data-bio-display-phase>${complete?'觀察後':'反應前'}</span>
    <b class="bio-organelle-title">${photo?'葉綠體':'粒線體'}<small>${photo?'葉片內部':'細胞內部'}</small></b>
    <div class="bio-model-products" hidden data-bio-model-products><span>${photo?'氧氣 O₂':'二氧化碳 CO₂'}</span><span>${photo?'葡萄糖 C₆H₁₂O₆':'水 H₂O'}</span></div></div>
   </div>
  </div>
 </div>
 <p class="life-observe-status" data-life-animation-status role="status"></p>${biologyEquation(key,complete)}</section>`;
}

export function bindBiologyLab(scene,onComplete){
 const key=scene.dataset.lifeReaction,photo=key==='photo';
 const status=scene.querySelector('[data-life-animation-status]'),retry=scene.querySelector('[data-life-retry]');
 const equationPaths=scene.querySelector('[data-bio-equation-paths]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const art=scene.querySelector('.bio-stage-art'),particles=[...art.querySelectorAll('[data-bio-molecule]')];
 const organelle=art.querySelector('[data-bio-organelle]'),light=art.querySelector('[data-bio-light]'),beam=art.querySelector('[data-bio-beam]');
 const phaseLabel=art.querySelector('[data-bio-display-phase]'),productLabels=art.querySelector('[data-bio-model-products]');
 const fraction=(p,from,to)=>Math.max(0,Math.min(1,(p-from)/(to-from))),ease=p=>p*p*(3-2*p);
 function paint(p){
  scene.style.setProperty('--bio-progress',String(p));
  phaseLabel.textContent=p===0?'反應前':p===1?'觀察後':'縮時觀察';
  const show=(index,opacity,x,y)=>{particles[index].setAttribute('opacity',String(opacity));particles[index].setAttribute('transform',`translate(${x} ${y})`);};
  const approach=reduced?0:ease(fraction(p,.03,.49)),arc=Math.sin(approach*Math.PI),remaining=1-ease(fraction(p,.29,.52));
  show(0,remaining,237*approach,-175*approach-31*arc);
  show(1,remaining,-224*approach,-167*approach-27*arc);
  const emerging=ease(fraction(p,.54,.9)),settling=reduced?0:1-emerging;
  show(2,emerging,176*settling,-117*settling);show(3,emerging,-171*settling,-122*settling);
  const illumination=reduced?0:ease(fraction(p,.12,.41))*(1-ease(fraction(p,.6,.93))),scale=1+.052*illumination;
  organelle.setAttribute('transform',`translate(480 254) scale(${scale}) translate(-480 -254)`);
  light.setAttribute('opacity',String(illumination*.72));beam?.setAttribute('opacity',String(.25+illumination*.75));
  productLabels.hidden=emerging<.24;productLabels.style.opacity=String(fraction(emerging,.24,.88));
  equationPaths.removeAttribute('hidden');
  equationPaths.closest('svg').setAttribute('viewBox','0 0 800 210');
  status.textContent=p===1?(photo?'水被氧化成氧氣；二氧化碳被還原，用來合成養分。':'葡萄糖被氧化成二氧化碳；氧氣被還原成水。'):p===0?'':photo?'觀察水、二氧化碳與產物的變化。':'觀察養分、氧氣與產物的變化。';
 }
 const dispose=bindLifePlayback(scene,{seconds:5.6,paint,initialComplete:scene.dataset.phase==='complete',onStart:()=>onComplete('start'),onComplete:()=>onComplete('complete')});
 return dispose;
}
