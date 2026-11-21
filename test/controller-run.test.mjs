import test from 'node:test';
import assert from 'node:assert/strict';
import {createController} from '../src/controller.mjs';
function harness(opts={}){
 let t=0,id=0;const jobs=[],requests=[],saves=[];
 const game=createController({render:()=>{},now:()=>t,later:(fn,ms)=>jobs.push({fn,due:t+ms,id:id++}),
  onSave:r=>saves.push(r===null?null:structuredClone(r)),
  requestAI:payload=>new Promise(resolve=>requests.push({payload,resolve})),...opts});
 function tick(ms){const target=t+ms;for(;;){jobs.sort((a,b)=>a.due-b.due||a.id-b.id);if(!jobs.length||jobs[0].due>target)break;const j=jobs.shift();t=j.due;j.fn();}t=target;}
 return {game,tick,requests,saves};
}
async function reply(h,at,policy='search'){const r=h.requests.at(-1);r.resolve({revision:r.payload.revision,action:{type:'Place',at},policy});await Promise.resolve();await Promise.resolve();}
async function turn(h,x,o,policy){assert(h.game.commit({type:'Place',at:x}));h.tick(300);await reply(h,o,policy);h.tick(300);}

test('board start saves a resumable record; resume restores it at the start of the board',async()=>{
 const h=harness(),g=h.game;g.draft('slide');
 const rec=h.saves.at(-1);assert.equal(rec.phase,'board');assert.equal(rec.level,1);assert.equal(rec.inventory.slide,1);
 await turn(h,0,4);
 const h2=harness();assert(h2.game.resume(rec));
 const s=h2.game.getState();assert.equal(s.phase,'player');assert.equal(s.level,1);assert.equal(s.inventory.slide,1);
 assert.deepEqual(s.position.cells,Array(9).fill(null));
});
test('a won board records a gold patch and saves the draft',async()=>{
 const h=harness(),g=h.game;g.draft('ward');await turn(h,0,3);await turn(h,1,4);g.commit({type:'Place',at:2});
 assert.deepEqual(g.getState().quilt,[{level:1,result:'win'}]);
 h.tick(700);const rec=h.saves.at(-1);assert.equal(rec.phase,'draft');assert.equal(rec.level,2);
 const h2=harness();h2.game.resume(rec);assert.equal(h2.game.getState().phase,'draft');
 assert(h2.game.draft(null));assert.equal(h2.game.getState().level,2);assert.equal(h2.game.getState().position.cells[0],'rock');
});
test('a loss saves the Second Wind outcome, never the beat itself',async()=>{
 const h=harness(),g=h.game;g.draft('ward');await turn(h,0,3);await turn(h,1,4);
 g.commit({type:'Place',at:8});h.tick(300);await reply(h,5);
 assert.equal(g.getState().phase,'lost');
 const rec=h.saves.at(-1);assert.equal(rec.secondWindAvailable,false);assert.equal(rec.phase,'board');
 assert.deepEqual(rec.quilt,[{level:1,result:'loss'}]);
 h.tick(1000);assert.deepEqual(g.getState().events,[{type:'secondWind',reason:'line'}]);
 await turn(h,0,3);await turn(h,1,4);g.commit({type:'Place',at:8});h.tick(300);await reply(h,5);
 assert.equal(h.saves.at(-1),null);
});
test('Owl policy and fallback are reported for her tells',async()=>{
 const h=harness(),g=h.game;g.draft('ward');g.commit({type:'Place',at:0});h.tick(300);await reply(h,4,'blunder');
 assert.equal(g.getState().owlPolicy,'blunder');h.tick(300);
 g.commit({type:'Place',at:1});h.tick(300);h.tick(1200);
 const s=g.getState();assert.equal(s.owlPolicy,'fallback');assert.equal(s.stats.fallbacks,1);assert.equal(s.stats.aiMoves,2);
});
test('reduced motion can change mid-run',async()=>{
 let rm=false;const h=harness({reducedMotion:()=>rm}),g=h.game;g.draft('ward');
 await turn(h,0,3);await turn(h,1,4);g.commit({type:'Place',at:8});h.tick(300);rm=true;await reply(h,5);
 h.tick(0);assert.equal(g.getState().phase,'player');
});
test('peak heat and powers spent survive the board reset',async()=>{
 const h=harness(),g=h.game;g.draft('ward');assert(g.commit({type:'Ward',at:0,shieldCell:8}));
 assert.equal(g.getState().peakHeat,3);assert.equal(g.getState().powersSpent,1);
});
test('resume rejects garbage',()=>{
 const h=harness();for(const bad of [null,{},{phase:'board',level:9},'x'])assert.equal(h.game.resume(bad),false);
});
