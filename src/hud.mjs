// HUD: house pips (level), heart buttons (boards left), Second Wind, HEARTH gauge (Heat), sewing tray (powers).
import {tools,house,heartButton,needle,rooms} from './art.mjs';
export const POWERS=[['shatter','Shatter','Snip one of Owl’s buttons (or shoo the cat), then stitch elsewhere.'],
 ['slide','Slide','Slide one of your stitches to an empty square, then stitch again.'],
 ['ward','Ward','Stitch, then set a teacup on an empty square: Owl can’t use it on her next move.']];
export function createHUD({top,hearth,tray},{onPower,reduced=()=>false}){
 top.innerHTML=`<ol class="houses">${[1,2,3,4,5].map(n=>`<li class="house" data-n="${n}">${house(n)}</li>`).join('')}</ol>
  <p class="score"><span class="score-now"></span><span class="score-best"></span></p>
  <div class="lives"><div class="second-wind" role="img">${needle}</div><div class="hearts" role="img">${[0,1,2].map(i=>`<span class="heart" data-i="${i}">${heartButton}</span>`).join('')}</div></div>`;
 hearth.innerHTML=`<span class="hearth-label" aria-hidden="true">HEARTH</span><div class="hearth-flame" aria-hidden="true"><svg viewBox="0 0 30 40"><path d="M15 2C20 12 28 16 26 27C25 35 19 38 15 38C9 38 4 34 4 27C4 20 9 18 10 10C13 14 13 18 15 20C17 14 14 8 15 2Z"/></svg></div>
  <div class="hearth-bar" role="meter" aria-label="Hearth heat" aria-valuemin="0" aria-valuemax="10">${Array.from({length:10},(_,i)=>`<i style="--n:${i}"></i>`).join('')}</div>`;
 tray.innerHTML=POWERS.map(([id,name],i)=>`<button type="button" class="tool" data-power="${id}" data-keep-preview aria-keyshortcuts="${i+1}">
  <span class="tool-art">${tools[id]}</span><span class="tool-name">${name}</span><span class="tool-count"></span><kbd>${i+1}</kbd></button>`).join('');
 tray.querySelectorAll('[data-power]').forEach(b=>b.onclick=()=>onPower(b.dataset.power));
 const houses=[...top.querySelectorAll('.house')],hearts=[...top.querySelectorAll('.heart')],heartsBox=top.querySelector('.hearts');
 const sw=top.querySelector('.second-wind'),bar=hearth.querySelector('.hearth-bar');
 let last=null,shownHearts=3,best=0;
 function pop(el,cls,delay=0){if(reduced())return;el.style.animationDelay=`${delay}ms`;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}
 function render(s,{selected=null}={}){
  houses.forEach((h,i)=>{const n=i+1;h.classList.toggle('current',n===s.level);h.classList.toggle('done',n<s.level||(n===5&&s.phase==='victory'));
   h.setAttribute('aria-current',n===s.level?'step':'false');h.setAttribute('aria-label',`Room ${n}: ${rooms[n].name}${n===s.level?' (here)':n<s.level?' (cleared)':''}`);});
  top.querySelector('.houses').setAttribute('aria-label',`Room ${s.level} of 5`);
  top.querySelector('.score-now').textContent=`Score ${s.score}`;
  top.querySelector('.score-best').textContent=`Best ${Math.max(best,0)}`;
  // Hearts: burn one on a draw, refill one by one on a level clear.
  const target=s.boardsLeft;
  hearts.forEach((h,i)=>h.classList.toggle('full',i<target));
  if(last&&target<shownHearts)for(let i=target;i<shownHearts;i++)pop(hearts[i],'burn');
  const refill=s.events.find(e=>e.type==='heartsRefill');
  if(refill&&last?.phase!=='draft')for(let i=refill.from;i<3;i++)pop(hearts[i],'refill',(i-refill.from)*160+250);
  if(last&&target>shownHearts&&!refill)for(let i=shownHearts;i<target;i++)pop(hearts[i],'refill',100);
  shownHearts=target;
  heartsBox.setAttribute('aria-label',`${target} of 3 boards left in this room`);
  sw.classList.toggle('ready',s.secondWindAvailable);
  sw.setAttribute('aria-label',s.secondWindAvailable?'Second Wind ready: your first lost run-ending board is replayed':'Second Wind used');
  if(last?.secondWindAvailable&&!s.secondWindAvailable)pop(sw,'spent');
  bar.setAttribute('aria-valuenow',s.heat);bar.setAttribute('aria-valuetext',`${s.heat} of 10`);
  bar.querySelectorAll('i').forEach((el,i)=>el.classList.toggle('lit',i<s.heat));
  hearth.style.setProperty('--h',s.heat);
  const inv=s.inventory,canAct=s.phase==='player'&&performance.now()>=s.inputLockedUntil;
  tray.querySelectorAll('[data-power]').forEach(b=>{
   const id=b.dataset.power,n=inv[id]||0,[,name,line]=POWERS.find(p=>p[0]===id);
   b.querySelector('.tool-count').textContent=`×${n}`;
   b.classList.toggle('empty',!n);b.classList.toggle('selected',selected===id);
   b.disabled=!canAct||!n;b.setAttribute('aria-pressed',String(selected===id));
   b.title=`${name}: ${line}`;
   b.setAttribute('aria-label',`${name}, ${n} held. ${line}`);
   if(last&&(last.inventory[id]||0)>n)pop(b,'spend');
  });
  last=s;
 }
 return {render,setBest(v){best=v;}};
}
