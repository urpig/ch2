import {flameGLSL} from './flame-shader.js';

const vertexSource=`
 attribute vec2 position;
 varying vec2 uv;
 void main(){
  uv=position*.5+.5;
  gl_Position=vec4(position,0.,1.);
 }
`;

const fragmentSource=`
 precision highp float;
 varying vec2 uv;
 uniform float seconds;
 uniform float progress;
 ${flameGLSL}

 vec4 coalFlare(vec2 p,vec2 base,vec2 size,float heat,float seed){
  float t=seconds+seed;
  // Individual tongues catch and die down as air moves through gaps in the coal bed.
  float pulse=smoothstep(.31,.78,flameNoise(vec2(t*2.9,seed)));
  size.y*=.23+.77*pulse;
  float height=clamp((base.y-p.y)/size.y,0.,1.);
  p.x+=height*(sin(t*5.4+height*5.5)*5.+(seed-4.)*height*2.7);
  vec4 flame=luminousFlame(p,base,size,vec3(1.,.47,.068),t,.46);
  flame.a*=heat*pulse*.82;
  return flame;
 }

 void main(){
  // Map the cropped canvas to the same coordinates as the photograph.
  vec2 p=vec2(216.,0.)+vec2(uv.x,1.-uv.y)*vec2(368.,226.);
  float fire=smoothstep(.18,.32,progress)*(1.-smoothstep(.57,.77,progress));
  float smoke=smoothstep(.07,.22,progress)*(1.-smoothstep(.82,.99,progress));
  vec4 light=vec4(0.);
  if(fire>.015){
   light=coalFlare(p,vec2(353.,193.),vec2(19.,38.),fire,2.8);
   light=flameOver(coalFlare(p,vec2(429.,185.),vec2(16.,43.),fire,6.7),light);
   light=flameOver(coalFlare(p,vec2(389.,204.),vec2(24.,27.),fire,4.1),light);
  }
  if(smoke>.01){
   vec4 wisp=oxidePlume(p,vec2(368.,191.),vec2(48.,152.),seconds,.16*smoke);
   light=flameOver(oxidePlume(p,vec2(437.,193.),vec2(39.,131.),seconds+3.,.18*smoke),light);
   light=flameOver(wisp,light);
  }
  // Keep the hot gases behind the front rim.
  light.a*=1.-smoothstep(207.,217.,p.y);
  gl_FragColor=light;
 }
`;

export function createOxidationFire(canvas){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false});
 if(!gl)return null;
 const program=gl.createProgram();
 const shaders=[[gl.VERTEX_SHADER,vertexSource],[gl.FRAGMENT_SHADER,fragmentSource]].map(([type,source])=>{
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source);
  gl.compileShader(shader);
  gl.attachShader(program,shader);
  gl.deleteShader(shader);
  return shader;
 });
 gl.linkProgram(program);
 if(shaders.some(shader=>!gl.getShaderParameter(shader,gl.COMPILE_STATUS))||!gl.getProgramParameter(program,gl.LINK_STATUS)){
  gl.deleteProgram(program);
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return null;
 }
 gl.useProgram(program);
 const buffer=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'position');
 gl.enableVertexAttribArray(position);
 gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const timeUniform=gl.getUniformLocation(program,'seconds');
 const progressUniform=gl.getUniformLocation(program,'progress');
 return {
  draw(seconds,progress){
   const width=Math.min(448,Math.max(1,Math.round(canvas.clientWidth*(devicePixelRatio||1))));
   const height=Math.round(width*226/368);
   if(canvas.width!==width||canvas.height!==height){
    canvas.width=width;
    canvas.height=height;
    gl.viewport(0,0,width,height);
   }
   gl.uniform1f(timeUniform,seconds);
   gl.uniform1f(progressUniform,progress);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  },
  dispose(){
   gl.deleteBuffer(buffer);
   gl.deleteProgram(program);
   gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
 };
}
