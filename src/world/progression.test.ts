import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialProgress, progression, isVillageUnlocked, isForestUnlocked } from './progression';
import { shrines, village, bosque } from './data';
import { move } from './navigation';
const hillShrines = shrines.filter(s=>s.region==='hill');
const forestShrines = shrines.filter(s=>s.region==='forest');
test('map → cinematic → hill → three nearby echoes → village → bosque → map',()=>{
 let s=initialProgress; assert.equal(isVillageUnlocked(s),false);
 s=progression(s,{type:'attune',id:'breath',distance:0}); assert.equal(s.attuned.length,0);
 s=progression(s,{type:'enter'}); assert.equal(s.mode,'descent');
 s=progression(s,{type:'land'}); assert.equal(s.mode,'explore');
 s=progression(s,{type:'arrive',target:'village',distance:0}); assert.equal(s.visited.includes('village'),false);
 s=progression(s,{type:'attune',id:'breath',distance:5}); assert.equal(s.attuned.length,0);
 for(const shrine of hillShrines) s=progression(s,{type:'attune',id:shrine.id,distance:3});
 s=progression(s,{type:'attune',id:'breath',distance:0}); assert.equal(s.attuned.length,3);
 assert.equal(isVillageUnlocked(s),true);
 s=progression(s,{type:'arrive',target:'village',distance:8}); assert.equal(s.visited.includes('village'),false);
 s=progression(s,{type:'arrive',target:'village',distance:2}); assert.equal(s.visited.includes('village'),true);
 assert.equal(isForestUnlocked(s),true);
 s=progression(s,{type:'arrive',target:'forest',distance:2}); assert.equal(s.visited.includes('forest'),false,'sealed until forest echoes are found');
 for(const shrine of forestShrines) s=progression(s,{type:'attune',id:shrine.id,distance:3});
 s=progression(s,{type:'arrive',target:'forest',distance:2}); assert.equal(s.visited.includes('forest'),true);
 s=progression(s,{type:'map'}); assert.equal(s.attuned.length,5);
 s=progression(s,{type:'reset'}); assert.deepEqual(s,initialProgress);
});
test('walking follows the route, respects sealed village/forest gates and world bounds',()=>{
 let state=progression(progression(initialProgress,{type:'enter'}),{type:'land'});
 let position={x:0,z:20};
 const locked=move(position,0,1,0,10,6,{village:false,forest:true});assert.equal(locked.z,-19);
 for(const shrine of hillShrines){
  for(let i=0;i<1200;i++){
   const dx=shrine.x-position.x,dz=shrine.z-position.z;if(Math.hypot(dx,dz)<.2)break;
   position=move(position,0,-dz,dx,1/60,6,{village:isVillageUnlocked(state),forest:isForestUnlocked(state)});
  }
  assert.ok(Math.hypot(position.x-shrine.x,position.z-shrine.z)<.2);
  state=progression(state,{type:'attune',id:shrine.id,distance:Math.hypot(position.x-shrine.x,position.z-shrine.z)});
 }
 assert.equal(isVillageUnlocked(state),true);
 position=move(position,0,1,0,1.5,6,{village:true,forest:false});
 state=progression(state,{type:'arrive',target:'village',distance:Math.hypot(position.x-village.x,position.z-village.z)});
 assert.equal(state.visited.includes('village'),true);
 assert.equal(isForestUnlocked(state),true);
 const sealedForest=move({x:0,z:-3},0,0,-1,10,6,{village:true,forest:false});assert.equal(sealedForest.x,-20);
 for(const shrine of forestShrines){
  for(let i=0;i<1200;i++){
   const dx=shrine.x-position.x,dz=shrine.z-position.z;if(Math.hypot(dx,dz)<.2)break;
   position=move(position,0,-dz,dx,1/60,6,{village:true,forest:isForestUnlocked(state)});
  }
  assert.ok(Math.hypot(position.x-shrine.x,position.z-shrine.z)<.2);
  state=progression(state,{type:'attune',id:shrine.id,distance:Math.hypot(position.x-shrine.x,position.z-shrine.z)});
 }
 position=move(position,0,1,0,1.5,6,{village:true,forest:true});
 state=progression(state,{type:'arrive',target:'forest',distance:Math.hypot(position.x-bosque.x,position.z-bosque.z)});
 assert.equal(state.visited.includes('forest'),true);
 assert.equal(move(position,0,0,-1,100,6,{village:true,forest:true}).x,-47);
 assert.equal(progression(initialProgress,{type:'enter',target:'village'}).mode,'map');
 state=progression(state,{type:'map'});state=progression(state,{type:'enter',target:'village'});assert.equal(state.entry,'village');
});
