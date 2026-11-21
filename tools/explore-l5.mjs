import {initial} from '../src/rules.mjs';
import {solve} from './solver.mjs';
const empty=Array(9).fill(null);
for(const pw of [{},{shatter:1},{slide:1},{ward:1},{shatter:1,slide:1},{shatter:1,slide:1,ward:1},{shatter:3},{ward:3}]){
 const t=performance.now();
 console.log('L5 start',JSON.stringify(pw).padEnd(36),'value',solve(initial(empty,'X',pw,1)),'ms',(performance.now()-t).toFixed(0));
}
for(const pw of [{},{shatter:1},{slide:1},{ward:1},{shatter:1,slide:1,ward:1}])
 console.log('L4 (O starts, no O ward)',JSON.stringify(pw).padEnd(36),'value',solve(initial(empty,'O',pw,0)));
const l3=['X',null,null,null,null,null,null,null,'O'];
for(const pw of [{},{shatter:1},{slide:1},{ward:1}])console.log('L3 seeds',JSON.stringify(pw).padEnd(36),'value',solve(initial(l3,'X',pw,0)));
const l2=['rock',null,null,null,null,null,null,null,null];
for(const pw of [{},{shatter:1},{slide:1},{ward:1}])console.log('L2 rock',JSON.stringify(pw).padEnd(36),'value',solve(initial(l2,'X',pw,0)));
for(const pw of [{},{shatter:1},{slide:1},{ward:1}])console.log('L1 empty',JSON.stringify(pw).padEnd(36),'value',solve(initial(empty,'X',pw,0)));
