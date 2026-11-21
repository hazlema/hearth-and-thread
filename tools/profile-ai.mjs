import {initial} from '../src/rules.mjs';
import {chooseAI} from '../src/ai.worker.mjs';
const cases={
 'L5 opening, X has 3 powers':initial(['X',null,null,null,null,null,null,null,null],'O',{shatter:1,slide:1,ward:1},1),
 'L5 X center, 1 power':initial([null,null,null,null,'X',null,null,null,null],'O',{shatter:1},1),
 'L4 O starts, X 3 powers':initial(Array(9).fill(null),'O',{shatter:1,slide:1,ward:1},0),
 'L4 O starts, no powers':initial(Array(9).fill(null),'O',{},0),
};
for(const [name,s] of Object.entries(cases)){
 const r=chooseAI(s,{level:5,random:()=>1,budgetMs:300});
 console.log(name.padEnd(30),'depth',r.depth,'timedOut',r.timedOut,'ms',r.elapsedMs.toFixed(0),JSON.stringify(r.action));
}
