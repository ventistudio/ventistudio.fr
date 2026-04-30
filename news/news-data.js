const newsData = [
  {
    id: 1,
    title: 'Bienvenue dans VentiStudio v4',
    author: 'Équipe VentiStudio',
    date: '2026-02-12',
    category: 'announcement',
    excerpt: 'Le lancement officiel de VentiStudio v4 avec une nouvelle interface modernisée, des performances améliorées et des fonctionnalités révolutionnaires.',
    content: `
      <p>Nous sommes heureux de vous annoncer le lancement de <strong>VentiStudio v4</strong>, une nouvelle version entièrement revisitée de notre plateforme créative.</p>

      <h3>Principales améliorations :</h3>
      <ul>
        <li>Interface complètement redessinée avec un design glass-morphism moderne</li>
        <li>Performances améliorées de 40%</li>
        <li>Meilleure compatibilité mobile</li>
        <li>Nouveau système d'actualités intégré</li>
        <li>Accessibilité WCAG complète</li>
      </ul>

      <p>Merci à toute la communauté VentiStudio pour votre soutien continu!</p>
    `
  }

];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = newsData;
}
