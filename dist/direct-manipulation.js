export function inside(point,rect){return point.x>=rect.left&&point.x<=rect.right&&point.y>=rect.top&&point.y<=rect.bottom;}
// A reusable instrument stays where it is released; its effect follows every move.
export function bindFreeSpoon(item,board,options={}){return bindFreeInstrument(item,board,options);}
export function bindFreeInstrument(item,board,{position=[320,224],offset=[29,205],bounds=[30,730,85,390],instrumentClass='free-spoon',onMove=()=>{},onGrab=()=>{},onRelease=()=>{}}={}){
 let point=[...position],drag=null;const clamp=p=>[Math.max(bounds[0],Math.min(bounds[1],p[0])),Math.max(bounds[2],Math.min(bounds[3],p[1]))];
 const paint=()=>{item.style.left=((point[0]-offset[0])/760*100)+'%';item.style.top=((point[1]-offset[1])/430*100)+'%';onMove([...point],!!drag);};
 const grab=()=>{item.classList.add('dragging');item.setAttribute('aria-pressed','true');onGrab();};
 const finish=cancel=>{if(!drag)return;const origin=drag.origin;drag=null;item.classList.remove('dragging');item.setAttribute('aria-pressed','false');if(cancel)point=origin;else{const next=onRelease([...point]);if(next)point=clamp(next);}paint();};
 item.classList.add('draggable',instrumentClass);item.tabIndex=0;item.setAttribute('role','button');
 const label=item.getAttribute('aria-label')||'燃燒匙';item.setAttribute('aria-label',label+'；可重複拖動，Enter 拿起或放下，方向鍵移動，Escape 回到拿起位置');
 const down=e=>{if(e.button!==0||drag)return;e.preventDefault();drag={id:e.pointerId,client:[e.clientX,e.clientY],origin:[...point]};item.setPointerCapture(e.pointerId);grab();};
 const move=e=>{if(drag?.id!==e.pointerId)return;const r=board.getBoundingClientRect();point=clamp([drag.origin[0]+(e.clientX-drag.client[0])/r.width*760,drag.origin[1]+(e.clientY-drag.client[1])/r.height*430]);paint();};
 const up=e=>{if(drag?.id!==e.pointerId)return;const id=e.pointerId;finish(false);if(item.hasPointerCapture(id))item.releasePointerCapture(id);};
 const cancel=()=>finish(true);
 const lost=e=>{if(drag?.id===e.pointerId)finish(true);};
 const key=e=>{if(e.key==='Escape'&&drag){e.preventDefault();finish(true);return;}if(e.key==='Enter'||e.key===' '){e.preventDefault();if(drag?.keyboard)finish(false);else if(!drag){drag={keyboard:true,origin:[...point]};grab();}return;}if(drag?.keyboard&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const n=e.shiftKey?24:8;point=clamp([point[0]+(e.key==='ArrowRight'?n:e.key==='ArrowLeft'?-n:0),point[1]+(e.key==='ArrowDown'?n:e.key==='ArrowUp'?-n:0)]);paint();}};
 for(const [event,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',lost],['keydown',key]])item.addEventListener(event,fn);
 paint();return ()=>{for(const [event,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',lost],['keydown',key]])item.removeEventListener(event,fn);if(drag?.id!==undefined&&item.hasPointerCapture(drag.id))item.releasePointerCapture(drag.id);drag=null;};
}
// Pointer and keyboard paths share the same hit test and completion callback.
export function bindDrop(item,zone,{onDrop,onMove=()=>{},onMiss=()=>{},anchor=[.5,.5],keep=false,highlightOnPickup=true,disabled=()=>false}={}){
 let drag=null,x=0,y=0,settled=false;
 const target=()=>typeof zone==='function'?zone():zone;
 item.classList.add('draggable');item.tabIndex=0;item.setAttribute('role','button');
 const initialLabel=item.getAttribute('aria-label')||item.textContent.trim();item.setAttribute('aria-label',initialLabel+'；拖曳，或 Enter 拿起、方向鍵移動、Enter 放下');
 function point(){const r=item.getBoundingClientRect();return {x:r.left+r.width*anchor[0],y:r.top+r.height*anchor[1]};}
 function paint(){item.style.transform=`translate(${x}px,${y}px)`;const z=target();if(!z)return false;const r=z.getBoundingClientRect(),hit=inside(point(),r);z.classList.toggle('drop-hover',hit);onMove(hit,item.getBoundingClientRect(),r);return hit;}
 function start(){if(settled||disabled())return false;const z=target();if(!z)return false;item.classList.add('dragging');item.setAttribute('aria-pressed','true');if(highlightOnPickup)z.classList.add('drop-active');return true;}
 function finish(cancel=false){const available=!disabled(),hit=!cancel&&available&&paint(),z=target();item.classList.remove('dragging');item.setAttribute('aria-pressed','false');z?.classList.remove('drop-active','drop-hover');drag=null;if(hit){settled=true;item.classList.add('placed');item.setAttribute('aria-label',initialLabel+'；已放置');if(keep){const r=item.getBoundingClientRect(),parent=item.offsetParent.getBoundingClientRect();item.style.left=((r.left-parent.left)/parent.width*100)+'%';item.style.top=((r.top-parent.top)/parent.height*100)+'%';}x=0;y=0;item.style.transform='';onDrop();}else{x=0;y=0;item.style.transform='';if(z)onMove(false,item.getBoundingClientRect(),z.getBoundingClientRect());if(!cancel&&available)onMiss();}}
 item.addEventListener('pointerdown',e=>{if(e.button!==0||!start())return;e.preventDefault();drag={id:e.pointerId,sx:e.clientX-x,sy:e.clientY-y};item.setPointerCapture(e.pointerId);});
 item.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;x=e.clientX-drag.sx;y=e.clientY-drag.sy;paint();});
 item.addEventListener('pointerup',e=>{if(drag?.id!==e.pointerId)return;item.releasePointerCapture(e.pointerId);finish();});
 item.addEventListener('pointercancel',()=>{if(drag)finish(true);});
 item.addEventListener('keydown',e=>{if(settled||disabled())return;if(e.key==='Escape'){e.preventDefault();if(drag)finish(true);return;}if(e.key==='Enter'||e.key===' '){e.preventDefault();if(drag?.keyboard)finish();else if(!drag&&start())drag={keyboard:true};return;}if(drag?.keyboard&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const n=e.shiftKey?30:12;x+=e.key==='ArrowRight'?n:e.key==='ArrowLeft'?-n:0;y+=e.key==='ArrowDown'?n:e.key==='ArrowUp'?-n:0;paint();}});
 return ()=>{settled=false;x=y=0;drag=null;item.style.transform='';item.classList.remove('placed','dragging');};
}
export function bindPull(item,{limit=90,onMove,onRelease}){
 let start=null,amount=0;
 item.classList.add('draggable');item.tabIndex=0;item.setAttribute('role','button');
 const paint=v=>{amount=Math.max(0,Math.min(limit,v));item.style.transform=`translateY(${amount}px)`;onMove(amount/limit);};
 item.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();start=e.clientY;item.setPointerCapture(e.pointerId);item.classList.add('dragging');});
 item.addEventListener('pointermove',e=>{if(start!==null)paint(e.clientY-start);});
 item.addEventListener('pointerup',e=>{if(start===null)return;start=null;item.releasePointerCapture(e.pointerId);item.classList.remove('dragging');onRelease(amount/limit);paint(0);});
 item.addEventListener('pointercancel',()=>{start=null;paint(0);});
 item.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();paint(amount+15);}if(e.key==='ArrowUp'){e.preventDefault();paint(amount-15);}if(e.key==='Enter'||e.key===' '){e.preventDefault();onRelease(amount/limit);paint(0);}});
}
