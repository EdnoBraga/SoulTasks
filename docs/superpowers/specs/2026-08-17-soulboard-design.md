# SoulBoard — Especificação de design do MVP

## Objetivo

Criar um web app local-first de gestão visual de tarefas, inspirado em kanban e na fluidez do Trello, mas com identidade SoulFork e foco em dois diferenciais: personalização das colunas e criação inteligente de cards por modal ou captura rápida.

O MVP será single-user, com persistência no navegador. A arquitetura deverá permitir trocar a persistência local por uma API/banco futuramente sem reescrever a interface.

## Direção visual

O visual seguirá a linguagem atual do site soulfork.com.br: base quase preta e azul-marinho, superfícies profundas, texto azul-claro, ciano luminoso, violeta e verde para estados positivos. A referência visual anexada continua válida para a composição de quadro, colunas claras, cartões arredondados e Inbox lateral, mas a paleta será SoulFork.

Tokens iniciais:

- `--ink-950: #04060E` — fundo principal.
- `--ink-900: #080D1E` — navegação e áreas estruturais.
- `--ink-800: #111A33` — superfícies secundárias.
- `--blue-600: #2F5FE0` — ação principal e destaque de quadro.
- `--blue-400: #5B8CFF` — foco e elementos ativos.
- `--cyan-400: #63D9FF` — assinatura visual e links.
- `--cyan-200: #9FE2FF` — texto auxiliar claro.
- `--violet-500: #7A35FF` — Inbox e captura.
- `--violet-300: #A78BFA` — etiquetas e estados secundários.
- `--green-400: #8FD41F` — concluído, sucesso e saúde do fluxo.
- `--paper: #EAF0FF` — cards e superfícies de leitura.
- `--muted: #A9B6DC` — metadados e textos secundários.

O risco visual será concentrado na Inbox violeta e nos detalhes ciano; o restante será disciplinado para manter boa legibilidade e não parecer um clone literal do Trello.

## Estrutura da tela

```text
┌─────────────────────────────────────────────────────────────────────┐
│ SoulBoard     Meus quadros     Busca              + Novo card  Perfil │
├───────────────┬─────────────────────────────────────────────────────┤
│ INBOX         │ Projeto SoulFork                         ⋯           │
│ + Capturar    │ A fazer   Em andamento   Revisão   Feito             │
│               │ ┌──────┐  ┌───────────┐  ┌───────┐  ┌─────┐          │
│ captura       │ │ card │  │ card      │  │ card  │  │card │          │
│ rápida        │ └──────┘  └───────────┘  └───────┘  └─────┘          │
└───────────────┴─────────────────────────────────────────────────────┘
```

O quadro terá navegação horizontal para comportar muitas colunas. Em telas pequenas, a Inbox vira uma aba/atalho superior e as colunas passam a ocupar uma faixa horizontal rolável.

## Funcionalidades do MVP

### Quadros

- quadro inicial de demonstração já preenchido;
- criar, editar, duplicar e excluir quadros;
- título e descrição do quadro;
- busca global de cards;
- filtros por etiqueta, prioridade, prazo e coluna.

### Colunas

- criar coluna;
- renomear;
- alterar cor e ícone;
- reordenar por drag and drop;
- limite opcional de cards;
- descrição curta;
- marcar como coluna de conclusão;
- arquivar coluna.

### Cards

- criar, editar, duplicar, arquivar e excluir;
- mover entre colunas por drag and drop;
- título e descrição;
- prioridade;
- etiquetas;
- prazo;
- checklist;
- anexos simulados/localizados no navegador;
- comentários locais;
- histórico de atividade local.

### Inbox

A Inbox será uma área de captura rápida para ideias ainda não classificadas. O usuário poderá digitar um título e pressionar Enter para criar um item. Depois, poderá abrir o item e enviá-lo para uma coluna do quadro.

### Modal inteligente

- foco automático no título;
- coluna de destino pré-selecionada conforme o ponto de origem;
- campos avançados recolhíveis;
- criação rápida sem abrir o modal completo;
- `Ctrl + Enter` para salvar;
- `Esc` para fechar;
- confirmação antes de descartar alterações;
- mensagens de erro específicas e não destrutivas.

## Arquitetura técnica

Implementação inicial em React + TypeScript, com componentes focados e camada de persistência isolada.

```text
UI components
    ↓
Application state
    ↓
Persistence adapter
    ├── localStorage / IndexedDB no MVP
    └── API + banco em uma etapa futura
```

Modelo mínimo:

- `Board`: id, nome, descrição, cor, columnIds, timestamps;
- `Column`: id, boardId, nome, cor, ícone, cardIds, limite, concluída, arquivada;
- `Card`: id, boardId, columnId, título, descrição, prioridade, etiquetas, prazo, checklist, comentários, anexos, timestamps;
- `InboxItem`: id, título, descrição, status, destino opcional, timestamps;
- `Label`: id, nome, cor;
- `Activity`: id, entidade, tipo, texto, timestamp.

Os IDs e timestamps serão gerados no cliente. O modelo já terá campos de relacionamento e ownership que poderão receber `userId` e `workspaceId` posteriormente.

## Estados e acessibilidade

- foco de teclado visível;
- labels e aria attributes nos controles;
- modal com foco preso enquanto aberto;
- suporte a `Esc`, Enter e atalhos documentados;
- contraste revisado para texto claro em superfícies escuras;
- suporte a `prefers-reduced-motion`;
- estado vazio com instrução acionável;
- toast para ações concluídas e erros de persistência.

## Verificação

- testar criação e edição de cards;
- testar reordenação e movimentação entre colunas;
- recarregar a página e confirmar persistência;
- testar criação e personalização de coluna;
- testar filtros e busca;
- testar modal via teclado;
- validar responsividade em desktop e mobile;
- executar `git diff --check` e uma verificação de produção/build.

## Fora do escopo do MVP

- login e cadastro;
- colaboração em tempo real;
- permissões e equipes;
- sincronização entre dispositivos;
- notificações externas;
- integrações com Slack, WhatsApp, calendário ou e-mail;
- publicação em produção.

Esses itens serão considerados na evolução multiusuário, mas não devem bloquear a validação da experiência principal.
