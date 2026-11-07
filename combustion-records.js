import {materialCases} from './journey-cards.js';
import {sampleVisual} from './specimens.js';
import {specimenFlames,waterReactions} from './combustion-observations.js';
import {combustionProducts} from './combustion-products.js';
import {bottleSolutions} from './bottle-ph-state.js';
import {metals,nonmetals} from './model.js';

export function combustionRecordsMarkup(type,has){
 return `<table class="current-sample-table all-sample-records"><caption>你的觀察表 · 燃燒、產物與遇水後的變化</caption><thead><tr><th>樣本</th><th>火焰的顏色</th><th>產物與化學反應式</th><th>遇水後的產物與反應式</th><th>酸鹼性</th></tr></thead><tbody>${materialCases[type].map(([key,name])=>{
  const burned=has(key+':burn'),wet=has(key+(bottleSolutions[key]?':ph':':wet')),kind=bottleSolutions[key]||(metals[key]||nonmetals[key]).litmus;
  return `<tr data-record-sample="${key}"><th scope="row" class="comparison-sample"><div class="comparison-sample-art">${sampleVisual(key,false,true,'records-'+key,{form:{Mg:'ribbon',Cu:'sheet',Zn:'powder',Na:'block',S:'powder',P:'powder'}[key]})}</div><span>${name}</span></th><td class="flame-colour-record">${burned?tableFlame(key):'尚未測試'}</td><td class="combustion-product-record">${burned?`<b>${combustionProducts[key].product}</b><span class="combustion-record-equation">${combustionProducts[key].equation}</span>`:'尚未測試'}</td><td class="combustion-product-record water-product-record">${wet?`<b>${['Cu','Zn'].includes(key)?'難溶於水':waterReactions[key].text}</b>${waterReactions[key].equation?`<span class="combustion-record-equation">${waterReactions[key].equation}</span>`:''}`:'尚未測試'}</td><td>${wet?`<b class="acidity-${kind}">${kind==='acid'?'酸性':kind==='base'?'鹼性':'近中性（水相）'}</b>`:'尚未測試'}</td></tr>`;
 }).join('')}</tbody></table>`;
}
function tableFlame(key){
 const label={Cu:'沒有',Mg:'白色',Zn:'藍綠色',Na:'黃色',S:'藍色',P:'黃白色',C:'沒有'}[key];
 const colour=specimenFlames[key].colour,noFlame=key==='Cu'||key==='C';
 return `<span class="flame-table-visual"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="table-glow-${key}"><stop stop-color="${colour}" stop-opacity=".85"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient></defs>${noFlame?(key==='C'?'<ellipse cx="32" cy="45" rx="22" ry="12" fill="url(#table-glow-C)"/><path d="M15 47L21 37 34 40 41 34 51 49 33 54Z" fill="#343b36"/><path d="M23 43l8 6 9-5" fill="none" stroke="#e97530" stroke-width="2"/>':'<path d="M10 47L41 39 54 48 23 56Z" fill="#323c36" stroke="#8f7060"/>'):`<ellipse cx="32" cy="33" rx="30" ry="31" fill="url(#table-glow-${key})"/><path d="M16 53C3 37 27 28 28 5C46 18 34 27 47 35C57 46 47 57 32 58Z" fill="${colour}"/><path d="M24 52Q19 42 33 27Q45 44 38 54Z" fill="#fffde3"/>`}</svg><span>${label}</span></span>`;
}
