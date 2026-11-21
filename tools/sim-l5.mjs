// Gate 3/4 harness: L5 clear rate over seeded runs, plus AI timing. Usage:
//   node tools/sim-l5.mjs [boards=200] [powers=1] [model=look3|look2|look4|perfect]
import {initial,legalActions,applyUnchecked} from '../src/rules.mjs';
import {chooseAI} from '../src/ai.worker.mjs';
import {solve,bestActions} from './solver.mjs';
const [N=200,POWERS=1,MODEL='look3']=process.argv.slice(2).map((v,i)=>i<2?Number(v):v);
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function evalX(s,ply){ // positive is good for X
 if(s.result==='X')return 1000-ply;if(s.result==='O')return -1000+ply;if(s.result==='draw')return 0;
 let v=0;for(const l of LINES){const c=l.map(i=>s.cells[i]);if(c.includes('rock'))continue;
  const x=c.filter(p=>p==='X').length,o=c.filter(p=>p==='O').length;if(!o)v+=[0,1,4,0][x];if(!x)v-=[0,1,4,0][o];}
 return v;
}
function lookahead(s,depth,ply=0,a=-1e9,b=1e9){
 if(s.result!=='playing'||depth===0)return evalX(s,ply);
 const x=s.toMove==='X';let best=x?-1e9:1e9;
 for(const act of legalActions(s)){const v=lookahead(applyUnchecked(s,act).position,depth-1,ply+1,a,b);
  if(x){best=Math.max(best,v);a=Math.max(a,best);}else{best=Math.min(best,v);b=Math.min(b,best);}if(b<=a)break;}
 return best;
}
function playerX(s,random){
 if(MODEL==='perfect')return bestActions(s)[0];
 const depth=Number(MODEL.slice(4));let best=-1e9,picks=[];
 for(const act of legalActions(s)){
  const v=lookahead(applyUnchecked(s,act).position,depth-1,1)-(act.type==='Place'?0:0.5); // mild preference to save powers
  if(v>best+1e-9){best=v;picks=[act];}else if(Math.abs(v-best)<1e-9)picks.push(act);
 }
 return picks[Math.floor(random()*picks.length)];
}
const types=['shatter','slide','ward'];
let clears=0,boards=0,aiMoves=0,overSoft=0,maxMs=0;const times=[];
for(let seed=1;seed<=N;seed++){
 const random=rng(seed);const inv={shatter:0,slide:0,ward:0};
 for(let i=0;i<POWERS;i++)inv[types[Math.floor(random()*3)]]++;
 let cleared=false;
 for(let board=0;board<3&&!cleared;board++){ // draws burn a board; an O line ends the level here (Second Wind assumed spent)
  boards++;let s=initial(Array(9).fill(null),'X',{...inv},1);
  while(s.result==='playing'){
   let act;
   if(s.toMove==='X')act=playerX(s,random);
   else{const r=chooseAI(s,{level:5,random});act=r.action;aiMoves++;const ms=r.elapsedMs??0;times.push(ms);maxMs=Math.max(maxMs,ms);if(r.timedOut)overSoft++;}
   s=applyUnchecked(s,act).position;
  }
  Object.assign(inv,s.powersX);
  if(s.result==='X')cleared=true;else if(s.result==='O')break;
 }
 if(cleared)clears++;
}
times.sort((a,b)=>a-b);
console.log(`model=${MODEL} powers=${POWERS} runs=${N} clear=${(100*clears/N).toFixed(1)}% boards=${boards} aiMoves=${aiMoves} softBudgetHits=${overSoft} p50=${times[times.length>>1]?.toFixed(0)}ms p95=${times[Math.floor(times.length*.95)]?.toFixed(0)}ms max=${maxMs.toFixed(0)}ms`);
