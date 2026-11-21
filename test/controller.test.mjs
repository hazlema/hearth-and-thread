import test from 'node:test';
import assert from 'node:assert/strict';
import {createController} from '../src/controller.mjs';
function harness(){
 let t=0,id=0,cancelled=0;const jobs=[],requests=[];
 const game=createController({render:()=>{},now:()=>t,later:(fn,ms)=>jobs.push({fn,due:t+ms,id:id++}),
 cancelAI:()=>cancelled++,requestAI:payload=>new Promise(resolve=>requests.push({payload,resolve}))});
 function tick(ms){const target=t+ms;for(;;){jobs.sort((a,b)=>a.due-b.due||a.id-b.id);if(!jobs.length||jobs[0].due>target)break;const j=jobs.shift();t=j.due;j.fn();}t=target;}
 return {game,tick,requests,cancelled:()=>cancelled};
}
const flush=async()=>{await Promise.resolve();await Promise.resolve();};
async function reply(h,at){const r=h.requests.at(-1);assert(r);r.resolve({revision:r.payload.revision,action:{type:'Place',at}});await flush();}
async function turn(h,x,o){assert(h.game.commit({type:'Place',at:x}));h.tick(300);await reply(h,o);h.tick(300);}

test('nonwinning power scores once; preview scores nothing',()=>{
 const h=harness(),g=h.game;assert(g.draft('ward'));
 const a={type:'Ward',at:0,shieldCell:8};assert(g.preview(a).position);assert.equal(g.getState().score,0);
 assert(g.commit(a));assert.equal(g.getState().score,25);assert.equal(g.getState().powersSpentThisLevel,1);
 assert.equal(g.commit(a),false);assert.equal(g.getState().score,25);
});
test('win skip and newly entered draft have separate guards',async()=>{
 const h=harness(),g=h.game;g.draft('ward');await turn(h,0,3);await turn(h,1,4);
 assert(g.commit({type:'Place',at:2}));assert.equal(g.getState().phase,'won');assert.equal(g.getState().score,250);
 assert.equal(g.skipWon(),false);h.tick(250);assert(g.skipWon());assert.equal(g.getState().phase,'draft');
 assert.equal(g.draft('slide'),false);h.tick(250);assert(g.draft('slide'));
 h.tick(1000);assert.equal(g.getState().level,2);assert.equal(g.getState().phase,'player');
});
test('reset invalidates transitions and worker replies',async()=>{
 const h=harness(),g=h.game;g.draft('ward');g.commit({type:'Place',at:0});h.tick(300);
 const r=h.requests[0];g.newRun();const before=g.getState();assert.equal(h.cancelled(),1);
 r.resolve({revision:r.payload.revision,action:{type:'Place',at:1}});await flush();h.tick(1000);
 assert.deepEqual(g.getState(),before);
});
test('illegal worker reply takes center before first empty cell',async()=>{
 const h=harness(),g=h.game;g.draft('ward');g.commit({type:'Place',at:0});h.tick(300);
 await reply(h,0);assert.equal(g.getState().position.cells[4],'O');
});
test('draw-exhaustion refunds one board but retains tilt; only once',async()=>{
 const h=harness(),g=h.game;g.draft('ward');
 async function draw(){
  for(const [x,o] of [[0,4],[8,1],[7,6],[2,5]])await turn(h,x,o);
  assert(g.commit({type:'Place',at:3}));h.tick(300);
 }
 await draw();assert.equal(g.getState().boardsLeft,2);
 await draw();assert.equal(g.getState().boardsLeft,1);
 await draw();assert.equal(g.getState().phase,'lost');assert.equal(g.getState().boardsLeft,0);
 h.tick(1000);let s=g.getState();assert.equal(s.phase,'player');assert.equal(s.boardsLeft,1);
 assert.equal(s.drawsThisLevel,3);assert.equal(s.secondWindAvailable,false);assert.equal(s.heat,0);
 await draw();assert.equal(g.getState().phase,'lost');h.tick(1000);assert.equal(g.getState().phase,'defeat');
});
test('O-line Second Wind retains the current attempt',async()=>{
 const h=harness(),g=h.game;g.draft('ward');await turn(h,0,3);await turn(h,1,4);
 g.commit({type:'Place',at:8});h.tick(300);await reply(h,5);
 assert.equal(g.getState().phase,'lost');h.tick(999);assert.equal(g.getState().phase,'lost');h.tick(1);
 const s=g.getState();assert.equal(s.phase,'player');assert.equal(s.boardsLeft,3);assert.equal(s.inventory.ward,1);assert.equal(s.secondWindAvailable,false);
});
