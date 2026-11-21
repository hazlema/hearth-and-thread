// Granny Owl is the AI's face: her mood is the readable tell for thinking, hesitation (draw tilt), timeouts and her L5 Ward.
import {owl as owlSvg} from './art.mjs';
const ENTRY={2:'Mind the cat, dear. She’s fast asleep.',3:'I’ve started us off. Your move.',4:'My stitch first, this time.',5:'Last room. I’ve brought my teacup.'};
export function createOwl(root,{reduced=()=>false,cue=()=>{}}={}){
 root.innerHTML=`${owlSvg}<p class="bubble" hidden></p>`;
 const svg=root.querySelector('.owl'),bubble=root.querySelector('.bubble');
 let last=null,bubbleTimer=0,moodTimer=0,greeted=false;
 function say(text,ms=2600){
  clearTimeout(bubbleTimer);bubble.textContent=text;bubble.hidden=false;bubble.classList.remove('show');void bubble.offsetWidth;bubble.classList.add('show');
  bubbleTimer=setTimeout(()=>{bubble.hidden=true;},ms);
 }
 function flash(mood,ms){
  svg.classList.add(mood);clearTimeout(moodTimer);
  moodTimer=setTimeout(()=>svg.classList.remove(mood),reduced()?10:ms);
 }
 function update(s){
  const prev=last;last=s;
  const placedO=s.events.some(e=>e.type==='placement'&&e.actor==='O')&&prev?.revision!==s.revision;
  svg.style.setProperty('--sleep',Math.min(3,s.drawsThisLevel));
  svg.classList.toggle('thinking',s.phase==='ai');
  svg.classList.toggle('hesitant',s.phase==='ai'&&s.drawsThisLevel>0);
  svg.classList.toggle('asleep',s.phase==='victory');
  svg.classList.toggle('pleased',s.phase==='lost'&&s.lossReason==='line'||s.phase==='defeat');
  svg.classList.toggle('dismayed',s.phase==='won');
  svg.classList.toggle('has-cup',s.level===5&&s.position?.wardO>0&&!['victory','defeat'].includes(s.phase));
  if(s.phase==='newRun'||(!prev&&s.phase==='draft'))greeted=false;
  if(prev?.phase!==s.phase||prev?.revision!==s.revision){
   if(placedO){
    const warded=s.events.some(e=>e.type==='power'&&e.actor==='O');
    if(s.owlPolicy==='fallback'){flash('yawn',900);cue('yawn');}
    if(warded){say('Mind the teacup, dear.');cue('teacup');}
    else if(!greeted){greeted=true;say('Your turn, dear.');}
    else if(s.owlPolicy==='blunder'&&s.drawsThisLevel>0&&Math.random()<.5)say('Hm? Oh… was that my stitch?',2000);
   }
   if(s.events.some(e=>e.type==='boardBurned')){flash('yawn',900);cue('yawn');say(['Mm… where was I?','A drawn quilt. How restful.','*yawn* Again, dear?'][Math.min(2,s.drawsThisLevel-1)]);}
   if(s.events.some(e=>e.type==='secondWind'))say('Let’s knit that one again.');
   if(s.phase==='won')say(s.level===5?'Oh, well stitched!':'Well stitched, dear.',1800);
   if(s.phase==='lost')say(s.lossReason==='line'?'Oh my. That came undone.':'We’ve run out of cloth.',2000);
   const entering=s.phase!=='draft'&&prev&&(prev.phase==='draft'||prev.level!==s.level)&&!s.events.length&&ENTRY[s.level];
   if(entering)say(ENTRY[s.level],3000);
  }
 }
 return {update,say,reset(){greeted=false;}};
}
