export function chapterKicker(number){
 const label=number==='序章'?'00':number;
 return `<div class="chapter-kicker"><span class="chapter-number">${label}</span></div>`;
}
