const COMMENTS_STORAGE_KEY = 'ventistudio_comments';
const COMMENT_MODERATION_KEY = 'ventistudio_pending_comments';

class CommentSystem {
  constructor() {
    this.comments = this.loadComments();
    this.pendingComments = this.loadPendingComments();
  }

  loadComments() {
    const data = localStorage.getItem(COMMENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  loadPendingComments() {
    const data = localStorage.getItem(COMMENT_MODERATION_KEY);
    return data ? JSON.parse(data) : {};
  }

  saveComments() {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(this.comments));
  }

  savePendingComments() {
    localStorage.setItem(COMMENT_MODERATION_KEY, JSON.stringify(this.pendingComments));
  }

  addComment(newsId, author, email, content, rating = 5) {
    if (!content || content.length < 5) {
      return { success: false, message: '❌ Le commentaire doit faire au moins 5 caractères' };
    }


    const clerkUser = window.Clerk?.user;

    if (!clerkUser) {

      if (!author || !email) {
        return { success: false, message: '❌ Tous les champs sont requis' };
      }
      if (!this.isValidEmail(email)) {
        return { success: false, message: '❌ Email invalide' };
      }
    }

    if (!this.comments[newsId]) {
      this.comments[newsId] = [];
    }

    const comment = {
      id: Date.now(),
      author: this.sanitize(author),
      email: email,
      content: this.sanitize(content),
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      date: new Date().toISOString(),
      approved: false,
      likes: 0,
      replies: []
    };


    if (!this.pendingComments[newsId]) {
      this.pendingComments[newsId] = [];
    }
    this.pendingComments[newsId].push(comment);
    this.savePendingComments();

    return {
      success: true,
      message: '✅ Commentaire envoyé! En attente de modération.',
      commentId: comment.id
    };
  }

  approveComment(newsId, commentId) {
    if (!this.pendingComments[newsId]) return false;

    const comment = this.pendingComments[newsId].find(c => c.id === commentId);
    if (!comment) return false;

    comment.approved = true;

    if (!this.comments[newsId]) {
      this.comments[newsId] = [];
    }
    this.comments[newsId].push(comment);

    this.pendingComments[newsId] = this.pendingComments[newsId].filter(c => c.id !== commentId);

    this.saveComments();
    this.savePendingComments();
    return true;
  }

  rejectComment(newsId, commentId) {
    if (!this.pendingComments[newsId]) return false;

    this.pendingComments[newsId] = this.pendingComments[newsId].filter(c => c.id !== commentId);
    this.savePendingComments();
    return true;
  }

  getComments(newsId) {
    const comments = this.comments[newsId] || [];
    return comments
      .filter(c => c.approved)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getCommentsCount(newsId) {
    return (this.comments[newsId] || []).filter(c => c.approved).length;
  }

  getPendingComments() {
    const pending = {};
    for (const [newsId, comments] of Object.entries(this.pendingComments)) {
      pending[newsId] = comments.filter(c => !c.approved);
    }
    return pending;
  }

  deleteComment(newsId, commentId) {
    if (this.comments[newsId]) {
      this.comments[newsId] = this.comments[newsId].filter(c => c.id !== commentId);
      this.saveComments();
      return true;
    }
    return false;
  }

  likeComment(newsId, commentId) {
    if (this.comments[newsId]) {
      const comment = this.comments[newsId].find(c => c.id === commentId);
      if (comment) {
        comment.likes = (comment.likes || 0) + 1;
        this.saveComments();
        return true;
      }
    }
    return false;
  }

  getAverageRating(newsId) {
    const comments = this.comments[newsId] || [];
    if (comments.length === 0) return 0;
    const sum = comments.reduce((acc, c) => acc + (c.rating || 5), 0);
    return (sum / comments.length).toFixed(1);
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  sanitize(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  exportComments() {
    return {
      export_date: new Date().toISOString(),
      total_comments: Object.values(this.comments).reduce((a, b) => a + b.length, 0),
      pending_moderation: Object.values(this.pendingComments).reduce((a, b) => a + b.length, 0),
      comments: this.comments
    };
  }
}

const commentSystem = new CommentSystem();

function renderComment(comment) {
  const stars = '⭐'.repeat(comment.rating);
  return `
    <div class="comment-item" data-comment-id="${comment.id}">
      <div class="comment-header">
        <strong>${comment.author}</strong>
        <span class="comment-date">${new Date(comment.date).toLocaleDateString('fr-FR')}</span>
        <span class="comment-rating">${stars}</span>
      </div>
      <div class="comment-content">${comment.content}</div>
      <div class="comment-actions">
        <button class="btn-like" onclick="commentSystem.likeComment(this.dataset.newsId, ${comment.id})">
          👍 ${comment.likes || 0}
        </button>
      </div>
    </div>
  `;
}

window.CommentSystem = CommentSystem;
window.commentSystem = commentSystem;
