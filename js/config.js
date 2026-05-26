// ============================================================
//  config.js — Supabase bağlantısı (tek kaynak)
//  Tüm modüller buradan import eder: import { supabase } from './config.js'
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = 'BURAYA_PROJECT_URL_YAZIN';   // örn: https://lxdtevdm....supabase.co
const SUPABASE_KEY  = 'BURAYA_PUBLISHABLE_KEY_YAZIN'; // sb_publishable_...

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Oturum değişikliklerini dinle (tüm sayfalarda ortak)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Korumalı sayfadaysa login'e yönlendir
    const korumalı = ['ilan-ver.html', 'profil.html', 'mesajlar.html'];
    const sayfa = window.location.pathname.split('/').pop();
    if (korumalı.includes(sayfa)) {
      window.location.href = '/ilan-platformu/giris.html';
    }
  }
});
