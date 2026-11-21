// Particles on one canvas: hearth embers (rate follows Heat) and bursts on placements, powers and lines.
// Particles stay small and translucent so marks remain the brightest, clearest things on the board.
export function createFX(canvas,{reduced=()=>false}={}){
 const ctx=canvas.getContext('2d'),parts=[];let heat=0,emitter=null,raf=0,last=0,dpr=1,running=false;
 function resize(){dpr=Math.min(2,devicePixelRatio||1);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;}
 addEventListener('resize',resize);resize();
 function spawn(x,y,{color='#E8A84A',vx=0,vy=-30,spread=40,life=1.2,size=2.2,gravity=-10}){
  parts.push({x,y,vx:vx+(Math.random()-.5)*spread,vy:vy+(Math.random()-.5)*spread,life,max:life,size:size*(.6+Math.random()*.8),color,gravity});
 }
 function burst(x,y,color,count=14,power=1){
  if(reduced())return;
  const n=Math.round(count*(1+heat/10)*power);
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(40+Math.random()*90)*(1+heat/14)*power;
   spawn(x,y,{color,vx:Math.cos(a)*v,vy:Math.sin(a)*v,spread:10,life:.6+Math.random()*.6,size:2.4,gravity:120});}
  start();
 }
 function seam(x1,y1,x2,y2,color='#F5C66A'){ // sparkles along the golden line
  if(reduced())return;
  for(let i=0;i<40;i++){const t=i/39;setTimeout(()=>spawn(x1+(x2-x1)*t,y1+(y2-y1)*t,{color,vy:-40,spread:50,life:1,size:2.6,gravity:-20}),t*700);}
  start();
 }
 function tick(t){
  const dt=Math.min(.05,(t-last)/1000||0);last=t;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,innerWidth,innerHeight);
  if(emitter&&!reduced()&&heat>0&&Math.random()<heat*.06){const r=emitter.getBoundingClientRect();
   if(r.width)spawn(r.left+r.width/2,r.top+r.height*.15,{color:Math.random()<.5?'#E8A84A':'#F08A4B',vy:-40-heat*4,spread:30,life:1.4+heat*.08,size:1.6+heat*.12,gravity:-8});}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;if(p.life<=0){parts.splice(i,1);continue;}
   p.vy+=p.gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const a=p.life/p.max;
   ctx.globalAlpha=a*.85;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;
  if(parts.length||(heat>0&&emitter&&!reduced()&&!document.hidden))raf=requestAnimationFrame(tick);else{running=false;ctx.clearRect(0,0,innerWidth,innerHeight);}
 }
 function start(){if(running)return;running=true;last=performance.now();raf=requestAnimationFrame(tick);}
 return {burst,seam,setHeat(h,el){heat=h;emitter=el;if(h>0)start();},destroy(){cancelAnimationFrame(raf);removeEventListener('resize',resize);}};
}
