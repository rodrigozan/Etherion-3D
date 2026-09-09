import { shrines } from './data';
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
