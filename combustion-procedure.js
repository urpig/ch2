export function combustionProcedureSteps(key='Na'){
 const gas=['S','C','CO'].includes(key),phosphorus=key==='P';
 return {
  title:gas||phosphorus?'非金屬的實驗步驟':'金屬的實驗步驟',
  steps:gas?[
   ['取樣','把樣本放上燃燒匙。'],
   ['點燃、收集產物','在酒精燈上點燃，再把燃燒匙放進預先充氧的集氣瓶。'],
   ['加水、左右搖晃','燃燒結束並冷卻後，取出燃燒匙；加入蒸餾水，蓋好玻璃片並左右搖晃，讓氣體溶於水。'],
   ['測試紙','用滴管取瓶內液體，滴到紅色石蕊；重新取液，再滴到藍色石蕊。']
  ]:[
   ['取樣','把樣本放上燃燒匙。'],
   ['加熱'+(phosphorus?'燃燒':''),'把匙端靠近酒精燈，觀察樣本的變化和火焰。'],
   ['產物加水','冷卻後，把燃燒匙上的產物加入清水。'],
   ['測試紙','分別把紅、藍石蕊試紙的下端浸入水中，觀察顏色變化。']
  ]
 };
}
export function updateCombustionProcedure(root,key){
 const box=root.closest('article')?.querySelector('.combustion-procedure');if(!box)return;
 const {title,steps}=combustionProcedureSteps(key);
 box.setAttribute('aria-label',title);box.querySelector('h3').textContent=title;
 box.querySelector('ol').innerHTML=steps.map(([label,text])=>`<li><strong>${label}：</strong>${text}</li>`).join('');
 const status=box.querySelector('[data-demo-instruction]');if(status)status.textContent='';
}
