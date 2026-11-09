import {sodiumSpecimen,sodiumOnDish,sodiumOnSpoon} from './sodium-specimen.js';
import {combustionSpecimen} from './combustion-specimens.js';
// All moving tools use the same photographs and coordinates in demo and practice.
const atlas='./assets/story/combustion-apparatus-atlas-v1.png';
const elementPhotos={Na:'./assets/story/elements/specimen-Na.webp',Mg:'./assets/story/elements/specimen-Mg.webp',Zn:'./assets/story/elements/specimen-Zn.webp',Cu:'./assets/story/elements/specimen-Cu.webp',C:'./assets/story/elements/specimen-C.webp'};
const crops={lamp:[62,58,310,348],beaker:[451,39,338,373],jar:[923,8,235,400],spoon:[180,422,80,420],wash:[529,428,218,412],pipette:[1015,427,55,407],lid:[22,981,373,158],sulfur:[421,909,398,282],phosphorus:[837,908,402,283],sulfurPowder:[513,979,241,154],phosphorusPowder:[938,989,253,141]};
export function apparatusPhoto(name,x,y,width,height){
 const crop=crops[name];
 if(!crop)throw new Error('Unknown apparatus photograph: '+name);
 const [cx,cy,cw,ch]=crop,sx=width/cw,sy=height/ch;
 const id=`photo-crop-${name}-${x}-${y}-${width}-${height}`;
 // Key out the neutral ceramic beneath the coloured grains, retaining their irregular edges.
 const grain=name==='sulfurPowder'||name==='phosphorusPowder';
 const key=grain?`<filter id="${id}-grains" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 ${name==='sulfurPowder'?'8 0 -8 0 -1':'10 -10 0 0 -.6'}"/></filter>`:'';
 return `<g class="apparatus-photo apparatus-photo-${name}" transform="translate(${x} ${y})" aria-hidden="true"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><rect width="${width}" height="${height}"/></clipPath>${key}</defs><g clip-path="url(#${id})"><image href="${atlas}" x="${-cx*sx}" y="${-cy*sy}" width="${1254*sx}" height="${1254*sy}" preserveAspectRatio="none" ${grain?`filter="url(#${id}-grains)"`:''}/></g></g>`;
}
export function photographicLab(){return `<image class="photographic-lab-background" href="./assets/story/everyday-lab-bench.jpg" x="0" y="0" width="760" height="430" preserveAspectRatio="xMidYMid slice"/>`;}
export function photographicLamp(lit=true){return `<g class="laboratory-alcohol-lamp photographic-lamp"><defs><linearGradient id="lamp-pink-liquid" x2="0" y2="1"><stop stop-color="#f5b0d0" stop-opacity=".45"/><stop offset=".6" stop-color="#e971a9" stop-opacity=".6"/><stop offset="1" stop-color="#b64c86" stop-opacity=".5"/></linearGradient></defs><ellipse cx="320" cy="376" rx="51" ry="5" fill="#122022" opacity=".21"/>${apparatusPhoto('lamp',275,286,90,90)}<path class="lamp-pink-liquid" d="M282 345Q319 353 358 345L358 354Q355 370 320 371Q287 370 282 357Z" fill="url(#lamp-pink-liquid)"/><ellipse cx="320" cy="346" rx="37" ry="5" fill="#f8b9d2" fill-opacity=".35" stroke="#f6dae8" stroke-width=".7"/><path d="M289 347L290 357Q294 365 306 366" fill="none" stroke="#fff" stroke-opacity=".53" stroke-width="2"/>${lit?'<g class="alcohol-flame-fallback"><path d="M319 286Q311 271 320 244Q326 270 322 286Z" fill="#509edc" opacity=".6"/><path d="M320 286Q316 280 321 267Q324 281 321 286Z" fill="#a6e6ff" opacity=".8"/></g>':''}</g>`;}
const powderPhotos={'oxide-white':'./assets/affinity-lab/oxide-white.png','oxide-black':'./assets/affinity-lab/oxide-black.png','silver-powder':'./assets/affinity-lab/silver-powder.png'};
const powder=(file,x,y,w,h)=>`<image href="${powderPhotos[file]}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet"/>`;
function metalPiece(key,x,y,w,h){
 const pieces={
  Na:{box:[249,282,138,86],path:'M287 282L385 309L354 367L249 347Z'},
  Cu:{box:[125,157,160,154],path:'M141 163Q128 175 126 210Q124 257 176 277L266 310L276 263L176 231Q141 216 141 184Z'},
  Mg:{box:[69,103,488,252],path:'M70 198C64 146 138 104 261 103C373 100 472 135 481 189C490 235 466 273 416 292Q508 285 556 259L553 308Q459 359 337 354C207 350 85 308 72 238Z M122 190C126 152 198 128 275 129C355 129 417 155 424 190C414 217 358 238 281 237C205 238 144 219 122 190Z'},
  C:{box:[108,72,367,266],path:'M108 231L117 195 149 150 197 112 257 85 291 73 316 81 330 111 341 147 338 177 316 216 281 245 242 268 197 287 156 278 128 259Z M275 287L277 246 300 221 344 196 391 169 430 179 461 209 475 245 469 287 436 319 401 338 350 329 306 313Z'}
 };
 const {box:[bx,by,bw,bh],path}=pieces[key],id=`metal-piece-${key}-${x}-${y}`;
 const scale=Math.min(w/bw,h/bh);
 return `<g transform="translate(${x+(w-bw*scale)/2} ${y+(h-bh*scale)/2}) scale(${scale}) translate(${-bx} ${-by})"><defs><clipPath id="${id}"><path d="${path}" clip-rule="evenodd"/></clipPath></defs><image href="${elementPhotos[key]}" width="600" height="450" clip-path="url(#${id})"/></g>`;
}
function spoonSample(key,oxide,cool){
 if(oxide)return key==='S'||key==='C'||key==='CO'?'':`<g style="${key==='Na'||key==='Zn'&&!cool?'filter:sepia(.55) saturate(1.2)':''}">${powder(key==='Cu'?'oxide-black':'oxide-white',12,196,34,12)}</g>`;
 if(key==='S'||key==='P'||key==='Zn')return combustionSpecimen(key,{x:10,y:188,width:38,height:19,prefix:'spoon-'+key});
 if(key==='Na'){const {x,y,width,height}=sodiumOnSpoon;return sodiumSpecimen(x,y,width,height,'sodium-in-spoon');}
 if(key==='Mg')return combustionSpecimen(key,{x:11,y:187,width:36,height:21,prefix:'spoon-Mg'});
 if(key==='Cu')return combustionSpecimen(key,{x:13,y:183,width:32,height:24,prefix:'spoon-Cu'});
 if(key==='C'||key==='CO')return combustionSpecimen('C',{x:12,y:181,width:34,height:25,prefix:'spoon-C'});
 return powder('silver-powder',12,196,34,12);
}
export function photographicSpoon(key,{oxide=false,cool=true,empty=false,progress=false}={}){
 const sample=empty?'':spoonSample(key,oxide,cool);
 // The bowl is still at (29,205), so heating and drop targets follow the visible tool.
 // A cropped straight steel shaft keeps the same photographic surface as the bowl.
 return `<svg class="precision-spoon photographic-spoon" width="160" height="230" viewBox="0 0 160 230" overflow="visible" aria-hidden="true"><g class="apparatus-photo-spoon"><g data-spoon-vertical-handle><svg x="49" y="64" width="5" height="140" viewBox="386 20 31 1649" preserveAspectRatio="none" overflow="hidden"><image href="./assets/story/deflagrating-spoon-v2.png" width="887" height="1774"/></svg></g><svg x="3" y="193" width="52" height="32" viewBox="414 1668 130 106" preserveAspectRatio="none" overflow="hidden"><image href="./assets/story/deflagrating-spoon-v2.png" width="887" height="1774"/></svg></g><ellipse data-spoon-bowl cx="29" cy="205" rx="25" ry="11.5" fill="transparent"/>${empty?'':'<ellipse cx="29" cy="207" rx="17" ry="3" fill="#27231d" opacity=".28"/>'}<g class="spoon-specimen">${progress?`<g class="reactant-surface">${sample}</g><g class="reaction-coat">${spoonSample(key,true,cool)}</g>`:sample}</g></svg>`;
}

