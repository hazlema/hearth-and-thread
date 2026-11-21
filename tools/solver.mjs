// Exhaustive game-theoretic solver over the shared reducer (no depth cap, no time budget).
// value: +1 X forces a win, 0 draw, -1 O forces a win. Used by fixtures and balance tooling.
import {legalActions,applyUnchecked} from '../src/rules.mjs';
const memo=new Map();
const keyOf=s=>s.cells.map(c=>c===null?'.':c[0]).join('')+s.toMove+s.powersX.shatter+s.powersX.slide+s.powersX.ward+s.wardO+(s.shield?s.shield.cell+s.shield.blockedActor:'-');
export function solve(s){
 if(s.result==='X')return 1;if(s.result==='O')return -1;if(s.result==='draw')return 0;
 const k=keyOf(s);const hit=memo.get(k);if(hit!==undefined)return hit;
 const xTurn=s.toMove==='X';let best=xTurn?-2:2;
 for(const a of legalActions(s)){
  const v=solve(applyUnchecked(s,a).position);
  if(xTurn?v>best:v<best)best=v;
  if(best===(xTurn?1:-1))break;
 }
 memo.set(k,best);return best;
}
export function bestActions(s){
 const target=solve(s);
 return legalActions(s).filter(a=>solve(applyUnchecked(s,a).position)===target);
}
