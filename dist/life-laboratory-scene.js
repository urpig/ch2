export function laboratoryBackdrop(complete=false){
 return `<div class="life-lab-backdrop" aria-hidden="true"></div><span class="life-lab-phase" data-lab-phase aria-hidden="true">${complete?'觀察後':'反應前'}</span>`;
}

export const gasChamberPort={x:149,y:267};

export function gasChamberBase(){
 return `<svg class="lab-chamber-base" viewBox="0 0 330 62" aria-hidden="true"><image href="./assets/story/bleach-props/glass-bell-jar-v1.png" x="0" y="-241" width="330" height="303" preserveAspectRatio="xMidYMid meet"/></svg>`;
}

export function gasChamber(){
 return `<svg class="lab-gas-chamber" viewBox="0 0 760 460" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
 <image href="./assets/story/bleach-props/glass-bell-jar-v1.png" x="143" y="84" width="330" height="303" preserveAspectRatio="xMidYMid meet"/>
 </svg><span class="lab-chamber-label" aria-hidden="true">密閉罩</span>`;
}
