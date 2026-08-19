import { supabase, supabaseEnabled } from './supabaseClient.js';

// Branches are the first table wired to real data — small, no auth-gated
// joins, and both the group form and student form already read from it.
// Students/groups/attendance stay on demo data until Supabase Auth +
// per-role RLS testing is done (needs real staff accounts, not just a
// demo account-picker).

export async function fetchBranches() {
  if (!supabaseEnabled) return null; // caller keeps using seed data
  const { data, error } = await supabase.from('branches').select('id,name,city,address').order('created_at');
  if (error) { console.error('fetchBranches failed:', error.message); return null; }
  return data;
}

export async function upsertBranch(id, form) {
  if (!supabaseEnabled) return null;
  if (id) {
    const { data, error } = await supabase.from('branches').update(form).eq('id', id).select().single();
    if (error) { console.error('updateBranch failed:', error.message); return null; }
    return data;
  }
  const { data, error } = await supabase.from('branches').insert(form).select().single();
  if (error) { console.error('insertBranch failed:', error.message); return null; }
  return data;
}

export async function deleteBranchRemote(id) {
  if (!supabaseEnabled) return false;
  const { error } = await supabase.from('branches').delete().eq('id', id);
  if (error) { console.error('deleteBranch failed:', error.message); return false; }
  return true;
}
