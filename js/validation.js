// ============================================================
//  validation.js — Giriş doğrulama ve temizleme
// ============================================================

// ── HTML taglerini temizle (XSS önlemi) ──────────────────
export function htmlTemizle(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

// ── Metin sınırla ve temizle ─────────────────────────────
export function metinTemizle(str, maxUzunluk = 500) {
  if (!str) return '';
  return String(str).trim().slice(0, maxUzunluk);
}

// ── E-posta doğrula ───────────────────────────────────────
export function epostaGecerliMi(eposta) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta);
}

// ── Telefon doğrula (Türkiye formatı) ────────────────────
export function telefonTemizle(tel) {
  if (!tel) return '';
  // Sadece rakam, +, boşluk, - bırak
  return tel.replace(/[^\d\s\+\-\(\)]/g, '').trim().slice(0, 20);
}

export function telefonGecerliMi(tel) {
  if (!tel) return true; // opsiyonel alan
  const temiz = tel.replace(/[\s\-\(\)]/g, '');
  return /^(\+90|0)?[5][0-9]{9}$/.test(temiz);
}

// ── Fiyat doğrula ────────────────────────────────────────
export function fiyatGecerliMi(fiyat) {
  if (!fiyat && fiyat !== 0) return true; // opsiyonel
  const sayi = parseFloat(fiyat);
  return !isNaN(sayi) && sayi >= 0 && sayi <= 9999999;
}

// ── URL doğrula ───────────────────────────────────────────
export function urlGecerliMi(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

// ── İlan verisi doğrula ───────────────────────────────────
export function ilanDogrula({ kategoriId, baslik, aciklama, fiyat, sehir, ilce }) {
  const hatalar = [];

  if (!kategoriId) {
    hatalar.push('Lütfen bir kategori seçin.');
  }

  const temizBaslik = metinTemizle(baslik, 100);
  if (!temizBaslik) {
    hatalar.push('Başlık zorunludur.');
  } else if (temizBaslik.length < 5) {
    hatalar.push('Başlık en az 5 karakter olmalıdır.');
  }

  const temizAciklama = metinTemizle(aciklama, 2000);
  if (!temizAciklama) {
    hatalar.push('Açıklama zorunludur.');
  } else if (temizAciklama.length < 20) {
    hatalar.push('Açıklama en az 20 karakter olmalıdır.');
  }

  if (fiyat && !fiyatGecerliMi(fiyat)) {
    hatalar.push('Geçersiz fiyat değeri.');
  }

  const temizSehir = metinTemizle(sehir, 50);
  if (!temizSehir) {
    hatalar.push('Şehir zorunludur.');
  }

  return {
    gecerli: hatalar.length === 0,
    hatalar,
    temizVeri: {
      kategoriId,
      baslik:    temizBaslik,
      aciklama:  temizAciklama,
      fiyat:     fiyat ? parseFloat(fiyat) : null,
      sehir:     temizSehir,
      ilce:      metinTemizle(ilce, 50),
    }
  };
}

// ── Kayıt formu doğrula ───────────────────────────────────
export function kayitDogrula({ adSoyad, email, sifre, telefon }) {
  const hatalar = [];

  const temizAd = metinTemizle(adSoyad, 100);
  if (!temizAd) {
    hatalar.push('Ad soyad zorunludur.');
  } else if (temizAd.length < 2) {
    hatalar.push('Ad soyad en az 2 karakter olmalıdır.');
  }

  if (!epostaGecerliMi(email)) {
    hatalar.push('Geçerli bir e-posta adresi girin.');
  }

  if (!sifre || sifre.length < 6) {
    hatalar.push('Şifre en az 6 karakter olmalıdır.');
  }

  if (telefon && !telefonGecerliMi(telefon)) {
    hatalar.push('Geçerli bir telefon numarası girin (örn. 05XX XXX XX XX).');
  }

  return { gecerli: hatalar.length === 0, hatalar };
}

// ── Mesaj doğrula ────────────────────────────────────────
export function mesajDogrula(icerik) {
  const temiz = metinTemizle(icerik, 1000);
  if (!temiz) return { gecerli: false, hata: 'Mesaj boş olamaz.', temiz: '' };
  if (temiz.length < 2) return { gecerli: false, hata: 'Mesaj çok kısa.', temiz: '' };
  return { gecerli: true, hata: null, temiz };
}

// ── Rate limit (basit client-side) ───────────────────────
//    Aynı kullanıcının kısa sürede çok istek atmasını önler
const istemciLimitler = {};
export function istemciRateLimit(anahtar, limitSaniye = 60) {
  const simdi = Date.now();
  const sonIstek = istemciLimitler[anahtar] || 0;
  if (simdi - sonIstek < limitSaniye * 1000) {
    const kalanSaniye = Math.ceil((limitSaniye * 1000 - (simdi - sonIstek)) / 1000);
    return { izinli: false, kalanSaniye };
  }
  istemciLimitler[anahtar] = simdi;
  return { izinli: true, kalanSaniye: 0 };
}
