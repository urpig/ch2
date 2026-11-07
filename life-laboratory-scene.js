export function laboratoryBackdrop(complete=false){
 return `<div class="life-lab-backdrop" aria-hidden="true"></div><span class="life-lab-phase" data-lab-phase aria-hidden="true">${complete?'觀察後':'反應前'}</span>`;
}

export function gasChamber(){
 return `<svg class="lab-gas-chamber" viewBox="0 0 760 460" preserveAspectRatio="none" aria-hidden="true">
 <defs>
  <linearGradient id="lab-chamber-glass">
   <stop stop-color="#e6f8f8" stop-opacity=".48"/><stop offset=".09" stop-color="#d7eff2" stop-opacity=".14"/>
   <stop offset=".64" stop-color="#e6f8f8" stop-opacity=".05"/><stop offset=".94" stop-color="#aec8ca" stop-opacity=".17"/>
   <stop offset="1" stop-color="#e6f8f8" stop-opacity=".43"/>
  </linearGradient>
  <linearGradient id="lab-chamber-port" x2="0" y2="1">
   <stop stop-color="#f1fbfa"/><stop offset=".34" stop-color="#96afb0"/><stop offset=".54" stop-color="#526a70"/><stop offset=".79" stop-color="#a7bec0"/><stop offset="1" stop-color="#41575a"/>
  </linearGradient>
 </defs>
 <path d="M185 352V228C185 153 237 119 315 119S440 157 440 228V352Q440 365 422 365H204Q185 365 185 352Z" fill="url(#lab-chamber-glass)" stroke="#d1e5e7" stroke-width="1.7"/>
 <path d="M194 339V230Q194 167 251 140" fill="none" stroke="#fbffff" stroke-opacity=".62" stroke-width="3" stroke-linecap="round"/>
 <path d="M423 184Q431 204 431 231V338" fill="none" stroke="#e1f6f8" stroke-opacity=".5" stroke-width="2"/>
 <ellipse cx="313" cy="353" rx="128" ry="15" fill="none" stroke="#a6c4ca" stroke-opacity=".72"/>
 <path d="M185 352Q314 383 440 352" fill="none" stroke="#e6f6f5" stroke-opacity=".72" stroke-width="3"/>
 <path d="M174 218H197V232H174Q169 225 174 218Z" fill="url(#lab-chamber-port)" stroke="#658184"/>
 <ellipse cx="173" cy="225" rx="3" ry="6" fill="#223c44" stroke="#b1d0d2"/>
 </svg><span class="lab-chamber-label" aria-hidden="true">密閉罩</span>`;
}
