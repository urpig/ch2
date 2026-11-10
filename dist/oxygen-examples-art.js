import {affinityBenchArt,mixture} from './affinity-appearance.js';
import {combustionSpecimen} from './combustion-specimens.js';
import {termExperimentFrame} from './term-demo-model.js';
import {oxygenExamples,oxygenExampleFrame,magnesiumExperimentFrame} from './oxygen-examples-model.js';

const magnesiumAssets={jar:'./assets/story/magnesium-co2/gas-jar-v4.png',tongs:'./assets/story/magnesium-co2/tongs-ribbon-v2.png',burner:'./assets/story/magnesium-co2/burner-v2.png'};

function dish(contents){return `<div class="free-specimen-dish"><img class="free-dish-photo" src="${affinityBenchArt.dish}" alt="" draggable="false"><div class="free-dish-contents">${contents}</div></div>`;}
function carbonLab(){
 const pile=texture=>mixture([texture]);
 return `<div class="free-real-bench term-experiment-bench term-demonstration carbon-oxygen-bench" data-phase="before">
  <img class="free-bench-photo" src="${affinityBenchArt.bench}" alt="本生燈、三腳架與坩堝" draggable="false">
  <div class="term-sample-tray term-tray-oxide">${dish(pile('black'))}</div><span class="term-sample-label term-label-oxide">氧化銀 Ag₂O</span>
  <div class="term-sample-tray term-tray-zinc">${dish(pile('black'))}</div><span class="term-sample-label term-label-zinc">碳粉 C</span>
  <div class="free-crucible-fill"><div class="term-oxide-pile">${pile('black')}</div><div class="term-zinc-pile">${pile('black')}</div><div class="term-mixture-before">${pile('black')}</div><div class="term-mixture-after">${pile('silver')}</div><div class="term-ember"></div></div>
  <div class="free-burner-flame"><img src="${affinityBenchArt.flame}" alt=""></div><img class="free-bench-occluder" src="${affinityBenchArt.bench}" alt="" aria-hidden="true">
  <span class="term-powder-stream">${Array.from({length:24},(_,i)=>`<i style="--grain-x:${15+i*43%69}%;--grain-size:${1.5+i*11%7}%;--grain-start:${(i*.023).toFixed(3)};--grain-fall:${228+i*13%52}%"></i>`).join('')}</span><span class="term-stirrer"></span>
  <span class="oxygen-co2-release" aria-hidden="true">CO₂ ↑</span>
 </div>`;
}
function magnesiumLab(){return `<div class="magnesium-co2-lab" role="img" aria-label="真實器材外觀的實驗模擬：坩堝鉗夾住鎂帶，在瓶外點燃後移入二氧化碳集氣瓶，持續發出白光，產物沉在瓶底">
 <img class="mg-lab-plate" src="${magnesiumAssets.jar}" alt="" draggable="false">
 <img class="mg-ignition-burner" src="${magnesiumAssets.burner}" alt="" draggable="false">
 <img class="mg-ribbon-dish" src="${affinityBenchArt.dish}" alt="" draggable="false">
 <div class="mg-bottom-products" aria-hidden="true"><img class="mg-residue-white" src="./assets/affinity-lab/oxide-white.png" alt=""><img class="mg-residue-carbon" src="./assets/affinity-lab/oxide-black.png" alt=""><img class="mg-residue-carbon mg-carbon-scatter" src="./assets/affinity-lab/oxide-black.png" alt=""></div>
 <div class="mg-photo-tongs"><img class="mg-steel-tongs mg-grip-lower" src="${magnesiumAssets.tongs}" alt="" draggable="false"><img class="mg-steel-tongs mg-grip-upper" src="${magnesiumAssets.tongs}" alt="" draggable="false"></div><div class="mg-held-ribbon"><div class="mg-metal-ribbon">${combustionSpecimen('Mg',{width:140,height:80,prefix:'mgco2-ribbon-metal'})}</div><div class="mg-converted-ribbon">${combustionSpecimen('Mg',{width:140,height:80,prefix:'mgco2-ribbon-ash'})}</div></div>
 <div class="mg-oxide-cloud" aria-hidden="true">${Array.from({length:8},(_,i)=>`<i data-mg-wisp="${i}"></i>`).join('')}</div>
 <div class="mg-white-flare" aria-hidden="true"><i></i><i></i><i></i></div>
 <div class="mg-glass-light" aria-hidden="true"></div>
 <img class="mg-front-glass" src="${magnesiumAssets.jar}" alt="" aria-hidden="true" draggable="false">
 <span class="mg-gas-label" aria-hidden="true">CO₂</span>
 </div>`;}

