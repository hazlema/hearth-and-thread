import {initial,canApply,applyAction,legalActions} from './rules.mjs';
import {tacticalFallback} from './ai.worker.mjs';
const TYPES=['shatter','slide','ward'];
const RUN=['level','drawsThisLevel','boardsLeft','secondWindAvailable','score','powersSpentThisLevel','inventory','starterDraft','quilt','peakHeat','powersSpent'];
export function createController({render,requestAI,cancelAI=()=>{},onOutcome=()=>{},onSave=()=>{},later=setTimeout,reducedMotion=false,now=()=>performance.now()}){
 let revision=0,inFlight=null,s;
 const rm=()=>typeof reducedMotion==='function'?reducedMotion():reducedMotion;
 // Only stable states are saved: a board start or a draft. Beats (won/lost/transition) never are.
 const record=(phase,extra={})=>structuredClone({v:1,phase,...Object.fromEntries(RUN.map(k=>[k,s[k]])),...extra});
 const snapshot=()=>structuredClone(s),publish=()=>render(snapshot());
 const locked=()=>now()<s.inputLockedUntil;
 function cancelWork(){try{cancelAI();}catch{/* Cleanup must not freeze play. */}}
 function stopAI(){const active=inFlight!==null;inFlight=null;if(active)cancelWork();}
 function wait(ms,fn){const r=revision,phase=s.phase;later(()=>{if(r===revision&&s.phase===phase)fn();},ms);}
 function guard(){s.inputLockedUntil=now()+250;wait(250,publish);}
 function end(phase){s.phase=phase;onSave(null);publish();onOutcome(snapshot());}
 function newRun(){
  stopAI();revision++;
  s={revision,phase:'draft',level:1,drawsThisLevel:0,boardsLeft:3,secondWindAvailable:true,heat:0,score:0,powersSpentThisLevel:0,
   inventory:{shatter:0,slide:0,ward:0},position:null,events:[],starterDraft:true,lossReason:null,inputLockedUntil:0,
   quilt:[],peakHeat:0,powersSpent:0,owlPolicy:null,stats:{aiMoves:0,fallbacks:0}};onSave(null);publish();
 }
 function resume(r){
  const ok=r&&typeof r==='object'&&r.v===1&&['board','draft'].includes(r.phase)&&Number.isInteger(r.level)&&r.level>=1&&r.level<=5
   &&Number.isInteger(r.boardsLeft)&&r.boardsLeft>=1&&r.boardsLeft<=3&&r.inventory&&Array.isArray(r.quilt);
  if(!ok)return false;
  newRun();Object.assign(s,structuredClone(Object.fromEntries(RUN.map(k=>[k,r[k]]))));
  if(r.phase==='draft'){onSave(record('draft'));publish();}else freshBoard();
  return true;
 }
 function freshBoard(events=[]){
  stopAI();revision++;s.revision=revision;
  const cells=Array(9).fill(null);
  if(s.level===2)cells[0]='rock';if(s.level===3){cells[0]='X';cells[8]='O';}
  s.position=initial(cells,s.level===4?'O':'X',s.inventory,s.level===5?1:0);
  s.heat=0;s.events=events;s.lossReason=null;s.inputLockedUntil=0;s.owlPolicy=null;
  s.phase=s.position.toMove==='X'?'player':'ai';onSave(record('board'));publish();kickAI();
 }
 function draft(type,replace=null){
  if(s.phase!=='draft'||locked())return false;
  const total=Object.values(s.inventory).reduce((a,b)=>a+b,0);
  if(type===null){if(s.starterDraft||(s.level===5&&total===0))return false;}
  else {
   if(!TYPES.includes(type))return false;
   if(total>=3){if(!TYPES.includes(replace)||s.inventory[replace]<1)return false;s.inventory[replace]--;}
   s.inventory[type]++;
  }
  s.starterDraft=false;freshBoard();return true;
 }
 function lose(reason){
  s.phase='lost';s.lossReason=reason;
  // Save the resolved outcome now, so a reload during the beat cannot dodge or eat the Second Wind.
  onSave(s.secondWindAvailable?record('board',{secondWindAvailable:false,boardsLeft:reason==='boards'?1:s.boardsLeft}):null);
  publish();
  wait(rm()?0:1000,()=>{
   if(s.secondWindAvailable){
    s.secondWindAvailable=false;
    if(reason==='boards')s.boardsLeft=1;
    freshBoard([{type:'secondWind',reason}]);
   }else end('defeat');
  });
 }
 function settle(){
  const result=s.position.result;
  if(result==='X'){
   if(s.level===5){end('victory');return;}
   const from=s.boardsLeft;
   s.level++;s.drawsThisLevel=0;s.boardsLeft=3;s.powersSpentThisLevel=0;
   s.phase='draft';s.events=[{type:'heartsRefill',from,to:3}];guard();onSave(record('draft'));publish();return;
  }
  if(result==='draw'){
   s.drawsThisLevel++;s.boardsLeft--;
   if(s.boardsLeft===0){lose('boards');return;}
   freshBoard([{type:'boardBurned',boardsLeft:s.boardsLeft}]);return;
  }
  s.phase=s.position.toMove==='X'?'player':'ai';publish();kickAI();
 }
 function skipWon(){if(s.phase!=='won'||locked())return false;settle();return true;}
 function commit(action,actor='X'){
  if((actor==='X'&&(s.phase!=='player'||locked()))||(actor==='O'&&s.phase!=='ai'))return false;
  if(s.position.toMove!==actor)return false;
  const r=applyAction(s.position,action);if(r.error)return false;
  revision++;s.revision=revision;s.position=r.position;s.inventory={...r.position.powersX};s.events=r.events;
  const spent=r.events.filter(e=>e.type==='power'&&e.actor==='X').length;
  s.powersSpentThisLevel+=spent;s.powersSpent+=spent;s.score+=25*spent;
  if(actor==='O')s.stats.aiMoves++;
  const result=r.position.result;
  if(result!=='playing')s.quilt.push({level:s.level,result:result==='X'?'win':result==='O'?'loss':'draw'});
  const placements=r.events.filter(e=>e.type==='placement').length;
  const powers=r.events.filter(e=>e.type==='power').length;
  s.heat=Math.min(10,s.heat+placements+2*powers+(r.position.result==='X'?3:0));s.peakHeat=Math.max(s.peakHeat,s.heat);
  if(r.position.result==='O')lose('line');
  else if(r.position.result==='X'){
   s.score+=100+50*s.boardsLeft;s.phase='won';guard();publish();wait(rm()?250:700,settle);
  }else{s.phase='transition';publish();wait(rm()?0:300,settle);}
  return true;
 }
 function commitFallback(){
  s.owlPolicy='fallback';s.stats.fallbacks++;
  let a;try{a=tacticalFallback(s.position);}catch{/* Use canonical actions below. */}
  if(a&&canApply(s.position,a)&&commit(a,'O'))return true;
  for(const candidate of legalActions(s.position))if(commit(candidate,'O'))return true;
  return false; // Unreachable for a valid, playing O position.
 }
 function kickAI(){
  if(s.phase!=='ai'||inFlight!==null)return;
  const r=revision;inFlight=r;
  const current=()=>inFlight===r&&revision===r&&s.phase==='ai';
  const payload={revision:r,position:structuredClone(s.position),level:s.level,drawsThisLevel:s.drawsThisLevel};
  function receive(reply){
   if(!current())return;
   if(reply?.revision===r)s.owlPolicy=reply.policy??'search';
   const accepted=reply?.revision===r&&canApply(s.position,reply.action)&&commit(reply.action,'O');
   // Do not disarm the watchdog unless an action really committed.
   if(accepted||commitFallback())inFlight=null;
  }
  later(()=>{
   if(!current())return;
   // Invalidate BEFORE cleanup; cancellation need not settle its promise.
   revision++;s.revision=revision;inFlight=null;cancelWork();
   commitFallback();
  },1200);
  try{Promise.resolve(requestAI(payload)).then(receive,()=>receive(null));}catch{receive(null);}
 }
 function preview(action){return s.phase==='player'&&!locked()?applyAction(s.position,action):{error:'INPUT_LOCKED'};}
 newRun();
 return {newRun,resume,draft,preview,skipWon,commit:action=>commit(action,'X'),getState:snapshot};
}