export function spoonRackArtwork(x=480,y=331){
 return `<g class="combustion-spoon-rack" transform="translate(${x} ${y})" aria-hidden="true"><defs><linearGradient id="rack-steel" x2="1" y2=".15"><stop stop-color="#334c49"/><stop offset=".2" stop-color="#c5d0c8"/><stop offset=".37" stop-color="#f0f3e9"/><stop offset=".55" stop-color="#708b80"/><stop offset="1" stop-color="#29433d"/></linearGradient></defs><ellipse cx="24" cy="41" rx="60" ry="5" fill="#102726" opacity=".2"/><path d="M-25 33H73L81 39L77 44H-29L-33 39Z" fill="url(#rack-steel)" stroke="#5f756b" stroke-width=".8"/><path d="M56 35V-143" fill="none" stroke="#334b43" stroke-width="5"/><path d="M55 34V-143" fill="none" stroke="url(#rack-steel)" stroke-width="3.5"/><path d="M56 -123H0" fill="none" stroke="#526b60" stroke-width="4"/><path d="M55 -124H0" fill="none" stroke="#dce4d8" stroke-width="1.1"/><rect x="50" y="-129" width="12" height="12" rx="2" fill="url(#rack-steel)" stroke="#405b4e"/><path d="M-5 -128V-119Q0 -114 5 -119V-128" fill="none" stroke="#496253" stroke-width="3"/><path d="M-5 -128V-120Q0 -116 5 -120V-128" fill="none" stroke="#d5e0d2" stroke-width="1.2"/><ellipse cx="56" cy="-145" rx="3" ry="1.5" fill="#e4e9df"/></g>`;
}

