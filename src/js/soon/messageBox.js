
export function showMessageBox(id) {
  const box = document.getElementById(id);
  box.style.display = 'block';
  document.body.classList.add('popup-open');
}

export function hideMessageBox(id) {
  const box = document.getElementById(id);
  box.style.display = 'none';
  document.body.classList.remove('popup-open');
}
