import {createController} from './controller.mjs';
import {createHUD,POWERS} from './hud.mjs';
import {createBoard,where} from './board.mjs';
import {createOwl} from './owl.mjs';
import {createFX} from './fx.mjs';
import {createAudio} from './audio.mjs';
import {createOverlays,createSettings} from './overlays.mjs';
import {rooms,gear,speaker} from './art.mjs';

const KEYS={best:'hearth-best',settings:'hearth-settings',run:'hearth-run'};
const load=(k,fallback)=>{try{const v=localStorage.getItem(k);return v==null?fallback:JSON.parse(v);}catch{return fallback;}};
const store=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v));}catch{/* Private mode: play on without saving. */}};
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

export function mountGame(root){
 root.innerHTML=`<div class="scene" data-room="1">
  <svg class="room" viewBox="0 0 1600 460" preserveAspectRatio="xMidYMax slice" aria-hidden="true"></svg>
  <div class="warmth" aria-hidden="true"></div>
  <header class="topbar"><div class="hud-top"></div><div class="sill"><button type="button" class="icon-btn" data-sound></button><button type="button" class="icon-btn" data-gear aria-label="Settings">${gear}</button></div></header>
  <main class="stage"><div class="owl-seat"></div>
   <div class="table"><aside class="hearth"></aside><div class="board"></div><nav class="tray" aria-label="Sewing tray: your tools"></nav></div></main>
  <div class="overlays"></div>
  <div class="vignette" aria-hidden="true"></div>
  <canvas class="fx" aria-hidden="true"></canvas>
  <p class="sr-only" role="status" aria-live="polite" data-live></p>
  <dialog class="dialog" data-settings aria-label="Settings"></dialog><dialog class="dialog" data-how aria-label="How to play"></dialog></div>`;
 const $=sel=>root.querySelector(sel);
 const scene=$('.scene'),roomSvg=$('.room'),live=$('[data-live]'),boardRoot=$('.board'),soundBtn=$('[data-sound]');
 const settings={music:.6,sfx:.8,muted:false,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,...load(KEYS.settings,{})};
 const reduced=()=>settings.reducedMotion;
 let best=Number(load(KEYS.best,0))||0,bestBeaten=false,last=null,selectedTool=null,game,endSeen='';
 const saved=load(KEYS.run,null);

 const audio=createAudio();
 let unlocked=false,gestured=false;
 // Audio starts only from a real click or key press, and never while muted.
 async function unlockAudio(){if(settings.muted||unlocked||!gestured)return;unlocked=await audio.unlock();audio.mute(settings.muted);audio.volumes({music:settings.music,sfx:settings.sfx});}
 const gesture=()=>{gestured=true;unlockAudio();};
 addEventListener('pointerdown',gesture,true);addEventListener('keydown',gesture,true);
 function applySettings(){
  store(KEYS.settings,settings);audio.mute(settings.muted);audio.volumes({music:settings.music,sfx:settings.sfx});
  scene.classList.toggle('reduced',settings.reducedMotion);
  soundBtn.innerHTML=speaker(!settings.muted);soundBtn.setAttribute('aria-label',settings.muted?'Sound off. Turn sound on':'Sound on. Mute');
  soundBtn.setAttribute('aria-pressed',String(!settings.muted));
  if(!settings.muted)unlockAudio();
 }
 const announce=t=>{live.textContent='';requestAnimationFrame(()=>{live.textContent=t;});};
 const fx=createFX($('.fx'),{reduced});

 // AI: one persistent module worker; a revision tag drops stale replies. Owl "thinks" for a beat that stays
 // well inside the controller's 1.2s watchdog; drawn boards make her visibly slower (hesitation).
 let worker=null,job=null;const qa={replies:0,slowest:0,errors:0};globalThis.hearthQA=qa;
 function getWorker(){
  if(worker)return worker;
  worker=new Worker(new URL('./ai.worker.mjs',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{if(job?.computing&&data.revision===job.revision)job.reply(data);};
  worker.onerror=e=>{e.preventDefault?.();qa.errors++;const j=job;worker?.terminate();worker=null;if(j?.computing){job=null;j.fail(new Error('worker failed'));}};
  return worker;
 }
 function cancelAI(){
  if(!job)return;const j=job;job=null;j.timers.forEach(clearTimeout);
  if(j.computing){worker?.terminate();worker=null;}
 }
 function requestAI(payload){
  cancelAI();
  return new Promise((resolve,reject)=>{
   const start=performance.now(),think=reduced()?150:Math.min(950,520+140*payload.drawsThisLevel);
   const j={revision:payload.revision,computing:true,timers:[],fail:reject};job=j;
   j.reply=reply=>{
    j.computing=false;const ms=performance.now()-start;qa.replies++;qa.slowest=Math.max(qa.slowest,ms);
    j.timers.push(setTimeout(()=>{if(job===j){job=null;resolve(reply);}},Math.max(0,think-ms)));
   };
   j.timers.push(setTimeout(()=>{if(job===j&&j.computing){job=null;worker?.terminate();worker=null;reject(new Error('worker slow'));}},1050));
   try{getWorker().postMessage(payload);}catch(e){job=null;reject(e);}
  });
 }

 const hud=createHUD({top:$('.hud-top'),hearth:$('.hearth'),tray:$('.tray')},{onPower:t=>board.selectPower(t),reduced});
 hud.setBest(best);
 const board=createBoard(boardRoot,{onCommit:a=>game.commit(a),onSkipWon:()=>game.skipWon(),announce,reduced,
  onFormChange:t=>{selectedTool=t;if(last)hud.render(last,{selected:t});}});
 const owl=createOwl($('.owl-seat'),{reduced,cue:n=>audio.cue(n)});
 const overlays=createOverlays($('.overlays'),{onDraft:(t,r)=>game.draft(t,r),onAgain:()=>newRun(),cue:n=>audio.cue(n),
  getBest:()=>({value:best,beaten:bestBeaten})});
 const dialogs=createSettings($('[data-settings]'),$('[data-how]'),{settings,onChange:v=>{Object.assign(settings,v);applySettings();},onQuit:()=>newRun()});
 $('[data-gear]').onclick=()=>dialogs.open();
 soundBtn.onclick=()=>{settings.muted=!settings.muted;applySettings();};

 const cellCenter=i=>{const r=boardRoot.querySelector(`[data-cell="${i}"]`)?.getBoundingClientRect();return r?[r.left+r.width/2,r.top+r.height/2]:[innerWidth/2,innerHeight/2];};
 const powerColor={Shatter:'#E8A84A',Slide:'#4E8295',Ward:'#F4E9D8'};
 function react(s,prev){
  const newRev=prev?.revision!==s.revision,newBeat=newRev||prev?.phase!==s.phase;
  const ev=newRev?s.events:[];
  const msgs=[];
  for(const e of ev){
   if(e.type==='power'){audio.cue(e.power);const at=ev.find(p=>p.type==='placement');if(at)fx.burst(...cellCenter(at.cell),powerColor[e.power],22,1.4);}
   if(e.type==='placement'){audio.cue('stitch');fx.burst(...cellCenter(e.cell),e.actor==='X'?'#D9637A':'#5E9AAE',8);
    msgs.push(e.actor==='X'?`You stitched ${where(e.cell)}.`:`Owl buttoned ${where(e.cell)}.`);}
   if(e.type==='shieldCreated')msgs.push(e.blockedActor==='X'?`Owl set a teacup on ${where(e.cell)}: blocked for your next move.`:`Your teacup covers ${where(e.cell)}: Owl can’t use it on her next move.`);
   if(e.type==='shieldExpired')msgs.push('The teacup lifts.');
   if(e.type==='boardBurned'){audio.cue('heart');msgs.push(`A draw. One heart burned, ${e.boardsLeft} left. Owl looks sleepier.`);}
   if(e.type==='secondWind'){audio.cue('repair');msgs.push('Second Wind! The quilt re-knits: a fresh board.');}
  }
  if(newRev&&ev.some(e=>e.type==='power'&&e.power==='Shatter')&&prev?.position?.cells.includes('rock')&&!s.position.cells.includes('rock'))audio.cue('cat');
  if(newBeat){
   if(s.phase==='won'){audio.cue(s.level===5?'victory':'win');msgs.push(s.level===5?'A golden seam! The final room is cleared.':'A golden seam! Room cleared.');
    const l=LINES.find(l=>l.every(i=>s.position.cells[i]==='X'));if(l)setTimeout(()=>fx.seam(...cellCenter(l[0]),...cellCenter(l[2])),60);}
   if(s.phase==='lost'){audio.cue('lost');msgs.push(s.lossReason==='line'?'Owl made a line. The quilt unravels.':'Out of boards. The quilt unravels.');}
   if(s.phase==='draft')msgs.push(s.starterDraft?'Pick your first sewing tool: 1 Shatter, 2 Slide, 3 Ward.':`Room cleared. Pick a tool for ${rooms[s.level].name}, or skip.`);
   if(s.phase==='player'&&prev&&(prev.phase==='draft'||prev.level!==s.level))msgs.unshift(`Room ${s.level}: ${rooms[s.level].name}.`);
   if(s.phase==='victory')msgs.push(`The quilt is finished! Score ${s.score}.`);
   if(s.phase==='defeat')msgs.push(`Run over. Score ${s.score}, best ${best}.`);
   if(s.phase==='player'&&newRev&&ev.some(e=>e.actor==='O'))msgs.push('Your turn.');
  }
  if(msgs.length)announce(msgs.join(' '));
 }
 function render(s){
  const prev=last;last=s;
  if(['victory','defeat'].includes(s.phase)&&endSeen!==`${s.revision}:${s.phase}`){
   endSeen=`${s.revision}:${s.phase}`;bestBeaten=s.score>best;if(bestBeaten){best=s.score;store(KEYS.best,best);}hud.setBest(best);
  }
  if(prev?.level!==s.level||!roomSvg.innerHTML){roomSvg.innerHTML=rooms[s.level].svg;scene.dataset.room=s.level;if(prev)scene.classList.remove('room-in'),void scene.offsetWidth,scene.classList.add('room-in');}
  scene.dataset.phase=s.phase;scene.style.setProperty('--heat',s.heat);scene.style.setProperty('--hot',Math.max(0,s.heat-7)/3);
  scene.classList.toggle('lost',s.phase==='lost'||s.phase==='defeat');
  hud.render(s,{selected:s.phase==='player'?selectedTool:null});
  board.render(s);owl.update(s);overlays.update(s);
  audio.heat(s.heat);fx.setHeat(s.heat,$('.hearth-flame'));
  react(s,prev);
  // Hand keyboard focus to the board when a draft closes, so play continues without a mouse.
  if(prev?.phase==='draft'&&s.phase!=='draft'&&!document.activeElement?.closest('dialog'))requestAnimationFrame(()=>board.focus());
 }
 function newRun(){owl.reset();game.newRun();}
 game=createController({render,requestAI,cancelAI,reducedMotion:reduced,onSave:r=>store(KEYS.run,r)});
 qa.game=game;
 if(saved&&game.resume(saved))announce('Welcome back. Your run continues at the start of this board.');
 applySettings();

 addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.target.closest?.('dialog')||e.ctrlKey||e.metaKey||e.altKey)return;
  const n=['1','2','3'].indexOf(e.key);
  if(n>=0&&last){
   if(last.phase==='draft'){e.preventDefault();overlays.pick(n);}
   else if(last.phase==='player'){e.preventDefault();board.selectPower(POWERS[n][0]);}
  }
  if(e.key==='Enter'&&last?.phase==='won'&&!e.target.closest?.('button')){e.preventDefault();game.skipWon();}
 });
 return {game,destroy(){cancelAI();worker?.terminate();audio.destroy();fx.destroy();board.destroy();removeEventListener('pointerdown',gesture,true);removeEventListener('keydown',gesture,true);root.replaceChildren();}};
}
