// JS VentiStudio

// Theme toggle
const toggleTheme = () => {
  const html = document.documentElement;
  const isLight = html.getAttribute("data-theme") === "light";
  html.setAttribute("data-theme", isLight ? "dark" : "light");
  document.getElementById("theme-toggle").textContent = isLight ? "🌙" : "🌞";
};
document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

// Language selector (placeholder for actual i18n integration)
document.querySelector(".language-selector select").addEventListener("change", (e) => {
  const lang = e.target.value;
  alert("Language set to: " + lang + " (fonction à implémenter)");
});
