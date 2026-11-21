// Draft panel, the Quilt end card, settings and how-to-play dialogs.
import {tools,rooms,C} from './art.mjs';
import {POWERS} from './hud.mjs';
const mini={X:(c,cls='')=>{const [x,y]=pos(c);return `<path class="${cls}" d="M${x-5} ${y-5}l10 10m0-10l-10 10" stroke="${C.berry}" stroke-width="3" stroke-linecap="round"/>`;},
 O:(c,cls='')=>{const [x,y]=pos(c);return `<circle class="${cls}" cx="${x}" cy="${y}" r="5.5" fill="none" stroke="${C.teal}" stroke-width="3.2"/>`;}};
function pos(c){return [10+(c%3)*20,10+Math.floor(c/3)*20];}
const grid=`<path d="M20 2V58M40 2V58M2 20H58M2 40H58" stroke="${C.walnut}" stroke-width="1" stroke-dasharray="2 1.5"/>`;
const demos={
 shatter:`${grid}${mini.X(0)}${mini.O(8)}<g class="d-pop">${mini.O(4)}</g><g class="d-in">${mini.X(2)}</g>`,
 slide:`${grid}${mini.O(4)}<g class="d-glide">${mini.X(0)}</g><g class="d-in">${mini.X(2)}</g>`,
 ward:`${grid}${mini.O(0)}<g class="d-in">${mini.X(4)}</g><g class="d-cup"><rect x="43" y="43" width="14" height="14" rx="2" fill="none" stroke="${C.walnut}" stroke-dasharray="2 1.5"/><path d="M44.5 55Q44.5 45 50 45Q55.5 45 55.5 55Z" fill="${C.ivory}" stroke="${C.night}" stroke-width="1"/></g>`,
};
function quiltRows(quilt){
 let i=0;const levels=[...new Set(quilt.map(p=>p.level))];
 return levels.map(l=>`<ol class="patch-row" aria-label="Room ${l}">${quilt.filter(p=>p.level===l).map(p=>patch(p,i++)).join('')}</ol>`).join('');
}
function patch(p,i){
 const fill=p.result==='win'?'#E8A84A':p.result==='draw'?'#EADFCB':'#8D8A86';
 const motif=p.result==='win'?`<path d="M14 14L34 34M34 14L14 34" stroke="${C.berry}" stroke-width="4" stroke-dasharray="3 1.5"/>`
  :p.result==='draw'?`<path d="M10 24H38" stroke="${C.walnut}" stroke-width="1.5" stroke-dasharray="3 2"/>`
  :`<path d="M8 40Q16 30 12 22T20 8M30 40Q36 30 30 22" stroke="#6E6A66" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/>`;
 return `<li class="patch ${p.result}" style="--i:${i}" title="Room ${p.level}: ${p.result==='win'?'won':p.result==='draw'?'drawn':'lost'}"><svg viewBox="0 0 48 48" aria-hidden="true">
  <rect x="2" y="2" width="44" height="44" rx="3" fill="${fill}"/><rect x="5" y="5" width="38" height="38" rx="2" fill="none" stroke="${C.ivory}" stroke-width="1.2" stroke-dasharray="2.5 2"/>${motif}</svg></li>`;
}
export function createOverlays(root,{onDraft,onAgain,onSettings,getBest,cue=()=>{}}){
 root.innerHTML=`<section class="overlay-panel draft-panel" hidden aria-labelledby="draft-title"></section>
  <section class="overlay-panel end-card" hidden aria-labelledby="end-title"></section>`;
 const draftEl=root.querySelector('.draft-panel'),endEl=root.querySelector('.end-card');
 let selected=null,replace=null,draftKey='',s=null,endKey='';
 function drawDraft(){
  const inv=s.inventory,total=Object.values(inv).reduce((a,b)=>a+b,0),full=total>=3;
  const mustPick=s.starterDraft||(s.level===5&&total===0);
  const title=s.starterDraft?'Hearth & Thread':`Room ${s.level-1} cleared`;
  const lead=s.starterDraft?'Granny Owl is knitting by the window. Beat her at noughts and crosses across five rooms. Pick your first sewing tool.'
   :s.level===5&&total===0?'Choose a tool for the final room. Owl keeps a teacup of her own there, so you’ll need one.'
   :`Next: ${rooms[s.level].name}. Take a tool, or skip and keep your tray as it is.`;
  const pickName=POWERS.find(p=>p[0]===selected)?.[1];
  draftEl.innerHTML=`<h2 id="draft-title" class="${s.starterDraft?'title':''}">${title}</h2><p class="lead">${lead}</p>
   <div class="cards" role="radiogroup" aria-label="Sewing tools">${POWERS.map(([id,name,line],i)=>`<button type="button" class="card" role="radio" data-pick="${id}" aria-checked="${selected===id}" aria-keyshortcuts="${i+1}">
    <span class="card-art">${tools[id]}</span><span class="card-name">${name}<kbd>${i+1}</kbd></span><span class="card-line">${line}</span>
    <svg class="demo demo-${id}" viewBox="0 0 60 60" aria-hidden="true">${demos[id]}</svg>${inv[id]?`<span class="held">In your tray: ${inv[id]}</span>`:''}</button>`).join('')}</div>
   ${full&&selected?`<div class="swap"><p>Your tray holds three. Swap out:</p>${POWERS.filter(([id])=>inv[id]).map(([id,name])=>`<button type="button" class="chip" data-replace="${id}" aria-pressed="${replace===id}">${name} ×${inv[id]}</button>`).join('')}</div>`:''}
   <div class="draft-actions"><button type="button" class="primary" data-confirm ${!selected||(full&&!replace)?'disabled':''}>${selected?(full?`Swap for ${pickName}`:`Keep ${pickName}`):'Pick a tool'}</button>
   ${mustPick?'':`<button type="button" data-skip>Skip, keep my tray</button>`}</div>`;
  draftEl.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>pick(b.dataset.pick));
  draftEl.querySelectorAll('[data-replace]').forEach(b=>b.onclick=()=>{replace=b.dataset.replace;drawDraft();draftEl.querySelector(`[data-replace="${replace}"]`)?.focus();});
  const c=draftEl.querySelector('[data-confirm]');c.onclick=()=>{if(onDraft(selected,replace))cue('draft');};
  const k=draftEl.querySelector('[data-skip]');if(k)k.onclick=()=>onDraft(null);
 }
 function pick(id){
  if(!s||s.phase!=='draft'||performance.now()<s.inputLockedUntil)return;
  selected=id;replace=null;drawDraft();cue('draft');
  const full=Object.values(s.inventory).reduce((a,b)=>a+b,0)>=3;
  draftEl.querySelector(full?'[data-replace]':'[data-confirm]')?.focus();
 }
 function drawEnd(){
  const best=getBest(),win=s.phase==='victory',spent=s.powersSpent,newBest=s.score>0&&s.score>=best.value&&best.beaten;
  endEl.classList.toggle('victory',win);
  endEl.innerHTML=`<h2 id="end-title">${win?'The quilt is finished.':`The quilt came undone ${rooms[s.level].where}.`}</h2>
   ${newBest?'<p class="new-best">New best!</p>':''}
   <div class="quilt-patches" role="list" aria-label="Your quilt: one row per room, one patch per board">${quiltRows(s.quilt)}</div>
   <dl class="stats"><div><dt>Rooms</dt><dd>${win?5:s.level-1} of 5 cleared</dd></div><div><dt>Score</dt><dd>${s.score}</dd></div><div><dt>Best</dt><dd>${best.value}</dd></div>
    <div><dt>Tools used</dt><dd>${spent}</dd></div><div><dt>Peak hearth</dt><dd>${s.peakHeat} of 10</dd></div></dl>
   <button type="button" class="primary again" data-again>Again</button>`;
  endEl.querySelector('[data-again]').onclick=onAgain;
 }
 function update(state){
  s=state;
  const key=state.phase==='draft'?`${state.level}:${state.starterDraft}`:'';
  if(key!==draftKey){selected=null;replace=null;draftKey=key;}
  const showDraft=state.phase==='draft',showEnd=['victory','defeat'].includes(state.phase);
  const opening=showDraft&&draftEl.hidden;
  draftEl.hidden=!showDraft;endEl.hidden=!showEnd;
  // Swallow taps during the input guard (fresh draft after a win).
  draftEl.inert=performance.now()<state.inputLockedUntil;
  if(showDraft){drawDraft();if(opening)setTimeout(()=>draftEl.querySelector('[data-pick]')?.focus({preventScroll:true}),30);}
  const ek=showEnd?`${state.revision}:${state.phase}`:'';
  if(ek&&ek!==endKey){drawEnd();setTimeout(()=>endEl.querySelector('[data-again]')?.focus({preventScroll:true}),30);}
  endKey=ek;
 }
 return {update,pick(i){const id=POWERS[i]?.[0];if(id)pick(id);},isOpen:()=>!draftEl.hidden||!endEl.hidden};
}

