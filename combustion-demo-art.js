import {laboratoryBackground,alcoholLamp,spoonIllustration} from './laboratory-assets.js';
import {gasCollectionBottle} from './glass-bottle.js';
import {scopeMarkup} from './card-markup.js';
import {sampleVisual} from './specimens.js';

const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t);
const point=(a,b,t)=>a.map((n,i)=>mix(n,b[i],ease(t)));
const opacity=(node,value)=>node.setAttribute('opacity',String(value));

function beaker(){return `<g><ellipse cx="147" cy="378" rx="76" ry="8" fill="#163940" opacity=".17"/><path d="M78 277Q145 264 216 277L211 366Q210 379 147 379Q85 378 84 365Z" fill="url(#demo-glass)" stroke="#8db1bb" stroke-width="1.3"/><path d="M86 317Q147 325 213 317V363Q210 374 147 374Q89 373 87 364Z" fill="#c7e9ef" fill-opacity=".25"/><ellipse cx="147" cy="317" rx="61" ry="7" fill="#e4f9fa" fill-opacity=".35" stroke="#a8d2da"/><path d="M91 284V360M101 286V357" stroke="#f8ffff" stroke-width="2" opacity=".65"/><path d="M79 277Q147 288 216 277" fill="none" stroke="#edfaff" stroke-width="2"/>${[0,1,2,3].map(i=>`<path d="M186 ${295+i*17}h15" stroke="#839da6" stroke-width="1"/>`).join('')}<text x="147" y="403" text-anchor="middle">清水</text></g>`;}
function washBottle(){return `<g data-demo-wash opacity="0"><ellipse cx="420" cy="367" rx="33" ry="5" fill="#163940" opacity=".13"/><path d="M394 297Q389 298 390 313V354Q391 365 419 365Q448 365 448 354V313Q447 298 439 297V286H397Z" fill="url(#demo-glass)" stroke="#94b3bd"/><path d="M394 327H444V352Q438 363 398 357Z" fill="#cfedf2" opacity=".6"/><rect x="393" y="283" width="50" height="8" rx="2" fill="#86a4aa"/><path d="M430 283V264Q430 259 435 259H460V266H438V283" fill="url(#demo-glass)" stroke="#aed3da"/><rect x="397" y="317" width="43" height="19" rx="3" fill="#ffffef" opacity=".8"/><text x="419" y="330" text-anchor="middle" font-size="10">蒸餾水</text></g>`;}
function pipette(){return `<g data-demo-pipette opacity="0"><defs><linearGradient id="demo-bulb"><stop stop-color="#314c57"/><stop offset=".3" stop-color="#78919a"/><stop offset=".5" stop-color="#46606b"/><stop offset="1" stop-color="#203c47"/></linearGradient></defs><path d="M-12 -145Q-18 -178 0 -179Q18 -178 12 -145L8 -131H-8Z" fill="url(#demo-bulb)" stroke="#56727b"/><path d="M-4 -131L-3 -15 0 0 3 -15 4 -131Z" fill="url(#demo-glass)" stroke="#91b4be"/><path d="M-1 -125L-1 -16" stroke="white" opacity=".7"/><path data-demo-pipette-liquid d="M-2 -69V-17L0 -4 2 -17V-69Z" fill="#a8d9e8" opacity=".85"/></g>`;}

