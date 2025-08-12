export function closePopup(id) {
    const popup = document.getElementById(id);
    if (popup) {
        popup.style.display = 'none';
        document.body.classList.remove('popup-open');
    }
}

export function openPopup(id, displayType, bodyClass) {
  const popup = document.getElementById(id);
  if (popup) {
    popup.style.display = displayType || 'block';
    if (bodyClass) {
      document.body.classList.add('popup-open');
    }
  }
}