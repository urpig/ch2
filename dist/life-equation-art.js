// Representative redox changes, not balanced overall equations. The pigments in
// food, cloth and bamboo are mixtures, so they must not share an invented formula.
// Ascorbate reduces quinone intermediates; peroxide/hypochlorite oxidise suitable
// pigments. The SO2 example follows the lesson's reducing-bleach model.
export const lifeEquationChanges={
 food:{
  name:'維他命 C 與蘋果保鮮',
  changes:[
   {from:['維他命 C','C₆H₈O₆'],to:['氧化後的維他命 C','C₆H₆O₆'],role:'oxidation'},
   {from:['褐變中間物質','醌類'],to:['較不易褐變的物質','酚類'],role:'reduction'}
  ]
 },
 peroxide:{
  name:'過氧化氫漂白',
  changes:[
   {from:['過氧化氫','H₂O₂'],to:['水','H₂O'],role:'reduction'},
   {from:['色素',''],to:['褪色後的物質',''],role:'oxidation'}
  ]
 },
 chlorine:{
  name:'次氯酸鈉漂白',
  changes:[
   {from:['次氯酸鈉','NaClO'],to:['氯化鈉','NaCl'],role:'reduction'},
   {from:['色素',''],to:['褪色後的物質',''],role:'oxidation'}
  ]
 },
 sulfur:{
  name:'二氧化硫的還原漂白',
  changes:[
   {from:['二氧化硫','SO₂'],to:['硫酸根','SO₄²⁻'],role:'oxidation'},
   {from:['色素',''],to:['褪色後的物質',''],role:'reduction'}
  ]
 }
};

const roleName=role=>role==='oxidation'?'被氧化':'被還原';
const substanceText=([name,formula])=>name+(formula?' '+formula:'');

export function lifeEquationMarkup(key,complete=false){
 const data=lifeEquationChanges[key];
 if(!data)throw new Error('Unknown life equation: '+key);
 if(key==='food')return '<section class="life-paired-equation life-example-equation life-antioxidant-summary" data-life-redox-equation="food"><b>維他命C被氧化，蘋果沒有影響</b></section>';
 const x=[210,390,610,830];
 const terms=[...data.changes.map(c=>c.from),...data.changes.map(c=>c.to)];
 const layout={height:210,name:94,formula:132,sign:122,start:145};
 return `<section class="life-paired-equation life-example-equation" data-life-redox-equation="${key}"  aria-label="${data.name}的反應式與氧化還原箭頭">
 <svg class="life-equation-art" viewBox="0 0 1000 ${layout.height}" role="img" aria-label="${data.changes.map(c=>substanceText(c.from)+roleName(c.role)+'成'+substanceText(c.to)).join('；')}">
  <g class="life-equation-terms" text-anchor="middle">${terms.map(([name,formula],i)=>`<g data-equation-species="${i}"><text class="life-equation-name${formula?'':' life-equation-word'}" x="${x[i]}" y="${formula?layout.name:layout.formula}">${formula?'':name}</text><text class="life-equation-formula" x="${x[i]}" y="${layout.formula}">${formula}</text></g>`).join('')}<g class="life-equation-sign"><text x="300" y="${layout.sign}">＋</text><text x="500" y="${layout.sign}">→</text><text x="700" y="${layout.sign}">＋</text></g></g>
  ${data.changes.map((c,i)=>{const above=c.role==='reduction',start=above?72:layout.start,tip=above?-11:11,bend=above?30:165,label=above?20:198;return `<g class="bio-equation-arrow is-${c.role}" data-equation-from="${substanceText(c.from)}" data-equation-to="${substanceText(c.to)}" data-equation-role="${c.role}"><path class="bio-equation-line" d="M ${x[i]} ${start} V ${bend} H ${x[i+2]} V ${start}"/><path d="M ${x[i+2]-7} ${start+tip} L ${x[i+2]} ${start+(above?1:-1)} L ${x[i+2]+7} ${start+tip}"/><text x="${(x[i]+x[i+2])/2}" y="${label}" text-anchor="middle">${c.from[0]} ${roleName(c.role)}</text></g>`;}).join('')}
 </svg>
 <div class="life-equation-mobile" aria-label="兩種物質的變化">${data.changes.map(c=>`<div class="life-equation-change is-${c.role}"><b>${c.from[0]} ${roleName(c.role)}</b><div><span>${c.from[1]?'':c.from[0]}${c.from[1]?`<strong>${c.from[1]}</strong>`:''}</span><i aria-hidden="true">→</i><span>${c.to[1]?'':c.to[0]}${c.to[1]?`<strong>${c.to[1]}</strong>`:''}</span></div></div>`).join('')}</div>
 </section>`;
}

export function showLifeEquation(scene,complete){
 const equation=scene.querySelector('[data-life-redox-equation]');
 if(equation)equation.hidden=false;
}
