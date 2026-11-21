import test from 'node:test';
import assert from 'node:assert/strict';
import {createController} from '../src/controller.mjs';
function harness(throwOnCancel=false){
 let t=0,id=0,cancels=0;const jobs=[],requests=[];
 const game=createController({render:()=>{},now:()=>t,later:(fn,ms)=>jobs.push({fn,due:t+ms,id:id++}),
 cancelAI:()=>{cancels++;if(throwOnCancel)throw Error('cleanup failed');},
 requestAI:payload=>new Promise(resolve=>requests.push({payload,resolve}))});
 function tick(ms){const target=t+ms;for(;;){jobs.sort((a,b)=>a.due-b.due||a.id-b.id);if(!jobs.length||jobs[0].due>target)break;const j=jobs.shift();t=j.due;j.fn();}t=target;}
 return {game,tick,requests,cancels:()=>cancels};
}
async function reply(h,at,index=h.requests.length-1){const r=h.requests[index];r.resolve({revision:r.payload.revision,action:{type:'Place',at}});await Promise.resolve();await Promise.resolve();}

test('silent worker: timeout and stale reply during next request',async()=>{
 const h=harness(),g=h.game;g.draft('ward');g.commit({type:'Place',at:0});h.tick(300);
 const revision=g.getState().revision;h.tick(1199);assert.equal(g.getState().phase,'ai');
 h.tick(1);assert.equal(h.cancels(),1);assert.equal(g.getState().position.cells[4],'O');assert(g.getState().revision>revision);
 h.tick(300);assert(g.commit({type:'Place',at:1}));h.tick(300);assert.equal(h.requests.length,2);
 const before=g.getState();await reply(h,8,0);assert.deepEqual(g.getState(),before);
 await reply(h,2,1);assert.equal(g.getState().position.cells[2],'O');
});
test('cleanup throwing cannot prevent timeout fallback',()=>{
 const h=harness(true),g=h.game;g.draft('ward');g.commit({type:'Place',at:0});
 h.tick(300);h.tick(1301);
 assert.equal(h.cancels(),1);assert.equal(g.getState().position.cells[4],'O');assert.equal(g.getState().phase,'transition');
});
test('successful reply leaves watchdog inert',async()=>{
 const h=harness(),g=h.game;g.draft('ward');g.commit({type:'Place',at:0});h.tick(300);await reply(h,4);
 h.tick(300);const before=g.getState();h.tick(1000);assert.deepEqual(g.getState(),before);assert.equal(h.cancels(),0);
});
test('Heat counts commits, powers, X line and board reset',async()=>{
 const h=harness(),g=h.game;g.draft('ward');const a={type:'Ward',at:0,shieldCell:8};
 g.preview(a);assert.equal(g.getState().heat,0);assert(g.commit(a));assert.equal(g.getState().heat,3);
 h.tick(300);await reply(h,3);h.tick(300);assert(g.commit({type:'Place',at:1}));
 h.tick(300);await reply(h,4);h.tick(300);assert.equal(g.getState().heat,6);
 assert(g.commit({type:'Place',at:2}));assert.equal(g.getState().heat,10);assert.equal(g.getState().phase,'won');
 h.tick(700);h.tick(250);assert(g.draft('slide'));assert.equal(g.getState().heat,0);
});
