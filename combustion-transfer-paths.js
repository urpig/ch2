export const collectionMouth={x:560,y:85,clearance:40};
const smooth=t=>t*t*(3-2*t);
function route(points,p){
 const t=Math.max(0,Math.min(1,p))*(points.length-1),i=Math.min(points.length-2,Math.floor(t)),f=smooth(t-i);
 return points[i].map((v,k)=>v+(points[i+1][k]-v)*f);
}
// Cross the rim only on its centreline; never carry a tool through the sidewall.
export function enterCollectionJar(from,depth,p){
 const {x,clearance:y}=collectionMouth;
 return route([from,[from[0],y],[x,y],[x,depth]],p);
}
export function leaveCollectionJar(to,depth,p){
 const {x,clearance:y}=collectionMouth;
 return route([[x,depth],[x,y],[to[0],y],to],p);
}
