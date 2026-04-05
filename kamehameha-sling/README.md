# Heey não se esqueça de dar uma estrela nesse projeto, isso ajuda muito a divulgar o jogo e a comunidade!
### ESSE JOGO É UMA HOMENAGEM AO DRAGON BALL E NÃO TEM FINS COMERCIAIS
### FOI FEITO POR HOBBY E PARA DIVERTIR A COMUNIDADE

# Kamehameha Sling

Jogo casual inspirado em estilingue, onde você controla o Goku para derrotar inimigos em diferentes níveis usando física e poderes especiais.

## Como executar

1. Clone o repositório.
2. Coloque os arquivos de áudio em `assets/` (ex: `bgMusic.mp3`, `launch.wav`, `impact.wav`).
3. Abra o arquivo `index.html` em um navegador moderno (Chrome, Firefox, Edge).
4. Jogue diretamente, não é necessário servidor ou instalação.

## Como jogar

- **Objetivo:** Derrote todos os inimigos de cada nível usando o menor número de lançamentos.
- **Arraste o Goku** no canvas para mirar e solte para lançar.
- **Colete Dragon Ball** para ativar o modo Super Saiyajin (poder extra).
- **Pegue Power-Ups** para habilidades temporárias: velocidade, multishot, perfurante, Goku gigante.
- **Use as setas do teclado** para ajustar a posição do Goku antes de lançar.
- **Evite projéteis dos inimigos** e use o ambiente a seu favor.

## Controles

- **Mouse/Toque:** Arraste e solte Goku para lançar.
- **Setas do teclado:** Move Goku antes do lançamento.
- **Botão Reiniciar:** Reinicia o nível atual.
- **Botão Som/Música:** Ativa/desativa efeitos sonoros e música de fundo.

## Principais mecânicas

- **Física de lançamento:** Força, gravidade, vento e colisão.
- **Power-Ups:** Habilidades temporárias que mudam o gameplay.
- **Dragon Ball:** Ativa modo Super Saiyajin.
- **Inimigos:** Tipos variados (normal, móvel, atirador, chefe).
- **Partículas:** Efeitos visuais para explosões, trilhas e transformações.
- **Pontuação e estrelas:** Ganhe pontos e estrelas conforme desempenho.

## Principais funções e classes

- `ParticleSystem`: Gerencia efeitos visuais.
- `SoundManager`: Controla sons e música.
- `PowerUp`: Representa e desenha power-ups.
- `Enemy`: Lógica e desenho dos inimigos.
- `GameState`: Estado geral do jogo, pontuação, nível, power-ups ativos.
- Funções de controle: `startGame`, `initGame`, `resetLevel`, `nextLevel`, `restartGame`, `toggleSound`, `toggleMusic`.

## O que foi feito

- Sistema de níveis progressivos.
- Implementação de física e colisão.
- Efeitos visuais e sonoros.
- Interface responsiva e intuitiva.
- Suporte a mouse, toque e teclado.
- Música de fundo em loop e alternância de som.
- Modal de vitória, derrota e conclusão de jogo.

---

Divirta-se e tente conquistar todas as esferas do dragão!