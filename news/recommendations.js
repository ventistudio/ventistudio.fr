class RecommendationEngine {
  constructor(newsData) {
    this.newsData = newsData || [];
    this.viewTracking = this.loadViewTracking();
  }

  loadViewTracking() {
    const data = localStorage.getItem('ventistudio_view_tracking');
    return data ? JSON.parse(data) : {};
  }

  saveViewTracking() {
    localStorage.setItem('ventistudio_view_tracking', JSON.stringify(this.viewTracking));
  }

  trackView(newsId, category) {
    if (!this.viewTracking[category]) {
      this.viewTracking[category] = 0;
    }
    this.viewTracking[category]++;
    this.saveViewTracking();
  }


  getRelated(currentNewsId, limit = 3) {
    const current = this.newsData.find(n => n.id === currentNewsId);
    if (!current) return [];

    return this.newsData
      .filter(n => n.id !== currentNewsId && n.category === current.category)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }


  getPopular(limit = 5) {
    return this.newsData
      .sort((a, b) => {
        const viewsA = this.viewTracking[a.id] || 0;
        const viewsB = this.viewTracking[b.id] || 0;
        return viewsB - viewsA;
      })
      .slice(0, limit);
  }


  getLatest(limit = 5, exclude = null) {
    return this.newsData
      .filter(n => n.id !== exclude)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }


  getSmart(currentNewsId, limit = 4) {
    const current = this.newsData.find(n => n.id === currentNewsId);
    if (!current) return [];


    const sameCat = this.getRelated(currentNewsId, Math.ceil(limit * 0.6));
    const popular = this.getPopular(Math.ceil(limit * 0.4)).filter(n => n.id !== currentNewsId);

    return [...sameCat, ...popular].slice(0, limit);
  }


  getByTags(tags, limit = 5, exclude = null) {
    return this.newsData
      .filter(n => n.id !== exclude && n.tags && n.tags.some(t => tags.includes(t)))
      .sort((a, b) => {
        const matchesA = a.tags ? a.tags.filter(t => tags.includes(t)).length : 0;
        const matchesB = b.tags ? b.tags.filter(t => tags.includes(t)).length : 0;
        return matchesB - matchesA;
      })
      .slice(0, limit);
  }


  getPersonalized(userPreferences = {}, limit = 5) {
    const preferences = {
      categories: userPreferences.categories || [],
      authors: userPreferences.authors || [],
      tags: userPreferences.tags || [],
      recency_weight: userPreferences.recency_weight || 0.3
    };

    return this.newsData
      .map(news => ({
        news: news,
        score: this.calculateScore(news, preferences)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.news)
      .slice(0, limit);
  }

  calculateScore(news, preferences) {
    let score = 0;

    if (preferences.categories.includes(news.category)) {
      score += 3;
    }

    if (preferences.authors.includes(news.author)) {
      score += 2;
    }

    if (news.tags && preferences.tags.length > 0) {
      const matches = news.tags.filter(tag => preferences.tags.includes(tag)).length;
      score += matches * 2;
    }


    const daysSince = Math.floor((Date.now() - new Date(news.date)) / (1000 * 60 * 60 * 24));
    if (daysSince < 7) {
      score += 1.5 * preferences.recency_weight;
    }

    const views = this.viewTracking[news.id] || 0;
    score += Math.log(views + 1) * 0.5;

    return score;
  }


  getTrending(limit = 5) {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return this.newsData
      .filter(n => new Date(n.date) > monthAgo)
      .map(n => ({
        news: n,
        views: this.viewTracking[n.id] || 0
      }))
      .sort((a, b) => b.views - a.views)
      .map(item => item.news)
      .slice(0, limit);
  }

  getStats() {
    return {
      total_news: this.newsData.length,
      total_views: Object.values(this.viewTracking).reduce((a, b) => a + b, 0),
      category_breakdown: this.getCategoryStats(),
      most_viewed: this.getMostViewed(1)[0]
    };
  }

  getCategoryStats() {
    const stats = {};
    this.newsData.forEach(news => {
      if (!stats[news.category]) {
        stats[news.category] = { count: 0, views: 0 };
      }
      stats[news.category].count++;
      stats[news.category].views += this.viewTracking[news.id] || 0;
    });
    return stats;
  }

  getMostViewed(limit = 5) {
    return this.newsData
      .map(n => ({
        ...n,
        views: this.viewTracking[n.id] || 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }
}

window.RecommendationEngine = RecommendationEngine;
