import {flameGLSL} from './flame-shader.js';
export function createCombustionAtmosphere(){
 const canvas=document.createElement('canvas');canvas.className='combustion-atmosphere';canvas.setAttribute('aria-hidden','true');
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false});if(!gl)return null;
 const vs='attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
 const fs=`precision highp float;varying vec2 uv;uniform float time;uniform float element;uniform float stage;uniform float metal;uniform float heater;uniform float covered;uniform float mobile;uniform vec2 movingBowl;uniform float specimenOn;
 ${flameGLSL}
 void main(){
  vec2 p=vec2(uv.x*760.,(1.-uv.y)*430.);bool active=mobile>.5?specimenOn>.5:stage==2.||stage==4.;bool jar=metal<.5&&(stage==4.||stage==5.);vec2 bowl=mobile>.5?movingBowl:jar?vec2(560.,283.):vec2(320.,224.);vec4 light=vec4(0.);
  if(stage!=5.){
   vec4 lamp=alcoholFlame(p,vec2(320.,287.),vec2(21.,54.+heater*21.),time);
   // Light must not pass through the heated spoon bowl or crucible.
   if(heater>.5&&covered>.5&&p.y<229.&&abs(p.x-320.)<53.)lamp.a=0.;
   if(mobile<.5&&heater<.5&&stage==2.&&p.y<242.&&abs(p.x-320.)<26.)lamp.a=0.;
   vec2 cap=(p-vec2(320.,305.))/vec2(12.,3.);float reflection=exp(-dot(cap,cap)*2.)*(.06+.006*sin(time*2.13));
   light=flameOver(lamp,vec4(.28,.53,.95,reflection));
  }
  if(active){
   if(element==1.){
    light=flameOver(luminousFlame(p,bowl-vec2(0.,4.),vec2(33.,58.),vec3(.96,.98,1.),time+3.,1.),light);
    vec2 q=(p-bowl)/vec2(45.,34.);float glare=exp(-dot(q,q)*2.)*(.85+.09*flameNoise(p*.13-time*2.));light=flameOver(vec4(vec3(1.,1.,.98),glare),light);
   }else if(element>1.&&element<6.){
    vec3 tint=element==2.?vec3(.15,.65,.58):element==3.?vec3(1.,.61,.045):element==4.?vec3(.08,.28,.95):vec3(1.,.91,.66);
    vec2 size=element==2.?vec2(35.,85.):element==3.?vec2(39.,100.):element==4.?vec2(33.,88.):vec2(40.,96.);
    light=flameOver(luminousFlame(p,bowl-vec2(0.,4.),size,tint,time+2.,element==5.?.8:0.),light);
    vec2 reflection=(p-bowl-vec2(0.,4.))/vec2(31.,10.);
    light=flameOver(vec4(tint,exp(-dot(reflection,reflection)*2.)*.32),light);
   }else if(element>=6.){
    vec2 q=(p-bowl)/vec2(26.,11.);float ember=exp(-dot(q,q)*2.)*(.55+.3*flameFbm(p*.21+vec2(0.,-time*.8)));float fissure=pow(flameNoise(p*.65-time*.5),8.);light=flameOver(vec4(mix(vec3(.9,.15,.008),vec3(1.,.65,.09),fissure),ember),light);
   }
  }
  if((element==1.||element==2.||element==5.)&&(active||stage==5.)){
   float strength=element==5.?1.05:element==1.?.46:.38;if(stage==5.)strength*=exp(-time*.75);
   vec4 smoke=oxidePlume(p,bowl-vec2(0.,9.),vec2(element==5.?88.:68.,190.),time,strength);
   if(jar){float halfWidth=p.y<130.?37.:p.y<176.?37.+(p.y-130.):82.;if(p.y<85.||p.y>340.||abs(p.x-560.)>halfWidth)smoke.a=0.;}
   light=flameOver(smoke,light);
  }
  gl_FragColor=light;
 }`;
 const shader=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};let program;
 try{program=gl.createProgram();for(const [kind,source] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=shader(kind,source);gl.attachShader(program,sh);gl.deleteShader(sh);}gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}catch{gl.getExtension('WEBGL_lose_context')?.loseContext();return null;}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['time','element','stage','metal','heater','covered','mobile','movingBowl','specimenOn'].map(k=>[k,gl.getUniformLocation(program,k)]));let state={},start=0,frame=0,alive=true,visible=false;
 function draw(){frame=0;if(!alive)return;const r=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5),w=Math.max(1,Math.round(r.width*ratio)),h=Math.max(1,Math.round(r.height*ratio));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.uniform1f(uniforms.time,Number.isFinite(state.frameTime)?state.frameTime:matchMedia('(prefers-reduced-motion:reduce)').matches?1:(performance.now()-start)/1000);gl.uniform1f(uniforms.element,['Cu','Mg','Zn','Na','S','P','C','CO'].indexOf(state.key));gl.uniform1f(uniforms.stage,['load','loaded','ignite','transfer','react','done'].indexOf(state.stage));gl.uniform1f(uniforms.metal,state.isMetal?1:0);gl.uniform1f(uniforms.heater,state.heater||0);gl.uniform1f(uniforms.covered,state.covered?1:0);gl.uniform1f(uniforms.mobile,state.mobile?1:0);gl.uniform2f(uniforms.movingBowl,state.bowl?.[0]??320,state.bowl?.[1]??224);gl.uniform1f(uniforms.specimenOn,state.specimenActive?1:0);gl.drawArrays(gl.TRIANGLES,0,6);canvas.dataset.renderer='volumetric-webgl';if(!state.externalClock&&visible&&!matchMedia('(prefers-reduced-motion:reduce)').matches&&(state.stage!=='done'||performance.now()-start<9000))frame=requestAnimationFrame(draw);}
 const resize=new ResizeObserver(()=>{if(!frame)frame=requestAnimationFrame(draw);});resize.observe(canvas);const intersection=new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible&&!frame)frame=requestAnimationFrame(draw);});intersection.observe(canvas);
 return {canvas,update(next,{preserveTime=false}={}){state=next;if(!preserveTime)start=performance.now();if(visible&&!frame)frame=requestAnimationFrame(draw);},dispose(){alive=false;cancelAnimationFrame(frame);resize.disconnect();intersection.disconnect();gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
}
