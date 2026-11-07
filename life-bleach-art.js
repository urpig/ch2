import {laboratoryBackdrop,gasChamber} from './life-laboratory-scene.js';
import {laboratoryReagent} from './lab-reagent-art.js';

const items={
 peroxide:{name:'豆干',agent:'過氧化氫'},
 chlorine:{name:'衣服布料',agent:'次氯酸鈉'},
 sulfur:{name:'竹筷',agent:'二氧化硫'}
};

export function bleachSupply(key){return laboratoryReagent(key);}

export function bleachLabArt(key,complete){
 const {name,agent}=items[key];
 return `<div class="life-lab-room bleach-lab-room" role="img" aria-label="實驗室中${agent}作用於${name}的對照實驗">
  ${laboratoryBackdrop(complete)}
  <div class="lab-specimen-groups">${[true,false].map(treated=>`<figure class="${treated?'lab-experimental':'lab-control'}">
   <div class="lab-specimen-photo"><div class="lab-specimen-original"></div>${treated&&key!=='sulfur'?'<div class="lab-specimen-treated"></div>':''}</div>
   <figcaption><b>${treated?'實驗組':'對照組'}</b><span>${treated?'加入'+agent:'未加漂白劑'}</span></figcaption>
  </figure>`).join('')}</div>
  ${key==='sulfur'?gasChamber():''}
 </div>`;
}
