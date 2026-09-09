import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialProgress, progression, isVillageUnlocked } from './progression';
import { shrines } from './data';
import { move } from './navigation';
test('map → cinematic → hill → three nearby echoes → village → map',()=>{
 let s=initialProgress; assert.equal(isVillageUnlocked(s),false);
 s=progression(s,{type:'attune',id:'breath',distance:0}); assert.equal(s.attuned.length,0);
 s=progression(s,{type:'enter'}); assert.equal(s.mode,'descent');
 s=progression(s,{type:'land'}); assert.equal(s.mode,'explore');
 s=progression(s,{type:'arrive',distance:0}); assert.equal(s.arrived,false);
 s=progression(s,{type:'attune',id:'breath',distance:5}); assert.equal(s.attuned.length,0);
 for(const shrine of shrines) s=progression(s,{type:'attune',id:shrine.id,distance:3});
 s=progression(s,{type:'attune',id:'breath',distance:0}); assert.equal(s.attuned.length,3);
 assert.equal(isVillageUnlocked(s),true);
 s=progression(s,{type:'arrive',distance:8}); assert.equal(s.arrived,false);
 s=progression(s,{type:'arrive',distance:2}); assert.equal(s.arrived,true);
 s=progression(s,{type:'map'}); assert.equal(s.attuned.length,3);
 s=progression(s,{type:'reset'}); assert.deepEqual(s,initialProgress);
});
test('walking follows the route, respects sealed village and world bounds',()=>{
 let state=progression(progression(initialProgress,{type:'enter'}),{type:'land'});
 let position={x:0,z:20};
 const locked=move(position,0,1,0,10,6,false);assert.equal(locked.z,-19);
 for(const shrine of shrines){
  for(let i=0;i<1200;i++){
   const dx=shrine.x-position.x,dz=shrine.z-position.z;if(Math.hypot(dx,dz)<.2)break;
   position=move(position,0,-dz,dx,1/60,6,isVillageUnlocked(state));
  }
  assert.ok(Math.hypot(position.x-shrine.x,position.z-shrine.z)<.2);
  state=progression(state,{type:'attune',id:shrine.id,distance:Math.hypot(position.x-shrine.x,position.z-shrine.z)});
 }
 assert.equal(isVillageUnlocked(state),true);
 position=move(position,0,1,0,1.5,6,true);
 state=progression(state,{type:'arrive',distance:Math.hypot(position.x-1,position.z+23)});
 assert.equal(state.arrived,true);
 assert.equal(move(position,0,1,0,100,6,true).z,-47);
 assert.equal(progression(initialProgress,{type:'enter',target:'village'}).mode,'map');
 state=progression(state,{type:'map'});state=progression(state,{type:'enter',target:'village'});assert.equal(state.entry,'village');
});
