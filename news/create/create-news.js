// Script pour la page de création de news
document.getElementById('newsForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = {
    title: document.getElementById('newsTitle').value,
    author: document.getElementById('newsAuthor').value,
    date: document.getElementById('newsDate').value || new Date().toISOString().split('T')[0],
    category: document.getElementById('newsCategory').value,
    excerpt: document.getElementById('newsExcerpt').value,
    content: document.getElementById('newsContent').value
  };

  // Générer le code HTML
  const htmlCode = `{
    id: '${Date.now()}',
    title: '${formData.title.replace(/'/g, "\\'")}',
    author: '${formData.author.replace(/'/g, "\\'")}',
    date: '${formData.date}',
    category: '${formData.category}',
    excerpt: '${formData.excerpt.replace(/'/g, "\\'")}',
    content: \`${formData.content.replace(/`/g, '\\`')}\`
  },`;

  // Afficher le code généré
  document.getElementById('generatedCode').textContent = htmlCode;
  document.getElementById('outputSection').style.display = 'block';
  document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
});

// Fonction pour copier le code
function copyToClipboard() {
  const code = document.getElementById('generatedCode').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.querySelector('.btn-copy');
    const originalText = btn.innerText;
    btn.innerText = 'Code copié!';
    setTimeout(() => {
      btn.innerText = originalText;
    }, 2000);
  }).catch(err => {
    alert('Erreur lors de la copie du code');
  });
}
