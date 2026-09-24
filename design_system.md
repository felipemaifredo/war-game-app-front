# Design System - War Game

Este arquivo define as diretrizes visuais e arquiteturais para o frontend do jogo War, seguindo um estilo **Moderno e Limpo** (Cores sólidas, flat design, alto contraste).

## 1. Cores (Palette)

- **Primária**: `#2563EB` (Azul Royal - Foco, ações principais)
- **Secundária**: `#10B981` (Verde Esmeralda - Sucesso, botões positivos)
- **Aviso/Perigo**: `#EF4444` (Vermelho - Ataque, alertas)
- **Fundo (Background)**: `#F8FAFC` (Slate Claro) ou `#0F172A` (Slate Escuro para Dark Mode)
- **Superfícies (Cards, Modais)**: `#FFFFFF` (Branco puro) ou `#1E293B` (Dark Mode)
- **Texto Principal**: `#1E293B` (Escuro) / `#F8FAFC` (Claro no Dark Mode)
- **Texto Secundário**: `#64748B`

## 2. Tipografia

- **Fonte Principal**: `Inter` ou `Roboto` (Sem serifa, limpa, ótima legibilidade).
- **Títulos (h1, h2)**: Peso `700` (Bold)
- **Corpo de texto (p)**: Peso `400` (Regular)
- **Botões/Labels**: Peso `600` (SemiBold)

## 3. Elementos de Interface (Componentes)

### Botões
- **Bordas**: Arredondadas (radius: `8px`).
- **Sombra**: Sombra leve (box-shadow) apenas no hover.
- **Transição**: Suave (transition: `all 0.2s ease`).
- Sem bordas grossas, fundo sólido com texto em alto contraste.

### Cards (Territórios, Salas)
- Fundo branco ou escuro sólido.
- Bordas sutis (1px solid `#E2E8F0`).
- Sombras suaves (`box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)`).

### Formulários/Inputs
- Fundo levemente cinza ou branco.
- Borda que destaca ao receber foco (outline primária).

## 4. Estrutura de Arquivos (Baseado nas Regras)
Todas as estilizações devem utilizar **CSS Modules** (`.module.css`).

`src/`
 ├── `app/` (Rotas, layout principal)
 ├── `ui/`
 │    ├── `pages/` (Componentes que agrupam a lógica de uma página)
 │    └── `components/` (Botões, Cards, Modais)
 ├── `lib/`
 │    ├── `utils/` (Funções auxiliares de validação, formatação)
 │    └── `hooks/` (Hooks de WebSocket e Estado do jogo)
 └── `resources/`
      ├── `assets/` (Imagens, SVG)
      ├── `fonts/`
      └── `texts/` (Strings, i18n se necessário)
