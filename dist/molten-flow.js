// Liquid surfaces follow the two existing runner paths, in the SVG's 900 × 650 space.
export function createMoltenFlow(canvas){
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 let state={},paused=false,alive=true,visible=true,frame=0,time=0,last=0;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const paths={iron:[[532,545],[578,555],[772,577],[807,586]],slag:[[528,509],[584,514],[663,521]]};
 const routes=Object.fromEntries(Object.entries(paths).map(([kind,points])=>{
  const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
  return [kind,{points,lengths,total:lengths.reduce((a,b)=>a+b,0),opened:0}];
 }));
 function point({points,lengths,total},q){
  let distance=Math.min(.99999,q)*total;
  for(let i=0;i<lengths.length;i++){
   const length=lengths[i];
   if(distance<=length){
    const a=points[i],b=points[i+1],dx=(b[0]-a[0])/length,dy=(b[1]-a[1])/length;
    return [a[0]+distance*dx,a[1]+distance*dy,-dy,dx];
   }
   distance-=length;
  }
  return [...points.at(-1),0,1];
 }
 function line(points,color,width){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
 function pool(x,y,rx,ry,iron,impact=false){
  ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.clip();
  const g=ctx.createRadialGradient(x-rx*.3,y-ry*.45,1,x,y,rx);g.addColorStop(0,iron?'#fff2b5':'#f3ca7d');g.addColorStop(.48,iron?'#ffb044':'#c28542');g.addColorStop(1,iron?'#b83b0d':'#654b32');ctx.fillStyle=g;ctx.fillRect(x-rx,y-ry,rx*2,ry*2);
  for(let i=0;i<12;i++){const u=(i*.173+time*(iron?.065:.025))%1,cx=x-rx+u*rx*2,cy=y+Math.sin(i*2.7+time*.6)*ry*.55;ctx.beginPath();ctx.ellipse(cx,cy,rx*(.12+i%3*.05),ry*.22,Math.sin(time*.4+i)*.12,0,Math.PI*2);ctx.strokeStyle=iron?'#fff6bf55':'#423d3299';ctx.lineWidth=iron?.7:1.5;ctx.stroke();}
  if(impact)for(let i=0;i<4;i++){const q=(time*(iron?1:.5)+i/4)%1;ctx.beginPath();ctx.ellipse(x,y,2+q*rx*.95,1+q*ry*.8,0,0,Math.PI*2);ctx.strokeStyle=`rgba(255,238,175,${(1-q)*.5})`;ctx.lineWidth=.7;ctx.stroke();}ctx.restore();
 }
 function runner(kind){const iron=kind==='iron',route=routes[kind],width=iron?8:7;
  const front=reduced?1:Math.min(1,(time-route.opened)/(iron?.86:1.03));
  if(front<=0)return;
  const track=Array.from({length:61},(_,i)=>point(route,front*i/60));
  ctx.save();ctx.shadowColor=iron?'#ff701c':'#db9b40';ctx.shadowBlur=iron?13:6;
  line(track.map(([x,y])=>[x,y]),iron?'#ed6f1b':'#99703e',width+1);ctx.shadowBlur=0;
  // Advected, irregular ribbons replace schematic dashed arrows.
  const colours=iron?['#b7450e','#f28b27','#ffe1a0','#ffcf68','#e6741b']:['#594a36','#b28b50','#efca86','#d3a366','#78603f'];
  for(let j=0;j<colours.length;j++){
   const ribbon=track.map(([x,y,nx,ny],i)=>{
    const offset=(j-2)*width*.17+Math.sin(front*i*.8-time*(iron?5:1.6)+j)*.65;
    return [x+nx*offset,y+ny*offset];
   });
   line(ribbon,colours[j],1.5);
  }
  for(let i=0;i<20;i++){const q=(i*.0617+time*(iron?.28:.09))%1;if(q>=front)continue;const pts=[];for(let k=0;k<5;k++){const [x,y,nx,ny]=point(route,Math.min(front,q+k*.003));const o=Math.sin(i*4.1)*width*.26;pts.push([x+nx*o,y+ny*o]);}line(pts,iron?'#fff1b366':'#403a2f99',iron?.65:1.7);}
  if(front<1){ctx.restore();return;}
  const [x,y]=route.points.at(-1);pool(x,y+1,iron?41:35,iron?5.5:5.3,iron,true);
  for(let i=0;i<(iron?7:3);i++){const q=(time*(iron?.8:.4)+i*.161)%1,dx=Math.sin(i*2.4)*q*(iron?13:7),dy=-Math.sin(q*Math.PI)*(iron?12:5);ctx.globalAlpha=(1-q)*.65;ctx.fillStyle=iron?'#ffdb83':'#d9ae64';ctx.beginPath();ctx.ellipse(x+dx,y+dy,.6,1.1,dx*.08,0,Math.PI*2);ctx.fill();}ctx.restore();
 }
 function draw(now){frame=0;if(!alive)return;time+=paused||reduced?0:Math.max(0,Math.min(.08,(now-(last||now))/1000));last=now;const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.setTransform(w/900,0,0,h/650,0,0);ctx.clearRect(0,0,900,650);
  if(state.iron)pool(451,535,49,5,true);if(state.slag)pool(451,518,52,4,false);if(state.slagTapped)runner('slag');if(state.ironTapped)runner('iron');canvas.dataset.renderer='flowing-liquid';if(visible&&!paused&&!reduced&&(state.iron||state.slag))frame=requestAnimationFrame(draw);
 }
 const schedule=()=>{last=performance.now();if(!frame&&alive)frame=requestAnimationFrame(draw);};const ro=new ResizeObserver(schedule);ro.observe(canvas);const io=new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)schedule();});io.observe(canvas);
 return {set(next,stop=false){
  if(next.ironTapped&&!state.ironTapped)routes.iron.opened=time;
  if(next.slagTapped&&!state.slagTapped)routes.slag.opened=time;
  state=next;paused=stop;schedule();
 },dispose(){alive=false;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();}};
}
