import {mountOreHammer} from './ore-hammer.js';
import {mountIronTransfer} from './iron-transfer.js';
import {mountRedox} from './redox-workshop.js';
import {bindDrop,bindPull} from './direct-manipulation.js';
import {mountOre} from './ore-orbit.js';
import {storyScene} from './story-scenes.js';
import {sampleVisual} from './specimens.js';
import {rockIllustration} from './lesson-materials.js';
import {scopeMarkup} from './card-markup.js';
import {mountFurnace} from './furnace-workshop.js';
import {mountBlade} from './blade-workshop.js';
import {mountRust} from './rust-workshop.js';
let sceneId=0;
const svg=(body,label)=>scopeMarkup(`<svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${label}"><defs><linearGradient id="steel-texture"><stop stop-color="#61756c"/><stop offset=".36" stop-color="#d3ded2"/><stop offset=".48" stop-color="#f6f9ed"/><stop offset=".67" stop-color="#8b9e8f"/><stop offset="1" stop-color="#4a6054"/></linearGradient></defs><rect width="640" height="360" fill="#e9eee1"/><path d="M0 300H640V360H0Z" fill="#d6e0cf"/>${body}</svg>`,'narrative-'+(++sceneId));
const txt=(x,y,t,size=16)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="#46604b">${t}</text>`;
export function mountNarrative(root,c,ctx){
 const {s,has,record,notice,delay,onCleanup}=ctx;
 if(c.type==='ore'){
 root.innerHTML='<section class="ore-viewer ore-solo" aria-label="赤鐵礦三維觀察台"><div class="ore-render-stage"><canvas class="ore-canvas" tabindex="0" role="img" aria-label="立體赤鐵礦；拖曳旋轉、滾輪縮放，方向鍵亦可轉動"></canvas><span class="ore-gesture-hint">拖曳旋轉 · 滾輪縮放</span></div></section>';
 onCleanup(mountOre(root.querySelector('canvas'),()=>{record('ore');}));onCleanup(mountOreHammer(root.querySelector('.ore-viewer'),{onCrushed:()=>{record('ore-crushed');}}));return;
 }
 if(c.type==='redox')return mountRedox(root,c,ctx);
 if(c.type==='iron')return mountIronTransfer(root,c,ctx);
 if(c.type==='furnace')return mountFurnace(root,c,ctx);
 if(c.type==='steel')return mountBlade(root,c,ctx);
 if(c.type==='rust')return mountRust(root,c,ctx);
}
