import {village,bosque} from './data';
export type Position={x:number;z:number};
export type Gates={village:boolean;forest:boolean};
/** Ground-plane movement is shared by the camera and navigation tests. */
export function move(position:Position,yaw:number,forward:number,side:number,seconds:number,speed:number,unlocked:Gates):Position{
 const length=Math.hypot(forward,side)||1;forward/=length;side/=length;
 const clamp=(n:number)=>Math.max(-47,Math.min(47,n));
 const next={x:clamp(position.x+(side*Math.cos(yaw)-forward*Math.sin(yaw))*speed*seconds),z:clamp(position.z+(-forward*Math.cos(yaw)-side*Math.sin(yaw))*speed*seconds)};
 if(!unlocked.village&&next.z<-19&&Math.abs(next.x-village.x)<10)next.z=-19;
 if(!unlocked.forest&&next.x<-20&&Math.abs(next.z-bosque.z)<18)next.x=-20;
 return next;
}
