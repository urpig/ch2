import {factoryLadleDefs,factoryReceivers} from './factory-ladles.js';
const materialIndex={ore:0,coke:1,lime:2};
const materialSprite=(material,x,y,w,h)=>`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${materialIndex[material]*724} 0 724 724" preserveAspectRatio="none" overflow="hidden"><image href="./assets/story/factory-materials-v2.png" width="2172" height="724"/></svg>`;
// Small, interlocking solids, seen through a cutaway; no stretched full-height strips.
// Alternating ore-rich and coke-rich layers retain individual, interlocking pieces.
// The lowest coke bed supports the burden above the hearth.
export const factoryBurdenLayer=row=>Math.floor(row/3)%2===0?'coke':'ore';
export function factoryPackedBurden(){
 let seed=2307;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const beds={ore:[],coke:[],lime:[]};
 for(let row=0;row<23;row++)for(let col=0;col<12;col++){
  const x=353+col*16+(row%2)*8+(random()-.5)*5,y=478-row*16+(random()-.5)*4;
  const w=19+random()*9,h=17+random()*6,rotation=random()*65-32;
  const points=[[-.5,-.15],[-.3,-.48],[.18,-.5],[.49,-.16],[.4,.34],[-.08,.48],[-.46,.23]].map(([a,b])=>`${(a*w).toFixed(2)},${(b*h).toFixed(2)}`).join(' ');
  const sx=30+Math.floor(random()*270),sy=40+Math.floor(random()*790),id=`burden-${row}-${col}`;
  const make=material=>`<g data-burden-material="${material}" data-burden-row="${row}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(1)})"><defs><clipPath id="${id}-${material}"><polygon points="${points}"/></clipPath></defs><polygon points="${points}" transform="translate(0 2)" fill="#190e0a"/><g clip-path="url(#${id}-${material})"><svg x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" viewBox="${materialIndex[material]*512+sx} ${sy} 175 155" preserveAspectRatio="xMidYMid slice"><image href="./assets/story/factory-burden-v3.png" width="1536" height="1024"/></svg></g><polygon points="${points}" fill="none" stroke="#241811" stroke-width=".7" stroke-opacity=".65"/><path d="M${-w*.3} ${-h*.48}L${w*.18} ${-h*.5}L${w*.49} ${-h*.16}" fill="none" stroke="#f9d4ad" stroke-opacity=".21" stroke-width=".6"/></g>`;
  beds.ore.push(make('ore'));
  const choice=random();
  if(factoryBurdenLayer(row)==='coke')beds.coke.push(make('coke'));
  else if(choice>.82)beds.lime.push(make('lime'));
 }
 return `<g class="factory-charge-layers"><path d="M355 128H540V490H355Z" fill="#3e241a"/>${beds.ore.join('')}</g><g class="factory-coke-layers">${beds.coke.join('')}</g><g class="factory-lime-layers">${beds.lime.join('')}</g><rect x="355" y="127" width="187" height="363" fill="url(#factory-burden-depth)"/>`;
}
export const factoryRawMaterial=material=>`<svg class="factory-material-photo" viewBox="0 0 300 190" aria-hidden="true">${materialSprite(material,18,-9,264,207)}</svg>`;
const rock=(x,y,r,c)=>materialSprite(c==='#c6c0a9'?'lime':['#303434','#252b2b','#342522'].includes(c)?'coke':'ore',x-r*1.5,y-r*1.5,r*3,r*3);
const feedColours={ore:'#995c40',coke:'#303434',lime:'#c6c0a9'};
const feedLoads=Object.entries(feedColours).map(([material,colour])=>
 `<g class="factory-skip-load" data-charge-material="${material}" clip-path="url(#factory-skip-opening)">${materialSprite(material,94,225,82,42)}</g>`
).join('');
const feedFall=Object.entries(feedColours).map(([material,colour])=>
 `<g class="factory-falling-charge" data-charge-material="${material}">${Array.from({length:9},(_,i)=>
  `<g style="--chunk:${i};--fall-sway:${i%3*11-10}px;--fall-length:${52+i%4*11}px">${rock(443+i*7%23,73+i%3*3,4+i%3,colour)}</g>`
 ).join('')}</g>`
).join('');

