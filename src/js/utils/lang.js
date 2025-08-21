let translations = {};
let currentLang = 'de';

export async function loadLanguage(lang) {
  const res = await fetch(`./i18n/${lang}.json`);
  if (!res.ok) {
    console.error(`Language file not found: ${lang}`);
    return;
  }
  translations = await res.json();
  currentLang = lang;
  updateTexts();
}

function t(key) {
  return translations[key] || key;
}

function updateTexts() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
}
