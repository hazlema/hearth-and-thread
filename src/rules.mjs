const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const other=p=>p==='X'?'O':'X';
const wins=(c,p)=>LINES.some(l=>l.every(i=>c[i]===p));
const key=a=>JSON.stringify([a.type,a.at,a.remove,a.from,a.to,a.shieldCell??null]);
const clone=s=>({...s,cells:[...s.cells],powersX:{...s.powersX},shield:s.shield?{...s.shield}:null});
export function initial(cells=Array(9).fill(null),toMove='X',powersX={},wardO=0){
 return {cells:[...cells],toMove,powersX:{shatter:0,slide:0,ward:0,...powersX},wardO,shield:null,result:'playing'};
}
export function legalActions(s){
 if(s.result!=='playing')return [];
 const p=s.toMove,c=s.cells,out=[];
 const blocked=i=>s.shield?.blockedActor===p&&s.shield.cell===i;
 const free=(b,i)=>b[i]===null&&!blocked(i);
 const has=t=>p==='X'?s.powersX[t]>0:t==='ward'&&s.wardO>0;
 for(let at=0;at<9;at++)if(free(c,at)){
  out.push({type:'Place',at});
  if(has('ward')){
   const b=[...c];b[at]=p;
   if(wins(b,p))out.push({type:'Ward',at,shieldCell:null});
   else {
    const empties=b.flatMap((v,i)=>v===null?[i]:[]);
    if(empties.length>=2)for(const shieldCell of empties)out.push({type:'Ward',at,shieldCell});
   }
  }
 }
 if(has('shatter'))for(let remove=0;remove<9;remove++)if(c[remove]===other(p)||c[remove]==='rock'){
  for(let at=0;at<9;at++)if(at!==remove&&free(c,at))out.push({type:'Shatter',remove,at});
 }
 if(has('slide'))for(let from=0;from<9;from++)if(c[from]===p){
  for(let to=0;to<9;to++)if(free(c,to)){
   const b=[...c];b[from]=null;b[to]=p;
   for(let at=0;at<9;at++)if(free(b,at))out.push({type:'Slide',from,to,at});
  }
 }
 return out;
}
function findAction(s,a){
 if(!a||typeof a!=='object')return undefined;
 const fields=['at','remove','from','to','shieldCell'];
 if(typeof a.type!=='string'||fields.some(f=>a[f]!=null&&(!Number.isInteger(a[f])||a[f]<0||a[f]>8)))return undefined;
 const wanted=key(a);
 return legalActions(s).find(x=>key(x)===wanted);
}
export const canApply=(s,a)=>Boolean(findAction(s,a));
export function applyAction(s,a){
 const action=findAction(s,a);
 if(!action)return {error:'ILLEGAL_ACTION'};
 return applyUnchecked(s,action);
}
// Search-only fast path: `action` must come from legalActions(s). Public callers use applyAction.
export function applyUnchecked(s,action){
 const n=clone(s),p=s.toMove,events=[];
 if(action.type==='Shatter')n.cells[action.remove]=null;
 if(action.type==='Slide'){n.cells[action.from]=null;n.cells[action.to]=p;}
 n.cells[action.at]=p;
 if(action.type!=='Place'){
  if(p==='X')n.powersX[action.type.toLowerCase()]--;else n.wardO--;
  events.push({type:'power',actor:p,power:action.type});
 }
 if(n.shield)events.push({type:'shieldExpired',cell:n.shield.cell});
 n.shield=null;
 n.result=wins(n.cells,p)?p:n.cells.includes(null)?'playing':'draw';
 if(n.result==='playing'&&action.type==='Ward'){
  n.shield={cell:action.shieldCell,blockedActor:other(p)};
  events.push({type:'shieldCreated',...n.shield});
 }
 events.push({type:'placement',actor:p,cell:action.at});
 if(n.result!=='playing')events.push({type:'terminal',result:n.result});
 else n.toMove=other(p);
 return {position:n,events};
}