export function combustionDemoArtwork(key){
 const s=key==='S',papers=s?'<g transform="translate(63 375)"><path d="M-8 -11H204V28H-8Z" fill="#e7e2c5" stroke="#aebda9"/><g data-demo-red><path d="M0 0H84V13H0Z" fill="#c46579"/><ellipse data-demo-red-tip cx="42" cy="7" rx="17" ry="5" fill="#c46579"/></g><g data-demo-blue><path d="M104 0H188V13H104Z" fill="#526eb9"/><ellipse data-demo-blue-tip cx="146" cy="7" rx="17" ry="5" fill="#526eb9"/></g><text x="42" y="-17" text-anchor="middle">紅色石蕊</text><text x="146" y="-17" text-anchor="middle">藍色石蕊</text></g>':'<g data-demo-red><path d="M25 186H39V266H25Z" fill="#c46579" stroke="#aa7f83" stroke-width=".5"/><path data-demo-red-tip d="M25 242H39V266H25Z" fill="#c46579"/></g><g data-demo-blue><path d="M54 186H68V266H54Z" fill="#526eb9" stroke="#687bab" stroke-width=".5"/><path data-demo-blue-tip d="M54 242H68V266H54Z" fill="#526eb9"/></g><text x="47" y="174" text-anchor="middle">石蕊試紙</text>';
 return scopeMarkup(`<svg class="combustion-demo-art" viewBox="0 0 760 430" role="img" aria-label="${s?'硫':'鈉'}的取樣、燃燒、產物加水與紅藍石蕊試紙測試動畫">${laboratoryBackground()}<defs><linearGradient id="demo-glass"><stop stop-color="#8bb7c5" stop-opacity=".3"/><stop offset=".13" stop-color="#f5ffff" stop-opacity=".7"/><stop offset=".3" stop-color="#d3f0f7" stop-opacity=".08"/><stop offset=".7" stop-color="#c8e6ed" stop-opacity=".05"/><stop offset=".93" stop-color="#f3ffff" stop-opacity=".65"/><stop offset="1" stop-color="#779fab" stop-opacity=".4"/></linearGradient><linearGradient id="demo-steel"><stop stop-color="#4b6671"/><stop offset=".24" stop-color="#f3faff"/><stop offset=".45" stop-color="#829ba6"/><stop offset=".7" stop-color="#eefaff"/><stop offset="1" stop-color="#536b76"/></linearGradient><clipPath id="demo-water"><path d="M87 317Q147 325 211 317V366H87Z"/></clipPath></defs>
 ${s?'':beaker()}${alcoholLamp(false)}
 <g data-demo-jar>${s?gasCollectionBottle('S'):''}<g data-demo-jar-water opacity="0"><path d="M482 324Q560 334 638 324V336Q560 350 482 336Z" fill="#c4e8f0" fill-opacity=".45" stroke="#c2e8f0"/><ellipse cx="560" cy="324" rx="78" ry="7" fill="#e5faff" fill-opacity=".3"/></g><g data-demo-gas opacity="0">${[0,1,2,3,4,5].map(i=>`<path d="M${500+i*22} 224q13 -13 22 5t15 18" fill="none" stroke="#a5c4d0" stroke-width="9" stroke-linecap="round" opacity="${.10+i%3*.025}"/>`).join('')}</g></g>
 <g data-demo-tray>${sampleVisual(key,false,true,'demo-tray',{form:s?'powder':'block'}).replace('<svg ','<svg x="87" y="116" width="130" height="93" ')}<text x="151" y="225" text-anchor="middle">${s?'硫粉 S':'鈉 Na'}</text></g>
 ${papers}${washBottle()}${pipette()}
 <g data-demo-spoon><g data-demo-empty>${spoonIllustration(key,{empty:true})}</g><g data-demo-raw opacity="0">${spoonIllustration(key)}</g><g data-demo-oxide opacity="0">${spoonIllustration(key,{oxide:true})}</g></g>
 <g data-demo-rest-spoon opacity="0"><path d="M7 -3L157 -14Q168 -19 167 -13Q163 -6 154 -8L8 4Z" fill="url(#demo-steel)" stroke="#57727c"/><ellipse cx="0" cy="3" rx="23" ry="8" fill="#425a67" stroke="#d3e4e7" stroke-width="2"/><ellipse cx="0" cy="1" rx="19" ry="5" fill="url(#demo-steel)"/><ellipse cx="-1" cy="1" rx="15" ry="3" fill="#4c646c"/></g>
 <g data-demo-tongs opacity="0"><path d="M-68 -92L-4 -6 5 0M-58 -98L4 -10 11 -3" fill="none" stroke="url(#demo-steel)" stroke-width="6" stroke-linecap="round"/><path d="M-63 -96L-2 -13" stroke="#e7f3f7" stroke-width="1"/><path d="M-6 -9l15 -2 8 6-15 5Z" fill="${s?'#e1be34':'#c0cbcc'}" stroke="#a6b1ac"/></g>
 <g data-demo-powder opacity="0" clip-path="url(#demo-water)">${Array.from({length:65},(_,i)=>`<ellipse cx="${105+(i*17)%86}" cy="${324+(i*11)%40}" rx="${.8+i%5*.38}" ry="${.5+i%3*.4}" fill="${i%3===0?'#c8bea0':'#f1e7c7'}" stroke="#a9a18a" stroke-width=".2"/>`).join('')}</g>
 <g data-demo-pour-grains opacity="0">${Array.from({length:22},(_,i)=>`<ellipse cx="${141+(i*7)%17}" cy="${277+i*2}" rx="${.7+i%4*.3}" ry="${.6+i%3*.25}" fill="#f3e4b7" stroke="#aca88c" stroke-width=".3"/>`).join('')}</g>
 <g data-demo-bubbles opacity="0">${Array.from({length:12},(_,i)=>`<circle cx="${116+(i*13)%61}" cy="${327+(i*7)%32}" r="${1.4+i%3}" fill="#f5ffff" fill-opacity=".5" stroke="#bdd9dc" stroke-width=".6"/>`).join('')}</g>
 <path data-demo-water-stream d="M560 85Q556 174 560 318" fill="none" stroke="#e0f8ff" stroke-width="4" stroke-linecap="round" opacity="0"/>
 <ellipse data-demo-drop rx="2.4" ry="4" fill="#c1e7f2" stroke="#effcff" opacity="0"/>
 <text x="320" y="403" text-anchor="middle">酒精燈</text></svg>`,'combustion-demo-'+key);
}

