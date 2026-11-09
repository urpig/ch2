import {activitySamples,metalConditions,activityReaction} from './metal-activity-model.js';
import {specimenArt} from './oxygen-affinity.js';

const clues={
 rapid:'快速產氣，樣本逐漸消耗',violent:'快速放熱、產氣，可能噴濺',cloudy:'產生氣泡，水變白濁',
 gas:'冒出氫氣，樣本逐漸溶解',slow:'反應較慢，可產生氫氣',coating:'表面形成固體層，可能妨礙後續反應',
 still:'短時間沒有明顯變化',protected:'表面保護膜使反應不明顯',passivated:'形成保護層，發生鈍化',
 conditional:'結果受形態、溫度等條件影響',dissolve:'樣本逐漸溶解','slow-dissolve':'樣本緩慢溶解',
 brown:'溶解，產生棕色氣體',blue:'溶解，溶液呈藍色',green:'溶解，溶液呈藍綠色',gold:'溶解，溶液呈黃色'
};

export function activityRecordsMarkup(records=[]){
 const seen=new Set(records.map(({symbol,condition})=>symbol+':'+condition));
 const groups=[
  ['cold',['K','Na','Ca'],'遇到冷水即可反應'],
  ['dilute',['Mg','Al','Zn','Cr','Fe','Sn','Pb'],'可與稀鹽酸反應；有些較慢或受表面膜影響'],
  ['concentrated',['Cu','Hg','Ag'],'可與濃硝酸反應'],
  ['aqua',['Pt','Au'],'可用王水溶解；鉑的反應較慢']
 ].map(([condition,symbols,note])=>{
  const tried=activitySamples.filter(({symbol})=>symbols.includes(symbol)&&seen.has(symbol+':'+condition));
  return tried.length?`<p><b>${tried.map(({name,symbol})=>name+' '+symbol).join('、')}</b>：${note}。</p>`:'';
 }).join('');
 return `<section class="activity-records" aria-label="元素與試劑的觀察紀錄"><div class="activity-record-scroll" tabindex="0" role="region" aria-label="元素活性觀察表，可左右捲動"><table class="current-sample-table activity-observation-table"><caption>你的觀察表 · 不同元素遇到水與酸的變化</caption><thead><tr><th scope="col">樣本</th>${metalConditions.map(({label})=>`<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${activitySamples.map(({symbol,name})=>`<tr data-activity-record="${symbol}"><th scope="row"><div class="activity-record-specimen">${specimenArt(symbol)}</div><span>${name} ${symbol}</span></th>${metalConditions.map(({id})=>{
  if(!seen.has(symbol+':'+id))return `<td data-record-condition="${id}" class="activity-untested">尚未測試</td>`;
  const r=activityReaction(symbol,id),changed=!['still','protected','passivated','conditional'].includes(r.effect);
  return `<td data-record-condition="${id}" data-record-result="${r.effect}" class="${changed?'activity-reacted':'activity-no-change'}"><b>${r.label}</b><span>${clues[r.effect]}</span></td>`;
 }).join('')}</tr>`).join('')}</tbody></table></div>${groups?`<div class="activity-record-conclusions" aria-label="從操作紀錄整理的重點">${groups}</div>`:''}</section>`;
}
