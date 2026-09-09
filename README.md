# Etherion — Atlas do Despertar

Protótipo 3D em React, TypeScript, Vite, Three.js e React Three Fiber. Toda a geometria é procedural e não exige modelos ou texturas externos.

## Executar

```sh
npm install
npm run dev
```

`npm run build` verifica TypeScript e gera `dist`. `npm test` valida as regras da progressão.

## Travessia

1. Clique na Colina do Despertar ou em **Explorar a colina**.
2. Acompanhe a descida de câmera (ou pule a transição).
3. Caminhe com **WASD/setas**, corra com **Shift**, arraste para olhar. No celular, use os botões direcionais.
4. Aproxime-se dos três marcos pelo caminho. Pressione **E** ou toque no botão para sintonizar cada eco.
5. Com os três ecos, a barreira da Vila das Ahosi desaparece. Aproxime-se das casas e escolha **Entrar na Vila das Ahosi**.
6. **Esc** ou o ícone de mapa retorna ao atlas preservando o progresso da sessão. O botão de reiniciar limpa a jornada.

## Organização

- `src/world/data.ts`: regiões, posições e função de altura compartilhada pelo terreno e câmera.
- `src/world/progression.ts`: máquina de estados pura; valida proximidade e requisitos de acesso.
- `src/world/navigation.ts`: caminhada e limites compartilhados pela câmera e pelos testes.
- `src/scene/World.tsx`: renderização e câmera, com transição contínua entre atlas e exploração.
- `src/App.tsx`: interface, entradas e conexão entre mundo e progressão.
- `src/style.css`: identidade visual e layouts responsivos.

## Verificação

Os testes automatizados percorrem os três marcos usando a mesma função de movimento da câmera e verificam desbloqueio, chegada, limites, ações fora de alcance e retorno ao mapa. Na prévia do navegador foram conferidos clique na colina, transição automática, deslocamento, sintonia do primeiro eco, retorno com progresso e layouts amplo e compacto. O percurso completo foi validado pela lógica automatizada, não por uma travessia manual integral no navegador.

## Limitações

Primeiro trecho explorável, sem backend ou salvamento permanente. As demais regiões são marcos bloqueados. A vila contém um pequeno exterior visitável, sem interiores ou NPCs conversáveis. Requer WebGL e navegador moderno. Fontes web têm fallback local.
