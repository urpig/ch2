import {affinityElements,affinityOxides,affinityReaction} from './affinity-free-model.js';

export const affinityBenchArt = {
 bench:'./assets/affinity-lab/heating-bench.png',
 flame:'./assets/affinity-lab/blue-flame.png',
 dish:'./assets/affinity-lab/observation-dish.png'
};
export const powderAssets={white:'./assets/affinity-lab/oxide-white.png',red:'./assets/affinity-lab/oxide-red.png',black:'./assets/affinity-lab/oxide-black.png'};
export const materialAssets={...powderAssets,copper:'./assets/affinity-lab/copper-residue.png',iron:'./assets/affinity-lab/iron-residue.png',silver:'./assets/affinity-lab/silver-powder.png'};

export function mixture(textures) {
 const images = textures.map((texture,index)=>`<img class="free-material-photo material-${texture} mixture-part-${index}" src="${materialAssets[texture]}" alt="" draggable="false">`).join('');
 return `<span class="free-material-mixture ${textures.length>1?'is-mixed':''}" aria-hidden="true">${images}</span>`;
}

// Qualitative, cooled specimen appearances. These are not purity or yield predictions.
const oxideColors={white:'白色',red:'紅棕色',black:'黑色'};
export function affinityAppearance(element,oxide){
 const e=affinityElements.find(x=>x.id===element),o=affinityOxides.find(x=>x.id===oxide);
 const r=affinityReaction(element,oxide);
 const elementTexture=e?(e.id==='C'?'black':e.id==='Cu'?'copper':e.id==='Fe'?'iron':'silver'):null;
 const before=[o?.powder,elementTexture].filter(Boolean);
 const elementText=e?.id==='C'?'黑色碳粉':e?.id==='Cu'?'紅棕色銅粒':e?.id==='Fe'?'灰黑色鐵粒':e?'銀灰色'+e.name+'粒':'';
 const beforeText=!e&&!o?'先放入兩種樣本。':!e?oxideColors[o.powder]+'粉末。':!o?elementText+'。':oxideColors[o.powder]+'粉末與'+elementText+'。';
 if(!r||r.kind==='same')return {before,after:before,beforeText,coolText:'',hotText:'',glow:'none',yellowHot:false};
 if(!r.reacts)return {before,after:before,beforeText,coolText:'冷卻後，未取回金屬'+affinityElements.find(x=>x.id===o.element).name+'。',hotText:o.id==='ZnO'?'氧化鋅受熱變黃；冷卻後會恢復白色。':'持續受熱，觀察冷卻後的樣本。',glow:'none',yellowHot:o.id==='ZnO'};
 const metalTexture=r.metal==='Cu'?'copper':r.metal==='Fe'?'iron':'silver';
 const after=[r.powder,metalTexture].filter(Boolean);
 const metalText=r.metal==='Cu'?'紅棕色銅粒':r.metal==='Fe'?'灰黑色鐵粒':'銀灰色'+affinityElements.find(x=>x.id===r.metal).name;
 return {before,after,beforeText,
  coolText:'可見'+metalText+(r.powder?'，混有'+oxideColors[r.powder]+'粉末':'')+'。',
  hotText:e.id==='Mg'?'反應放出光與熱，接著冷卻觀察。':r.product==='ZnO'?'氧化鋅受熱呈黃色，冷卻後變白。':r.metal==='Zn'?'生成的鋅在高溫下可成蒸氣；冷卻後觀察凝結物。':'混合物灼熱，冷卻後再比較顆粒與顏色。',
  glow:e.id==='Mg'?'bright':'ember',yellowHot:r.product==='ZnO'};
}
