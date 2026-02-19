document.addEventListener('DOMContentLoaded', () => {
  const detectedCountry = localStorage.getItem('detectedCountry');
  if (detectedCountry) {
    const container = document.getElementById('geo-detected');
    const value = document.getElementById('detected-country');
    if (container && value) {
      value.textContent = detectedCountry;
      container.classList.add('visible');
    }
  }

  // Highlight matching country card if detected
  const code = localStorage.getItem('detectedCountryCode');
  if (code) {
    const card = document.querySelector(`.country-card[data-country="${code.toUpperCase()}"]`);
    if (card) {
      card.style.borderColor = 'var(--accent)';
      card.style.boxShadow = '0 0 16px var(--glass-shadow)';
    }
  }
});