export function factoryArt(){
 return `<svg class="factory-art" viewBox="0 0 900 650" role="img" aria-label="現代煉鐵廠高爐剖面：送料斜橋、爐身鋼構、熱風管、耐火磚、上下分層的熔渣與鐵水"><defs>${factoryLadleDefs()}
 <linearGradient id="furnace-interior"><stop stop-color="#63372e"/><stop offset=".5" stop-color="#8b4b3a"/><stop offset="1" stop-color="#65362c"/></linearGradient><linearGradient id="hall" x2="0" y2="1"><stop stop-color="#f1f5ee"/><stop offset=".65" stop-color="#d5e1da"/><stop offset="1" stop-color="#b8cbc1"/></linearGradient><linearGradient id="steel-shell"><stop stop-color="#263638"/><stop offset=".15" stop-color="#768583"/><stop offset=".34" stop-color="#b2bbb1"/><stop offset=".45" stop-color="#6f807d"/><stop offset=".73" stop-color="#3e5658"/><stop offset=".9" stop-color="#72807c"/><stop offset="1" stop-color="#213a3e"/></linearGradient><linearGradient id="pipe-steel"><stop stop-color="#162c32"/><stop offset=".2" stop-color="#486267"/><stop offset=".4" stop-color="#9eaba7"/><stop offset=".55" stop-color="#5b7577"/><stop offset=".85" stop-color="#334a50"/><stop offset="1" stop-color="#112b33"/></linearGradient><linearGradient id="brick"><stop stop-color="#ae8064"/><stop offset=".5" stop-color="#684634"/><stop offset="1" stop-color="#c08a5b"/></linearGradient><radialGradient id="hearth-glow"><stop stop-color="#ffe7a0"/><stop offset=".4" stop-color="#e58b30"/><stop offset=".78" stop-color="#984019"/><stop offset="1" stop-color="#4b241a"/></radialGradient><linearGradient id="iron-liquid" x2="0" y2="1"><stop stop-color="#fff8b0"/><stop offset=".26" stop-color="#ffc56c"/><stop offset=".55" stop-color="#f68536"/><stop offset="1" stop-color="#a9451d"/></linearGradient><linearGradient id="slag-liquid" x2="0" y2="1"><stop stop-color="#ffe2a1"/><stop offset=".3" stop-color="#c18c4a"/><stop offset="1" stop-color="#715338"/></linearGradient><linearGradient id="light-shaft" x2=".3" y2="1"><stop stop-color="#dfefeb" stop-opacity=".17"/><stop offset="1" stop-color="#dff3ec" stop-opacity="0"/></linearGradient><pattern id="refractory" width="25" height="14" patternUnits="userSpaceOnUse"><rect width="25" height="14" fill="url(#brick)"/><path d="M0 0H25M0 14H25M12 0V14" stroke="#372c26" stroke-width="1"/><path d="M1 1H24" stroke="#d2a382" stroke-opacity=".4"/></pattern><linearGradient id="factory-floor" x2="0" y2="1"><stop stop-color="#c2c9bc"/><stop offset="1" stop-color="#e2dfce"/></linearGradient><filter id="heat-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter><clipPath id="furnace-core"><path d="M415 126H474V178Q477 219 489 267L530 395Q522 440 506 490L502 553H401L399 495Q376 457 365 399L402 247Q413 203 415 178Z"/></clipPath><radialGradient id="factory-brick-radiance" cx=".5" cy=".93" r=".9"><stop stop-color="#fff0ab" stop-opacity=".95"/><stop offset=".3" stop-color="#ff8e28" stop-opacity=".8"/><stop offset=".62" stop-color="#b8370c" stop-opacity=".5"/><stop offset="1" stop-color="#411708" stop-opacity="0"/></radialGradient><pattern id="factory-rock-grain" width="8" height="7" patternUnits="userSpaceOnUse"><path d="M1 2l1 -.5m2 3l2 -1M2 6h1" stroke="#fff0cb" stroke-width=".45" opacity=".28"/><path d="M6 1h1M1 4l1 1" stroke="#0e1919" stroke-width=".8" opacity=".35"/></pattern></defs>
 <image class="factory-photographic-plant" href="./assets/story/factory-plant-v2.png" width="900" height="650" preserveAspectRatio="none"/>
 <defs>
  <clipPath id="factory-coke-bands"><path d="M355 184L415 177L472 187L542 180V220L475 226L410 214L355 221ZM355 286L416 278L471 289L542 282V326L475 331L408 320L355 327ZM355 391L412 384L477 394L542 388V425L473 434L410 422L355 430ZM355 472H542V565H355Z"/></clipPath>
  <clipPath id="factory-lime-pockets"><path d="M425 155l18-4 12 9-10 14-20-4ZM471 245l21-5 12 15-14 15-21-7ZM391 344l23-8 14 18-16 17-24-9ZM464 362l19-4 15 14-13 17-21-8ZM424 443l23-6 18 15-17 17-24-7Z"/></clipPath>
  <clipPath id="factory-solid-charge"><rect x="350" y="120" width="200" height="370"/></clipPath>
  <linearGradient id="factory-burden-fade" x1="0" y1="0" x2="0" y2="650" gradientUnits="userSpaceOnUse"><stop offset=".59" stop-color="white"/><stop class="factory-burden-mask-lower" offset=".76" stop-color="white"/><stop class="factory-burden-mask-lower" offset="1" stop-color="white"/></linearGradient>
  <mask id="factory-burden-mask" maskUnits="userSpaceOnUse" x="350" y="120" width="200" height="450"><rect x="350" y="120" width="200" height="450" fill="url(#factory-burden-fade)"/></mask>
  <linearGradient id="factory-burden-depth"><stop stop-color="#190c07" stop-opacity=".54"/><stop offset=".18" stop-color="#190c07" stop-opacity="0"/><stop offset=".8" stop-color="#190c07" stop-opacity="0"/><stop offset="1" stop-color="#190c07" stop-opacity=".57"/></linearGradient>
  <clipPath id="factory-skip-opening"><path d="M104 237H162L177 250H89Z"/></clipPath>
  <clipPath id="factory-skip-front"><rect x="77" y="250" width="115" height="62"/></clipPath>
 </defs>
 <g clip-path="url(#furnace-core)">
  <path class="factory-heat-bed" d="M365 170H535V555H365Z" fill="url(#factory-brick-radiance)" style="mix-blend-mode:screen"/>
  <g class="factory-burden-stack" clip-path="url(#factory-solid-charge)" mask="url(#factory-burden-mask)">${factoryPackedBurden()}</g>
  <path class="factory-hearth-floor" d="M398 553H506V561H398Z" fill="url(#refractory)"/>
  <g class="factory-gas-arrows" fill="none" stroke="#f1d5a4" stroke-opacity=".55" stroke-width="1.3" stroke-dasharray="3 17"><path d="M424 456Q393 345 434 223V143M480 456Q512 347 464 215V146"/></g>
  <g class="factory-slag-pool"><path d="M400 517Q450 509 505 517L503 531H400Z" fill="url(#slag-liquid)"/><path d="M400 517Q451 511 504 517" stroke="#f4d59a" stroke-width="1.5" class="factory-liquid-sheen"/></g>
  <g class="factory-iron-pool"><path d="M400 530Q451 536 503 530L502 553H401Z" fill="url(#iron-liquid)"/><path d="M401 536Q451 543 502 536" fill="none" stroke="#fff4b2" stroke-width="2" class="factory-liquid-sheen"/></g>
 </g>
 <g class="factory-skip-rail-seat" aria-hidden="true"><path d="M82 305H188" stroke="#202a2b" stroke-width="6"/><path d="M82 302H188" stroke="#a0a8a6" stroke-width="2"/><path d="M92 308V317M177 308V317" stroke="#526261" stroke-width="5"/></g>
 <g class="factory-skip" data-factory-skip>
  <image class="factory-skip-photo" href="./assets/story/factory-skip-v3.png" x="80" y="232" width="108" height="72" preserveAspectRatio="xMidYMid meet"/>
  ${feedLoads}<image href="./assets/story/factory-skip-v3.png" x="80" y="232" width="108" height="72" preserveAspectRatio="xMidYMid meet" clip-path="url(#factory-skip-front)"/>
 </g>
 <g class="factory-air-trace"><path d="M213 456H372" stroke="#efbb7c" stroke-width="2" stroke-dasharray="9 18" fill="none"/></g>
 <g class="factory-outlets">
  ${factoryReceivers()}
  <g class="factory-iron-stream"><path d="M532 545L578 555 772 577 807 586" fill="none" stroke="#f48733" stroke-width="18" opacity=".4" filter="url(#heat-glow)"/><path d="M532 545L578 555 772 577 807 586" fill="none" stroke="url(#iron-liquid)" stroke-width="8"/><path d="M532 545L578 555 772 577 807 586" fill="none" stroke="#fff4b2" stroke-width="2" stroke-dasharray="12 7 3 18" class="factory-flow"/></g>
  <g class="factory-upper-runner-front" aria-hidden="true">
   <path d="M532 510L659 524" fill="none" stroke="#162327" stroke-width="19" stroke-opacity=".23"/>
   <path d="M530 496L655 509L665 517L540 504Z" fill="#69645b" stroke="#302f2b" stroke-width="1.2"/>
   <path d="M533 497L655 510L661 515L539 503Z" fill="url(#refractory)"/>
   <path d="M538 504L661 517V523L538 510Z" fill="#4a3327"/>
   <path d="M532 510L659 523V536L532 522Z" fill="#494c48" stroke="#292d2c" stroke-width="1"/>
   <path d="M534 507L658 520V529L534 516Z" fill="url(#refractory)" stroke="#b89574" stroke-width=".7"/>
   <path d="M532 520L659 534M531 507L658 520" stroke="#b1aba0" stroke-width="1.4" fill="none"/>
   <path d="M659 513L666 516V534L659 536Z" fill="#65665e" stroke="#a9a99b" stroke-width="1"/>
   ${[548,579,610,641].map(x=>`<path d="M${x} ${511+(x-534)*.105}V${524+(x-534)*.105}" stroke="#353b39" stroke-width="2.3"/><circle cx="${x}" cy="${522+(x-534)*.105}" r="1" fill="#b8b4a3"/>`).join('')}
  </g>
  <g class="factory-slag-stream"><path d="M528 506L584 512 658 520 663 524" fill="none" stroke="#99703e" stroke-width="6"/><path d="M528 506L584 512 658 520 663 524" fill="none" stroke="#f4d39c" stroke-width="1.7" stroke-dasharray="6 22 2 17" class="factory-flow slag-flow"/></g>
  <defs><clipPath id="factory-lower-runner-front"><path d="M535 532L581 542L779 565L779 590L576 567L535 555Z"/></clipPath></defs>
  <image class="factory-lower-runner-front" href="./assets/story/factory-plant-v2.png" width="900" height="650" preserveAspectRatio="none" clip-path="url(#factory-lower-runner-front)"/>
 </g>
 <g class="factory-slag-label"><rect x="631" y="473" width="64" height="29" rx="5" fill="#f5efda" stroke="#9d8b66"/><text x="663" y="493" text-anchor="middle" font-size="17" font-weight="600" fill="#63583d">熔渣</text></g>
 <g class="factory-main-product"><rect x="772" y="541" width="72" height="31" rx="5" fill="#fff2d9" stroke="#9a642d"/><text x="808" y="563" text-anchor="middle" font-size="20" font-weight="700" fill="#82441d">生鐵</text></g>
 <g class="factory-zone-ring"><ellipse data-zone-ring cx="450" cy="266" rx="63" ry="54" fill="none" stroke="#ffe0a4" stroke-width="2" stroke-dasharray="4 5"/></g>${feedFall}</svg>`;
}
