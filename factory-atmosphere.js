import {flameGLSL} from './flame-shader.js';
// A continuous advected radiance field; flames are translucent gas, never solid ore.
export function createFactoryAtmosphere(canvas){
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false});if(!gl)return null;
 const vs='attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
 const fs=`precision highp float;varying vec2 uv;uniform float time;uniform float hot;
 ${flameGLSL}
 void main(){vec2 p=vec2(uv.x*900.,(1.-uv.y)*650.);
  vec4 f=luminousFlame(p,vec2(450.,519.),vec2(121.,158.),vec3(1.,.34,.026),time,.22);
  for(int i=0;i<2;i++){float side=i==0?1.:-1.;vec2 delta=p-vec2(i==0?378.:516.,469.);vec2 jet=vec2(delta.y,-side*delta.x);f=flameOver(luminousFlame(jet,vec2(0.),vec2(11.,36.),vec3(1.,.66,.2),time+float(i)*3.,.65),f);}
  if(p.y>518.||p.y<348.||p.x<366.||p.x>530.)f.a=0.;gl_FragColor=vec4(f.rgb,f.a*hot);
 }`;
 const compile=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;};let program;
 try{program=gl.createProgram();for(const [t,s] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=compile(t,s);gl.attachShader(program,sh);gl.deleteShader(sh);}gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}catch{gl.getExtension('WEBGL_lose_context')?.loseContext();return null;}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);const tu=gl.getUniformLocation(program,'time'),hu=gl.getUniformLocation(program,'hot');let frame=0,alive=true,visible=true,hot=false,paused=false,elapsed=0,last=performance.now();
 function draw(now){frame=0;if(!alive)return;const dt=Math.min(.1,(now-last)/1000);last=now;if(!paused)elapsed+=dt;const r=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);const w=Math.max(1,Math.round(r.width*ratio)),h=Math.max(1,Math.round(r.height*ratio));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(tu,matchMedia('(prefers-reduced-motion:reduce)').matches?1:elapsed);gl.uniform1f(hu,hot?1:0);gl.drawArrays(gl.TRIANGLES,0,6);canvas.dataset.renderer='volumetric-webgl';if(visible&&hot&&!paused&&!matchMedia('(prefers-reduced-motion:reduce)').matches)frame=requestAnimationFrame(draw);}
 const schedule=()=>{last=performance.now();if(!frame)frame=requestAnimationFrame(draw);};const ro=new ResizeObserver(schedule);ro.observe(canvas);const io=new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)schedule();});io.observe(canvas);
 return {set(next,stop=false){hot=next;paused=stop;schedule();},restart(){elapsed=0;schedule();},dispose(){alive=false;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
}
