export function combustionNextAction({loaded,ignited,isMetal,inJar,near,complete}){
 if(complete)return {id:'observe'};
 if(!loaded)return {id:'load',tool:'[data-shelf-sample].selected',target:'[data-shelf-target]',label:'拿取樣本',instruction:'下一步：從桌面拿取樣本，放到箭頭標示的燃燒匙凹槽。'};
 if(!ignited&&!near)return {id:'heat',tool:'[data-spoon]',target:'[data-heat-zone]',label:'移向火焰',instruction:'下一步：抓住燃燒匙，把匙端移到箭頭標示的火焰上方加熱。'};
 if(ignited&&!isMetal&&!inJar)return {id:'bottle',tool:'[data-spoon]',target:'[data-jar-target]',instruction:'下一步：把燃燒匙拖進箭頭標示的集氣瓶內，放開觀察。'};
 return {id:'observe',instruction:'正在反應，觀察樣本顏色與反應式；看完後按「觀察完成，查看產物」。'};
}
export function solidNextAction({completed,ready,adding,dipped=[]}){
 if(!completed)return {id:'wait'};
 if(adding)return {id:'adding'};
 if(!ready)return {id:'water',tool:'[data-bench-product]',target:'[data-bench-add]',instruction:'下一步：抓住箭頭標示的燃燒匙，把匙端移到箭頭標示的清水杯口。'};
 const paper=['red','blue'].find(p=>!dipped.includes(p));
 return paper?{id:'paper-'+paper,tool:`[data-bench-paper="${paper}"]`,target:'[data-bench-liquid]',label:paper==='red'?'拿紅色試紙':'拿藍色試紙',instruction:`下一步：把箭頭標示的${paper==='red'?'紅色':'藍色'}石蕊試紙下端浸入杯中液體。`}:{id:'complete'};
}
export function highlightNext(root,next){
 root.querySelectorAll('.next-specimen').forEach(el=>el.classList.remove('next-specimen'));
 root.querySelectorAll('.experiment-next-tool,.experiment-next-target').forEach(el=>{el.classList.remove('experiment-next-tool','experiment-next-target');el.removeAttribute('data-next-label');});
 root.dataset.nextAction=next.id;
 if(next.tool){const selector=next.id==='load'&&root.dataset.nextSample?'[data-shelf-sample="'+root.dataset.nextSample+'"]':next.tool;const el=root.querySelector(selector);if(el){el.classList.add('experiment-next-tool');el.closest('.tabletop-specimen')?.classList.add('next-specimen');if(next.label&&!root.closest('.combustion-lesson'))el.dataset.nextLabel=next.label;}}
 if(next.target)root.querySelector(next.target)?.classList.add('experiment-next-target');
}