export function beakerSediment(key){
 const dark=key==='Cu';
 return `<g data-bench-sediment visibility="hidden"><defs><clipPath id="sediment-inside-glass"><path d="M94 305H210V359Q210 371 151 371Q94 370 94 359Z"/></clipPath></defs><g clip-path="url(#sediment-inside-glass)"><ellipse cx="151" cy="363" rx="53" ry="5" fill="#334340" opacity=".24"/><g opacity=".89">${powder(dark?'oxide-black':'oxide-white',96,340,111,29)}</g>${Array.from({length:110},(_,i)=>{const a=i*2.39996,r=Math.sqrt((i+.5)/110);return `<ellipse cx="${151+Math.cos(a)*51*r}" cy="${363+Math.sin(a)*4*r}" rx="${.22+i%4*.13}" ry="${.18+i%3*.1}" fill="${dark?(i%3?'#27302d':'#666c64'):(i%3?'#f0f0e8':'#a8b1a7')}" opacity="${.35+i%3*.15}"/>`;}).join('')}<path d="M99 312V355Q100 363 115 365M204 313V356" fill="none" stroke="#f5ffff" stroke-opacity=".4" stroke-width="1.5"/></g></g>`;
}
export function specimenDishArtwork(key,front=false){
 const id=`dish-front-${key}`;
 // Both dish layers and the movable specimen use a 160 x 120 coordinate frame.
 // The near rim overlaps the grains/metal, so their lower edges sit inside the dish.
 return `<svg class="${front?'tabletop-dish-rim':'tabletop-dish'}" viewBox="0 0 160 120" aria-hidden="true">${front?`<defs><clipPath id="${id}"><path d="M12 56C20 78 48 94 80 93C113 94 140 78 146 56L160 120H0Z"/></clipPath></defs>`:''}<image href="./assets/affinity-lab/observation-dish.png" x="0" y="10" width="160" height="106.667" preserveAspectRatio="xMidYMid meet" ${front?`clip-path="url(#${id})"`:''}/></svg>`;
}
function tabletopSpecimen(key){
 // All specimens rest on the same interior plane at y = 86; photos are never stretched.
 if(key==='Na'){const {x,y,width,height}=sodiumOnDish;return sodiumSpecimen(x,y,width,height,'sodium-on-dish');}
 if(key==='Mg')return combustionSpecimen(key,{x:26,y:38,width:108,height:50,prefix:'dish-Mg'});
 if(key==='Cu')return combustionSpecimen(key,{x:44,y:31,width:72,height:57,prefix:'dish-Cu'});
 if(key==='C')return combustionSpecimen(key,{x:28,y:20,width:104,height:68,prefix:'dish-C'});
 if(key==='S'||key==='P'||key==='Zn')return combustionSpecimen(key,{x:24,y:42,width:112,height:46,prefix:'dish-'+key});
 return powder(key==='Zn'?'silver-powder':'oxide-black',25,49,110,37);
}
export function photographicSample(key,picked=false){
 const title=({Na:'鈉',Mg:'鎂帶',Zn:'鋅粉',Cu:'銅片',S:'硫粉',P:'紅磷',C:'碳'})[key]||'樣本';
 const content=picked?`<g class="sample-contact-shadow"><ellipse cx="80" cy="83" rx="${key==='Cu'?25:41}" ry="7" fill="#43382a" opacity=".13"/><ellipse cx="80" cy="84" rx="${key==='Cu'?20:35}" ry="3" fill="#332a22" opacity=".17"/></g>${tabletopSpecimen(key)}`:key==='S'||key==='P'?apparatusPhoto(key==='S'?'sulfur':'phosphorus',0,0,160,160*282/398):key==='Zn'?`<image href="./assets/affinity-lab/observation-dish.png" width="160" height="100" preserveAspectRatio="xMidYMid meet"/>${powder('silver-powder',20,30,120,40)}`:`<image href="${elementPhotos[key==='CO'?'C':key]}" width="160" height="100" preserveAspectRatio="xMidYMid meet"/>`;

 return `<svg class="photographic-specimen" viewBox="0 0 160 ${picked?120:100}" role="img" aria-label="${title}的實物外觀">${content}</svg>`;
}
export function photographicLid(){return `<svg viewBox="0 0 110 44" aria-hidden="true"><ellipse cx="55" cy="33" rx="48" ry="3" fill="#283d42" opacity=".16"/><path d="M1 27L97 24L110 31L5 35Z" fill="#d9edf0" fill-opacity=".27" stroke="#d6e5e4" stroke-width=".7"/><path d="M5 35L110 31V33L5 37Z" fill="#9bbac0" fill-opacity=".55" stroke="#e0efee" stroke-width=".5"/><path d="M5 29L93 26" stroke="#fff" stroke-opacity=".75" stroke-width=".7"/></svg>`;}
export function photographicWash(){return `<svg viewBox="0 0 100 160" aria-hidden="true">${apparatusPhoto('wash',14,5,76,150)}<rect x="26" y="83" width="48" height="21" rx="2" fill="#fbf9ec"/><text x="50" y="97" text-anchor="middle" font-size="9" fill="#324b50">蒸餾水</text></svg>`;}
export function photographicPipette(){return `<svg viewBox="0 0 44 300" aria-hidden="true">${apparatusPhoto('pipette',8,4,28,287)}<path class="pipette-charge" d="M21 225H24V271L22 286Z" fill="#b4d9e3" fill-opacity=".65"/><path class="pipette-droplet" d="M22 292Q16 301 22 303Q28 301 22 292" fill="#d6eff5" stroke="#94bac9" stroke-width=".5"/></svg>`;}
export function photographicProduct(key,cool,x,y){
 const label=({Cu:'黑色表層',Mg:'白色固體',Zn:cool?'冷卻後：白色':'仍熱：黃色',Na:'淡黃色產物',P:'白色固體微粒'})[key];
 const warm=key==='Na'||key==='Zn'&&!cool;
 return `<g class="product-closeup" transform="translate(${x} ${y})"><rect x="-91" y="-74" width="182" height="133" rx="10" fill="#f7f8f1" stroke="#a7b6a5"/><text y="-51" text-anchor="middle" font-size="12" fill="#5b705d">產物放大觀察</text><image href="./assets/affinity-lab/observation-dish.png" x="-72" y="-30" width="144" height="64" preserveAspectRatio="none"/><g style="${warm?'filter:sepia(.6) saturate(1.3)':''}">${powder(key==='Cu'?'oxide-black':'oxide-white',-56,-18,112,36)}</g><text y="44" text-anchor="middle" font-size="12" fill="#465f50">${label}</text></g>`;
}
