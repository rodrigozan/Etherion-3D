import { shrines, regions, regionAt, village, bosque, clareira } from './data';
export type Mode = 'map' | 'descent' | 'explore';
export type RegionId = 'hill' | 'village' | 'forest' | 'temple_clearing';
export type Progress = {mode: Mode; attuned: string[]; visited: RegionId[]; entry: RegionId};
export type Action = {type:'enter';target?:RegionId} | {type:'land'} | {type:'map'} | {type:'attune'; id:string; distance:number} | {type:'arrive'; target:RegionId; distance:number} | {type:'reset'};
export const initialProgress: Progress = {mode:'map',attuned:[],visited:[],entry:'hill'};
const regionShrines = (id:RegionId) => shrines.filter(s=>s.region===id);
export const isVillageUnlocked = (state: Progress) => regionShrines('hill').every(s=>state.attuned.includes(s.id));
export const isForestUnlocked = (state: Progress) => state.visited.includes('village');
export const isTempleClearingUnlocked = (state: Progress) => state.visited.includes('forest');
export const isRegionUnlocked = (id: RegionId, state: Progress) => id==='hill' ? true : id==='village' ? isVillageUnlocked(state) : id==='forest' ? isForestUnlocked(state) : isTempleClearingUnlocked(state);
export function progression(state:Progress,action:Action):Progress {
  switch(action.type) {
    case 'enter': return state.mode==='map' && isRegionUnlocked(action.target??'hill',state) ? {...state,mode:'descent',entry:action.target??'hill'} : state;
    case 'land': return state.mode==='descent'?{...state,mode:'explore'}:state;
    case 'map': return {...state,mode:'map'};
    case 'attune': return state.mode==='explore' && action.distance<=4 && shrines.some(s=>s.id===action.id) && !state.attuned.includes(action.id) ? {...state,attuned:[...state.attuned,action.id]}:state;
    case 'arrive': return state.mode==='explore' && action.distance<=6 && isRegionUnlocked(action.target,state) && regionShrines(action.target).every(s=>state.attuned.includes(s.id)) && !state.visited.includes(action.target) ? {...state,visited:[...state.visited,action.target]}:state;
    case 'reset': return initialProgress;
  }
}
const order:RegionId[]=['hill','village','forest','temple_clearing'];
const heart:Record<RegionId,{x:number;z:number}|null>={hill:null,village,forest:bosque,temple_clearing:clareira};
const gate:Record<RegionId,{x:number;z:number}>={hill:{x:0,z:13},village:{x:1,z:-20},forest:{x:-22,z:-3},temple_clearing:{x:-35,z:-16}};
export type Objective={x:number;z:number;label:string;kind:'shrine'|'heart'|'region'};
/** Next place the traveller should walk to; drives the compass arrow and the in-world beacon. */
export function objective(state:Progress,x:number,z:number):Objective|null {
 const done=(id:RegionId)=>regionShrines(id).every(s=>state.attuned.includes(s.id))&&(id==='hill'||state.visited.includes(id));
 const next=order.find(id=>!done(id));if(!next)return null;
 if(regionAt(x,z)!==next)return {...gate[next],label:regions.find(r=>r.id===next)!.name,kind:'region'};
 const pending=regionShrines(next).filter(s=>!state.attuned.includes(s.id)).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
 if(pending)return {x:pending.x,z:pending.z,label:pending.name,kind:'shrine'};
 const h=heart[next]!;return {x:h.x,z:h.z,label:next==='village'?'Coração da vila':next==='forest'?'Coração do bosque':'Portal de bronze',kind:'heart'};
}
