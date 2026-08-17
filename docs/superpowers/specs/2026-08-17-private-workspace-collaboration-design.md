# SoulTasks — workspace privado e colaboração em tempo real

## Objetivo

Transformar o SoulTasks em um workspace interno da SoulFork para três pessoas:
um administrador e dois membros da empresa. Todos os membros autorizados
visualizam o mesmo quadro, cards, atividade, calendário e colaboração. Não
haverá cadastro público nem acesso para clientes externos.

O remetente dos convites será `faleconosco@soulfork.com.br`.

## Escopo aprovado

### Etapa 1 — acesso e colaboração

- remover a opção pública de criar conta;
- permitir que somente o administrador convide usuários por e-mail;
- aceitar o convite e definir a senha pelo Supabase Auth;
- manter um workspace compartilhado entre os três usuários;
- exibir presença online, ausente e offline;
- criar um canal geral da SoulFork;
- permitir conversas privadas entre dois usuários;
- atualizar mensagens e presença em tempo real;
- indicar quando alguém está digitando;
- manter o histórico protegido por RLS.

### Experiência operacional do quadro

- os responsáveis disponíveis serão `Braga`, `Pallus` e `Kayo`;
- cada card poderá ter um, dois ou os três responsáveis selecionados;
- Inbox, título, descrição, checklist e comentários terão ação de microfone;
- a fala será transcrita em português brasileiro em tempo real enquanto a
  pessoa fala, e o texto ficará editável antes de ser salvo;
- nenhum áudio será armazenado, e a digitação continuará disponível como
  alternativa caso o navegador não ofereça reconhecimento de voz;
- o quadro terá rolagem horizontal visível, suporte a arrastar no espaço vazio
  e gesto de toque, além de zoom em 80%, 90% e 100% para acomodar quatro ou
  mais colunas.

### Etapa 2 — sala de videochamada

- qualquer usuário autenticado pode iniciar uma sala;
- a sala ativa aparece para os demais usuários;
- qualquer membro pode entrar sem aprovação;
- suportar até três participantes;
- áudio, câmera e compartilhamento de tela;
- mostrar quem está na sala;
- permitir que o iniciador encerre a chamada;
- usar WebRTC para mídia e Supabase Realtime para sinalização;
- prever servidor TURN para redes que não permitem conexão direta.

## Arquitetura proposta

### Autenticação e autorização

O frontend continuará usando somente a chave publishable do Supabase. A criação
de usuários será feita por uma Edge Function protegida, usando a chave de
servidor somente no ambiente da função. Essa chave nunca será enviada ao
navegador, ao GitHub ou ao código público.

O administrador será identificado por uma tabela de membros controlada por RLS
e por autorização validada no backend. Não serão usados campos editáveis de
`user_metadata` para decisões de autorização.

Fluxo do convite:

```text
Administrador → Edge Function → Supabase Auth inviteUserByEmail
              → e-mail do remetente configurado
              → usuário define a senha → entra no workspace
```

O cadastro público será desabilitado no produto e nas configurações de Auth.

### Modelo de dados

As tabelas serão criadas em uma migração versionada, todas com RLS:

- `workspace_members`: usuário, workspace, papel, nome exibido, status e datas;
- `chat_channels`: canal geral ou conversa privada;
- `chat_channel_members`: participantes autorizados de cada canal;
- `chat_messages`: autor, canal, conteúdo, edição, exclusão lógica e data;
- `call_rooms`: sala ativa, iniciador, status e datas;
- `call_participants`: usuários presentes na sala e estado de entrada/saída.

O snapshot atual do quadro continuará separado em `board_snapshots`, associado
ao workspace compartilhado em vez de ficar conceitualmente preso a um usuário
individual. A migração deverá preservar os dados existentes antes de trocar a
chave de posse.

### RLS e privacidade

- somente membros ativos do workspace poderão ler o quadro;
- somente membros ativos poderão ler canais dos quais participam;
- mensagens poderão ser inseridas apenas pelo próprio usuário autenticado;
- conversas privadas serão visíveis apenas aos dois participantes;
- somente o administrador poderá convidar, suspender ou reativar membros;
- salas de chamada serão visíveis aos membros do workspace;
- usuários não autenticados não terão acesso a quadro, chat, presença ou salas.

Cada política de `UPDATE` terá `USING` e `WITH CHECK`, e todas as tabelas
expostas à Data API terão RLS habilitado e grants mínimos.

### Presença e mensagens

O Supabase Realtime Presence manterá o estado efêmero online/offline e o canal
de digitação. As mensagens persistentes ficarão em `chat_messages` e serão
recebidas por Postgres Changes, garantindo histórico após recarregar a página.

Interface planejada:

- avatares no topo com indicador de presença;
- painel lateral ou drawer de chat;
- aba “Geral” e lista de conversas privadas;
- composer com envio por Enter e quebra de linha por Shift+Enter;
- estado vazio com convite para iniciar a conversa;
- mensagens de erro orientando a ação seguinte.

### Criação de tarefas por voz e responsáveis

O modal de criação/edição de card reutilizará um controle de voz contextual
para os campos de texto. Ao iniciar, o navegador solicitará o microfone e o
texto parcial aparecerá enquanto a pessoa fala; ao parar, o resultado final
será consolidado no campo ativo e poderá ser revisado antes do envio. O
controle exibirá estados “Gravando”, “Processando” e “Transcrição pronta”, com
mensagem de recuperação para permissão negada, idioma indisponível ou
navegador sem suporte.

O seletor “Responsáveis” será multiseleção com busca e opções fixas Braga,
Pallus e Kayo. Os responsáveis aparecerão no card e poderão ser alterados sem
abrir uma tela separada.

### Navegação do quadro

O viewport do quadro será horizontalmente rolável e manterá a largura natural
das colunas. A interação deverá funcionar por barra de rolagem, arraste com
mouse no fundo do quadro, toque/trackpad e Shift+roda do mouse. O seletor de
zoom será persistido localmente por navegador e não alterará os dados do board.

### Videochamada e compartilhamento de tela

O frontend usará `getUserMedia` para câmera/microfone e `getDisplayMedia` para
compartilhamento de tela. A sinalização de oferta, resposta e ICE será enviada
por um canal Realtime privado da sala. O estado da sala persistirá em
`call_rooms` e `call_participants`, mas os streams de áudio e vídeo não serão
armazenados.

Para três usuários, uma malha WebRTC pequena é suficiente para a primeira
versão. Um servidor TURN será configurado antes do uso em produção para reduzir
falhas em redes corporativas, VPNs e CGNAT. A permissão do navegador para
câmera, microfone e tela será solicitada somente ao entrar na chamada.

## Experiência e textos

O produto usará linguagem direta e operacional:

- “Convidar membro” em vez de “Cadastrar usuário”;
- “Entrar no workspace” em vez de “Criar conta”;
- “Iniciar chamada” e “Entrar na chamada”;
- “Canal geral” e “Conversa privada”;
- estados vazios sempre indicarão o próximo passo.

O visual seguirá a identidade SoulFork já aplicada: fundo escuro, acentos ciano
e violeta, logo no cabeçalho e indicadores compactos de estado. O chat e a sala
serão componentes do dashboard, não páginas externas.

## Configuração externa necessária

Antes da publicação da Etapa 1, será necessário configurar no Supabase:

- URL de redirecionamento do convite para `https://tasks.soulfork.com.br`;
- SMTP com o remetente `faleconosco@soulfork.com.br`;
- segredo da Edge Function para o envio administrativo;
- administrador inicial do workspace.

Antes da publicação da Etapa 2, será necessário definir o provedor TURN e seus
segredos de conexão. Esses valores ficarão somente em secrets do Supabase.

## Verificação

### Etapa 1

- usuário não autenticado não vê o quadro;
- botão de cadastro público não existe;
- administrador envia convite válido;
- convite expirado apresenta orientação clara;
- membro aceito entra no workspace compartilhado;
- três usuários veem o mesmo estado do quadro;
- presença muda ao entrar e sair;
- mensagem geral chega aos três membros;
- mensagem privada chega somente aos dois participantes;
- RLS impede leitura direta por usuário externo.
- card permite selecionar Braga, Pallus, Kayo, individualmente ou em conjunto;
- Inbox e modal de card transcrevem a fala em tempo real e permitem editar o
  texto antes de salvar;
- quatro colunas podem ser alcançadas por rolagem, arraste e toque;
- zoom 80%, 90% e 100% mantém cards e controles utilizáveis.

### Etapa 2

- membro inicia sala;
- os demais veem a sala ativa;
- um ou dois membros entram sem aprovação;
- áudio, câmera e tela podem ser alternados;
- desligar câmera/microfone atualiza o estado visual;
- encerrar a sala libera os participantes;
- falha de permissão ou conexão mostra recuperação clara;
- nenhum stream é persistido no banco.

## Decisões e limites

- Não haverá cadastro público.
- O workspace terá três usuários autorizados nesta primeira versão.
- Todos compartilham o mesmo quadro e os mesmos dados operacionais.
- Não haverá acesso de clientes externos neste produto.
- O chat persistirá mensagens; presença e digitação serão efêmeras.
- Videochamadas serão iniciadas sob demanda, sem agenda obrigatória.
- A implementação será dividida em duas etapas para validar acesso e RLS
  antes de ativar mídia em tempo real.
