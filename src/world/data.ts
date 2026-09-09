import { createNoise2D } from 'simplex-noise';
export const regions = [
  { id: 'hill', name: 'Colina do Despertar', subtitle: 'O início da travessia', x: 0, z: 13 },
  { id: 'village', name: 'Vila das Ahosi', subtitle: 'Um refúgio entre as raízes', x: 1, z: -23 },
  { id: 'forest', name: 'Bosque dos Ecos', subtitle: 'Região desconhecida', x: -29, z: -3 },
  { id: 'ruins', name: 'Ruínas de Vael', subtitle: 'Região desconhecida', x: 29, z: -13 },
  { id: 'peaks', name: 'Coroa de Cinzas', subtitle: 'Região desconhecida', x: -18, z: -39 },
  { id: 'marsh', name: 'Véu Silencioso', subtitle: 'Região desconhecida', x: 30, z: 28 },
] as const;
export const shrines = [{ id: 'breath', name: 'Sopro da terra', x: -2, z: 8 }, { id: 'echo', name: 'Eco das raízes', x: 4, z: -3 }, { id: 'memory', name: 'Memória da luz', x: -2, z: -14 }];
export const spawn = { x: 0, z: 20 };
export const village = { x: 1, z: -23 };
export function random(seed: number) { let n=seed; return () => { n=(n*1664525+1013904223)>>>0; return n/4294967296; }; }
const terrainNoise = createNoise2D(random(9001));
export function fbm(x: number, z: number, oct = 4) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) { sum += amp * terrainNoise(x*freq*.045, z*freq*.045); norm += amp; amp *= .5; freq *= 2; }
  return sum / norm;
}
export function heightAt(x: number, z: number) {
  return 1.5 + 5 * Math.exp(-(x*x/380 + (z-13)**2/650)) + 1.4*Math.sin(x*.12)*Math.cos(z*.1) + .6*Math.sin(x*.3+z*.13) + 7*Math.exp(-((x+28)**2/110+(z+35)**2/170)) + 6*Math.exp(-((x-30)**2/130+(z+24)**2/140)) + 2*fbm(x,z);
}
