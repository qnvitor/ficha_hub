<h1 align="center"> 🎲 RPG Character Sheet Hub </h1>

<p align="center">
Sistema de fichas de personagem para RPG de mesa.
</p>
<p align="center">
Hub web completo para gerenciar fichas de personagem de múltiplos sistemas de RPG com salvamento automático, exportação JSON e geração de PDF.
</p>

<p align="center">
<a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
<a href="#-projeto">Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
<a href="#-fichas-disponíveis">Fichas Disponíveis</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
<a href="#-estrutura">Estrutura</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
<a href="#-licença">Licença</a>
</p>

<p align="center">
<img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=49AA26&labelColor=000000">
</p>

<br>

## 🚀 Tecnologias

Esse projeto foi desenvolvido com:

- **HTML5** - Estrutura semântica
- **ES6 Modules** - Arquitetura modular e componentes
- **Vanilla CSS** 
  - CSS Grid e Flexbox
  - CSS Variables para temas
  - Media queries responsivas
- **JavaScript Vanilla**
  - Pub/Sub pattern para eventos
  - LocalStorage API
  - Dynamic imports
  - Classes ES6
- **Print CSS** - Otimização para PDF
- **Theme System** - Dark/Light mode com persistência

<br>

## 💻 Projeto

Sistema web modular para criação e gerenciamento de fichas de personagem de RPG. Atualmente suporta **Justice League Unlimited RPG** com arquitetura preparada para expansão.

<br>

## 📝 Fichas Disponíveis

### 🦸 Justice League Unlimited RPG

<br>

## 📁 Estrutura

```
rpg_hub/
├── index.html                          # Hub de seleção de sistemas
├── assets/
│   ├── css/
│   │   ├── global.css                 # Variáveis e estilos globais
│   │   └── home.css                   # Estilos do hub
│   └── js/
│       └── theme.js                    # Gerenciador global de temas
├── sheets/
│   └── jlu_rpg/                        # Ficha Justice League Unlimited
│       ├── jlu.html                   # Estrutura da ficha
│       ├── jlu.css                    # Estilos da ficha
│       ├── print.css                  # Estilos para impressão/PDF
│       ├── jlu.js                     # Orquestrador principal
│       ├── components/                 # Componentes modulares
│       │   ├── CharacterInfo.js       # Identificação e PAX
│       │   ├── Attributes.js          # Atributos (FOR, AGI, INT, PRE, VIG, ESP)
│       │   ├── Combat.js              # Combate e Determinação
│       │   ├── Capabilities.js        # Capacidades Heróicas e Traços
│       │   ├── Limitations.js         # Limitações
│       │   └── Knowledge.js           # Conhecimentos e Perícias
│       ├── utils/
│       │   ├── events.js              # Sistema Pub/Sub
│       │   ├── calculations.js        # Funções de cálculo
│       │   └── storage.js             # LocalStorage API
│       └── data/
│           └── tierData.js            # Dados dos Tiers
└── README.md
```

<br>

## :memo: Licença

Esse projeto está sob a licença MIT.

---

Feito com ♥ by Abyssal Roll 👋🎲