function magnesiumSpecimen(after){return after?`<div class="mg-product-closeup">${dish(mixture(['white','black']))}</div>`:`<div class="mg-ribbon-closeup">${combustionSpecimen('Mg',{width:140,height:80,prefix:'mgco2-ribbon-closeup'})}</div>`;}

function oxygenTrack(key){
 const carbon=key==='carbon',bases=carbon?[['Ag',12,35],['Ag',24,35],['Ag',12,65],['Ag',24,65],['C',78,50]]:[['C',22,50],['Mg',78,35],['Mg',78,65]];
 return `<figure class="oxygen-trail"><figcaption><b>同時追蹤氧</b><span>紅色 O 代表氧</span></figcaption><div class="oxygen-trail-lanes"><b>${carbon?'氧化銀 → 銀':'二氧化碳 → 碳'}</b><b>${carbon?'碳 → 二氧化碳':'鎂 → 氧化鎂'}</b></div><div class="oxygen-trail-atoms" aria-hidden="true">${bases.map(([label,x,y])=>`<span class="term-ball term-ball-${label}" style="left:${x}%;top:${y}%">${label}</span>`).join('')}${[0,1].map(i=>`<span class="term-ball term-ball-oxygen" data-transfer-oxygen="${i}">O</span>`).join('')}<span class="oxygen-route-arrow">→</span></div>${carbon?'<div class="oxygen-travel-caption oxygen-change-pair" data-oxygen-caption><p>氧化銀<b>被還原成銀</b></p><p>碳<b>被氧化成二氧化碳</b></p></div>':'<p class="oxygen-travel-caption" data-oxygen-caption></p>'}</figure>`;
}

export function oxygenExampleArt(key){
 const e=oxygenExamples[key];
 return `<div class="oxygen-experiment-grid"><figure class="oxygen-lab-view"><figcaption><b>實驗台</b><span data-physical-phase>反應前</span></figcaption>${key==='carbon'?carbonLab():magnesiumLab()}${key==='carbon'?'':'<p data-physical-caption>'+e.before+'</p>'}</figure><div class="oxygen-observation-side"><div class="oxygen-material-change"><h4>物質的前後變化</h4><div>${['反應前','反應後'].map((label,i)=>`<section><b>${label}</b>${key==='carbon'?dish(mixture([i?'silver':'black'])):magnesiumSpecimen(i)}<span data-specimen-description>${i?'播放後觀察產物':e.before}</span></section>`).join('')}</div></div>${oxygenTrack(key)}</div></div>`;
}

