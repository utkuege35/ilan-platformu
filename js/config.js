// ============================================================
//  config.js — Supabase bağlantısı (tek kaynak)
//  Tüm modüller buradan import eder: import { supabase } from './config.js'
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = 'https://lxdtevdmdaohbuuodzio.supabase.co';   // örn: https://lxdtevdm....supabase.co
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHRldmRtZGFvaGJ1dW9kemlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODIyMzAsImV4cCI6MjA5NDg1ODIzMH0.t_pV5zqWb2OQQdE6gFDRinOdNwyDQu2sdvUCqOH5X5g'; // sb_publishable_...

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Oturum değişikliklerini dinle (tüm sayfalarda ortak)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Korumalı sayfadaysa login'e yönlendir
    const korumalı = ['ilan-ver.html', 'profil.html', 'mesajlar.html'];
    const sayfa = window.location.pathname.split('/').pop();
    if (korumalı.includes(sayfa)) {
      window.location.href = 'giris.html';
    }
  }
});
