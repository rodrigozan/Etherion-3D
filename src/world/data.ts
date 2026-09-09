import { createNoise2D } from 'simplex-noise';
export const regions = [
  { id: 'hill', name: 'Colina do Despertar', subtitle: 'O início da travessia', x: 0, z: 13 },
  { id: 'village', name: 'Vila das Ahosi', subtitle: 'Um refúgio entre as raízes', x: 1, z: -23 },
  { id: 'forest', name: 'Bosque Protegido', subtitle: 'Selado por magia antiga', x: -29, z: -3 },
  { id: 'temple_clearing', name: 'Clareira do Templo', subtitle: 'Flores que não deveriam existir aqui', x: -38, z: -16 },
  { id: 'temple', name: 'Templo de Orum', subtitle: 'Região desconhecida', x: -43, z: -28 },
  { id: 'battle', name: 'Confronto de Hitachi e Heimduriel', subtitle: 'Região desconhecida', x: -33, z: -40 },
] as const;
export const shrines = [
  { id: 'breath', region: 'hill', name: 'Sopro da terra', x: -2, z: 8 },
  { id: 'echo', region: 'hill', name: 'Eco das raízes', x: 4, z: -3 },
  { id: 'memory', region: 'hill', name: 'Memória da luz', x: -2, z: -14 },
  { id: 'moss', region: 'forest', name: 'Sussurro do musgo', x: -25, z: -8 },
  { id: 'roots', region: 'forest', name: 'Voz da raiz-mãe', x: -33, z: 3 },
  { id: 'bloom', region: 'temple_clearing', name: 'Flor de outro mundo', x: -35, z: -11 },
  { id: 'watch', region: 'temple_clearing', name: 'Presença que observa', x: -42, z: -20 },
];
export const spawn = { x: 0, z: 20 };
export type RegionKey = 'hill' | 'village' | 'forest' | 'temple_clearing';
export function regionAt(x: number, z: number): RegionKey {
  return x<-33&&Math.abs(z-clareira.z)<14?'temple_clearing':x<-20?'forest':z<-19?'village':'hill';
}
export const village = { x: 1, z: -23 };
export const bosque = { x: -29, z: -3 };
export const clareira = { x: -38, z: -16 };
export function random(seed: number) { let n=seed; return () => { n=(n*1664525+1013904223)>>>0; return n/4294967296; }; }
const terrainNoise = createNoise2D(random(9001));
export function fbm(x: number, z: number, oct = 4) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) { sum += amp * terrainNoise(x*freq*.045, z*freq*.045); norm += amp; amp *= .5; freq *= 2; }
  return sum / norm;
}
export function heightAt(x: number, z: number) {
  return 1.5 + 5 * Math.exp(-(x*x/380 + (z-13)**2/650)) + 1.4*Math.sin(x*.12)*Math.cos(z*.1) + .6*Math.sin(x*.3+z*.13) + 7*Math.exp(-((x+28)**2/110+(z+35)**2/170)) + 6*Math.exp(-((x-30)**2/130+(z+24)**2/140)) + 3*Math.exp(-((x+29)**2/260+(z+3)**2/220)) + 4*Math.exp(-((x+38)**2/150+(z+16)**2/150)) + 2*fbm(x,z);
}