export function paintOxygenExample(root,key,value,reduced=false){
 const f=oxygenExampleFrame(value,reduced),e=oxygenExamples[key];root.dataset.phase=f.stage;
 const phase={before:'反應前',prepare:'準備樣本',heat:'加熱、點燃',react:'反應中',cool:'觀察產物',complete:'反應後'}[f.stage];
 root.querySelector('[data-physical-phase]').textContent=phase;
 const physicalCaption=root.querySelector('[data-physical-caption]');if(physicalCaption)physicalCaption.textContent=f.stage==='before'||f.stage==='prepare'?e.before:key==='magnesium'?(f.stage==='heat'?'先點燃鎂帶，再放進 CO₂。':f.stage==='react'?'放進 CO₂ 後，鎂仍發出耀眼白光。':e.after):(f.stage==='heat'?'加熱混合物。':f.stage==='react'?'深色混合物逐漸形成灰色、帶金屬光澤的銀。':e.after);
 root.style.setProperty('--oxygen-progress',f.travel);
 if(key==='magnesium'){
  const m=magnesiumExperimentFrame(value),lab=root.querySelector('.magnesium-co2-lab');lab.dataset.magnesiumStage=m.stage;
  root.querySelector('[data-physical-phase]').textContent=({before:'點燃前',pickup:'夾取鎂帶',ignite:'瓶外點燃',transfer:'移入集氣瓶',burn:'瓶內繼續燃燒',settle:'產物沉降',complete:'反應後'})[m.stage];
  root.querySelector('[data-physical-caption]').textContent=m.caption;
  for(const [name,amount] of Object.entries({x:m.x+'%',y:m.y+'%',angle:m.angle+'deg',scale:m.scale,holding:m.holding,'ribbon-x':m.ribbonX+'%','ribbon-y':m.ribbonY+'%','ribbon-angle':m.ribbonAngle+'deg','tip-x':m.tipX+'%','tip-y':m.tipY+'%',light:m.glow,metal:m.metal,ash:m.ash,settled:m.settled,smoke:m.smoke}))lab.style.setProperty('--mg-'+name,amount);
  lab.querySelectorAll('[data-mg-wisp]').forEach((node,i)=>{
   const p=(m.time*4.4+i/8)%1;node.style.left=49+Math.sin(i*2.4+p*4)*(3+p*8)+'%';node.style.top=57-p*21+'%';node.style.transform=`translate(-50%,-50%) scale(${.5+p*1.5})`;node.style.opacity=String(m.smoke*Math.sin(p*Math.PI)*.3);
  });
 }
 for(const node of root.querySelectorAll('[data-transfer-oxygen]')){
  const i=Number(node.dataset.transferOxygen),carbon=key==='carbon';
  const start=carbon?[36,i?65:35]:[i?32:12,50],end=carbon?[i?88:68,50]:[88,i?65:35];
  node.style.left=start[0]+(end[0]-start[0])*f.travel+'%';node.style.top=start[1]+(end[1]-start[1])*f.travel-Math.sin(f.travel*Math.PI)*16+'%';
 }
 const caption=root.querySelector('[data-oxygen-caption]');
 if(key==='carbon')caption.style.visibility=f.travel>0?'visible':'hidden';
 else caption.textContent=f.travel===0?`在反應式裡找一找：氧原本在 ${e.source}。`:f.travel<1?`氧從${e.donor}移向${e.receiver}。`:`氧從 ${e.source} 轉移到 ${e.destination}。`;
 const after=root.querySelector('.oxygen-material-change section:last-child');after.style.setProperty('--oxygen-progress',f.travel);after.querySelector('[data-specimen-description]').textContent=f.travel===1?e.after:'播放後觀察產物';
 if(key==='carbon'){
  const mapped=value<.3?value/.3*.44:value<.46?.44+(value-.3)/.16*.18:value<.76?.62+(value-.46)/.3*.22:.84+(value-.76)/.24*.16;
  const bench=root.querySelector('.carbon-oxygen-bench'),b=termExperimentFrame(mapped,reduced);
  for(const [material,pour] of [['oxide',b.oxide],['zinc',b.zinc]])for(const [name,amount] of Object.entries(pour))bench.style.setProperty('--term-'+material+'-'+name,amount);
  for(const [name,amount] of [['mixed',b.mixed],['stir',b.stir],['stir-depth',b.stirDepth],['warmth',0],['glow',f.glow*.45],['glow-position',50]])bench.style.setProperty('--term-'+name,amount);
  bench.dataset.phase=b.stage;
 }
}