export function createSettings(dialog,how,{settings,onChange,onQuit}){
 dialog.innerHTML=`<form method="dialog" class="settings"><h2>Settings</h2>
  <label class="range"><span>Music</span><input type="range" min="0" max="100" name="music"></label>
  <label class="range"><span>Sound effects</span><input type="range" min="0" max="100" name="sfx"></label>
  <label class="check"><input type="checkbox" name="muted"><span>Mute all sound</span></label>
  <label class="check"><input type="checkbox" name="reducedMotion"><span>Reduce motion</span></label>
  <div class="settings-actions"><button type="button" data-how>How to play</button><button type="button" data-quit>Quit run</button><button class="primary" value="close">Done</button></div></form>`;
 how.innerHTML=`<form method="dialog" class="how"><h2>How to play</h2>
  <p>Make a line of three berry stitches before Granny Owl lines up her teal buttons.</p>
  <ul><li>Clear five rooms. Each room gives you three boards (the hearts). A draw burns a heart; Owl gets a little sleepier and more careless every time.</li>
  <li>If Owl makes a line, or the hearts run out, the run ends. Second Wind (the golden needle) saves you once per run.</li>
  <li>Tools: use one per turn, and each one includes your stitch. Pick a tool, choose the squares, check the preview, then confirm. Esc, tapping the last square again, or tapping outside cancels. Nothing is spent until you confirm.</li>
  <li><b>Shatter</b> snips one of Owl’s buttons (or shoos the cat), then you stitch elsewhere. <b>Slide</b> moves one of your stitches, then you stitch again. <b>Ward</b> stitches, then sets a teacup on an empty square that Owl can’t use on her next move.</li>
  <li>After each room, pick a new tool (you can hold three). In the last room Owl has a teacup too, so keep a tool for it.</li>
  <li>Score: 100 per room, 50 per heart left when you clear it, 25 per tool spent.</li>
  <li>Keys: arrows move, Enter stitches, 1, 2 and 3 pick a tool, Esc cancels.</li></ul>
  <div class="settings-actions"><button class="primary" value="close">Got it</button></div></form>`;
 const f=dialog.querySelector('form'),quit=dialog.querySelector('[data-quit]');let armed=false;
 function sync(){f.music.value=Math.round(settings.music*100);f.sfx.value=Math.round(settings.sfx*100);f.muted.checked=settings.muted;f.reducedMotion.checked=settings.reducedMotion;}
 f.addEventListener('input',()=>onChange({music:f.music.value/100,sfx:f.sfx.value/100,muted:f.muted.checked,reducedMotion:f.reducedMotion.checked}));
 dialog.querySelector('[data-how]').onclick=()=>{dialog.close();how.showModal();};
 quit.onclick=()=>{if(!armed){armed=true;quit.textContent='Tap again to quit';return;}armed=false;quit.textContent='Quit run';dialog.close();onQuit();};
 dialog.addEventListener('close',()=>{armed=false;quit.textContent='Quit run';});
 return {open(){sync();dialog.showModal();},openHow(){how.showModal();}};
}
