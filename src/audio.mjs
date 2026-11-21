export function createAudio(){
 let ctx=null,master=null,music=null,sfx=null,vol={music:.7,sfx:.8},fire=null,timer=null,noise=null,fireSource=null,muted=false,H=0,beat=0,dead=false;
 const voices=new Set();
 function tone(hz,t,d=.15,g=.1,endHz=null,bus=sfx,type='sine'){
  if(!ctx||muted||document.hidden||dead)return;
  const o=ctx.createOscillator(),v=ctx.createGain();o.type=type;o.frequency.setValueAtTime(hz,t);
  if(endHz)o.frequency.exponentialRampToValueAtTime(endHz,t+d);
  v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+.008);v.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(v).connect(bus);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();v.disconnect();};o.start(t);o.stop(t+d+.02);
 }
 function rustle(t,d=.07,g=.15,bus=sfx){
  if(!ctx||muted||document.hidden||dead)return;
  const src=ctx.createBufferSource(),v=ctx.createGain(),f=ctx.createBiquadFilter();src.buffer=noise;
  f.type='bandpass';f.frequency.value=1400;f.Q.value=.7;
  v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.0001,t+d);
  src.connect(f).connect(v).connect(bus);voices.add(src);
  src.onended=()=>{voices.delete(src);src.disconnect();f.disconnect();v.disconnect();};src.start(t);src.stop(t+d+.02);
 }
 function sync(){
  if(!ctx)return;
  const t=ctx.currentTime;
  master.gain.setTargetAtTime(muted||document.hidden?0:.18,t,.03);
  fire.gain.setTargetAtTime(.008+.022*H/10,t,.3);
  music.gain.setTargetAtTime(vol.music,t,.05);sfx.gain.setTargetAtTime(vol.sfx,t,.05);
 }
 function tick(){
  if(!ctx||ctx.state!=='running'||muted||document.hidden)return;
  const t=ctx.currentTime+.025,phrase=[523.25,659.25,783.99,659.25,587.33,659.25,523.25,0];
  const n=phrase[beat%8];if(n)tone(n,t,.35,.055,null,music);
  if(H>=4&&beat%2===0)tone(261.63,t,.55,.025,null,music);
  if(H>=8&&beat%4===0){tone(130.81,t,.8,.025,null,music);tone(392,t+.06,.65,.018,null,music);}
  if(Math.random()<.08+.2*H/10)rustle(t,.025,.015,music);
  beat++;
 }
 async function unlock(){
  if(dead)return false;
  try{
   if(!ctx){
    const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return false;
    ctx=new Audio();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    music=ctx.createGain();sfx=ctx.createGain();music.connect(master);sfx.connect(master);
    noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    fireSource=ctx.createBufferSource();fireSource.buffer=noise;fireSource.loop=true;
    const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=650;
    fire=ctx.createGain();fireSource.connect(f).connect(fire).connect(music);fireSource.start();
    timer=setInterval(tick,400);
   }
   await ctx.resume();sync();return ctx.state==='running';
  }catch{return false;}
 }
 function heat(value){H=Math.max(0,Math.min(10,value));sync();}
 function mute(value){muted=Boolean(value);sync();}
 function volumes(v){vol={...vol,...v};sync();}
 function cue(name){
  if(!ctx||ctx.state!=='running'||muted||document.hidden)return;
  const t=ctx.currentTime+.01;
  if(name==='stitch'){rustle(t,.025,.06);tone(950,t,.04,.025);}
  if(name==='Shatter'){rustle(t,.06,.16);tone(360,t,.09,.04,180);}
  if(name==='Slide')tone(330,t,.22,.05,660);
  if(name==='Ward'){tone(1046.5,t,.45,.055);tone(1568,t+.025,.3,.018);}
  if(name==='win')[523.25,659.25,783.99,1046.5,1318.5].forEach((n,i)=>tone(n,t+i*.11,.7,.06,null,sfx,'triangle'));
  if(name==='repair')[392,523.25,659.25,783.99].forEach((n,i)=>tone(n,t+i*.09,.9,.05));
  if(name==='lost'){tone(392,t,.9,.055,147);rustle(t+.1,.4,.04);}
  if(name==='victory')[523.25,659.25,783.99,1046.5,783.99,1046.5,1318.5,1568].forEach((n,i)=>tone(n,t+i*.13,.9,.05,null,sfx,'triangle'));
  if(name==='heart')tone(240,t,.3,.06,120,sfx,'triangle');
  if(name==='yawn')tone(300,t,.8,.03,170,sfx,'triangle');
  if(name==='teacup'){tone(2093,t,.25,.03);tone(2637,t+.05,.2,.02);}
  if(name==='cat')tone(620,t,.35,.03,880,sfx,'triangle');
  if(name==='draft')tone(784,t,.12,.04);
 }
 function visibility(){sync();if(ctx){if(document.hidden)ctx.suspend().catch(()=>{});else ctx.resume().catch(()=>{});}}
 document.addEventListener('visibilitychange',visibility);
 function destroy(){
  dead=true;clearInterval(timer);document.removeEventListener('visibilitychange',visibility);
  for(const v of voices){try{v.stop();}catch{}}voices.clear();
  if(fireSource){try{fireSource.stop();}catch{}}
  if(ctx)ctx.close().catch(()=>{});
 }
 return {unlock,mute,volumes,heat,cue,destroy};
}
