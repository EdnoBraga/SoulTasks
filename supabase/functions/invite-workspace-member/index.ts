import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const workspaceId = '00000000-0000-0000-0000-000000000001';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) return json({ error: 'Não autenticado.' }, 401);
    const token = authorization.slice('Bearer '.length);
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const publicClient = createClient(supabaseUrl, publishableKey);
    const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: { user }, error: userError } = await publicClient.auth.getUser(token);
    if (userError || !user) return json({ error: 'Sessão inválida.' }, 401);
    const { data: admin, error: adminError } = await adminClient.from('workspace_members').select('role,status').eq('workspace_id', workspaceId).eq('user_id', user.id).maybeSingle();
    if (adminError || admin?.role !== 'admin' || admin.status !== 'active') return json({ error: 'Somente o administrador pode convidar membros.' }, 403);
    const payload = await request.json() as { email?: string; displayName?: string };
    const email = payload.email?.trim().toLowerCase() ?? '';
    const displayName = payload.displayName?.trim() ?? '';
    if (!/^\S+@\S+\.\S+$/.test(email) || !displayName) return json({ error: 'Nome e e-mail válidos são obrigatórios.' }, 400);
    const redirectTo = Deno.env.get('INVITE_REDIRECT_URL') ?? 'https://tasks.soulfork.com.br';
    const { data: invitation, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, { redirectTo, data: { display_name: displayName } });
    if (inviteError || !invitation.user) return json({ error: inviteError?.message ?? 'Não foi possível enviar o convite.' }, 400);
    const { error: memberError } = await adminClient.from('workspace_members').upsert({ workspace_id: workspaceId, user_id: invitation.user.id, email, display_name: displayName, role: 'member', status: 'pending' }, { onConflict: 'workspace_id,user_id' });
    if (memberError) return json({ error: 'Convite enviado, mas não foi possível registrar o membro.' }, 500);
    return json({ invited: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Erro inesperado.' }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
