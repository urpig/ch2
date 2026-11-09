import {combustionProducts} from './combustion-products.js';

// Descriptions refer to the specimen, not to the blue alcohol-lamp flame.
export const specimenFlames={
 Cu:{colour:'#8a5e43',text:'銅片：沒有明顯的自身火焰',detail:'銅片加熱後表面變黑；下方藍色火焰來自酒精燈。'},
 Mg:{colour:'#fff9df',text:'鎂帶：耀眼白光',detail:'燃燒發出強烈白光，形成白色氧化鎂。'},
 Zn:{colour:'#62bdae',text:'鋅粉：藍綠色火焰',detail:'充分加熱後燃燒；氧化鋅熱時黃、冷卻後白。'},
 Na:{colour:'#ffc13d',text:'鈉：黃色火焰',detail:'在本次氧充足條件下，以過氧化鈉為代表產物。'},
 S:{colour:'#467bf6',text:'硫：藍色火焰',detail:'藍色是火焰；生成的二氧化硫是無色氣體。'},
 P:{colour:'#fff0c3',text:'紅磷：明亮黃白色火焰',detail:'同時出現白煙；白煙是磷氧化物固體微粒。'},
 C:{colour:'#e76c36',text:'木炭：紅熱發光，通常沒有明顯火焰',detail:'這裡觀察完全燃燒；生成的二氧化碳是無色氣體。'}
};
export const waterReactions={
 Cu:{equation:null,text:'氧化銅加入水中，難溶且無明顯反應',detail:'黑色氧化銅留在杯底。'},
 Mg:{equation:'MgO + H₂O → Mg(OH)₂',text:'氧化鎂加入水中，緩慢反應產生氫氧化鎂',detail:'形成難溶的氫氧化鎂，液相呈鹼性。'},
 Zn:{equation:null,text:'氧化鋅加入水中，難溶且無明顯反應',detail:'白色氧化鋅留在水中。'},
 Na:{equation:'2Na₂O₂ + 2H₂O → 4NaOH + O₂',text:'過氧化鈉溶到水裡產生氫氧化鈉',detail:'同時產生氧氣，溶液呈鹼性。'},
 S:{equation:'SO₂ + H₂O ⇌ H₂SO₃',text:'二氧化硫溶到水裡，形成亞硫酸的酸性溶液',detail:'以國中簡化反應式表示。'},
 P:{equation:'P₄O₁₀ + 6H₂O → 4H₃PO₄',text:'磷氧化物加入水中，反應產生磷酸',detail:'形成酸性溶液。'},
 C:{equation:'CO₂ + H₂O ⇌ H₂CO₃',text:'二氧化碳溶到水裡，部分與水反應產生碳酸',detail:'反應可逆，溶液呈酸性。'},
 CO:{equation:null,text:'CO 加入水：無明顯反應',detail:'一氧化碳難溶於水。'}
};
export function reactionObservations(key,{ignited=false,heatMs=0,completed=false,waterAdded=false}={}){
 const reacting=completed||ignited||(key==='Cu'&&heatMs>0);
 return {burn:reacting&&combustionProducts[key]?{...combustionProducts[key],...specimenFlames[key]}:null,water:completed&&waterAdded?waterReactions[key]||null:null};
}
export function mountReactionObservations(board,key,{completed=false}={}){
 const live=document.createElement('aside');live.className='specimen-reaction-live';live.hidden=true;live.setAttribute('aria-live','polite');live.setAttribute('aria-atomic','true');board.append(live);
 const record=document.createElement('section');record.className='combustion-reaction-record';record.setAttribute('aria-label','燃燒與加水的反應紀錄');record.innerHTML='<div data-burn-reaction hidden></div><div data-water-reaction hidden></div>';board.after(record);
 const burn=record.querySelector('[data-burn-reaction]'),wet=record.querySelector('[data-water-reaction]');wet.setAttribute('aria-live','polite');
 let lastBurn=false,lastWater=false;
 return function update(state={}){
  const data=reactionObservations(key,{...state,completed});
  if(data.burn&&!lastBurn){const d=data.burn,html=`<b><i style="--specimen-colour:${d.colour}" aria-hidden="true"></i>${d.text}</b><strong class="specimen-equation">${d.equation}</strong><small>${d.detail}</small>`;live.innerHTML=`<b><i style="--specimen-colour:${d.colour}" aria-hidden="true"></i>${d.text}</b><strong class="specimen-equation">${d.equation}</strong>`;burn.innerHTML='<span class="reaction-record-step">① 與氧反應 · 氧化</span>'+html;lastBurn=true;}
  live.hidden=completed||!data.burn;board.classList.toggle('show-specimen-reaction',!live.hidden);burn.hidden=!completed||!data.burn;
  if(data.water&&!lastWater){const d=data.water;wet.innerHTML='<span class="reaction-record-step">② 產物加入水後</span><b>'+d.text+'</b>'+(d.equation?'<strong class="specimen-equation">'+d.equation+'</strong>':'')+'<small>'+d.detail+'</small>';lastWater=true;}
  wet.hidden=!data.water;record.hidden=burn.hidden&&wet.hidden;
 };
}
