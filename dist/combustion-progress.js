export function combustionProgressMarkup(label='操作步驟'){
 return `<ol class="combustion-demo-steps" aria-label="${label}"><li data-demo-process="0" aria-current="step">取樣</li><li data-demo-process="1">加熱燃燒</li><li data-demo-process="2">產物加水</li><li data-demo-process="3">測試紙</li></ol>`;
}

export function updateCombustionProgress(root,index){
 for(const step of root.querySelectorAll('[data-demo-process]')){
  if(Number(step.dataset.demoProcess)===index)step.setAttribute('aria-current','step');
  else step.removeAttribute('aria-current');
 }
}
