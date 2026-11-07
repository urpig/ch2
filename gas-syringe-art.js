export function gasSyringe(suffix,angle=-22){
 const id='syringe-photo-'+suffix;
 const image='<image href="./assets/story/life-gas-syringe-v2.png" x="7" y="31" width="162" height="54" preserveAspectRatio="none"/>';
 return `<svg class="${suffix==='supply'?'bleach-supply ':''}gas-syringe" width="180" height="142" viewBox="0 0 180 142" aria-hidden="true">
 <defs>
  <linearGradient id="${id}-clear" x2="0" y2="1"><stop stop-color="#eef7f7" stop-opacity=".65"/><stop offset=".4" stop-color="#c9dce0" stop-opacity=".22"/><stop offset="1" stop-color="#e8f3f4" stop-opacity=".55"/></linearGradient>
  <clipPath id="${id}-body"><path d="M37 31H171V87H37Z M62 47V70H73V47Z" clip-rule="evenodd"/></clipPath>
  <clipPath id="${id}-plunger"><path d="M6 31H37V87H6Z M62 47H73V70H62Z"/></clipPath>
 </defs>
 ${suffix==='supply'?'<ellipse cx="89" cy="119" rx="68" ry="5" fill="#102b3547"/>':''}
 <g transform="rotate(${angle} 90 71)">
  <rect x="62" y="47" width="11" height="23" fill="url(#${id}-clear)"/>
  <g clip-path="url(#${id}-body)">${image}</g>
  <g class="syringe-plunger"><g clip-path="url(#${id}-plunger)">${image}</g></g>
  <rect x="80" y="85" width="41" height="18" rx="3" fill="#fffbed" stroke="#c2cdbd"/><text x="100" y="98" text-anchor="middle" font-size="12" font-weight="600" fill="#315560">SO₂</text>
 </g></svg>`;
}
