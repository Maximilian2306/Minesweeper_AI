let translations = {};
let currentLang = 'de';

export async function loadLanguage(lang) {
  const response = await fetch(`./src/i18n/${lang}.json`);
  translations = await response.json();
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
