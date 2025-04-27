document.addEventListener('DOMContentLoaded', () => {
    const detectedCountry = localStorage.getItem('detectedCountry');
    if (detectedCountry) {
        const messageElement = document.querySelector('.restricted-message');
        if (messageElement) {
            messageElement.textContent += ` Pays détecté : ${detectedCountry}`;
        }
    }
});