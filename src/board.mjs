// Quilt board: preview-then-confirm input (board v2 rules) on a persistent DOM so animations survive re-renders.
import {legalActions,applyAction} from './rules.mjs';
import {marks,teacup,cloth,cellCenter} from './art.mjs';
const fields={Shatter:['remove','at'],Slide:['from','to','at'],Ward:['at','shieldCell']};
const names={shatter:'Shatter',slide:'Slide',ward:'Ward'};
const instructions={remove:'Choose a button (or the cat) to snip away.',from:'Choose your stitch to slide.',to:'Choose where it slides to.',
 at:'Choose where to stitch your X.',shieldCell:'Choose a square for the teacup.'};
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const lineOf=(cells,p)=>LINES.find(l=>l.every(i=>cells[i]===p));
const where=i=>`row ${Math.floor(i/3)+1}, column ${i%3+1}`;
export {where};

export function createBoard(root,{onCommit,onSkipWon=()=>{},announce=()=>{},onFormChange=()=>{},reduced=()=>false}){
 let s=null,form=null,step=0,action=null,lastCell=null,cursor=4,pending=null,lastX=null,lastO=null,seenRevision=-1,seenPhase='';
 const shown={piece:Array(9).fill(undefined),cup:Array(9).fill(false)};
 root.innerHTML=`<div class="quilt">
   <svg class="cloth" viewBox="0 0 100 100" aria-hidden="true">${cloth}</svg>
   <div class="cells" role="group" aria-label="Quilt board, three by three">${Array.from({length:9},(_,i)=>`<button type="button" class="cell" data-cell="${i}" tabindex="${i===4?0:-1}">
    <svg class="ghost" viewBox="0 0 100 100" aria-hidden="true">${marks.X}</svg><svg class="piece" viewBox="0 0 100 100" aria-hidden="true"></svg><svg class="cup" viewBox="0 0 100 100" aria-hidden="true"></svg></button>`).join('')}</div>
   <svg class="overlay" viewBox="0 0 100 100" aria-hidden="true"><defs><mask id="sew"><path class="seam-mask" pathLength="100" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></mask></defs>
    <path class="thread" fill="none"/><g mask="url(#sew)"><path class="seam-glow" fill="none"/><path class="seam" fill="none"/></g></svg>
  </div>
  <div class="board-bar"><p class="board-hint" aria-live="polite"></p>
   <div class="board-actions"><button type="button" data-cancel>Cancel</button><button type="button" data-confirm class="primary">Stitch it</button><button type="button" data-continue class="primary">Continue</button></div></div>`;
 const quilt=root.querySelector('.quilt'),cells=[...root.querySelectorAll('.cell')],hint=root.querySelector('.board-hint');
 const btnCancel=root.querySelector('[data-cancel]'),btnConfirm=root.querySelector('[data-confirm]'),btnContinue=root.querySelector('[data-continue]');
 const seam=root.querySelectorAll('.seam,.seam-glow,.seam-mask'),thread=root.querySelector('.thread');

 const locked=()=>!s||performance.now()<s.inputLockedUntil;
 function reset(){form=null;step=0;action=null;lastCell=null;onFormChange(null);}
 function candidates(){return legalActions(s.position).filter(a=>a.type===form.type&&Object.entries(form).every(([k,v])=>a[k]===v));}
 function progress(){
  const options=candidates(),order=fields[form.type];
  while(step<order.length&&options.every(a=>a[order[step]]==null)){form[order[step]]=null;step++;}
  if(step===order.length)action=options[0];
 }
 function cancel(){if(!form)return;const refocus=root.contains(document.activeElement);reset();draw();if(refocus)cells[cursor].focus();announce('Tool put away. Nothing spent.');}
 function selectPower(type){
  if(s?.phase!=='player'||!names[type]||locked())return false;
  if(form?.type===names[type]){cancel();return true;}
  if(!s.position.powersX[type])return false;
  if(!legalActions(s.position).some(a=>a.type===names[type])){announce('No legal use for that tool right now.');return false;}
  reset();form={type:names[type]};onFormChange(type);draw();announce(`${names[type]}: ${instructions[fields[names[type]][0]]}`);return true;
 }
 function commit(a){pending=a;if(!onCommit(a))pending=null;}
 function confirm(){if(!action)return;const a=action,refocus=root.contains(document.activeElement);reset();commit(a);if(refocus)cells[cursor].focus();}
 function tap(i){
  if(!s)return;
  if(s.phase==='won'){onSkipWon();return;}
  if(s.phase!=='player'||locked())return;
  if(form&&i===lastCell){cancel();return;}
  if(!form){if(s.position.cells[i]===null&&legalActions(s.position).some(a=>a.type==='Place'&&a.at===i))commit({type:'Place',at:i});return;}
  if(action)return;
  const field=fields[form.type][step];
  if(!candidates().some(a=>a[field]===i))return;
  form[field]=i;lastCell=i;step++;progress();draw();
  if(action){announce('Preview ready. Press Enter to stitch it, or Esc to cancel.');if(root.contains(document.activeElement))btnConfirm.focus();}
  else announce(instructions[fields[form.type][step]]);
 }
 cells.forEach((b,i)=>{b.onclick=()=>{cursor=i;tap(i);};b.onfocus=()=>{cursor=i;cells.forEach((c,j)=>c.tabIndex=j===i?0:-1);};});
 btnCancel.onclick=cancel;btnConfirm.onclick=confirm;btnContinue.onclick=()=>onSkipWon();
 function moveCursor(dx,dy){const r=Math.floor(cursor/3),c=cursor%3;cursor=Math.min(2,Math.max(0,r+dy))*3+Math.min(2,Math.max(0,c+dx));cells[cursor].focus();}
 function keys(e){
  if(e.target.closest?.('dialog,input,.overlay-panel'))return;
  const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
  if(d&&s?.position){e.preventDefault();if(!root.contains(document.activeElement)){cells[cursor].focus();return;}moveCursor(...d);return;}
  if(e.key==='Escape'&&form){e.preventDefault();cancel();}
 }
 // Outside taps cancel a preview; the tool tray keeps it (re-tapping a tool toggles it instead).
 function outside(e){if(form&&!root.contains(e.target)&&!e.target.closest?.('[data-keep-preview]'))cancel();}
 document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',keys);

 function restart(el,cls){el.classList.remove(cls);void el.getBoundingClientRect();el.classList.add(cls);}
 function setPiece(i,piece,anim){
  const svg=cells[i].querySelector('.piece');
  if(shown.piece[i]!==piece){svg.innerHTML=piece?marks[piece]:'';shown.piece[i]=piece;}
  svg.className.baseVal='piece';if(anim)restart(svg,anim);
 }
 function exitClone(i,piece,cls){ // A removed piece lingers on top of its cell while it animates away.
  if(reduced()||!piece)return;
  const g=document.createElementNS('http://www.w3.org/2000/svg','svg');g.setAttribute('viewBox','0 0 100 100');g.classList.add('piece','exit',cls);
  g.innerHTML=marks[piece];cells[i].append(g);g.addEventListener('animationend',()=>g.remove(),{once:true});setTimeout(()=>g.remove(),1500);
 }
 function linePath(l){const [x1,y1]=cellCenter(l[0]),[x2,y2]=cellCenter(l[2]),dx=(x2-x1)*.16,dy=(y2-y1)*.16;return `M${x1-dx} ${y1-dy}L${x2+dx} ${y2+dy}`;}

 // Animate what changed between the last committed position and this one.
 function animateCommit(prevCells,next){
  const ev=s.events||[];
  const placed=ev.filter(e=>e.type==='placement');
  for(const e of placed){if(e.actor==='X')lastX=e.cell;else lastO=e.cell;}
  const a=pending;pending=null;
  for(let i=0;i<9;i++){
   const was=prevCells?.[i]??null,now=next.cells[i];
   if(was===now)continue;
   if(was&&!now){ // removed by Shatter (button pops / cat pads off) or vacated by Slide
    if(!(a?.type==='Slide'&&a.from===i))exitClone(i,was,was==='O'?'pop-off':was==='rock'?'shoo':'unpick');
    setPiece(i,null);continue;
   }
   const glide=a?.type==='Slide'&&a.to===i;
   if(glide){const svg=cells[i].querySelector('.piece'),f=cells[a.from].getBoundingClientRect(),t=cells[i].getBoundingClientRect();
    svg.style.setProperty('--dx',`${f.left-t.left}px`);svg.style.setProperty('--dy',`${f.top-t.top}px`);}
   setPiece(i,now,now?(glide?'glide':now==='O'?'drop-in':now==='X'?'sew-in':'settle'):null);
  }
  if(a?.type==='Slide'&&!reduced()){const [x1,y1]=cellCenter(a.from),[x2,y2]=cellCenter(a.to);thread.setAttribute('d',`M${x1} ${y1}Q${(x1+x2)/2+6} ${(y1+y2)/2-10} ${x2} ${y2}`);restart(thread,'tug');}
 }
 function render(state){
  const prev=s;
  if(prev?.revision!==state.revision||state.phase!=='player')reset();
  s=state;
  const fresh=state.position&&(prev?.position==null||state.revision!==seenRevision);
  if(fresh){
   // Commits always carry a placement event; a fresh board (level entry, retry, Second Wind) never does.
   const newBoard=!prev?.position||!state.events.some(e=>e.type==='placement');
   if(newBoard){
    lastX=null;lastO=null;pending=null;
    quilt.classList.remove('sewn','unravel','o-lost');
    for(let i=0;i<9;i++)setPiece(i,state.position.cells[i],state.position.cells[i]?'settle':null);
    if(state.events.some(e=>e.type==='secondWind'))restart(quilt,'reknit');else restart(quilt,'fresh');
   }else animateCommit(prev.position.cells,state.position);
  }
  seenRevision=state.revision;
  if(seenPhase!==`${state.revision}:${state.phase}`){seenPhase=`${state.revision}:${state.phase}`;beat();}
  draw();
 }
 function beat(){
  const p=s.position;if(!p)return;
  if(s.phase==='won'){
   const l=lineOf(p.cells,'X');if(l){seam.forEach(el=>el.setAttribute('d',linePath(l)));restart(quilt,'sewn');}
  }
  if(s.phase==='lost'){
   const l=lineOf(p.cells,'O');
   cells.forEach((c,i)=>c.classList.toggle('o-line',Boolean(l?.includes(i))));
   // Replay the last two moves in slow motion, then let the quilt unravel to grey.
   if(!reduced())for(const [i,k] of [[lastX,0],[lastO,1]])if(i!=null){const svg=cells[i].querySelector('.piece');svg.style.setProperty('--k',k);restart(svg,'replay');}
   restart(quilt,'unravel');
  }else cells.forEach(c=>c.classList.remove('o-line'));
 }
 function draw(){
  if(!s?.position){quilt.classList.add('empty');hint.textContent='';btnCancel.hidden=btnConfirm.hidden=btnContinue.hidden=true;return;}
  quilt.classList.remove('empty');
  const real=s.position,preview=action?applyAction(real,action):null,next=preview?.position||real;
  const field=form&&!action?fields[form.type][step]:null;
  const targets=field?new Set(candidates().map(a=>a[field])):null;
  const placeable=s.phase==='player'&&!form?new Set(legalActions(real).filter(a=>a.type==='Place').map(a=>a.at)):new Set();
  const chosen=new Set(form?Object.entries(form).filter(([k,v])=>k!=='type'&&v!=null).map(([,v])=>v):[]);
  quilt.dataset.mode=form?form.type.toLowerCase():s.phase;
  for(let i=0;i<9;i++){
   const b=cells[i],r=real.cells[i],n=next.cells[i];
   if(!preview&&shown.piece[i]!==r)setPiece(i,r,null);
   const ghostIn=preview&&n&&n!==r,leaving=preview&&r&&!n;
   b.classList.toggle('preview-in',Boolean(ghostIn));b.classList.toggle('preview-out',Boolean(leaving));
   // The preview piece shows in the ghost layer; the real piece stays put underneath.
   b.querySelector('.ghost').innerHTML=ghostIn?marks[n]:marks.X;
   const shieldHere=next.shield?.cell===i;
   if(shown.cup[i]!==shieldHere){const cup=b.querySelector('.cup');cup.innerHTML=shieldHere?teacup:'';shown.cup[i]=shieldHere;if(shieldHere&&!preview)restart(cup,'cup-drop');}
   b.classList.toggle('cup-preview',Boolean(shieldHere&&preview&&real.shield?.cell!==i));
   b.classList.toggle('blocked-x',shieldHere&&next.shield.blockedActor==='X');
   b.classList.toggle('blocked-o',shieldHere&&next.shield.blockedActor==='O');
   const enabled=s.phase==='won'||(s.phase==='player'&&((form&&i===lastCell)||(!action&&(targets?targets.has(i):placeable.has(i)))));
   b.classList.toggle('open',!form&&placeable.has(i));
   b.classList.toggle('target',Boolean(targets?.has(i)));
   b.classList.toggle('chosen',chosen.has(i));
   b.setAttribute('aria-disabled',String(!enabled));
   const label=r==='X'?'your stitch':r==='O'?'Owl’s button':r==='rock'?'sleeping cat':'empty';
   const shieldNote=real.shield?.cell===i?(real.shield.blockedActor==='X'?', teacup: blocked for your move':', teacup: blocked for Owl’s next move'):'';
   b.setAttribute('aria-label',`${where(i)[0].toUpperCase()+where(i).slice(1)}: ${label}${shieldNote}${form&&i===lastCell?', press again to cancel':''}${targets?.has(i)?', can choose':''}`);
  }
  btnCancel.hidden=!form;btnConfirm.hidden=!action;btnContinue.hidden=s.phase!=='won';
  btnConfirm.textContent=action?`Stitch it (${action.type})`:'Stitch it';
  hint.textContent=action?'Preview. Confirm it, or cancel: nothing is spent yet.':form?instructions[field]
   :s.phase==='won'?'A golden seam!':s.phase==='player'?(real.shield?.blockedActor==='X'?'Your stitch. The teacup square is blocked.':'Your stitch.')
   :s.phase==='ai'||(s.phase==='transition'&&real.toMove==='O')?'Owl is thinking…':s.phase==='transition'?'Your stitch.':s.phase==='lost'?'The quilt unravels…':'';
 }
 return {render,selectPower,cancel,focus(){cells[cursor].focus();},hasPreview:()=>Boolean(form),
  destroy(){document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',keys);root.replaceChildren();}};
}
