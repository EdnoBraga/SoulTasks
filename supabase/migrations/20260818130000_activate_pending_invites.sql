-- Convites já enviados foram registrados como pending pela primeira versão da função.
-- O link do convite continua sendo a barreira de autenticação; após o envio,
-- o usuário convidado precisa poder carregar o workspace ao aceitar o link.
update public.workspace_members
set status = 'active', updated_at = timezone('utc', now())
where status = 'pending';
