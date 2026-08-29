# Configuração do workspace privado SoulTasks

## Supabase

1. Execute a migração `20260818090000_private_workspace_collaboration.sql`.
2. Cadastre o primeiro administrador em `workspace_members` com o workspace
   `00000000-0000-0000-0000-000000000001`, o `user_id` do usuário Auth, papel
   `admin` e status `active`.
3. Desative o cadastro público em Auth > Providers > Email.
4. Configure o redirect do convite para `https://tasks.soulfork.com.br`.
5. Configure SMTP com o remetente `no-reply@example.com`.

## Edge Function

Faça o deploy de `invite-workspace-member` e configure os secrets:

- `SUPABASE_SERVICE_ROLE_KEY`: somente no ambiente da função;
- `INVITE_REDIRECT_URL=https://tasks.soulfork.com.br`.

O service role nunca deve ser colocado no frontend, no GitHub Actions ou em
variáveis `VITE_*`.

## Verificação

- login de usuário não convidado deve mostrar “Acesso não autorizado”;
- o administrador deve ver “Convidar membro”;
- um membro comum não deve conseguir enviar convite;
- os três usuários ativos devem carregar o mesmo snapshot do quadro;
- chat geral e presença devem funcionar somente para membros ativos.
