import {scopeMarkup} from './card-markup.js';
// Rack specimens are reusable; pointer and keyboard share the same hit test.
let dragCopy=0;
export function bindWorkbenchDrag(item,{targets,onDrop,onMiss=()=>{},blocked=()=>false,visualSelector=null}){
 let drag=null,x=0,y=0,hit=null,proxy=null,origin=null;
 const clear=()=>targets().forEach(n=>n.classList.remove('finish-drop-active','finish-drop-hover'));
 const paint=()=>{if(proxy){proxy.style.left=origin.left+x+'px';proxy.style.top=origin.top+y+'px';}else item.style.transform=`translate(${x}px,${y}px)`;const r=(proxy||item).getBoundingClientRect(),px=r.left+r.width/2,py=r.top+r.height/2;hit=null;for(const node of targets()){const b=node.getBoundingClientRect(),inside=px>=b.left&&px<=b.right&&py>=b.top&&py<=b.bottom;node.classList.toggle('finish-drop-hover',inside);if(inside)hit=node;}};
 const start=()=>{if(drag||blocked())return false;const source=visualSelector&&item.querySelector(visualSelector);if(source){origin=source.getBoundingClientRect();proxy=document.createElement('div');proxy.className='finish-specimen-in-hand';proxy.setAttribute('aria-hidden','true');proxy.innerHTML=scopeMarkup(source.outerHTML,'held-blade-'+(++dragCopy));Object.assign(proxy.style,{left:origin.left+'px',top:origin.top+'px',width:origin.width+'px',height:origin.height+'px'});document.body.append(proxy);item.classList.add('has-drag-proxy');}item.classList.add('dragging');item.setAttribute('aria-pressed','true');targets().forEach(n=>n.classList.add('finish-drop-active'));return true;};
 const end=cancel=>{if(!drag)return;paint();const target=hit,id=drag.id;drag=null;x=y=0;proxy?.remove();proxy=origin=null;item.style.transform='';item.classList.remove('dragging','has-drag-proxy');item.setAttribute('aria-pressed','false');clear();if(id!==undefined&&item.hasPointerCapture(id))item.releasePointerCapture(id);if(!cancel){if(target)onDrop(target);else onMiss();}};
 const down=e=>{if(e.button!==0||!start())return;e.preventDefault();drag={id:e.pointerId,sx:e.clientX,sy:e.clientY};item.setPointerCapture(e.pointerId);};
 const move=e=>{if(drag?.id!==e.pointerId)return;x=e.clientX-drag.sx;y=e.clientY-drag.sy;paint();};
 const up=e=>{if(drag?.id===e.pointerId)end(false);};const cancel=()=>end(true);
 const key=e=>{if(e.key==='Escape'){if(drag)e.preventDefault();end(true);return;}if(e.key==='Enter'||e.key===' '){e.preventDefault();if(drag?.keyboard)end(false);else if(start())drag={keyboard:true};return;}if(drag?.keyboard&&['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const step=e.shiftKey?30:12;x+=e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0;y+=e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0;paint();}};
 item.tabIndex=0;item.setAttribute('role','button');item.classList.add('finish-draggable');item.setAttribute('aria-label',item.getAttribute('aria-label')+'；拖曳或 Enter 拿起、方向鍵移動、Enter 放下，Escape 取消');
 const events=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel],['blur',cancel],['keydown',key]];for(const [n,f]of events)item.addEventListener(n,f);
 return ()=>{end(true);for(const [n,f]of events)item.removeEventListener(n,f);};
}
export function bindLoadGrip(item,board,{enabled,onMove,onRelease,travelFraction=.37}){
 let drag=null,q=0;const length=()=>board.getBoundingClientRect().height*travelFraction;
 const paint=v=>{q=Math.max(0,Math.min(1,v));item.style.transform=`translateY(${q*length()}px)`;item.setAttribute('aria-valuenow',String(Math.round(q*100)));onMove(q);};
 const end=cancel=>{if(!drag)return;const id=drag.id,value=q;drag=null;q=0;item.style.transform='';item.classList.remove('dragging');item.setAttribute('aria-valuenow','0');if(id!==undefined&&item.hasPointerCapture(id))item.releasePointerCapture(id);if(cancel)onMove(0);else onRelease(value);};
 const down=e=>{if(e.button!==0||drag||!enabled())return;e.preventDefault();drag={id:e.pointerId,y:e.clientY};item.classList.add('dragging');item.setPointerCapture(e.pointerId);};
 const move=e=>{if(drag?.id===e.pointerId)paint((e.clientY-drag.y)/length());};const up=e=>{if(drag?.id===e.pointerId)end(false);};const cancel=()=>end(true);
 const key=e=>{if(!enabled())return;if(e.key==='Escape'){e.preventDefault();end(true);return;}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();drag=drag||{keyboard:true};paint(e.key==='Home'?0:e.key==='End'?1:q+(e.key==='ArrowDown'?.1:-.1));}else if(['Enter',' '].includes(e.key)){e.preventDefault();end(false);}};
 item.tabIndex=0;item.setAttribute('role','slider');item.setAttribute('aria-valuemin','0');item.setAttribute('aria-valuemax','100');item.setAttribute('aria-valuenow','0');
 const events=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel],['blur',cancel],['keydown',key]];for(const [n,f]of events)item.addEventListener(n,f);
 return ()=>{end(true);for(const [n,f]of events)item.removeEventListener(n,f);};
}
