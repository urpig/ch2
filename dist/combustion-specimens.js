// Dimensional solids share the same lighting on the dish and in the spoon.
// Each viewBox follows the specimen's own proportions; destination boxes never stretch it.
const dimensions={Mg:[140,80],Cu:[140,92],Zn:[160,80],S:[160,80],P:[160,80],C:[160,104]};
const powderColours={
 Zn:{top:'#c2c8c7',middle:'#939d9d',edge:'#586768',light:'#e4e8e4',dark:'#607071'},
 S:{top:'#f3db55',middle:'#d2b326',edge:'#a08115',light:'#fff4a1',dark:'#a88b1d'},
 P:{top:'#a54f39',middle:'#843b2d',edge:'#50291f',light:'#c87551',dark:'#532d26'}
};
const fixed=(v)=>Math.round(v*100)/100;
const random=(n,salt=0)=>{const value=Math.sin((n+1)*127.1+salt*311.7)*43758.5453;return value-Math.floor(value);};

function powderArtwork(key,id){
 const c=powderColours[key];
 const mound='M7 66Q13 61 24 57L43 44L60 25Q65 21 73 24L86 34L96 37L112 48L137 58L153 66Q145 74 82 75Q27 75 7 66Z';
 const grains=Array.from({length:235},(_,i)=>{
  const x=10+random(i,1)*140,y=24+random(i,2)*50;
  const r=(key==='Zn'?.65:1.1)+random(i,3)*(key==='Zn'?1.3:2.3);
  const colour=i%5===0?c.light:i%3===0?c.dark:c.top;
  return `<path d="M${fixed(x-r)} ${fixed(y)}l${fixed(r*.7)} ${fixed(-r*.9)} ${fixed(r*1.2)} ${fixed(-r*.1)} ${fixed(r*.8)} ${fixed(r)} ${fixed(-r*.8)} ${fixed(r*.65)}Z" fill="${colour}" opacity="${fixed(.28+random(i,4)*.5)}"/>`;
 }).join('');
 return `<defs><linearGradient id="${id}-mound" x1=".25" y1="0" x2=".7" y2="1"><stop stop-color="${c.top}"/><stop offset=".55" stop-color="${c.middle}"/><stop offset="1" stop-color="${c.edge}"/></linearGradient><clipPath id="${id}-mound-edge"><path d="${mound}"/></clipPath></defs>
 <ellipse cx="80" cy="72" rx="68" ry="5" fill="#282c22" opacity=".19"/>
 <path d="${mound}" fill="url(#${id}-mound)"/>
 <path d="M24 57L43 44L60 25Q65 21 73 24L86 34L76 30L66 28L52 48L35 59Z" fill="${c.light}" opacity=".24"/>
 <g clip-path="url(#${id}-mound-edge)">${grains}</g>
 <path d="M10 67Q73 79 148 67" fill="none" stroke="${c.dark}" stroke-opacity=".3" stroke-width="1"/>
 ${[0,1,2,3,4,5,6,7,8].map(i=>`<ellipse cx="${13+i*16+random(i,9)*5}" cy="${75+random(i,10)*2}" rx="${.5+random(i,11)}" ry=".4" fill="${c.middle}" opacity=".7"/>`).join('')}`;
}

const photographicSolids={
 Mg:{box:[69,103,488,252],path:'M70 198C64 146 138 104 261 103C373 100 472 135 481 189C490 235 466 273 416 292Q508 285 556 259L553 308Q459 359 337 354C207 350 85 308 72 238Z M122 190C126 152 198 128 275 129C355 129 417 155 424 190C414 217 358 238 281 237C205 238 144 219 122 190Z'},
 Cu:{box:[125,157,160,154],path:'M141 163Q128 175 126 210Q124 257 176 277L266 310L276 263L176 231Q141 216 141 184Z'},
 C:{box:[108,72,367,266],path:'M108 231L117 195 149 150 197 112 257 85 291 73 316 81 330 111 341 147 338 177 316 216 281 245 242 268 197 287 156 278 128 259Z M275 287L277 246 300 221 344 196 391 169 430 179 461 209 475 245 469 287 436 319 401 338 350 329 306 313Z'}
};

function photographicArtwork(key,id){
 const {box:[bx,by,bw,bh],path}=photographicSolids[key], [width,height]=dimensions[key];
 const scale=Math.min((width-8)/bw,(height-8)/bh),left=(width-bw*scale)/2,top=height-7-bh*scale;
 // Mask only the solid's irregular silhouette. The original dish/background is excluded,
 // including the open centre of the magnesium ribbon coil.
 return `<defs><clipPath id="${id}-solid-mask"><path d="${path}" clip-rule="evenodd"/></clipPath><filter id="${id}-contact-blur" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="1.2"/></filter></defs>
 <ellipse cx="${width/2}" cy="${height-5}" rx="${bw*scale*.43}" ry="${key==='C'?3:2}" fill="#192924" opacity=".28" filter="url(#${id}-contact-blur)"/>
 <g transform="translate(${fixed(left)} ${fixed(top)}) scale(${fixed(scale)}) translate(${-bx} ${-by})"><image href="./assets/story/elements/specimen-${key}.webp" width="600" height="450" preserveAspectRatio="xMidYMid meet" clip-path="url(#${id}-solid-mask)"/></g>`;
}

export function combustionSpecimen(key,{x=0,y=0,width=160,height=120,prefix='combustion-specimen'}={}){
 const size=dimensions[key];
 if(!size)throw new Error('Unsupported dimensional specimen: '+key);
 const id=(prefix+'-'+key).replace(/[^a-z0-9_-]/gi,'-');
 const artwork=powderColours[key]?powderArtwork(key,id):photographicArtwork(key,id);
 return `<svg class="dimensional-specimen dimensional-specimen-${key}" x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 ${size[0]} ${size[1]}" preserveAspectRatio="xMidYMax meet" overflow="visible" aria-hidden="true">${artwork}</svg>`;
}

export const combustionSpecimenSize=key=>dimensions[key]?[...dimensions[key]]:null;
