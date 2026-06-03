// ============================================================
//  auth.js — Kayıt, giriş, çıkış, oturum kontrolü
// ============================================================

import { supabase } from './config.js';

// ── Kayıt ol ─────────────────────────────────────────────
export async function kayitOl({ email, sifre, adSoyad, telefon, sehir }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: sifre,
    options: {
      data: { ad_soyad: adSoyad, telefon, sehir }
    }
  });

  if (error) throw error;
  return data;
}

// ── Giriş yap ────────────────────────────────────────────
export async function girisYap({ email, sifre }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: sifre
  });

  if (error) throw error;
  return data;
}

// ── Çıkış yap ────────────────────────────────────────────
export async function cikisYap() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.href = '/ilan-platformu/index.html';
}

// ── Mevcut kullanıcıyı al ────────────────────────────────
export async function mevcutKullanici() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Mevcut oturumu al ────────────────────────────────────
export async function mevcutOturum() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Profil bilgilerini al ────────────────────────────────
export async function profilAl(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// ── Profil güncelle ──────────────────────────────────────
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

// ── Şifre sıfırlama maili ────────────────────────────────
export async function sifreSifirla(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/ilan-platformu/giris.html?mod=sifre-guncelle`
  });
  if (error) throw error;
}

// ── Yeni şifre belirle (reset linkten sonra) ────────────
export async function sifreGuncelle(yeniSifre) {
  const { error } = await supabase.auth.updateUser({ password: yeniSifre });
  if (error) throw error;
}

// ── Navbar'ı oturuma göre güncelle ──────────────────────
//    Her sayfanın altında çağrılır: navbarGuncelle()
export async function navbarGuncelle() {
  const kullanici = await mevcutKullanici();
  const loginBtn  = document.getElementById('nav-giris');
  const userMenu  = document.getElementById('nav-kullanici');
  const userAd    = document.getElementById('nav-kullanici-ad');

  if (!loginBtn || !userMenu) return;

  if (kullanici) {
    loginBtn.classList.add('gizli');
    userMenu.classList.remove('gizli');
    if (userAd) {
      const profil = await profilAl(kullanici.id);
      userAd.textContent = profil?.ad_soyad?.split(' ')[0] ?? 'Hesabım';
    }
  } else {
    loginBtn.classList.remove('gizli');
    userMenu.classList.add('gizli');
  }
}
