// Supabase Edge Function: telegram-send
// Secrets (server only): TELEGRAM_BOT_TOKEN
//
// Called with { group_id, message } (or { group_code, message }) — looks up
// the group's linked telegram_chat_id and posts the message there via the
// Telegram Bot API. Meant to be called from process-reminders (or a
// scheduled job) once a group is linked, not directly from the browser
// with the bot token — the token stays server-side.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    return Response.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN is not configured' }, { status: 503, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const db = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

  const { group_id, group_code, message } = await req.json();
  if (!message || (!group_id && !group_code)) {
    return Response.json({ ok: false, error: 'group_id or group_code, and message, are required' }, { status: 400, headers: corsHeaders });
  }

  const query = db.from('groups').select('id, name, telegram_chat_id');
  const { data: group, error } = await (group_id ? query.eq('id', group_id) : query.eq('group_code', group_code)).maybeSingle();

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders });
  if (!group) return Response.json({ ok: false, error: 'Group not found' }, { status: 404, headers: corsHeaders });
  if (!group.telegram_chat_id) {
    return Response.json({ ok: false, error: `Group "${group.name}" has no linked Telegram chat yet — add the bot to its Telegram group first.` }, { status: 409, headers: corsHeaders });
  }

  const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: group.telegram_chat_id, text: message }),
  });
  const tgBody = await tgResponse.json();

  if (!tgResponse.ok || !tgBody.ok) {
    return Response.json({ ok: false, error: tgBody.description ?? 'Telegram API error' }, { status: 502, headers: corsHeaders });
  }

  return Response.json({ ok: true, sent_to: group.name }, { headers: corsHeaders });
});