export function paintCombustionDemoArt(root,frame){
 const {key,phase,progress:p,index}=frame,s=key==='S',q=ease(p),find=selector=>root.querySelector(selector);
 let bowl=[320,232],angle=0;
 if(phase==='heat')bowl=point([320,232],[320,224],p);
 if(phase==='burn')bowl=s?[560,283]:[320,224];
 if(s&&phase==='transfer')bowl=p<.45?point([320,224],[560,73],p/.45):point([560,73],[560,283],(p-.45)/.55);
 if(phase==='cool'){
  if(s){bowl=p<.55?point([560,283],[560,73],p/.55):point([560,73],[390,356],(p-.55)/.45);angle=80*Math.max(0,(p-.6)/.4);}
  else bowl=point([320,224],[390,227],p);
 }
 if(!s&&phase==='pour'){bowl=point([390,227],[147,275],Math.min(1,p/.65));angle=35*Math.max(0,(p-.35)/.65);}
 const afterPour=!s&&index>=7,afterCool=s&&index>=6;
 if(afterPour){bowl=[235,358];angle=80;}
 if(afterCool){bowl=[390,356];angle=80;}
 find('[data-demo-spoon]').setAttribute('transform',`translate(${bowl[0]} ${bowl[1]}) rotate(${angle}) translate(-29 -205)`);
 const loaded=index>1||phase==='load'&&p>.62,empty=!loaded||afterPour||s&&frame.burned;
 const resting=afterPour||afterCool,coat=phase==='burn'&&!s?q:Number(frame.burned);
 opacity(find('[data-demo-spoon]'),Number(!resting));
 const rest=find('[data-demo-rest-spoon]');opacity(rest,Number(resting));rest.setAttribute('transform',`translate(${bowl[0]} ${bowl[1]})`);
 opacity(find('[data-demo-empty]'),Number(empty));opacity(find('[data-demo-raw]'),empty?0:1-coat);opacity(find('[data-demo-oxide]'),empty?0:coat);
 const tongs=find('[data-demo-tongs]');opacity(tongs,phase==='load'?Math.sin(p*Math.PI):0);
 const tip=point([151,165],[321,228],Math.min(1,p/.7));tongs.setAttribute('transform',`translate(${tip[0]} ${tip[1]})`);
 opacity(find('[data-demo-tray]'),phase==='load'?1-q*.65:index>1?.35:1);
 const dipRed=!s&&phase==='red',dipBlue=!s&&phase==='blue';
 find('[data-demo-red]').setAttribute('transform',dipRed?`translate(${q*94} ${Math.sin(p*Math.PI)*77})`: '');
 find('[data-demo-blue]').setAttribute('transform',dipBlue?`translate(${q*103} ${Math.sin(p*Math.PI)*77})`: '');
 // Both strips return to the rack; only the wet tips change colour.
 if(!s&&dipRed)find('[data-demo-red]').setAttribute('transform',`translate(${Math.sin(p*Math.PI)*98} ${Math.sin(p*Math.PI)*75})`);
 if(!s&&dipBlue)find('[data-demo-blue]').setAttribute('transform',`translate(${Math.sin(p*Math.PI)*103} ${Math.sin(p*Math.PI)*75})`);
 find('[data-demo-red-tip]').setAttribute('fill',!s&&(frame.redTested||dipRed&&p>.48)?'#526eb9':'#c46579');
 find('[data-demo-blue-tip]').setAttribute('fill',s&&(frame.blueTested||phase==='blue'&&p>.62)?'#c46579':'#526eb9');
 opacity(find('[data-demo-powder]'),!s&&index>=6?Math.min(1,phase==='dissolve'?1-q*.75:.25):0);
 opacity(find('[data-demo-pour-grains]'),!s&&phase==='pour'&&p>.6?Math.sin((p-.6)/.4*Math.PI):0);
 opacity(find('[data-demo-bubbles]'),phase==='dissolve'?Math.sin(p*Math.PI):0);
 const jar=find('[data-demo-jar]');jar.setAttribute('transform',phase==='shake'?`translate(${Math.sin(p*Math.PI*6)*5} 0)`: '');
 opacity(find('[data-demo-jar-water]'),s&&index>=6?1:0);
 opacity(find('[data-demo-gas]'),s&&(phase==='burn'||phase==='cool')?.6:0);
 find('[data-demo-gas]').setAttribute('transform',`translate(0 ${phase==='burn'?p*50:50})`);
 const cover=find('[data-jar-cover]');if(cover)cover.setAttribute('transform',s&&index>=7?'translate(21 10)':'translate(-38 -14)');
 const washing=s&&phase==='wash',wash=find('[data-demo-wash]');opacity(wash,Number(washing));
 wash.setAttribute('transform',washing?`translate(${q*90} ${-q*196}) rotate(${q*35} 430 286)`: '');
 opacity(find('[data-demo-water-stream]'),washing&&p>.35&&p<.9?.8:0);
 const pipette=find('[data-demo-pipette]');let pipetteAt=[390,337];const liquid=frame.water&&index>=9;
 if(s&&['take','retake'].includes(phase))pipetteAt=point([390,337],[560,326],p);
 if(s&&['red','blue'].includes(phase))pipetteAt=point([560,326],[phase==='red'?105:209,362],Math.min(1,p/.55));
 opacity(pipette,Number(s&&index>=8));pipette.setAttribute('transform',`translate(${pipetteAt[0]} ${pipetteAt[1]})`);
 opacity(find('[data-demo-pipette-liquid]'),Number(liquid));
 const drop=find('[data-demo-drop]'),dripping=s&&['red','blue'].includes(phase)&&p>.55&&p<.78;
 opacity(drop,Number(dripping));drop.setAttribute('cx',phase==='red'?105:209);drop.setAttribute('cy',mix(362,382,Math.max(0,Math.min(1,(p-.55)/.23))));
 root.dataset.phase=phase;
 return {bowl,lamp:phase==='heat'||phase==='burn'||phase==='transfer',burning:frame.burning};
}
