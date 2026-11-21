import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,legalActions,applyAction} from '../src/rules.mjs';
import {chooseAI} from '../src/ai.worker.mjs';
import {solve,bestActions} from '../tools/solver.mjs';
const play=(s,a)=>{const r=applyAction(s,a);assert.equal(r.error,undefined);return r.position;};
const ai=s=>chooseAI(s,{level:5,random:()=>1,budgetMs:2000}).action;
// Play X by the exhaustive solver and O by the shipped worker until the board ends.
function duel(s){while(s.result==='playing')s=play(s,s.toMove==='X'?bestActions(s)[0]:ai(s));return s.result;}
const forkA=(powersX)=>initial(['X',null,null, null,'X','O', null,null,'O'],'X',powersX,1);

test('L5-FORK-A: Shatter{8→1} wins on the next X move against every O reply',()=>{
 const s=play(forkA({shatter:1}),{type:'Shatter',remove:8,at:1});
 const replies=legalActions(s);assert(replies.some(a=>a.type==='Ward'));
 for(const o of replies){
  const n=play(s,o);
  assert(legalActions(n).some(x=>applyAction(n,x).position.result==='X'),`no immediate win after ${JSON.stringify(o)}`);
 }
});
test('L5-FORK-A: the shipped worker cannot stop it',()=>{
 assert.equal(solve(forkA({shatter:1})),1);
 assert.equal(duel(forkA({shatter:1})),'X');
});
test('L5-FORK-A control: no powers cannot win',()=>{
 assert(solve(forkA({}))<=0);
 assert.notEqual(duel(forkA({})),'X');
});
test('L5-FORK-B: Slide plus Shatter beats a single Ward',()=>{
 const s=initial(['X',null,null, null,'X',null, null,'O','O'],'X',{slide:1,shatter:1},1);
 assert.equal(solve(s),1);assert.equal(duel(s),'X');
});
test('L5 from an empty board: one power forces a win, none cannot',()=>{
 const empty=Array(9).fill(null);
 assert.equal(solve(initial(empty,'X',{},1)),0);
 for(const t of ['shatter','slide','ward'])assert.equal(solve(initial(empty,'X',{[t]:1},1)),1,t);
});
