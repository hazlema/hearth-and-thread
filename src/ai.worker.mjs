import {legalActions,applyUnchecked} from './rules.mjs';
const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const wins=(c,p)=>lines.some(l=>l.every(i=>c[i]===p));
export function tacticalFallback(s){
 const moves=legalActions(s).filter(a=>a.type==='Place'),p=s.toMove,enemy=p==='O'?'X':'O';
 const makes=(a,mark)=>{const c=[...s.cells];c[a.at]=mark;return wins(c,mark);};
 return moves.find(a=>makes(a,p))||moves.find(a=>makes(a,enemy))||moves.find(a=>a.at===4)||moves[0]||null;
}
function evaluate(s,ply){
 if(s.result==='O')return 10000-ply;if(s.result==='X')return -10000+ply;if(s.result==='draw')return 0;
 let v=0;
 for(const l of lines){
  const c=l.map(i=>s.cells[i]);if(c.includes('rock'))continue;
  const x=c.filter(p=>p==='X').length,o=c.filter(p=>p==='O').length;
  if(!x)v+=[0,2,12,500][o];if(!o)v-=[0,2,12,500][x];
 }
 v-=3*(s.powersX.shatter+s.powersX.slide+s.powersX.ward);v+=3*s.wardO;
 if(s.shield)v+=s.shield.blockedActor==='X'?2:-2;return v;
}
export function chooseAI(position,{level=5,drawsThisLevel=0,budgetMs=300,maxDepth=6,random=Math.random,now=()=>performance.now()}={}){
 const start=now(),deadline=start+budgetMs,TIMEOUT=Symbol('timeout');
 const root=legalActions(position),plain=root.filter(a=>a.type==='Place'),fallback=tacticalFallback(position);
 if(!root.length)return {action:null,depth:0};
 const immediate=plain.find(a=>applyUnchecked(position,a).position.result==='O');
 if(level>=4&&immediate)return {action:immediate,depth:0,policy:'win'};
 const p=Math.min(1,[0,.8,.4,.25,.1,0][level]+.1*drawsThisLevel);
 if(random()<p)return {action:plain[Math.floor(random()*plain.length)]||fallback,depth:0,policy:'blunder'};
 const check=()=>{if(now()>=deadline)throw TIMEOUT;};
 const rank=a=>a.type==='Place'?(a.at===4?0:1):2;
 function actions(s,ply){
  const a=legalActions(s);
  return (s.toMove==='X'&&ply>4?a.filter(x=>x.type==='Place'):a).sort((a,b)=>rank(a)-rank(b));
 }
 function search(s,depth,alpha,beta,ply){
  check();if(s.result!=='playing'||depth===0)return evaluate(s,ply);
  const maximizing=s.toMove==='O';let best=maximizing?-Infinity:Infinity;
  for(const a of actions(s,ply)){
   check();const r=applyUnchecked(s,a);
   const value=search(r.position,depth-1,alpha,beta,ply+1);
   best=maximizing?Math.max(best,value):Math.min(best,value);
   if(maximizing)alpha=Math.max(alpha,best);else beta=Math.min(beta,best);
   if(beta<=alpha)break;
  }
  return Number.isFinite(best)?best:evaluate(s,ply);
 }
 let best=root.find(a=>a.type==='Place'&&a.at===fallback?.at)||root[0],completedDepth=0,timedOut=false;
 for(let depth=1;depth<=maxDepth;depth++){
  let candidate=best,value=-Infinity;
  const ordered=[best,...root.filter(a=>a!==best)];
  try{
   for(const a of ordered){check();const r=applyUnchecked(position,a);
    const score=search(r.position,depth-1,value,Infinity,1);
    if(score>value){value=score;candidate=a;}
   }
   best=candidate;completedDepth=depth;
  }catch(e){if(e!==TIMEOUT)throw e;timedOut=true;break;}
 }
 return {action:best,depth:completedDepth,timedOut,elapsedMs:now()-start,policy:'search'};
}
if(typeof WorkerGlobalScope!=='undefined'&&globalThis instanceof WorkerGlobalScope){
 globalThis.onmessage=({data})=>{
  const {revision,position,level,drawsThisLevel}=data;
  try{globalThis.postMessage({revision,...chooseAI(position,{level,drawsThisLevel})});}
  catch{globalThis.postMessage({revision,action:tacticalFallback(position),policy:'error-fallback'});}
 };
}
