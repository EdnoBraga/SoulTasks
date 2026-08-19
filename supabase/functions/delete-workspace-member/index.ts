import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
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
    if (!supabaseUrl || !publishableKey || !serviceRoleKey) return json({ code: 'function_not_configured', error: 'O serviço de exclusão não está configurado no Supabase.' }, 503);
    const publicClient = createClient(supabaseUrl, publishableKey);
    const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: { user }, error: userError } = await publicClient.auth.getUser(token);
    if (userError || !user) return json({ error: 'Sessão inválida.' }, 401);
    const { data: admin, error: adminError } = await adminClient.from('workspace_members').select('role,status').eq('workspace_id', workspaceId).eq('user_id', user.id).maybeSingle();
    if (adminError || admin?.role !== 'admin' || admin.status !== 'active') return json({ error: 'Somente o administrador pode excluir usuários.' }, 403);
    const payload = await request.json() as { memberId?: string };
    const memberId = payload.memberId?.trim() ?? '';
    if (!memberId) return json({ error: 'O usuário a excluir é obrigatório.' }, 400);
    const { data: target, error: targetError } = await adminClient.from('workspace_members').select('id,user_id,role,status').eq('workspace_id', workspaceId).eq('id', memberId).maybeSingle();
    if (targetError) return json({ error: 'Não foi possível localizar o usuário.' }, 500);
    if (!target || target.status !== 'active') return json({ error: 'Usuário não encontrado neste workspace.' }, 404);
    if (target.role === 'admin' || target.user_id === user.id) return json({ error: 'Não é permitido excluir o administrador.' }, 403);
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(target.user_id);
    if (authDeleteError) return json({ error: `Não foi possível excluir a conta: ${authDeleteError.message}` }, 500);
    const { error: memberDeleteError } = await adminClient.from('workspace_members').delete().eq('id', memberId);
    if (memberDeleteError) return json({ error: 'A conta foi excluída, mas não foi possível limpar o vínculo do workspace.' }, 500);
    return json({ deleted: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Erro inesperado.' }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
