import {useMemo,useLayoutEffect,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {heightAt,random,village} from '../world/data';

export function pathX(z:number){return 1.9*Math.sin((z-4)*.15);}
function leafCluster(){const rand=random(122);const p:number[]=[],indices:number[]=[];const v=new THREE.Vector3();const q=new THREE.Quaternion();for(let i=0;i<72;i++){const theta=rand()*Math.PI*2,phi=Math.acos(rand()*2-1),r=Math.pow(rand(),.33);const center=new THREE.Vector3(r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta));q.setFromEuler(new THREE.Euler(rand()*3,rand()*6,rand()*3));const s=.085+rand()*.12;for(const [x,y] of [[0,-1],[-.55,0],[0,1],[.55,0]]){v.set(x*s,y*s,0).applyQuaternion(q).add(center);p.push(v.x,v.y,v.z);}const n=i*4;indices.push(n,n+1,n+2,n,n+2,n+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();return g;}
function grassBlade(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-.24,0,0,.24,0,0,.1,.65,0,.2,1,0],3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return g;}
function ribbon(width:number,river=false){
 const positions:number[]=[],indices:number[]=[];const steps=160;
 for(let i=0;i<=steps;i++){const z=river?-59+i/steps*118:-31+i/steps*65;const x=river?19+6*Math.sin(z*.055)+3*Math.sin(z*.15):pathX(z);for(const side of [-1,1]){const xx=x+side*width*(river?1+.22*Math.sin(z*.22):1);positions.push(xx,heightAt(xx,z)+.065,z);}if(i<steps){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function Paths(){const path=useMemo(()=>ribbon(1.25),[]);const river=useMemo(()=>ribbon(1.4,true),[]);return <><mesh geometry={path} receiveShadow><meshStandardMaterial color="#9d9271" roughness={1}/></mesh><mesh geometry={river}><meshStandardMaterial color="#59817b" metalness={.55} roughness={.24}/></mesh></>;}

export function Vegetation(){
 const foliage=useMemo(leafCluster,[]);const blade=useMemo(grassBlade,[]);
 const trunks=useRef<THREE.InstancedMesh>(null);const crowns=useRef<THREE.InstancedMesh>(null);const grasses=useRef<THREE.InstancedMesh>(null);const rocks=useRef<THREE.InstancedMesh>(null);
 const objects=useMemo(()=>{const rand=random(6041);const trees=[];for(let i=0;i<580;i++){const x=(rand()-.5)*140,z=(rand()-.5)*140;if(Math.abs(x-pathX(z))<(z>0&&z<29?10:4)||Math.hypot(x-village.x,z-village.z)<10||Math.abs(x-(19+6*Math.sin(z*.055)+3*Math.sin(z*.15)))<3)continue;trees.push({x,z,h:3.5+rand()*5,w:1+rand()*.8,c:['#55644b','#777048','#724749','#5c465a','#3c584b','#354e44'][Math.floor(rand()*6)],angle:rand()*6.28});}return trees;},[]);
 useLayoutEffect(()=>{if(!trunks.current||!crowns.current||!grasses.current||!rocks.current)return;const dummy=new THREE.Object3D(),color=new THREE.Color();const rand=random(3307);
 objects.forEach((t,i)=>{const y=heightAt(t.x,t.z);dummy.position.set(t.x,y+t.h*.42,t.z);dummy.rotation.set(0,t.angle,.03);dummy.scale.set(.16,t.h*.84,.16);dummy.updateMatrix();trunks.current!.setMatrixAt(i,dummy.matrix);
 for(let j=0;j<4;j++){dummy.position.set(t.x+Math.sin(j*2.2)*t.w*.5,y+t.h*(.55+j*.12),t.z+Math.cos(j*2.2)*t.w*.5);dummy.scale.set(t.w*(1.2-j*.16),t.h*.27,t.w*(1.2-j*.16));dummy.rotation.set(j*.2,t.angle,Math.sin(j)*.12);dummy.updateMatrix();crowns.current!.setMatrixAt(i*4+j,dummy.matrix);color.set(t.c).multiplyScalar(.8+rand()*.35);crowns.current!.setColorAt(i*4+j,color);}});
 for(let i=0;i<3800;i++){const x=(rand()-.5)*84,z=(rand()-.5)*90;const nearPath=Math.abs(x-pathX(z))<1.5;dummy.position.set(x,heightAt(x,z),z);dummy.rotation.set(0,rand()*Math.PI,rand()*.2);dummy.scale.set(.08+rand()*.12,nearPath?.015:.18+rand()*.65,1);dummy.updateMatrix();grasses.current.setMatrixAt(i,dummy.matrix);color.set(['#9c8e63','#6a8060','#936177','#66715b','#af936f'][Math.floor(rand()*5)]);grasses.current.setColorAt(i,color);}
 for(let i=0;i<180;i++){let x=(rand()-.5)*100;const z=(rand()-.5)*100;if(Math.abs(x-pathX(z))<4)x+=x<pathX(z)?-5:5;dummy.position.set(x,heightAt(x,z),z);dummy.rotation.set(rand(),rand()*6,rand());dummy.scale.set(.4+rand()*1.4,.3+rand()*.7,.6+rand()*.8);dummy.updateMatrix();rocks.current.setMatrixAt(i,dummy.matrix);}for(const ref of [trunks,crowns,grasses,rocks]){ref.current!.instanceMatrix.needsUpdate=true;if(ref.current!.instanceColor)ref.current!.instanceColor!.needsUpdate=true;}
 },[objects]);
 return <group><instancedMesh ref={trunks} args={[undefined,undefined,objects.length]}><cylinderGeometry args={[.35,1,1,8]}/><meshStandardMaterial color="#3b3930" roughness={1}/></instancedMesh><instancedMesh ref={crowns} args={[foliage,undefined,objects.length*4]}><meshStandardMaterial roughness={.94} side={THREE.DoubleSide}/></instancedMesh><instancedMesh ref={grasses} args={[blade,undefined,3800]}><meshStandardMaterial side={THREE.DoubleSide} roughness={1}/></instancedMesh><instancedMesh ref={rocks} args={[undefined,undefined,180]}><dodecahedronGeometry args={[1,1]}/><meshStandardMaterial color="#686e62" roughness={.95}/></instancedMesh></group>;
}

function House({x,z,scale=1,angle=0}:{x:number;z:number;scale?:number;angle?:number}){return <group position={[x,heightAt(x,z),z]} scale={scale} rotation={[0,angle,0]}>
 <mesh position={[0,1,0]}><boxGeometry args={[2.6,2,2.2]}/><meshStandardMaterial color="#ada48b" roughness={1}/></mesh>
 <mesh position={[0,2.45,0]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[2.35,1.45,4]}/><meshStandardMaterial color="#4a3f43" roughness={.9}/></mesh>
 {[-1.25,1.25].map(x=><mesh key={x} position={[x,1,1.13]}><boxGeometry args={[.14,2,.15]}/><meshStandardMaterial color="#393b31"/></mesh>)}
 <mesh position={[0,.65,1.12]}><boxGeometry args={[.65,1.3,.08]}/><meshStandardMaterial color="#343b30"/></mesh>
 {[-.8,.8].map(x=><mesh key={x} position={[x,1.3,1.14]}><planeGeometry args={[.4,.55]}/><meshStandardMaterial color="#ffcc80" emissive="#e99b43" emissiveIntensity={1.3}/></mesh>)}
 <mesh position={[.75,2.5,-.3]}><boxGeometry args={[.35,1.5,.4]}/><meshStandardMaterial color="#777668"/></mesh>
 </group>;}
export function Village({unlocked}:{unlocked:boolean}){return <group>
 {[[-5,-27,1.1,.25],[5,-26,1,-.35],[-4,-33,1.25,.3],[4,-33,.9,-.1],[0,-36,1.5,0],[9,-31,.8,-.8]].map(([x,z,s,a],i)=><House key={i} x={x} z={z} scale={s} angle={a}/>)}
 <group position={[1,heightAt(1,-19),-19]}>{[-3,3].map(x=><mesh key={x} position={[x,1.7,0]}><boxGeometry args={[.45,3.4,.5]}/><meshStandardMaterial color="#6b7060"/></mesh>)}<mesh position={[0,3.4,0]}><boxGeometry args={[6.7,.4,.55]}/><meshStandardMaterial color="#727966"/></mesh>{!unlocked&&<mesh position={[0,1.7,0]}><planeGeometry args={[5.6,3.3]}/><meshStandardMaterial color="#7aabc0" emissive="#628f9b" emissiveIntensity={.7} transparent opacity={.22} side={THREE.DoubleSide}/></mesh>}</group>
 </group>;}

const skyVertex=`varying vec3 vWorld;void main(){vWorld=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const skyFragment=`varying vec3 vWorld;void main(){float h=normalize(vWorld).y;vec3 c=mix(vec3(.56,.48,.34),vec3(.10,.21,.25),smoothstep(-.08,.6,h));float sun=pow(max(0.,dot(normalize(vWorld),normalize(vec3(-.55,.24,-.8)))),38.);c+=vec3(.55,.32,.10)*sun;gl_FragColor=vec4(c,1.);}`;
const moonFragment=`varying vec3 vNormal;varying vec3 vPos;void main(){float n=sin(vPos.x*12.+sin(vPos.y*19.))*sin(vPos.z*24.+vPos.y*7.);float c=sin(vPos.x*38.+vPos.z*21.)*cos(vPos.y*32.);float light=.32+.68*max(0.,dot(normalize(vNormal),normalize(vec3(-1.,.5,1.))));vec3 color=mix(vec3(.29,.085,.055),vec3(.73,.35,.22),.6+n*.2+c*.13)*light;gl_FragColor=vec4(color,1.);}`;
export function Atmosphere(){const particles=useRef<THREE.Points>(null);const positions=useMemo(()=>{const rand=random(304);return new Float32Array(Array.from({length:520},()=>{const x=(rand()-.5)*45,z=(rand()-.5)*68;return [x,heightAt(x,z)+.8+rand()*5,z];}).flat());},[]);
 useFrame((state,dt)=>{if(particles.current){particles.current.rotation.y+=Math.min(dt,.05)*.005;const mat=particles.current.material as THREE.PointsMaterial;mat.opacity=.5+Math.sin(state.clock.elapsedTime*.7)*.14;}});
 return <><mesh><sphereGeometry args={[170,32,24]}/><shaderMaterial vertexShader={skyVertex} fragmentShader={skyFragment} side={THREE.BackSide} depthWrite={false}/></mesh>
 {[[-35,47,-94,8],[18,37,-105,4.4]].map(([x,y,z,r],i)=><group key={i} position={[x,y,z]}><mesh><sphereGeometry args={[r,48,32]}/><shaderMaterial vertexShader={`varying vec3 vNormal;varying vec3 vPos;void main(){vNormal=normal;vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={moonFragment}/></mesh></group>)}
 <points ref={particles}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial size={.065} color="#d9edbb" transparent opacity={.7} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation/></points>
 </>;
}

function Animal({x,z,seed}:{x:number;z:number;seed:number}){const group=useRef<THREE.Group>(null);const head=useRef<THREE.Group>(null);const legs=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(!group.current)return;const t=clock.elapsedTime*.22+seed;const px=x+Math.sin(t)*1.4,pz=z+Math.cos(t)*.9;group.current.position.set(px,heightAt(px,pz)+.45,pz);group.current.rotation.y=-t;group.current.position.y+=Math.sin(t*12)*.018;if(head.current)head.current.rotation.x=.3+Math.sin(t*3)*.25;if(legs.current)legs.current.rotation.z=Math.sin(t*12)*.035;});
 return <group ref={group}><mesh scale={[.28,.32,.56]}><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color="#8c806a" roughness={1}/></mesh><group ref={head} position={[0,.2,-.42]}><mesh position={[0,.12,-.09]} scale={[.17,.2,.28]}><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color="#968b73"/></mesh>{[-1,1].map(s=><mesh key={s} position={[s*.13,.38,-.04]} rotation={[0,0,-s*.3]} scale={[.055,.22,.06]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color="#8c806a"/></mesh>)}</group><group ref={legs}>{[[-.17,-.25],[.17,-.25],[-.17,.3],[.17,.3]].map(([x,z],i)=><mesh key={i} position={[x,-.28,z]}><cylinderGeometry args={[.045,.035,.5,6]}/><meshStandardMaterial color="#635f50"/></mesh>)}</group><mesh position={[0,.1,.55]} rotation={[.7,0,0]}><coneGeometry args={[.09,.27,8]}/><meshStandardMaterial color="#c0b59a"/></mesh></group>;
}
export function Wildlife(){return <>{[[-5,13],[7,6],[-7,-6],[9,-11]].map(([x,z],i)=><Animal key={i} x={x} z={z} seed={i*7}/>)}</>;}

export function Mountains(){const geo=useMemo(()=>{const g=new THREE.PlaneGeometry(220,50,100,18);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);const envelope=Math.pow(Math.max(0,1-Math.abs(z)/25),.5);p.setY(i,(5+Math.abs(Math.sin(x*.075))*17+Math.abs(Math.sin(x*.24))*6)*envelope);};g.computeVertexNormals();return g;},[]);return <mesh geometry={geo} position={[0,-1,-80]}><meshStandardMaterial color="#536261" roughness={1}/></mesh>;}
