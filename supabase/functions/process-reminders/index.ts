// Supabase Edge Function: process-reminders
// Secrets (server only): SMS_WEBHOOK_URL, SMS_WEBHOOK_TOKEN, SMS_SENDER=ALBAYAN
// The webhook adapter keeps Al-Bayan independent from any one SMS vendor.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function render(template: string, payload: Record<string, unknown>) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => String(payload[key] ?? ''));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const webhookUrl = Deno.env.get('SMS_WEBHOOK_URL');
  const webhookToken = Deno.env.get('SMS_WEBHOOK_TOKEN');
  const sender = Deno.env.get('SMS_SENDER') ?? 'ALBAYAN';
  const db = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

  if (!webhookUrl) {
    return Response.json({ ok: false, error: 'SMS_WEBHOOK_URL is not configured' }, { status: 503, headers: corsHeaders });
  }

  const { data: jobs, error } = await db
    .from('notification_jobs')
    .select('id,student_id,recipient,template_code,payload,attempts')
    .eq('status', 'queued')
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(50);

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders });

  let sent = 0;
  for (const job of jobs ?? []) {
    const claimed = await db.from('notification_jobs').update({ status:'processing', attempts:(job.attempts ?? 0)+1, updated_at:new Date().toISOString() }).eq('id',job.id).eq('status','queued').select('id').maybeSingle();
    if (!claimed.data) continue;

    const { data: template } = await db.from('notification_templates').select('body').eq('code',job.template_code).maybeSingle();
    const message = render(template?.body ?? '', job.payload ?? {});

    try {
      const response = await fetch(webhookUrl, {
        method:'POST',
        headers:{'content-type':'application/json', ...(webhookToken ? {authorization:`Bearer ${webhookToken}`} : {})},
        body:JSON.stringify({to:job.recipient,from:sender,message,metadata:{job_id:job.id,student_id:job.student_id}})
      });
      const responseText = await response.text();
      let responseBody: unknown = responseText;
      try { responseBody = JSON.parse(responseText); } catch { /* provider may return text */ }
      if (!response.ok) throw new Error(`Provider ${response.status}: ${responseText.slice(0,300)}`);

      const providerMessageId = typeof responseBody === 'object' && responseBody && 'id' in responseBody ? String((responseBody as {id: unknown}).id) : null;
      await db.from('notification_jobs').update({status:'sent',provider_message_id:providerMessageId,last_error:null,updated_at:new Date().toISOString()}).eq('id',job.id);
      await db.from('notification_logs').insert({job_id:job.id,student_id:job.student_id,channel:'sms',recipient:job.recipient,provider:'generic_webhook',provider_message_id:providerMessageId,status:'sent',response:typeof responseBody==='object'?responseBody:{body:responseText}});
      sent += 1;
    } catch (e) {
      const messageText = e instanceof Error ? e.message : String(e);
      await db.from('notification_jobs').update({status:(job.attempts ?? 0)>=2?'failed':'queued',last_error:messageText,updated_at:new Date().toISOString()}).eq('id',job.id);
      await db.from('notification_logs').insert({job_id:job.id,student_id:job.student_id,channel:'sms',recipient:job.recipient,provider:'generic_webhook',status:'failed',response:{error:messageText}});
    }
  }

  return Response.json({ ok:true, processed:(jobs ?? []).length, sent }, { headers:corsHeaders });
});
