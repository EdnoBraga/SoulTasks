import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const workspaceId = '00000000-0000-0000-0000-000000000001';
const emailPattern = /^\S+@\S+\.\S+$/;

type NotificationPayload = { kind?: 'assignment' | 'comment' | 'due'; title?: string; message?: string; cardTitle?: string; recipientEmails?: string[] };

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
    const { data: member, error: memberError } = await adminClient.from('workspace_members').select('user_id,status').eq('workspace_id', workspaceId).eq('user_id', user.id).maybeSingle();
    if (memberError || member?.status !== 'active') return json({ error: 'Você não pertence a este workspace.' }, 403);

    const payload = await request.json() as NotificationPayload;
    const kind = payload.kind;
    const title = payload.title?.trim() ?? '';
    const message = payload.message?.trim() ?? '';
    const cardTitle = payload.cardTitle?.trim() ?? '';
    const requestedRecipients = [...new Set((payload.recipientEmails ?? []).map((email) => email.trim().toLowerCase()).filter((email) => emailPattern.test(email)))];
    if (!kind || !title || !message || !cardTitle || !requestedRecipients.length) return json({ error: 'Dados da notificação incompletos.' }, 400);

    const { data: recipients, error: recipientError } = await adminClient.from('workspace_members').select('email').eq('workspace_id', workspaceId).eq('status', 'active').in('email', requestedRecipients);
    if (recipientError) return json({ error: 'Não foi possível validar os destinatários.' }, 500);
    const allowedRecipients = [...new Set((recipients ?? []).map((recipient) => recipient.email?.trim().toLowerCase()).filter((email): email is string => Boolean(email && emailPattern.test(email))))];
    if (!allowedRecipients.length) return json({ sent: 0 });

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) return json({ error: 'RESEND_API_KEY ainda não foi configurada no Supabase.' }, 503);
    const from = Deno.env.get('EMAIL_FROM') ?? 'no-reply@example.com';
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: allowedRecipients, subject: `[SoulTasks] ${title}`, html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p><p><strong>Tarefa:</strong> ${escapeHtml(cardTitle)}</p><p><a href="${escapeHtml(Deno.env.get('APP_URL') ?? 'https://tasks.soulfork.com.br')}">Abrir SoulTasks</a></p></div>` }) });
    if (!response.ok) return json({ error: `O provedor de e-mail recusou o envio (${response.status}).` }, 502);
    return json({ sent: allowedRecipients.length });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Erro inesperado.' }, 500);
  }
});

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character); }
function json(body: Record<string, unknown>, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
