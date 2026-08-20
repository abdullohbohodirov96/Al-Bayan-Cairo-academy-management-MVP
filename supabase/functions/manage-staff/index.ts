// Supabase Edge Function: manage-staff
// No extra secrets needed beyond the ones Supabase provides automatically
// (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY).
//
// Only a signed-in CEO may call this. It:
//  - verifies the caller's own session (via their access token) and checks
//    their profiles.role === 'ceo'
//  - then uses the service-role client to create/update/deactivate/delete
//    Supabase Auth users and their matching profiles row
//
// The service-role key never reaches the browser — it only lives inside
// this function's server-side environment.
//
// Request body: { action, ...fields }
//   action: 'list'            -> {}
//   action: 'create'          -> { email, password, full_name, phone, role: 'teacher'|'admin' }
//   action: 'update_profile'  -> { user_id, full_name, phone, role }
//   action: 'reset_password'  -> { user_id, password }
//   action: 'set_active'      -> { user_id, is_active }
//   action: 'delete'          -> { user_id }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const authHeader = req.headers.get('Authorization') ?? '';
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !caller) return json({ ok: false, error: 'Not signed in' }, 401);

  const { data: callerProfile } = await callerClient
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .single();

  if (callerProfile?.role !== 'ceo') {
    return json({ ok: false, error: 'Faqat CEO xodimlar hisoblarini boshqara oladi' }, 403);
  }

  const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  const body = await req.json().catch(() => ({}));
  const { action } = body;

  if (action === 'list') {
    const { data: profiles, error } = await admin
      .from('profiles')
      .select('id, full_name, phone, role, is_active, created_at')
      .in('role', ['teacher', 'admin'])
      .order('created_at');
    if (error) return json({ ok: false, error: error.message }, 500);

    // profiles has no email column — pull it from auth alongside.
    const { data: authList, error: authErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authErr) return json({ ok: false, error: authErr.message }, 500);
    const emailById = new Map(authList.users.map(u => [u.id, u.email]));

    const staff = profiles.map(p => ({ ...p, email: emailById.get(p.id) || null }));
    return json({ ok: true, staff });
  }

  if (action === 'create') {
    const { email, password, full_name, phone, role } = body;
    if (!email || !password || !full_name || !role) {
      return json({ ok: false, error: 'email, password, full_name, role talab qilinadi' }, 400);
    }
    if (!['teacher', 'admin'].includes(role)) {
      return json({ ok: false, error: 'role faqat teacher yoki admin bo\'lishi mumkin' }, 400);
    }
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (createError) return json({ ok: false, error: createError.message }, 400);

    const { error: profileError } = await admin.from('profiles').upsert({
      id: created.user.id, full_name, phone: phone || null, role, is_active: true,
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id); // roll back the orphaned auth user
      return json({ ok: false, error: profileError.message }, 500);
    }
    return json({ ok: true, user_id: created.user.id });
  }

  if (action === 'update_profile') {
    const { user_id, full_name, phone, role } = body;
    if (!user_id) return json({ ok: false, error: 'user_id talab qilinadi' }, 400);
    const { error } = await admin.from('profiles').update({ full_name, phone, role }).eq('id', user_id);
    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true });
  }

  if (action === 'reset_password') {
    const { user_id, password } = body;
    if (!user_id || !password) return json({ ok: false, error: 'user_id va password talab qilinadi' }, 400);
    const { error } = await admin.auth.admin.updateUserById(user_id, { password });
    if (error) return json({ ok: false, error: error.message }, 400);
    return json({ ok: true });
  }

  if (action === 'set_active') {
    const { user_id, is_active } = body;
    if (!user_id) return json({ ok: false, error: 'user_id talab qilinadi' }, 400);
    const { error } = await admin.from('profiles').update({ is_active }).eq('id', user_id);
    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true });
  }

  if (action === 'delete') {
    const { user_id } = body;
    if (!user_id) return json({ ok: false, error: 'user_id talab qilinadi' }, 400);
    if (user_id === caller.id) return json({ ok: false, error: 'O\'zingizni o\'chira olmaysiz' }, 400);
    await admin.from('profiles').delete().eq('id', user_id);
    const { error } = await admin.auth.admin.deleteUser(user_id);
    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ ok: false, error: 'Noma\'lum action' }, 400);
});
