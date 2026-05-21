// ============================================================
//  profil.js — Profil görüntüleme ve güncelleme
// ============================================================

import { supabase } from './config.js';

// ── Profil getir ─────────────────────────────────────────
export async function profilGetir(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// ── Profil güncelle ───────────────────────────────────────
export async function profilGuncelle(userId, guncellemeler) {
  const { data, error } = await supabase
    .from('profiles')
    .update(guncellemeler)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Avatar yükle ──────────────────────────────────────────
export async function avatarYukle(userId, dosya) {
  const uzanti = dosya.name.split('.').pop();
  const yol    = `${userId}/avatar.${uzanti}`;

  const { error: yukErr } = await supabase.storage
    .from('ilan-fotograflari')
    .upload(yol, dosya, { upsert: true });
  if (yukErr) throw yukErr;

  const { data } = supabase.storage.from('ilan-fotograflari').getPublicUrl(yol);
  const avatarUrl = data.publicUrl + '?t=' + Date.now(); // cache bust

  await profilGuncelle(userId, { avatar_url: avatarUrl });
  return avatarUrl;
}
