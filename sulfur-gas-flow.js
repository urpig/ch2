// Visible labels represent an invisible gas, rather than coloured smoke.
export function sulfurGasFlow(key='S'){
 const formula=key==='C'?'CO₂':'SO₂',name=key==='C'?'碳燃燒產生無色二氧化碳':'硫燃燒產生無色二氧化硫';
 const markers = Array.from({length:6},(_,i)=>`<g transform="translate(${504+i%3*44} 240)">
  <g class="sulfur-gas-marker" style="--gas-delay:${-i*.6}s;--gas-sway:${i%2?8:-8}px"><ellipse rx="17" ry="11"/><text text-anchor="middle" y="4">${formula}</text></g>
 </g>`).join('');
 return `<svg class="sulfur-gas-flow" viewBox="0 0 760 430" role="img" aria-label="${name}，分子標記向瓶底移動的示意"><text class="sulfur-gas-caption" x="560" y="188" text-anchor="middle">${formula} 無色氣體 · 分子示意</text>${markers}<path class="sulfur-gas-arrow" d="M625 246v65m-5-7 5 7 5-7"/></svg>`;
}
