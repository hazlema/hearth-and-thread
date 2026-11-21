import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,legalActions,canApply,applyAction} from '../src/rules.mjs';
const play=(s,a)=>{const r=applyAction(s,a);assert.equal(r.error,undefined);return r.position;};

test('ordinary win terminates before AI reply',()=>{
 const s=initial(['X','X',null,'O','O',null,null,null,null]);
 const n=play(s,{type:'Place',at:2});
 assert.equal(n.result,'X');assert.deepEqual(legalActions(n),[]);
});
test('Shatter cannot convert; rejection is nonthrowing and pure',()=>{
 const s=initial(['O',null,null,null,null,null,null,null,null],'X',{shatter:1});
 const before=JSON.stringify(s),a={type:'Shatter',remove:0,at:0};
 assert.equal(canApply(s,a),false);assert.deepEqual(applyAction(s,a),{error:'ILLEGAL_ACTION'});
 assert.equal(JSON.stringify(s),before);
 const n=play(s,{type:'Shatter',remove:0,at:1});
 assert.equal(n.cells[0],null);assert.equal(n.cells[1],'X');assert.equal(n.powersX.shatter,0);
});
test('incomplete and malformed preview actions reject safely',()=>{
 const s=initial();
 for(const a of [null,undefined,{}, {type:'Place'}, {type:'Place',at:99}, {type:'Place',at:'0'}]){
  assert.equal(canApply(s,a),false);assert.equal(applyAction(s,a).error,'ILLEGAL_ACTION');
 }
});
test('Shatter clears rock',()=>{
 const s=initial(['rock',null,null,null,null,null,null,null,null],'X',{shatter:1});
 assert.equal(play(s,{type:'Shatter',remove:0,at:4}).cells[0],null);
});
test('Slide permits vacated origin',()=>{
 const s=initial(['X',null,null,null,null,null,null,null,null],'X',{slide:1});
 const n=play(s,{type:'Slide',from:0,to:4,at:0});
 assert.equal(n.cells[0],'X');assert.equal(n.cells[4],'X');assert.equal(n.powersX.slide,0);
});
test('AI Ward blocks Slide destinations, then expires',()=>{
 const s=initial(['X',null,null,null,null,null,null,null,null],'O',{slide:1},1);
 const ward=play(s,{type:'Ward',at:8,shieldCell:4});
 assert.equal(ward.shield.blockedActor,'X');assert.equal(ward.wardO,0);
 assert(!legalActions(ward).some(a=>a.at===4||a.to===4));
 const n=play(ward,{type:'Slide',from:0,to:1,at:0});
 assert.equal(n.shield,null);assert.equal(n.toMove,'O');
});
test('shield blocks Shatter placement, not its unshielded alternative',()=>{
 const s=initial(['O',null,null,null,null,null,null,null,null],'X',{shatter:1});
 s.shield={cell:4,blockedActor:'X'};
 assert.equal(canApply(s,{type:'Shatter',remove:0,at:4}),false);
 assert.equal(applyAction(s,{type:'Shatter',remove:0,at:4}).error,'ILLEGAL_ACTION');
 assert(!legalActions(s).some(a=>a.type==='Shatter'&&a.at===4));
 const n=play(s,{type:'Shatter',remove:0,at:1});
 assert.equal(n.shield,null);assert.equal(n.powersX.shatter,0);
});
test('new Ward survives old Ward expiration',()=>{
 const s=initial(['X',null,null,null,null,null,null,null,'O'],'X',{ward:1});
 s.shield={cell:4,blockedActor:'X'};
 assert.deepEqual(play(s,{type:'Ward',at:1,shieldCell:2}).shield,{cell:2,blockedActor:'O'});
});
test('Ward cannot remove last reply when neither placement wins',()=>{
 const s=initial(['X','O','X','X','O','O','O',null,null],'X',{ward:1});
 assert(!legalActions(s).some(a=>a.type==='Ward'));
 assert.equal(canApply(s,{type:'Place',at:7}),true);
 assert.equal(canApply(s,{type:'Place',at:8}),true);
});
test('winning Ward needs no shieldCell',()=>{
 const s=initial(['X','X',null,'O','O',null,null,null,null],'X',{ward:1});
 assert.equal(canApply(s,{type:'Ward',at:2}),true);
 const n=play(s,{type:'Ward',at:2});
 assert.equal(n.result,'X');assert.equal(n.shield,null);assert.equal(n.powersX.ward,0);
});
test('extra Ward copies do not duplicate action branches',()=>{
 const one=initial(Array(9).fill(null),'X',{ward:1});
 for(const count of [2,3]){
  const many={...one,powersX:{...one.powersX,ward:count}};
  const actions=legalActions(many);
  assert.deepEqual(actions,legalActions(one));
  assert.equal(new Set(actions.map(a=>JSON.stringify(a))).size,actions.length);
  assert.equal(play(many,{type:'Ward',at:0,shieldCell:1}).powersX.ward,count-1);
 }
});
test('rock-filled board draws despite held power',()=>{
 const s=initial(['X','O','X','X','O','O','O',null,'rock'],'X',{shatter:1});
 assert.equal(play(s,{type:'Place',at:7}).result,'draw');
});
test('enumerated actions apply without input mutation',()=>{
 const s=initial(['X',null,null,null,'O',null,null,null,null],'X',{slide:1,ward:1,shatter:1});
 const before=JSON.stringify(s);
 for(const a of legalActions(s)){
  assert.equal(canApply(s,a),true);
  const n=play(s,a);assert.equal(JSON.stringify(s),before);
  assert(n.powersX.slide>=0&&n.powersX.ward>=0&&n.powersX.shatter>=0);
 }
});
