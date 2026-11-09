const clamp=x=>Math.max(0,Math.min(1,x));
export function fireToolArt(tool){return tool==='water'?`<svg viewBox="0 0 150 110" aria-hidden="true"><defs><linearGradient id="fire-jug"><stop stop-color="#9ba7a7"/><stop offset=".25" stop-color="#edf1e9"/><stop offset=".48" stop-color="#7c8c91"/><stop offset=".75" stop-color="#e2e8df"/><stop offset="1" stop-color="#4a6168"/></linearGradient></defs><path d="M99 35Q138 32 130 65Q126 79 106 74" fill="none" stroke="#89989a" stroke-width="9"/><path d="M35 25L93 25L106 89Q68 105 25 87L25 41L12 29Z" fill="url(#fire-jug)" stroke="#5c7375" stroke-width="2"/><ellipse cx="64" cy="25" rx="30" ry="7" fill="#d7e8e9" stroke="#566c6d"/><path d="M35 36V79" stroke="#fff" stroke-opacity=".65" stroke-width="3"/></svg>`:`<svg viewBox="0 0 150 110" aria-hidden="true"><defs><radialGradient id="fire-lid"><stop stop-color="#f1f1e2"/><stop offset=".4" stop-color="#a5b1ad"/><stop offset=".85" stop-color="#52666a"/><stop offset="1" stop-color="#d5dbce"/></radialGradient></defs><ellipse cx="75" cy="65" rx="64" ry="26" fill="url(#fire-lid)" stroke="#3b5056" stroke-width="2"/><ellipse cx="75" cy="65" rx="55" ry="20" fill="none" stroke="#f9f9e9" stroke-opacity=".55"/><path d="M60 44V34Q75 26 90 34V44" fill="none" stroke="#26383c" stroke-width="9" stroke-linecap="round"/></svg>`;}
export function createFireExperimentRenderer(canvas){
 const c=canvas.getContext('2d');if(!c)return null;
 const bg=new Image();bg.src='./assets/story/everyday-lab-bench.jpg';
 let state={flame:1,p:0},time=0,last=0,frame=0,active=true,paused=false,alive=true;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 function ellipse(x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
 function gradient(x,y,w,h,stops){const g=c.createLinearGradient(x,y,x+w,y+h);stops.forEach(([p,col])=>g.addColorStop(p,col));return g;}
 function lid(y,alpha=1){c.save();c.globalAlpha=alpha;const g=c.createRadialGradient(470,y-20,4,500,y,180);g.addColorStop(0,'#f0eedc');g.addColorStop(.45,'#a3afaa');g.addColorStop(.85,'#4d6265');g.addColorStop(1,'#d6d9c8');ellipse(500,y,169,44,g,'#31464a');ellipse(500,y-3,151,34,null,'#c5d0c4');c.lineCap='round';c.lineWidth=12;c.strokeStyle='#233439';c.beginPath();c.moveTo(479,y-36);c.lineTo(479,y-52);c.quadraticCurveTo(500,y-64,521,y-52);c.lineTo(521,y-36);c.stroke();c.restore();}
 function flame(x,y,h,w,phase,alpha=1){
  c.save();c.globalAlpha=alpha;const sway=Math.sin(time*4+phase)*w*.35;
  const g=c.createLinearGradient(x,y,x,y-h);g.addColorStop(0,'#fff7bf');g.addColorStop(.24,'#ffdb67');g.addColorStop(.62,'#ef8e27');g.addColorStop(1,'#ef5a1320');c.fillStyle=g;
  c.beginPath();c.moveTo(x-w,y);c.bezierCurveTo(x-w*1.6,y-h*.35,x+sway-w*.4,y-h*.65,x+sway,y-h);c.bezierCurveTo(x+w*.3+sway,y-h*.57,x+w*1.7,y-h*.2,x+w,y);c.closePath();c.fill();c.restore();
 }
 function paint(){
  if(!alive)return;const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);const w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}c.setTransform(w/1000,0,0,h/500,0,0);c.clearRect(0,0,1000,500);
  c.fillStyle='#7b8b83';c.fillRect(0,0,1000,500);if(bg.complete&&bg.naturalWidth)c.drawImage(bg,0,0,1000,565);
  c.fillStyle=gradient(0,285,0,215,[[0,'#233a39aa'],[1,'#152727']]);c.fillRect(0,285,1000,215);
  ellipse(505,448,252,24,'#0d1b1bcc');c.fillStyle=gradient(0,365,0,88,[[0,'#b4bdb5'],[.2,'#556a6a'],[1,'#1d3035']]);c.beginPath();c.roundRect(279,363,450,83,12);c.fill();ellipse(500,376,148,26,'#18292c','#8d9c93');
  c.fillStyle='#d4dbc9';c.font='16px sans-serif';c.textAlign='left';c.fillText('熱源',320,423);ellipse(384,417,17,16,'#21363a','#718780');c.save();c.translate(384,417);c.rotate(state.heatOff?-1.1:0);c.fillStyle=state.heatOff?'#a7c4b2':'#e5b34e';c.fillRect(-2,-12,4,14);c.restore();
  if(!state.heatOff){for(let i=0;i<14;i++)flame(389+i*16,363,12+Math.sin(i+time)*4,5,i,.8);}
  c.lineWidth=22;c.strokeStyle='#23383b';c.lineCap='round';c.beginPath();c.moveTo(654,321);c.lineTo(838,284);c.stroke();c.lineWidth=5;c.strokeStyle='#8b9890';c.beginPath();c.moveTo(654,315);c.lineTo(833,278);c.stroke();
  c.fillStyle=gradient(325,290,0,88,[[0,'#8a9993'],[.12,'#c0c7b9'],[.25,'#3f5254'],[1,'#1b2c30']]);c.beginPath();c.moveTo(326,290);c.bezierCurveTo(340,402,660,402,674,290);c.closePath();c.fill();ellipse(500,290,174,49,'#263a3a','#b4beb1');
  const oil=c.createRadialGradient(465,278,5,500,291,164);oil.addColorStop(0,'#bda34f');oil.addColorStop(.6,'#7c6327');oil.addColorStop(1,'#302b1b');ellipse(500,292,157,36,oil);
  for(let i=0;i<19;i++){const q=(i*.183+time*.17)%1;ellipse(385+(i*39)%225,287+Math.sin(i*5)*17,2+q*5,1+q*2,null,'#e4c87640');}
  const f=state.flame??1,cover=state.covered||0;
  if(f>.01){c.save();c.globalCompositeOperation='screen';const glow=c.createRadialGradient(500,270,1,500,270,165*f);glow.addColorStop(0,'#f8a12955');glow.addColorStop(1,'#f8a12900');c.fillStyle=glow;c.fillRect(100,0,800,420);c.restore();for(let i=0;i<13;i++)flame(380+i*20,297+(i%3)*3,(55+Math.sin(i*4.7+time*2)*20)*f,12+(i%3)*3,i,1-cover*.9);}
  if(state.water>0){c.save();c.translate(590,115);c.rotate(-.6);c.fillStyle=gradient(-40,-20,85,20,[[0,'#7b8e90'],[.4,'#e7ece1'],[1,'#52696d']]);c.beginPath();c.moveTo(-45,-35);c.lineTo(30,-35);c.lineTo(41,38);c.quadraticCurveTo(0,51,-45,37);c.closePath();c.fill();c.strokeStyle='#adbdb8';c.lineWidth=7;c.beginPath();c.arc(45,2,22,-1.5,1.5);c.stroke();c.restore();c.strokeStyle='#d9eff3bb';c.lineWidth=9*state.water;c.beginPath();c.moveTo(548,111);c.quadraticCurveTo(510,178,495,285);c.stroke();}
  if(state.splash>0){const s=state.splash;for(let i=0;i<32;i++){const a=i*2.3999,travel=s*(75+i%7*15),x=500+Math.cos(a)*travel*1.7,y=285-Math.sin((i%6+1)/7*Math.PI)*travel;ellipse(x,y,2+i%3,4+i%4,'#f4c76cc9');if(i%5===0)flame(x,y+8,(22+i%4*7)*s,7,i,.65*s);}c.save();c.globalAlpha=s*.25;for(let i=0;i<5;i++)ellipse(500+Math.sin(i*7)*65,265-s*110-i*10,40+s*25,20+s*35,'#eee5c7');c.restore();}
  if(state.method==='lid'&&state.p>0)lid(290-(1-clamp((state.p-.04)/.35))*220,Math.min(1,state.p*15));
  if(state.complete&&state.method==='lid'){c.fillStyle='#e7efdf';c.font='20px sans-serif';c.textAlign='center';c.fillText('保持覆蓋，等待冷卻',500,76);}
 }
 function tick(now){frame=0;if(!alive)return;if(!paused&&!reduced)time+=Math.min(.08,(now-(last||now))/1000);last=now;paint();if(active&&!paused&&!reduced)frame=requestAnimationFrame(tick);}
 function schedule(){if(!frame&&alive)frame=requestAnimationFrame(tick);}
 const ro=new ResizeObserver(()=>{paint();schedule();});ro.observe(canvas);bg.onload=()=>{paint();};schedule();
 return {draw(next){state=next;paint();},setActive(value){active=value;if(value)schedule();else{cancelAnimationFrame(frame);frame=0;}},setPaused(value){paused=value;last=0;if(value){cancelAnimationFrame(frame);frame=0;paint();}else schedule();},dispose(){alive=false;cancelAnimationFrame(frame);ro.disconnect();bg.onload=null;}};
}
