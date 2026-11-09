// Photographic steel and rust share a fixed silhouette; only the corrosion texture grows.
const PHOTO='./assets/story/rust-sword-photo-atlas-v2.png';
const W=1536,H=220;
let sourcePromise;
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function hash(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}
function noise(x,y){
 const a=Math.floor(x),b=Math.floor(y),u=smooth(x-a),v=smooth(y-b);
 return (hash(a,b)*(1-u)+hash(a+1,b)*u)*(1-v)+(hash(a,b+1)*(1-u)+hash(a+1,b+1)*u)*v;
}
function makeCanvas(w,h){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;return canvas;}
function sources(){
 if(sourcePromise)return sourcePromise;
 sourcePromise=new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>{
   try{
    const clean=makeCanvas(W,H),rust=makeCanvas(W,H),cleanCtx=clean.getContext('2d'),rustCtx=rust.getContext('2d');
    cleanCtx.drawImage(image,0,230,W,H,0,0,W,H);
    rustCtx.drawImage(image,0,615,W,H,0,0,W,H);
    const cleanPixels=cleanCtx.getImageData(0,0,W,H).data,rustPixels=rustCtx.getImageData(0,0,W,H).data;
    const thresholds=new Float32Array(W*H).fill(2),opacity=new Uint8ClampedArray(W*H);
    for(let y=25;y<160;y++)for(let x=399;x<1510;x++){
     const i=y*W+x,a=cleanPixels[i*4+3];if(a<40)continue;
     const n=noise(x/91,y/29)*.55+noise(x/27,y/12)*.29+noise(x/8,y/5)*.16;
     const edge=Math.min(1,Math.abs(y-108)/52)*.045;
     thresholds[i]=clamp((n-.27)/.49-edge);
     opacity[i]=Math.min(a,rustPixels[i*4+3]);
    }
    resolve({clean,rustPixels,thresholds,opacity});
   }catch(error){sourcePromise=null;reject(error);}
  };
  image.onerror=()=>{sourcePromise=null;reject(new Error('無法載入寶劍影像'));};
  image.src=PHOTO;
 });
 return sourcePromise;
}
function drop(ctx,x,y,r,alpha){
 ctx.save();ctx.translate(x,y);ctx.scale(1,.5);ctx.globalAlpha=alpha;
 const glass=ctx.createRadialGradient(-r*.3,-r*.4,0,0,0,r);
 glass.addColorStop(0,'rgba(244,253,255,.14)');glass.addColorStop(.65,'rgba(159,191,190,.1)');glass.addColorStop(.9,'rgba(28,48,44,.42)');glass.addColorStop(1,'rgba(234,249,245,.65)');
 ctx.fillStyle=glass;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='rgba(246,255,253,.85)';ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(-r*.24,-r*.38,r*.3,r*.13,-.5,0,Math.PI*2);ctx.stroke();ctx.restore();
}
export function createRustSwordRenderer(canvas,key){
 return sources().then(({clean,rustPixels,thresholds,opacity})=>{
  canvas.width=1000;canvas.height=740;
  const ctx=canvas.getContext('2d'),surface=makeCanvas(W,H),surfaceCtx=surface.getContext('2d'),overlay=makeCanvas(W,H),overlayCtx=overlay.getContext('2d'),pixels=overlayCtx.createImageData(W,H);
  let disposed=false,lastCorrosion=-1;
  function draw(frame){
   if(disposed)return;
   const {corrosion,preparation,progress}=frame;
   if(Math.abs(corrosion-lastCorrosion)>.001||lastCorrosion<0){
    const data=pixels.data;
    for(let i=0;i<thresholds.length;i++){
     if(!opacity[i])continue;
     const alpha=corrosion===0?0:smooth((corrosion-thresholds[i]+.025)/.105);
     data[i*4]=rustPixels[i*4];data[i*4+1]=rustPixels[i*4+1];data[i*4+2]=rustPixels[i*4+2];data[i*4+3]=Math.round(alpha*opacity[i]);
    }
    overlayCtx.putImageData(pixels,0,0);
    surfaceCtx.clearRect(0,0,W,H);surfaceCtx.drawImage(clean,0,0);surfaceCtx.drawImage(overlay,0,0);lastCorrosion=corrosion;
   }
   ctx.clearRect(0,0,1000,740);
   ctx.save();ctx.translate(500,180);ctx.rotate(-.16);ctx.shadowColor='rgba(6,17,16,.48)';ctx.shadowBlur=15;ctx.shadowOffsetY=18;
   ctx.drawImage(surface,-470,-67,940,135);ctx.restore();
   ctx.save();ctx.beginPath();ctx.rect(0,330,1000,410);ctx.clip();
   const bed=ctx.createLinearGradient(0,330,0,740);bed.addColorStop(0,'#76827b');bed.addColorStop(.5,'#adb5ac');bed.addColorStop(1,'#64746d');ctx.fillStyle=bed;ctx.fillRect(0,330,1000,410);
   ctx.shadowColor='rgba(9,23,21,.34)';ctx.shadowBlur=14;ctx.shadowOffsetY=17;ctx.drawImage(surface,670,25,440,155,-40,365,1080,380);ctx.shadowColor='transparent';
   if(frame.barrier==='oil'&&preparation>0){
    ctx.globalAlpha=preparation*.48;
    const film=ctx.createLinearGradient(0,425,0,650);film.addColorStop(0,'rgba(212,188,100,0)');film.addColorStop(.25,'rgba(243,214,137,.1)');film.addColorStop(.55,'rgba(255,250,214,.28)');film.addColorStop(.6,'rgba(253,255,249,.6)');film.addColorStop(.65,'rgba(227,195,97,.08)');film.addColorStop(1,'rgba(227,195,97,0)');ctx.fillStyle=film;ctx.fillRect(0,425,1000,225);ctx.globalAlpha=1;
   }
   if(frame.water>0&&preparation>0){const evaporation=1-smooth((progress-.25)/.9)*.67;for(let i=0;i<18;i++)drop(ctx,25+hash(i,8)*950,470+hash(i,3)*150,6+hash(i,5)*15,preparation*evaporation*.82);}
   ctx.restore();
  }
  return {draw,dispose(){disposed=true;}};
 });
}
