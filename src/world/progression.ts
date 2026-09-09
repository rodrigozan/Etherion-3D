import { shrines } from './data';
export type Mode = 'map' | 'descent' | 'explore';
export type Progress = {mode: Mode; attuned: string[]; arrived: boolean; entry:'hill'|'village'};
export type Action = {type:'enter';target?:'hill'|'village'} | {type:'land'} | {type:'map'} | {type:'attune'; id:string; distance:number} | {type:'arrive'; distance:number} | {type:'reset'};
export const initialProgress: Progress = {mode:'map',attuned:[],arrived:false,entry:'hill'};
export const isVillageUnlocked = (state: Progress) => state.attuned.length === shrines.length;
export function progression(state:Progress,action:Action):Progress {
  switch(action.type) {
    case 'enter': return state.mode==='map'&&(action.target!=='village'||isVillageUnlocked(state))?{...state,mode:'descent',entry:action.target??'hill'}:state;
    case 'land': return state.mode==='descent'?{...state,mode:'explore'}:state;
    case 'map': return {...state,mode:'map'};
    case 'attune': return state.mode==='explore' && action.distance<=4 && shrines.some(s=>s.id===action.id) && !state.attuned.includes(action.id) ? {...state,attuned:[...state.attuned,action.id]}:state;
    case 'arrive': return state.mode==='explore'&&isVillageUnlocked(state)&&action.distance<=6?{...state,arrived:true}:state;
    case 'reset': return {...initialProgress,attuned:[]};
  }
}
