// ============================================================
//  ilanlar.js — İlan listeleme, filtreleme, oluşturma, güncelleme
// ============================================================

import { supabase } from './config.js';

// ── Temel sorgu (join'li) ─────────────────────────────────
function ilanSorgusu() {
  return supabase
    .from('ilanlar')
    .select(`
      id, baslik, aciklama, fiyat, fiyat_birimi,
      sehir, ilce, durum, goruntuleme, created_at,
      user_id,
      kategoriler ( id, slug, ad, ikon, renk_hex ),
      profiles   ( id, ad_soyad, avatar_url, telefon ),
      ilan_fotograflari ( url, sira )
    `);
}

// ── Aktif ilanları listele (filtreli) ─────────────────────
export async function ilanlariGetir({
  kategoriSlug = null,
  sehir        = null,
  arama        = null,
  sirala       = 'yeni',   // 'yeni' | 'eski' | 'ucuz' | 'pahali'
  limit        = 20,
  offset       = 0
} = {}) {
  let sorgu = ilanSorgusu().eq('durum', 'aktif');

  if (kategoriSlug) {
    // kategori slug'a göre filtre için önce id al
    const { data: kat } = await supabase
      .from('kategoriler')
      .select('id')
      .eq('slug', kategoriSlug)
      .single();
    if (kat) sorgu = sorgu.eq('kategori_id', kat.id);
  }

  if (sehir)  sorgu = sorgu.ilike('sehir', `%${sehir}%`);
  if (arama)  sorgu = sorgu.ilike('baslik', `%${arama}%`);

  // Sıralama
  const siralamaMap = {
    yeni:   { kolon: 'created_at', azalan: true  },
    eski:   { kolon: 'created_at', azalan: false },
    ucuz:   { kolon: 'fiyat',      azalan: false },
    pahali: { kolon: 'fiyat',      azalan: true  }
  };
  const s = siralamaMap[sirala] ?? siralamaMap.yeni;
  sorgu = sorgu.order(s.kolon, { ascending: !s.azalan });

  // Fotoğrafları sıraya göre al
  sorgu = sorgu.order('sira', { referencedTable: 'ilan_fotograflari', ascending: true });

  const { data, error, count } = await sorgu
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data ?? [];
}

// ── Tek ilan getir ────────────────────────────────────────
export async function ilanGetir(id) {
  const { data, error } = await ilanSorgusu()
    .eq('id', id)
    .single();

  if (error) throw error;

  // Görüntüleme sayacını artır (arka planda)
  supabase.rpc('artir_goruntuleme', { p_id: id }).then(() => {});

  return data;
}

// ── Kullanıcının kendi ilanları ───────────────────────────
export async function benimIlanlarim(userId) {
  const { data, error } = await ilanSorgusu()
    .eq('user_id', userId)
    .neq('durum', 'silindi')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── İlan oluştur ──────────────────────────────────────────
export async function ilanOlustur(ilanVerisi) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor.');

  const { data, error } = await supabase
    .from('ilanlar')
    .insert({
      user_id:      user.id,
      kategori_id:  ilanVerisi.kategoriId,
      baslik:       ilanVerisi.baslik,
      aciklama:     ilanVerisi.aciklama,
      fiyat:        ilanVerisi.fiyat || null,
      fiyat_birimi: ilanVerisi.fiyatBirimi || 'TL',
      sehir:        ilanVerisi.sehir,
      ilce:         ilanVerisi.ilce || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── İlan güncelle ─────────────────────────────────────────
export async function ilanGuncelle(id, guncellemeler) {
  const { data, error } = await supabase
    .from('ilanlar')
    .update(guncellemeler)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── İlanı pasife al (soft delete değil, pasif) ───────────
export async function ilanPasifYap(id) {
  return ilanGuncelle(id, { durum: 'pasif' });
}

// ── İlanı sil (soft delete) ───────────────────────────────
export async function ilanSil(id) {
  return ilanGuncelle(id, { durum: 'silindi' });
}

// ── Kategorileri getir ────────────────────────────────────
export async function kategorileriGetir() {
  const { data, error } = await supabase
    .from('kategoriler')
    .select('*')
    .eq('aktif', true)
    .order('sira');

  if (error) throw error;
  return data ?? [];
}

// ── Şehirleri getir (otomatik tamamlama için) ─────────────
export async function sehirleriGetir() {
  const { data, error } = await supabase
    .from('ilanlar')
    .select('sehir')
    .eq('durum', 'aktif');

  if (error) return [];
  const benzersiz = [...new Set(data.map(d => d.sehir).filter(Boolean))].sort();
  return benzersiz;
}
