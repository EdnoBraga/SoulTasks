# Deploy automático do SoulTasks

O workflow `.github/workflows/deploy.yml` executa a seguinte sequência a cada
`push` na branch `main`:

1. instala as dependências com `npm ci`;
2. executa os testes;
3. gera o build Vite em `dist/`;
4. envia somente `dist/` para o diretório do subdomínio no Hostinger.

O site principal não participa desse fluxo. O destino é definido por Secret
para impedir que o workflow publique acidentalmente em `public_html` ou em
outro domínio.

## Secrets necessários no GitHub

No repositório, abra `Settings → Secrets and variables → Actions → New
repository secret` e cadastre:

| Secret | Valor |
| --- | --- |
| `HOSTINGER_FTP_SERVER` | servidor FTP/SFTP exibido no hPanel |
| `HOSTINGER_FTP_USERNAME` | usuário FTP do Hostinger |
| `HOSTINGER_FTP_PASSWORD` | senha FTP do Hostinger |
| `HOSTINGER_SERVER_DIR` | diretório remoto exato da pasta do subdomínio |
| `VITE_SUPABASE_URL` | URL pública do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | chave publishable/anon do Supabase |

Para este projeto, `HOSTINGER_SERVER_DIR` deve apontar para a pasta do
subdomínio `tasks`, e não para a raiz do site principal. Confirme o caminho
exato no Gerenciador de Arquivos ou nas informações da conta FTP antes de
salvar o Secret.

Não coloque a senha FTP, a `service_role key` do Supabase ou qualquer outro
segredo no código ou no arquivo `.env.example`.

Depois de cadastrar os Secrets, qualquer `push` em `main` iniciará o workflow.
Também é possível executá-lo manualmente pela aba `Actions`, usando
`Build and deploy SoulTasks → Run workflow`.
