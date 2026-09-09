// The atlas and the walkable landscape share one continuous Three.js scene.
import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { heightAt, regions, shrines, spawn, village } from '../world/data';
import { type Progress, type Action, isVillageUnlocked } from '../world/progression';
import {Vegetation,Paths,Village,Atmosphere,Wildlife,Mountains} from './Landscape';
import {move} from '../world/navigation';
export type Controls = {keys:Set<string>; yaw:number; pitch:number};
type Props = {progress:Progress; dispatch:React.Dispatch<Action>; controls:Controls; onPosition:(x:number,z:number)=>void; detail?:boolean};
function Terrain() {
 const geo=useMemo(()=>{const g=new THREE.PlaneGeometry(200,200,128,128);g.rotateX(-Math.PI/2);const p=g.attributes.position;const colors=[];const c=new THREE.Color();for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=heightAt(x,z);p.setY(i,h);c.set(h>7?'#626850':h>4?'#4f6150':'#304e47');c.multiplyScalar(.82+Math.sin(x*2+z*3)*.08);colors.push(c.r,c.g,c.b);}g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;},[]);
 return <mesh geometry={geo} receiveShadow><meshStandardMaterial vertexColors roughness={1}/></mesh>;
}
function CameraRig({progress,dispatch,controls,onPosition}:Props) {
 const {camera,size}=useThree();const atlasY=size.width<700?140:91;const atlasZ=size.width<700?65:42;const pos=useRef(new THREE.Vector3(spawn.x,0,spawn.z));const time=useRef(0);const mode=useRef(progress.mode);const tick=useRef(0);const look=useMemo(()=>new THREE.Vector3(),[]);
 useEffect(()=>{if(progress.mode==='descent'){time.current=0;const start=progress.entry==='village'?{x:1,z:-22}:spawn;pos.current.set(start.x,0,start.z);controls.keys.clear();controls.yaw=0;controls.pitch=0;onPosition(start.x,start.z);}mode.current=progress.mode;},[progress.mode,progress.entry,controls]);
 useFrame((_,dt)=>{const d=Math.min(dt,.05);const m=mode.current;
 if(m==='map'){camera.position.set(0,atlasY,atlasZ);camera.lookAt(0,0,-5);return;}
 if(m==='descent'){time.current+=d;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const t=Math.min(time.current/(reduced?.5:4.8),1),e=t*t*(3-2*t);const start=progress.entry==='village'?{x:1,z:-22}:spawn;camera.position.lerpVectors(new THREE.Vector3(0,atlasY,atlasZ),new THREE.Vector3(start.x,heightAt(start.x,start.z)+1.8,start.z),e);look.lerpVectors(new THREE.Vector3(0,0,-5),new THREE.Vector3(start.x,heightAt(start.x,start.z)+1.8,start.z-50),e);camera.lookAt(look);if(t===1)dispatch({type:'land'});return;}
 const k=controls.keys;let forward=Number(k.has('w')||k.has('arrowup'))-Number(k.has('s')||k.has('arrowdown'));let side=Number(k.has('d')||k.has('arrowright'))-Number(k.has('a')||k.has('arrowleft'));const length=Math.hypot(forward,side)||1;forward/=length;side/=length;const speed=k.has('shift')?10:6;
 const next=move(pos.current,controls.yaw,forward,side,d,speed,isVillageUnlocked(progress));pos.current.x=next.x;pos.current.z=next.z;
 camera.position.set(pos.current.x,heightAt(pos.current.x,pos.current.z)+1.8,pos.current.z);camera.rotation.order='YXZ';camera.rotation.set(controls.pitch,controls.yaw,0);
 tick.current+=d;if(tick.current>.12){onPosition(pos.current.x,pos.current.z);tick.current=0;}
 });return null;
}
function Scene(props:Props){return <>
 <color attach="background" args={['#172d30']}/><fog attach="fog" args={props.progress.mode==='map'?['#233d39',155,240]:['#6b7566',55,145]}/>
 <ambientLight intensity={.65}/><hemisphereLight args={['#bac8c0','#242c25',1.2]}/><directionalLight position={[-30,32,-20]} color="#ffcc86" intensity={3}/>
 <Terrain/><Paths/><Vegetation/><Village unlocked={isVillageUnlocked(props.progress)}/><Atmosphere/><Mountains/><Wildlife/>
 {shrines.map(s=><group key={s.id} position={[s.x,heightAt(s.x,s.z),s.z]}><mesh position={[0,1,0]}><boxGeometry args={[.65,2,.5]}/><meshStandardMaterial color="#7e8170"/></mesh><mesh position={[0,2.2,0]}><octahedronGeometry args={[.3]}/><meshStandardMaterial color="#c7ebdf" emissive="#74ceaf" emissiveIntensity={props.progress.attuned.includes(s.id)?3:1}/></mesh></group>)}
 {props.progress.mode==='map'&&regions.map(r=><Html key={r.id} position={[r.x,heightAt(r.x,r.z)+5,r.z]} center zIndexRange={[20,10]}><button className={'map-marker '+(r.id==='hill'?'active':r.id==='village'&&isVillageUnlocked(props.progress)?'unlocked':'locked')} disabled={r.id!=='hill'&&!(r.id==='village'&&isVillageUnlocked(props.progress))} onClick={()=>props.dispatch({type:'enter',target:r.id==='village'?'village':'hill'})}><span className="marker-icon">{r.id==='hill'?'◇':r.id==='village'&&isVillageUnlocked(props.progress)?'◇':'⌑'}</span><span>{r.name}</span><small>{r.id==='hill'?'EXPLORAR REGIÃO':r.id==='village'&&isVillageUnlocked(props.progress)?'DESBLOQUEADA':'BLOQUEADA'}</small></button></Html>)}
 <CameraRig {...props}/>
 </>;}
export default function World(props:Props){return <Canvas camera={{position:[0,91,42],fov:49,near:.1,far:220}} dpr={[1,1]} gl={{antialias:true,powerPreference:'high-performance'}}><Scene {...props}/></Canvas>;}

