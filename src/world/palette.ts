export type RegionKey = 'hill' | 'village' | 'forest' | 'temple_clearing';
type Atmosphere = {fog:string; fogNear:number; fogFar:number; sun:string; sunIntensity:number; ambient:string; hemiSky:string; hemiGround:string};
export const REGION_ATMOSPHERE: Record<RegionKey,Atmosphere> = {
 hill:{fog:'#6b7566',fogNear:55,fogFar:145,sun:'#ffcc86',sunIntensity:3,ambient:'#ffffff',hemiSky:'#bac8c0',hemiGround:'#242c25'},
 village:{fog:'#4a3420',fogNear:35,fogFar:120,sun:'#ffab5c',sunIntensity:2.4,ambient:'#f2c497',hemiSky:'#e0a15a',hemiGround:'#2c1d12'},
 forest:{fog:'#132420',fogNear:16,fogFar:80,sun:'#bfead0',sunIntensity:1.6,ambient:'#9fc2ab',hemiSky:'#7fae8f',hemiGround:'#0c1712'},
 temple_clearing:{fog:'#1c1433',fogNear:20,fogFar:100,sun:'#9fe8e0',sunIntensity:1.4,ambient:'#8f7ad1',hemiSky:'#8f7ad1',hemiGround:'#130c22'},
};
export const MAP_FOG = {color:'#233d39',near:155,far:240};
export const SHRINE_COLORS: Record<string,{base:string;emissive:string}> = {
 breath:{base:'#c7ebdf',emissive:'#74ceaf'},
 echo:{base:'#c7ebdf',emissive:'#74ceaf'},
 memory:{base:'#c7ebdf',emissive:'#74ceaf'},
 moss:{base:'#bfe3ff',emissive:'#4fc4e8'},
 roots:{base:'#bfe3ff',emissive:'#4fc4e8'},
 bloom:{base:'#e6c9ff',emissive:'#a855f7'},
 watch:{base:'#c9f5ef',emissive:'#06b6d4'},
};
