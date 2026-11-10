// Preserve the original half-width pairs and full-width explanations, with one height.
export function mountUniformDialogue(root=document.body){
 const page=document.documentElement;
 let frame=0,stopped=false;
 const widths=new WeakMap(),parents=new Set();
 const schedule=()=>{
  if(!stopped&&!frame)frame=requestAnimationFrame(()=>{frame=0;measure();});
 };
 const resize=new ResizeObserver(entries=>{
  let changed=false;
  for(const entry of entries){
   const width=entry.contentRect.width;
   if(widths.get(entry.target)!==width){widths.set(entry.target,width);changed=true;}
  }
  if(changed)schedule();
 });
 function measure(){
  const speeches=[...root.querySelectorAll('.story-speech')];
  if(!speeches.length)return;
  const activeParents=new Set(speeches.map(speech=>speech.parentElement));
  for(const parent of parents)if(!activeParents.has(parent)){resize.unobserve(parent);parents.delete(parent);}
  const availableWidths=new Map(),layoutWidths=new Map();
  const layout=speech=>{
   const dialogue=speech.closest('.story-dialogue');
   return !dialogue?'solo':dialogue.closest('.with-forge-scene')?'scene':dialogue.classList.contains('dialogue-stack')?'stack':'pair';
  };
  for(const parent of activeParents){
   if(!parents.has(parent)){parents.add(parent);resize.observe(parent);}
  }
  for(const speech of speeches){
   const available=speech.getBoundingClientRect().width;
   if(available>0){
    availableWidths.set(speech,Math.floor(available));
    const kind=layout(speech);
    layoutWidths.set(kind,Math.min(layoutWidths.get(kind)||Infinity,Math.floor(available)));
   }
  }
  if(!availableWidths.size)return;
  const fallbackWidth=Math.min(...availableWidths.values());
  const hiddenWidth=speech=>{
   const kind=layout(speech);
   if(kind==='pair'||kind==='scene')return layoutWidths.get(kind)||fallbackWidth;
   for(let parent=speech.parentElement;parent;parent=parent.parentElement){
    const width=parent.getBoundingClientRect().width;
    if(width>0){
     const style=getComputedStyle(parent);
     return Math.floor(width-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-parseFloat(style.borderLeftWidth)-parseFloat(style.borderRightWidth));
    }
   }
   return layoutWidths.get(kind)||fallbackWidth;
  };

  // Include unrevealed explanations so opening a tab does not clip longer text.
  const probe=document.createElement('div');
  probe.className='dialogue-size-probe';
  probe.dataset.dialogueMeasure='';
  probe.inert=true;
  probe.setAttribute('aria-hidden','true');
  for(const speech of speeches){
   const copy=speech.cloneNode(true);
   copy.removeAttribute('hidden');
   copy.removeAttribute('id');
   // Full-width explanations must be measured at their own width, not squeezed
   // into a half-width copy that adds empty height to every dialogue on the page.
   copy.style.width=(availableWidths.get(speech)||hiddenWidth(speech))+'px';
   copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
   probe.append(copy);
  }
  root.append(probe);
  const height=Math.ceil(Math.max(...[...probe.children].map(copy=>copy.getBoundingClientRect().height)));
  probe.remove();
  const heightValue=height+'px';
  if(page.style.getPropertyValue('--dialogue-height')!==heightValue)page.style.setProperty('--dialogue-height',heightValue);
 }
 const hasDialogue=node=>node.nodeType===1&&!node.matches('[data-dialogue-measure]')&&(node.matches('.story-speech')||node.querySelector('.story-speech'));
 const changes=new MutationObserver(records=>{
  if(records.some(record=>{
   if(record.target.parentElement?.closest('[data-dialogue-measure]')||record.target.nodeType===1&&record.target.matches('[data-dialogue-measure]'))return false;
   if(record.type==='attributes')return hasDialogue(record.target);
   const target=record.target.nodeType===1?record.target:record.target.parentElement;
   if(target?.closest('.story-speech'))return true;
   return [...record.addedNodes,...record.removedNodes].some(hasDialogue);
  }))schedule();
 });
 measure();
 changes.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden']});
 window.addEventListener('resize',schedule);
 document.fonts?.ready.then(schedule);
 document.fonts?.addEventListener('loadingdone',schedule);
 return ()=>{
  stopped=true;
  cancelAnimationFrame(frame);
  resize.disconnect();
  changes.disconnect();
  window.removeEventListener('resize',schedule);
  document.fonts?.removeEventListener('loadingdone',schedule);
 };
}
