import {observationTimeline} from './observation-timeline.js';
import {laboratoryTransfer,bindLaboratoryTransfer} from './lab-reagent-art.js';
import {appleMarkup,bindAppleComparison} from './apple-comparison.js';
import {lifeBiology,lifeBleaches} from './everyday-redox-model.js';
import {bleachSupply} from './life-bleach-art.js';
import {lifeReactorArt} from './life-reactor-art.js';
import {lifeLabDefinition} from './life-reactant-model.js';
import {bindLifePlayback} from './life-autoplay.js';
import {biologyMarkup,bindBiologyLab} from './life-biology-lab.js';
import {lifeEquationMarkup,showLifeEquation} from './life-equation-art.js';

// Each entry records both sides of one representative reaction.
export function lifeReactionPair(key){
 if(lifeBiology[key]){
  const b=lifeBiology[key],oxidation=b.paths.find(p=>p.role==='oxidation'),reduction=b.paths.find(p=>p.role==='reduction');
  return {title:b.name,equation:b.equation,condition:b.condition,oxidation,reduction,finding:b.reason};
 }
 if(lifeBleaches[key]){
  const b=lifeBleaches[key],agent={from:b.name+' '+b.formula,to:b.role==='oxidation'?'氧化後的產物':'還原後的產物'},dye={from:'色素',to:'漂白'};
  return {title:b.name+'的漂白作用',condition:'適用色素與合適條件下的代表反應',oxidation:b.role==='oxidation'?agent:dye,reduction:b.role==='reduction'?agent:dye,finding:b.reason};
 }
 if(key==='food')return {title:'維生素 C 延緩蘋果褐變',condition:'相同蘋果、空氣與溫度；比較有無維生素 C',oxidation:{from:'維生素 C',to:'氧化後的維生素 C'},reduction:{from:'褐變中間產物',to:'還原成較不易褐變的物質'},finding:'維生素 C 自己被氧化，幫部分褐變中間產物還原；保護用完後，蘋果仍會逐漸變褐。'};
 throw new Error('Unknown life reaction: '+key);
}
const atom=(name)=>`<i class="life-molecule-atom life-atom-${name}" aria-hidden="true">${name}</i>`;
function substance(label){
 let icon='';
 if(label.includes('CO₂'))icon=['O','C','O'].map(atom).join('');
 else if(label.includes('H₂O₂'))icon=['H','O','O','H'].map(atom).join('');
 else if(label.includes('H₂O'))icon=['H','O','H'].map(atom).join('');
 else if(label.includes('SO₂'))icon=['O','S','O'].map(atom).join('');
 else if(label.includes('NaClO'))icon=['Na','Cl','O'].map(atom).join('');
 else if(label.includes('O₂'))icon=['O','O'].map(atom).join('');
 else if(label.includes('C₆H₁₂O₆'))icon='<i class="life-sugar-symbol" aria-hidden="true">葡萄糖</i>';
 else icon=`<i class="life-substance-symbol ${label.includes('色')?'life-pigment-symbol':''}" aria-hidden="true">${label.includes('維生素')?'C':label.includes('色')?'◈':'◇'}</i>`;
 return `<div class="life-molecule">${icon}</div><strong>${label}</strong>`;
}
export function lifePairedMarkup(key,complete=false){
 if(key==='food')return appleMarkup(complete);
 if(key==='photo'||key==='resp')return biologyMarkup(key,complete);
 const p=lifeReactionPair(key),lab=lifeLabDefinition(key);
 return `<section class="life-paired-reaction life-manual-reaction life-auto-observation" data-glossary-skip data-life-observation data-life-reaction="${key}" data-phase="${complete?'complete':'ready'}" style="--life-progress:${complete?1:0}" aria-label="${p.title}的氧化還原配對">
 <div class="reaction-heading"><div><h4>${p.title}</h4></div><div class="life-playback-actions"><button type="button" class="text-button" data-life-retry>${complete?'↻ 重播動畫':'▶ 播放動畫'}</button>${observationTimeline()}</div></div>
 <p class="life-mix-instruction">左側加入${lab.inputs[0].label}，右側保留原樣。比較兩組的顏色。</p>
 <div class="life-mix-workbench life-bleach-workbench"><div class="life-reactor-panel"><div class="life-reactor-art life-reactor-${key}">${lifeReactorArt(key,complete)}${laboratoryTransfer(key)}<div class="life-reactant bleach-bench-reagent">${bleachSupply(key)}</div></div>
 </div></div>
 <p class="life-observe-status" data-life-animation-status role="status">${complete?'實驗組的顏色比對照組淡了。':''}</p>
 ${lifeEquationMarkup(key,complete)}
 </section>`;
}
export function bindLifePairedReaction(scene,onComplete){
 if(scene?.dataset.lifeReaction==='food')return bindAppleComparison(scene,onComplete);
 if(!scene)return ()=>{};
 if(['photo','resp'].includes(scene.dataset.lifeReaction))return bindBiologyLab(scene,onComplete);
 const key=scene.dataset.lifeReaction,retry=scene.querySelector('[data-life-retry]'),status=scene.querySelector('[data-life-animation-status]');
 const seconds={peroxide:4.6,chlorine:4.8,sulfur:5.2}[key];
 const paintTransfer=bindLaboratoryTransfer(scene,key,seconds);
 const paint=p=>{
  showLifeEquation(scene,p===1);
  scene.style.setProperty('--life-progress',String(p));scene.dataset.reactionProgress=p.toFixed(3);
  const change=Math.max(0,Math.min(1,(p-.26)/.69));
  const fade=change*change*(3-2*change);
  const wetting=Math.max(0,Math.min(1,(p*seconds-1.03)/.72));
  scene.style.setProperty('--specimen-fade',String(fade));
  scene.style.setProperty('--specimen-wet',key==='sulfur'?'0':String(wetting*(1-fade)*.78));
  scene.style.setProperty('--specimen-replace',String(Math.max(0,(fade-.88)/.12)));
  paintTransfer(p);
  status.textContent=p===1?'實驗組的顏色比對照組淡了。':p===0?'':key==='sulfur'?'觀察氣體注入後，罩內竹筷的顏色怎麼變。':'觀察試劑接觸樣本後，哪一組先褪色。';
 };
 const dispose=bindLifePlayback(scene,{seconds,paint,initialComplete:scene.dataset.phase==='complete',onStart:()=>onComplete('start'),onComplete:()=>onComplete('complete')});
 return dispose;
}
