// The same isolated sodium cut is used on the dish, in the jaws and in the spoon.
// Preserve the cut-face texture and irregular edges; exclude the storage oil and jar.
export function sodiumSpecimen(x,y,width,height,prefix='sodium'){
 const id=prefix.replace(/[^a-z0-9_-]/gi,'-');
 return `<svg class="sodium-solid" x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 100 72" preserveAspectRatio="xMidYMid meet" overflow="visible" aria-hidden="true"><defs>
 <clipPath id="${id}-cut-outline"><path d="M287 282L328 291L385 309L380 325L354 367L249 347L253 329Z"/></clipPath>
 <filter id="${id}-silver-surface" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values=".12"/><feComponentTransfer><feFuncR type="linear" slope="1.06" intercept=".025"/><feFuncG type="linear" slope="1.09" intercept=".03"/><feFuncB type="linear" slope="1.13" intercept=".035"/></feComponentTransfer></filter>
 <linearGradient id="${id}-edge" x2="0" y2="1"><stop stop-color="#eef1ed" stop-opacity=".32"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#243239" stop-opacity=".24"/></linearGradient>
 </defs><svg x="4" y="5" width="92" height="62" viewBox="249 282 138 86" preserveAspectRatio="xMidYMid meet" overflow="visible"><g clip-path="url(#${id}-cut-outline)"><image href="./assets/story/elements/specimen-Na.webp" width="600" height="450" filter="url(#${id}-silver-surface)"/><path d="M287 282L385 309L354 367L249 347Z" fill="url(#${id}-edge)"/><path d="M287 283L329 294L383 310M287 283L270 316" stroke="#edf1ed" stroke-opacity=".52" stroke-width=".7" fill="none"/></g></svg></svg>`;
}
export const sodiumOnDish={x:47,y:38,width:66,height:47.52};
export const sodiumOnSpoon={x:12,y:183.52,width:34,height:24.48};
