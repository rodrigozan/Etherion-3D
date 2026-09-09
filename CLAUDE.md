# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```sh
npm install       # instalar dependências
npm run dev       # servidor de desenvolvimento (Vite, --host 0.0.0.0)
npm run build     # tsc -b (verificação de tipos) seguido de vite build → dist/
npm test          # tsx --test src/world/progression.test.ts
```

Não há linter configurado. Não há flag para rodar um teste isolado — `progression.test.ts` é o único arquivo de teste e roda ambos os `test()` de uma vez via `node:test`.

## Visão geral

Etherion é um protótipo 3D (React + TypeScript + Vite + Three.js/React Three Fiber) de um "atlas" explorável. Toda a geometria é procedural — sem modelos ou texturas externos, tudo gerado por código (ruído determinístico via `random(seed)` em [src/world/data.ts](src/world/data.ts)).

O app tem uma única cena Three.js contínua que serve tanto o mapa aéreo ("atlas") quanto a exploração em primeira pessoa — não há troca de `<Canvas>`, apenas a câmera se move entre os dois modos.

### Máquina de estados de progressão

O núcleo lógico do app é puro e desacoplado de React/Three.js, o que permite testá-lo sem navegador:

- [src/world/progression.ts](src/world/progression.ts) — reducer puro (`progression(state, action) => state`) com `Mode = 'map' | 'descent' | 'explore'`. Controla transições entre atlas, cinemática de descida e exploração, além de sintonia dos ecos (`attune`) e desbloqueio da vila (`isVillageUnlocked`).
- [src/world/navigation.ts](src/world/navigation.ts) — `move()`, função pura de movimento no plano do chão. Usada tanto pelo `CameraRig` em runtime quanto diretamente pelos testes (mesma lógica, sem duplicação).
- [src/world/data.ts](src/world/data.ts) — dados estáticos do mundo (regiões, santuários/`shrines`, spawn, vila) e `heightAt(x, z)`, a função de altura do terreno compartilhada entre a malha 3D (`Terrain` em World.tsx) e a câmera/movimento — não há física real, a altura é sempre recalculada pela mesma fórmula.

Como a lógica de jogo é pura, `progression.test.ts` simula travessias completas (todos os três santuários, limites do mundo, vila selada) chamando `progression`/`move` diretamente, sem montar componentes React.

### Camada de renderização (React Three Fiber)

- [src/scene/World.tsx](src/scene/World.tsx) — `Canvas` único; `CameraRig` interpola a câmera entre atlas (vista aérea) e primeira pessoa (`descent` → `explore`) usando easing baseado em tempo, respeitando `prefers-reduced-motion`. Chama `move()` de navigation.ts a cada frame e reporta posição via `onPosition`.
- [src/scene/Landscape.tsx](src/scene/Landscape.tsx) — geometria procedural: terreno, vegetação instanciada (`InstancedMesh` para troncos/copas/grama/rochas), casas da vila, céu com shader customizado (GLSL inline), luas, partículas atmosféricas, animais animados.
- [src/scene/SceneBoundary.tsx](src/scene/SceneBoundary.tsx) — error boundary de classe React que captura falhas de WebGL e mostra fallback em português.

### UI e integração

- [src/App.tsx](src/App.tsx) — único componente de UI; conecta `useReducer(progression, ...)` ao `World`, trata input de teclado/ponteiro (WASD, arrastar para olhar, `E` para interagir, `Esc` para voltar ao mapa), renderiza overlays (atlas, guia, HUD de exploração) condicionalmente por `progress.mode`.
- [src/world/webmcp.ts](src/world/webmcp.ts) — expõe ferramentas via `document.modelContext` (API experimental de agentes de navegador/WebMCP) para leitura de estado (`read_etherion_journey`), navegação (`walk_etherion`) e retorno ao atlas (`return_to_etherion_atlas`). É opcional em runtime (`if (!context?.registerTool) return`) — não quebra se a API não existir.

### Convenções do código-fonte

- Estilo extremamente compacto: sem espaçamento generoso, funções e componentes curtos em poucas linhas, quase sem comentários (apenas quando explicam uma restrição não óbvia, como em `navigation.ts` e `data.ts`). Siga esse estilo denso ao editar esses arquivos em vez de expandir para um formato mais verboso.
- `src/style.css` concentra toda a identidade visual e responsividade (não há CSS-in-JS nem módulos CSS).
- Textos de UI e commits/documentação são em português do Brasil (ver README.md e a UI em App.tsx).
