// ============================================================
//  tema.js — Dark / Light mod yönetimi
// ============================================================

const ANAHTAR = 'tema-tercihi';

// Kaydedilmiş temayı uygula (sayfa yüklenince titreşimi önler)
export function temaUygula() {
  const kayitli = localStorage.getItem(ANAHTAR);
  const sistem  = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const tema    = kayitli ?? sistem;
  document.documentElement.setAttribute('data-tema', tema);
  return tema;
}

// Toggle yap ve kaydet
export function temaDegistir() {
  const simdiki = document.documentElement.getAttribute('data-tema');
  const yeni    = simdiki === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-tema', yeni);
  localStorage.setItem(ANAHTAR, yeni);
  return yeni;
}

// Navbar'a toggle butonu ekle
export function temaButonuEkle() {
  const saglar = document.querySelector('.navbar-saglar');
  if (!saglar || document.getElementById('tema-toggle-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'tema-toggle-btn';
  btn.className = 'tema-toggle';
  btn.title = 'Temayı değiştir';
  btn.setAttribute('aria-label', 'Temayı değiştir');

  function ikonGuncelle() {
    const dark = document.documentElement.getAttribute('data-tema') === 'dark';
    btn.textContent = dark ? '☀️' : '🌙';
  }

  ikonGuncelle();
  btn.addEventListener('click', () => {
    temaDegistir();
    ikonGuncelle();
  });

  // Buton navbar'ın en soluna eklensin (diğer butonlardan önce)
  saglar.insertBefore(btn, saglar.firstChild);
}

// Tek satırda başlat
export function temaBaslat() {
  temaUygula();
  // DOM hazır olunca butonu ekle
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', temaButonuEkle);
  } else {
    temaButonuEkle();
  }
}
