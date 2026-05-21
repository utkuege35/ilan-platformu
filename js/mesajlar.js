// ============================================================
//  mesajlar.js — Konuşma listesi, mesajlar, realtime
// ============================================================

import { supabase } from './config.js';

// ── Kullanıcının konuşmalarını getir ─────────────────────
export async function konusmalariGetir(userId) {
  const { data, error } = await supabase
    .from('konusmalar')
    .select(`
      id, son_mesaj, okunmadi, updated_at,
      ilan_id,
      ilanlar ( id, baslik, kategoriler ( ikon, ad ) ),
      ilan_sahibi_profil:profiles!konusmalar_ilan_sahibi_fkey ( id, ad_soyad, avatar_url ),
      mesajci_profil:profiles!konusmalar_mesajci_fkey ( id, ad_soyad, avatar_url )
    `)
    .or(`ilan_sahibi.eq.${userId},mesajci.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Tek konuşmanın mesajlarını getir ─────────────────────
export async function mesajlariGetir(konusmaId) {
  const { data, error } = await supabase
    .from('mesajlar')
    .select(`
      id, icerik, okundu, created_at,
      gonderen_id,
      profiles ( ad_soyad, avatar_url )
    `)
    .eq('konusma_id', konusmaId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ── Mesaj gönder ─────────────────────────────────────────
export async function mesajGonder(konusmaId, gonderenId, icerik) {
  const { data, error } = await supabase
    .from('mesajlar')
    .insert({ konusma_id: konusmaId, gonderen_id: gonderenId, icerik })
    .select()
    .single();

  if (error) throw error;

  // Konuşmanın son_mesaj ve updated_at güncelle
  await supabase
    .from('konusmalar')
    .update({ son_mesaj: icerik })
    .eq('id', konusmaId);

  return data;
}

// ── Mesajları okundu yap ─────────────────────────────────
export async function okunduYap(konusmaId, userId) {
  await supabase
    .from('mesajlar')
    .update({ okundu: true })
    .eq('konusma_id', konusmaId)
    .neq('gonderen_id', userId);

  await supabase
    .from('konusmalar')
    .update({ okunmadi: 0 })
    .eq('id', konusmaId);
}

// ── Realtime mesaj dinleyici ─────────────────────────────
export function mesajlariDinle(konusmaId, callback) {
  const kanal = supabase
    .channel(`mesajlar:${konusmaId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mesajlar',
        filter: `konusma_id=eq.${konusmaId}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return kanal; // temizlemek için: supabase.removeChannel(kanal)
}
