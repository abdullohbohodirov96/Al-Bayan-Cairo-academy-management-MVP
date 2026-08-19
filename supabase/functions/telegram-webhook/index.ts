// Supabase Edge Function: telegram-webhook
// Secrets (server only): TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET
//
// What this does:
// 1. Telegram calls this URL every time something happens in a chat the
//    bot is part of (message posted, bot added/removed, title changed).
// 2. When the bot is added to a group, or the group's title changes, we
//    look for a group_code pattern (e.g. "S22-22") inside the chat title.
// 3. If it matches a groups.group_code in our DB, we save that chat's
//    Telegram id onto the group — from then on, sendReminder-style jobs
//    can message that chat directly via telegram-send.
//
// Setup (after deploying this function):
//   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
//     -d "url=https://<project-ref>.supabase.co/functions/v1/telegram-webhook" \
//     -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Matches codes like S22-22, A1-14, B2-7 — adjust if your center uses a
// different pattern.
const CODE_PATTERN = /\b[A-Za-z]\d{0,2}-?\d{1,3}\b/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');
  if (webhookSecret) {
    const provided = req.headers.get('x-telegram-bot-api-secret-token');
    if (provided !== webhookSecret) {
      return Response.json({ ok: false, error: 'Invalid secret token' }, { status: 401, headers: corsHeaders });
    }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const db = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

  const update = await req.json();

  // Chat info can arrive on several update types — normalize to one shape.
  const chat =
    update.message?.chat ??
    update.my_chat_member?.chat ??
    update.channel_post?.chat ??
    null;

  if (!chat || (chat.type !== 'group' && chat.type !== 'supergroup')) {
    return Response.json({ ok: true, skipped: 'not a group update' }, { headers: corsHeaders });
  }

  const title: string = chat.title ?? '';
  const match = title.match(CODE_PATTERN);
  if (!match) {
    return Response.json({ ok: true, skipped: 'no group code found in title', title }, { headers: corsHeaders });
  }

  const groupCode = match[0].toUpperCase();
  const chatId = String(chat.id);

  const { data: group, error: findError } = await db
    .from('groups')
    .select('id, name, telegram_chat_id')
    .eq('group_code', groupCode)
    .maybeSingle();

  if (findError) return Response.json({ ok: false, error: findError.message }, { status: 500, headers: corsHeaders });
  if (!group) return Response.json({ ok: true, skipped: `no group with code ${groupCode}` }, { headers: corsHeaders });

  if (group.telegram_chat_id !== chatId) {
    const { error: updateError } = await db.from('groups').update({ telegram_chat_id: chatId }).eq('id', group.id);
    if (updateError) return Response.json({ ok: false, error: updateError.message }, { status: 500, headers: corsHeaders });
  }

  // Optional: greet the group once linked, so staff get instant confirmation.
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (botToken && group.telegram_chat_id !== chatId) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `✅ Ushbu guruh Al-Bayan Academy OS'dagi "${group.name}" (${groupCode}) bilan bog'landi.` }),
    });
  }

  return Response.json({ ok: true, linked: group.name, groupCode }, { headers: corsHeaders });
});
