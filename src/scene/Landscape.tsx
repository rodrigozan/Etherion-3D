import {useMemo,useLayoutEffect,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {heightAt,random,village,bosque} from '../world/data';

export function pathX(z:number){return 1.9*Math.sin((z-4)*.15);}
function leafCluster(){const rand=random(122);const p:number[]=[],uv:number[]=[],indices:number[]=[];const v=new THREE.Vector3();const q=new THREE.Quaternion();for(let i=0;i<72;i++){const theta=rand()*Math.PI*2,phi=Math.acos(rand()*2-1),r=Math.pow(rand(),.33);const center=new THREE.Vector3(r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta));q.setFromEuler(new THREE.Euler(rand()*3,rand()*6,rand()*3));const s=.085+rand()*.12;for(const [x,y] of [[0,-1],[-.55,0],[0,1],[.55,0]]){v.set(x*s,y*s,(rand()-.5)*s*.4).applyQuaternion(q).add(center);p.push(v.x,v.y,v.z);}uv.push(.5,0,0,.5,.5,1,1,.5);const n=i*4;indices.push(n,n+1,n+2,n,n+2,n+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;}
function leafTexture(){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d')!;const grad=ctx.createRadialGradient(32,32,2,32,32,30);grad.addColorStop(0,'rgba(255,255,255,1)');grad.addColorStop(.55,'rgba(255,255,255,.85)');grad.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(32,32,30,23,0,0,Math.PI*2);ctx.fill();const tex=new THREE.CanvasTexture(c);tex.needsUpdate=true;return tex;}
function grassBlade(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-.24,0,0,.24,0,0,.1,.65,0,.2,1,0],3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return g;}
const windChunk=`
 float windPhase=fract(sin(dot(instanceMatrix[3].xz,vec2(12.9898,78.233)))*43758.5453);
 float sway=sin(uTime*2.1+windPhase*6.2832)*transformed.y*.16+sin(uTime*4.3+windPhase*3.1)*transformed.y*.05;
 transformed.x+=sway;transformed.z+=sway*.4;
`;
function ribbon(width:number,river=false){
 const positions:number[]=[],indices:number[]=[];const steps=160;
 for(let i=0;i<=steps;i++){const z=river?-59+i/steps*118:-31+i/steps*65;const x=river?19+6*Math.sin(z*.055)+3*Math.sin(z*.15):pathX(z);for(const side of [-1,1]){const xx=x+side*width*(river?1+.22*Math.sin(z*.22):1);positions.push(xx,heightAt(xx,z)+.065,z);}if(i<steps){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function Paths(){const path=useMemo(()=>ribbon(1.25),[]);const river=useMemo(()=>ribbon(1.4,true),[]);return <><mesh geometry={path} receiveShadow><meshStandardMaterial color="#9d9271" roughness={1}/></mesh><mesh geometry={river}><meshStandardMaterial color="#59817b" metalness={.55} roughness={.24}/></mesh></>;}

export function Vegetation(){
 const foliage=useMemo(leafCluster,[]);const leafMap=useMemo(leafTexture,[]);const blade=useMemo(grassBlade,[]);
 const trunks=useRef<THREE.InstancedMesh>(null);const crowns=useRef<THREE.InstancedMesh>(null);const grasses=useRef<THREE.InstancedMesh>(null);const rocksA=useRef<THREE.InstancedMesh>(null);const rocksB=useRef<THREE.InstancedMesh>(null);
 const grassUniforms=useMemo(()=>({uTime:{value:0}}),[]);
 useFrame(({clock})=>{grassUniforms.uTime.value=clock.elapsedTime;});
 const objects=useMemo(()=>{const rand=random(6041);const trees=[];for(let i=0;i<580;i++){const x=(rand()-.5)*140,z=(rand()-.5)*140;if(Math.abs(x-pathX(z))<(z>0&&z<29?10:4)||Math.hypot(x-village.x,z-village.z)<10||Math.hypot(x-bosque.x,z-bosque.z)<6||Math.abs(x-(19+6*Math.sin(z*.055)+3*Math.sin(z*.15)))<3)continue;trees.push({x,z,h:3.5+rand()*5,w:1+rand()*.8,c:['#55644b','#777048','#724749','#5c465a','#3c584b','#354e44'][Math.floor(rand()*6)],angle:rand()*6.28});}return trees;},[]);
 useLayoutEffect(()=>{if(!trunks.current||!crowns.current||!grasses.current||!rocksA.current||!rocksB.current)return;const dummy=new THREE.Object3D(),color=new THREE.Color();const rand=random(3307);
 objects.forEach((t,i)=>{const y=heightAt(t.x,t.z);dummy.position.set(t.x,y+t.h*.42,t.z);dummy.rotation.set(0,t.angle,.03);dummy.scale.set(.16,t.h*.84,.16);dummy.updateMatrix();trunks.current!.setMatrixAt(i,dummy.matrix);
 for(let j=0;j<4;j++){dummy.position.set(t.x+Math.sin(j*2.2)*t.w*.5,y+t.h*(.55+j*.12),t.z+Math.cos(j*2.2)*t.w*.5);dummy.scale.set(t.w*(1.2-j*.16),t.h*.27,t.w*(1.2-j*.16));dummy.rotation.set(j*.2,t.angle,Math.sin(j)*.12);dummy.updateMatrix();crowns.current!.setMatrixAt(i*4+j,dummy.matrix);color.set(t.c).multiplyScalar(.8+rand()*.35);crowns.current!.setColorAt(i*4+j,color);}});
 for(let i=0;i<3800;i++){const x=(rand()-.5)*84,z=(rand()-.5)*90;const nearPath=Math.abs(x-pathX(z))<1.5;dummy.position.set(x,heightAt(x,z),z);dummy.rotation.set(0,rand()*Math.PI,rand()*.2);dummy.scale.set(.08+rand()*.12,nearPath?.015:.18+rand()*.65,1);dummy.updateMatrix();grasses.current.setMatrixAt(i,dummy.matrix);color.set(['#9c8e63','#6a8060','#936177','#66715b','#af936f'][Math.floor(rand()*5)]);grasses.current.setColorAt(i,color);}
 let na=0,nb=0;for(let i=0;i<180;i++){let x=(rand()-.5)*100;const z=(rand()-.5)*100;if(Math.abs(x-pathX(z))<4)x+=x<pathX(z)?-5:5;dummy.position.set(x,heightAt(x,z),z);dummy.rotation.set(rand(),rand()*6,rand());dummy.scale.set(.4+rand()*1.4,.3+rand()*.7,.6+rand()*.8);dummy.updateMatrix();if(i%2===0)rocksA.current!.setMatrixAt(na++,dummy.matrix);else rocksB.current!.setMatrixAt(nb++,dummy.matrix);}for(const ref of [trunks,crowns,grasses,rocksA,rocksB]){ref.current!.instanceMatrix.needsUpdate=true;if(ref.current!.instanceColor)ref.current!.instanceColor!.needsUpdate=true;}
 },[objects]);
 return <group><instancedMesh ref={trunks} args={[undefined,undefined,objects.length]} castShadow receiveShadow><cylinderGeometry args={[.35,1,1,8]}/><meshStandardMaterial color="#3b3930" roughness={1}/></instancedMesh>
 <instancedMesh ref={crowns} args={[foliage,undefined,objects.length*4]} castShadow receiveShadow><meshStandardMaterial roughness={.94} side={THREE.DoubleSide} alphaMap={leafMap} alphaTest={.35}/></instancedMesh>
 <instancedMesh ref={grasses} args={[blade,undefined,3800]} receiveShadow><meshStandardMaterial side={THREE.DoubleSide} roughness={1} onBeforeCompile={shader=>{shader.uniforms.uTime=grassUniforms.uTime;shader.vertexShader='uniform float uTime;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\n${windChunk}`);}}/></instancedMesh>
 <instancedMesh ref={rocksA} args={[undefined,undefined,90]} castShadow receiveShadow><dodecahedronGeometry args={[1,1]}/><meshStandardMaterial color="#686e62" roughness={.95}/></instancedMesh>
 <instancedMesh ref={rocksB} args={[undefined,undefined,90]} castShadow receiveShadow><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color="#767a68" roughness={.9}/></instancedMesh>
 </group>;
}

function hutWallTexture(seed:number){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;const rand=random(seed);ctx.fillStyle='#b0895a';ctx.fillRect(0,0,128,128);for(let i=0;i<50;i++){const v=90+rand()*60|0;ctx.fillStyle=`rgba(${v},${(v*.7)|0},${(v*.4)|0},${.12+rand()*.22})`;ctx.beginPath();ctx.arc(rand()*128,rand()*128,3+rand()*9,0,Math.PI*2);ctx.fill();}
 const colors=['#c76b3f','#e0a83a','#8a2e2e','#2f6b52'];[28,62,96].forEach((y,i)=>{ctx.fillStyle=colors[i%colors.length];ctx.fillRect(0,y,128,7);for(let x=0;x<128;x+=10){ctx.fillStyle='#1c130d';ctx.fillRect(x,y+1,4,5);}});
 const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(3,1);return tex;}
function thatchTexture(seed:number){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;const rand=random(seed);ctx.fillStyle='#a3843f';ctx.fillRect(0,0,128,128);for(let y=0;y<128;y+=4){const v=55+rand()*35|0;ctx.strokeStyle=`rgba(${v},${(v*.8)|0},${(v*.35)|0},.55)`;ctx.lineWidth=1+rand();ctx.beginPath();ctx.moveTo(0,y+rand()*2);ctx.lineTo(128,y+rand()*2);ctx.stroke();}const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1,3);return tex;}
function doorShape(w:number,h:number){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,h*.7);s.absarc(0,h*.7,w/2,Math.PI,0,true);s.lineTo(w/2,0);s.lineTo(-w/2,0);return s;}
function House({x,z,scale=1,angle=0,seed=0}:{x:number;z:number;scale?:number;angle?:number;seed?:number}){
 const wallTex=useMemo(()=>hutWallTexture(4001+seed*17),[seed]);const roofTex=useMemo(()=>thatchTexture(5003+seed*17),[seed]);const door=useMemo(()=>doorShape(.62,1.05),[]);
 const r=1.35;
 return <group position={[x,heightAt(x,z),z]} scale={scale} rotation={[0,angle,0]}>
 <mesh position={[0,.85,0]} castShadow receiveShadow><cylinderGeometry args={[r,r*1.06,1.7,16]}/><meshStandardMaterial map={wallTex} roughness={1}/></mesh>
 <mesh position={[0,2.05,0]} castShadow receiveShadow><coneGeometry args={[r*1.22,1.35,16]}/><meshStandardMaterial map={roofTex} roughness={1}/></mesh>
 <mesh position={[0,2.75,0]}><sphereGeometry args={[.1,8,8]}/><meshStandardMaterial color="#caa14a" metalness={.6} roughness={.3}/></mesh>
 <mesh position={[0,0,r*.99]} rotation={[0,0,0]}><shapeGeometry args={[door]}/><meshStandardMaterial color="#231b16" side={THREE.DoubleSide}/></mesh>
 {[-.85,.85].map(a=><mesh key={a} position={[Math.sin(a)*r*.97,1.15,Math.cos(a)*r*.97]} rotation={[0,a,0]}><circleGeometry args={[.17,14]}/><meshStandardMaterial color="#ffce85" emissive="#f0a13d" emissiveIntensity={1.4} side={THREE.DoubleSide}/></mesh>)}
 <mesh position={[0,.02,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[r*1.03,.05,8,24]}/><meshStandardMaterial color="#caa14a" metalness={.6} roughness={.4}/></mesh>
 </group>;}
export function Village({unlocked}:{unlocked:boolean}){return <group>
 {[[-5,-27,1.1,.25],[5,-26,1,-.35],[-4,-33,1.25,.3],[4,-33,.9,-.1],[0,-36,1.5,0],[9,-31,.8,-.8]].map(([x,z,s,a],i)=><House key={i} x={x} z={z} scale={s} angle={a} seed={i}/>)}
 <group position={[1,heightAt(1,-19),-19]}>
 {[-3,3].map(x=><mesh key={x} position={[x,1.7,0]} castShadow receiveShadow><cylinderGeometry args={[.24,.3,3.4,10]}/><meshStandardMaterial color="#6b4a2c" roughness={.85}/></mesh>)}
 <mesh position={[0,3.4,0]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.22,.22,6.7,10]}/><meshStandardMaterial color="#caa14a" metalness={.55} roughness={.35}/></mesh>
 {!unlocked&&<mesh position={[0,1.7,0]}><planeGeometry args={[5.6,3.3]}/><meshStandardMaterial color="#7aabc0" emissive="#628f9b" emissiveIntensity={.7} transparent opacity={.22} side={THREE.DoubleSide}/></mesh>}
 </group>
 </group>;}
function GroveHeart(){const rand=random(9042);const roots=useMemo(()=>Array.from({length:6},(_,i)=>({a:(i/6)*Math.PI*2+rand()*.3,len:2.4+rand()*1.4})),[]);
 return <group position={[bosque.x,heightAt(bosque.x,bosque.z),bosque.z]}>
 <mesh position={[0,2.6,0]} castShadow receiveShadow><cylinderGeometry args={[.9,1.5,5.2,10]}/><meshStandardMaterial color="#392c22" roughness={1}/></mesh>
 {roots.map((r,i)=><mesh key={i} position={[Math.sin(r.a)*r.len*.5,.25,Math.cos(r.a)*r.len*.5]} rotation={[0,-r.a,Math.PI/2-.3]} castShadow><cylinderGeometry args={[.16,.32,r.len,6]}/><meshStandardMaterial color="#312619" roughness={1}/></mesh>)}
 <mesh position={[0,5.6,0]}><icosahedronGeometry args={[2.6,1]}/><meshStandardMaterial color="#3f5a3e" roughness={.9}/></mesh>
 <mesh position={[0,1.4,0]}><torusGeometry args={[1.05,.09,8,24]}/><meshStandardMaterial color="#8ee6b0" emissive="#6fd99a" emissiveIntensity={1.6}/></mesh>
 </group>;}
export function Forest({unlocked}:{unlocked:boolean}){return <group>
 <GroveHeart/>
 <group position={[-20,heightAt(-20,bosque.z),bosque.z]}>
 {[-2.6,2.6].map(z=><mesh key={z} position={[0,2.1,z]} rotation={[0,0,Math.sin(z)*.12]} castShadow receiveShadow><cylinderGeometry args={[.32,.55,4.2,8]}/><meshStandardMaterial color="#332a1e" roughness={1}/></mesh>)}
 <mesh position={[0,4.1,0]} rotation={[Math.PI/2,0,0]} castShadow><torusGeometry args={[2.65,.28,8,20,Math.PI]}/><meshStandardMaterial color="#3b5c40" roughness={.95}/></mesh>
 {!unlocked&&<mesh position={[0,2.1,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[5.2,4.2]}/><meshStandardMaterial color="#6fd99a" emissive="#4fae7a" emissiveIntensity={.7} transparent opacity={.22} side={THREE.DoubleSide}/></mesh>}
 </group>
 </group>;}

const skyVertex=`varying vec3 vWorld;void main(){vWorld=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const skyFragment=`varying vec3 vWorld;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.;a*=.5;}return v;}
void main(){vec3 dir=normalize(vWorld);float h=dir.y;vec3 c=mix(vec3(.56,.48,.34),vec3(.10,.21,.25),smoothstep(-.08,.6,h));float sun=pow(max(0.,dot(dir,normalize(vec3(-.55,.24,-.8)))),38.);c+=vec3(.55,.32,.10)*sun;
float cloud=fbm(dir.xz*2.4+dir.y*.6);c=mix(c,c+vec3(.14,.11,.09)*smoothstep(.5,.78,cloud),smoothstep(.0,.5,h)*smoothstep(1.,.35,h));
gl_FragColor=vec4(c,1.);}`;
const moonFragment=`varying vec3 vNormal;varying vec3 vPos;void main(){float n=sin(vPos.x*12.+sin(vPos.y*19.))*sin(vPos.z*24.+vPos.y*7.);float c=sin(vPos.x*38.+vPos.z*21.)*cos(vPos.y*32.);float light=.32+.68*max(0.,dot(normalize(vNormal),normalize(vec3(-1.,.5,1.))));vec3 color=mix(vec3(.29,.085,.055),vec3(.73,.35,.22),.6+n*.2+c*.13)*light;gl_FragColor=vec4(color,1.);}`;
export function Atmosphere(){const particles=useRef<THREE.Points>(null);const positions=useMemo(()=>{const rand=random(304);return new Float32Array(Array.from({length:520},()=>{const x=(rand()-.5)*45,z=(rand()-.5)*68;return [x,heightAt(x,z)+.8+rand()*5,z];}).flat());},[]);
 useFrame((state,dt)=>{if(particles.current){particles.current.rotation.y+=Math.min(dt,.05)*.005;const mat=particles.current.material as THREE.PointsMaterial;mat.opacity=.5+Math.sin(state.clock.elapsedTime*.7)*.14;}});
 return <><mesh><sphereGeometry args={[170,32,24]}/><shaderMaterial vertexShader={skyVertex} fragmentShader={skyFragment} side={THREE.BackSide} depthWrite={false}/></mesh>
 {[[-35,47,-94,8],[18,37,-105,4.4]].map(([x,y,z,r],i)=><group key={i} position={[x,y,z]}><mesh><sphereGeometry args={[r,48,32]}/><shaderMaterial vertexShader={`varying vec3 vNormal;varying vec3 vPos;void main(){vNormal=normal;vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={moonFragment}/></mesh></group>)}
 <points ref={particles}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial size={.065} color="#d9edbb" transparent opacity={.7} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation/></points>
 </>;
}

const animalPalettes=[{body:'#8c806a',head:'#968b73',leg:'#635f50'},{body:'#6b5a4a',head:'#7a6a58',leg:'#493f34'}];
function Animal({x,z,seed,kind=0}:{x:number;z:number;seed:number;kind?:number}){const group=useRef<THREE.Group>(null);const head=useRef<THREE.Group>(null);const legs=useRef<THREE.Group>(null);
 const pal=animalPalettes[kind%animalPalettes.length];const legLen=kind===1?.68:.5;const bodyScale:[number,number,number]=kind===1?[.24,.3,.62]:[.28,.32,.56];
 useFrame(({clock})=>{if(!group.current)return;const t=clock.elapsedTime*.22+seed;const px=x+Math.sin(t)*1.4,pz=z+Math.cos(t)*.9;group.current.position.set(px,heightAt(px,pz)+(kind===1?.58:.45),pz);group.current.rotation.y=-t;group.current.position.y+=Math.sin(t*12)*.018;if(head.current)head.current.rotation.x=.3+Math.sin(t*3)*.25;if(legs.current)legs.current.rotation.z=Math.sin(t*12)*.035;});
 return <group ref={group}><mesh scale={bodyScale} castShadow><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color={pal.body} roughness={1}/></mesh><group ref={head} position={[0,.2,-.42]}><mesh position={[0,.12,-.09]} scale={[.17,.2,.28]} castShadow><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color={pal.head}/></mesh>{[-1,1].map(s=><mesh key={s} position={[s*.13,.38,-.04]} rotation={[0,0,-s*.3]} scale={[.055,.22,.06]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={pal.body}/></mesh>)}</group><group ref={legs}>{[[-.17,-.25],[.17,-.25],[-.17,.3],[.17,.3]].map(([x,z],i)=><mesh key={i} position={[x,-.28,z]} castShadow><cylinderGeometry args={[.045,.035,legLen,6]}/><meshStandardMaterial color={pal.leg}/></mesh>)}</group><mesh position={[0,.1,.55]} rotation={[.7,0,0]}><coneGeometry args={[.09,.27,8]}/><meshStandardMaterial color="#c0b59a"/></mesh></group>;
}
export function Wildlife(){return <>{[[-5,13],[7,6],[-7,-6],[9,-11]].map(([x,z],i)=><Animal key={i} x={x} z={z} seed={i*7} kind={i%2}/>)}</>;}

export function Mountains(){const geo=useMemo(()=>{const g=new THREE.PlaneGeometry(220,50,100,18);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);const envelope=Math.pow(Math.max(0,1-Math.abs(z)/25),.5);p.setY(i,(5+Math.abs(Math.sin(x*.075))*17+Math.abs(Math.sin(x*.24))*6)*envelope);};g.computeVertexNormals();return g;},[]);return <mesh geometry={geo} position={[0,-1,-80]} receiveShadow><meshStandardMaterial color="#536261" roughness={1}/></mesh>;}
