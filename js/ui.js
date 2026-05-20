// ============================================================
//  ui.js — Toast bildirimleri, spinner, ortak UI yardımcıları
// ============================================================

// ── Toast bildirimi ───────────────────────────────────────
export function toast(metin, tip = 'bilgi', sure = 3500) {
  let konteyner = document.getElementById('toast-konteyner');
  if (!konteyner) {
    konteyner = document.createElement('div');
    konteyner.id = 'toast-konteyner';
    document.body.appendChild(konteyner);
  }
  const el = document.createElement('div');
  el.className = `toast ${tip}`;
  el.textContent = metin;
  konteyner.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(() => el.remove(), 300);
  }, sure);
}

export const toastBasari = (m) => toast(m, 'basari');
export const toastHata   = (m) => toast(m, 'hata');
export const toastBilgi  = (m) => toast(m, 'bilgi');

// ── Yükleniyor spinner ────────────────────────────────────
export function spinnerGoster(hedefId) {
  const el = document.getElementById(hedefId);
  if (!el) return;
  el.innerHTML = '<div class="yukleniyor-spinner"></div>';
}

export function spinnerGizle(hedefId, html = '') {
  const el = document.getElementById(hedefId);
  if (el) el.innerHTML = html;
}

// ── Buton yükleniyor durumu ───────────────────────────────
export function btnYukleniyor(btn, yukleniyor, asılMetin) {
  btn.disabled = yukleniyor;
  btn.textContent = yukleniyor ? 'Lütfen bekleyin...' : asılMetin;
}

// ── Boş durum göster ─────────────────────────────────────
export function bosDurumGoster(hedefId, { ikon = '🔍', baslik, aciklama, btnMetin, btnHref } = {}) {
  const el = document.getElementById(hedefId);
  if (!el) return;
  el.innerHTML = `
    <div class="bos-durum">
      <div class="bos-durum-ikon">${ikon}</div>
      <h3>${baslik ?? 'Sonuç bulunamadı'}</h3>
      ${aciklama ? `<p>${aciklama}</p>` : ''}
      ${btnMetin && btnHref ? `<a href="${btnHref}" class="btn-birincil" style="margin-top:1rem;display:inline-flex">${btnMetin}</a>` : ''}
    </div>
  `;
}

// ── Fiyat formatla ────────────────────────────────────────
export function fiyatFormatla(fiyat, birim = 'TL') {
  if (!fiyat) return 'Fiyat sorulur';
  return `${Number(fiyat).toLocaleString('tr-TR')} ${birim}`;
}

// ── Tarih formatla ────────────────────────────────────────
export function tarihFormatla(tarihStr) {
  const tarih = new Date(tarihStr);
  const simdi  = new Date();
  const fark   = simdi - tarih;
  const dakika = Math.floor(fark / 60000);
  const saat   = Math.floor(fark / 3600000);
  const gun    = Math.floor(fark / 86400000);
  if (dakika < 1)  return 'Az önce';
  if (dakika < 60) return `${dakika} dakika önce`;
  if (saat < 24)   return `${saat} saat önce`;
  if (gun < 7)     return `${gun} gün önce`;
  return tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── URL parametre al ──────────────────────────────────────
export function urlParam(isim) {
  return new URLSearchParams(window.location.search).get(isim);
}

// ── İlan kartı HTML'i oluştur ─────────────────────────────
export function ilanKartHTML(ilan) {
  const fotograf = ilan.ilan_fotograflari?.[0]?.url;
  const fiyatMetin = fiyatFormatla(ilan.fiyat, ilan.fiyat_birimi);
  return `
    <a href="/ilan-detay.html?id=${ilan.id}" class="kart ilan-kart">
      <div class="ilan-kart-fotograf">
        ${fotograf
          ? `<img src="${fotograf}" alt="${ilan.baslik}" loading="lazy" />`
          : `<div class="ilan-kart-fotograf-yok">${ilan.kategoriler?.ikon ?? '📋'}</div>`
        }
      </div>
      <div class="ilan-kart-icerik">
        <div class="ilan-kart-kategori">${ilan.kategoriler?.ad ?? ''}</div>
        <div class="ilan-kart-baslik">${ilan.baslik}</div>
        <div class="ilan-kart-meta">
          <span class="ilan-kart-fiyat">${fiyatMetin}</span>
          <span class="ilan-kart-sehir">📍 ${ilan.sehir}</span>
        </div>
      </div>
    </a>
  `;
}
