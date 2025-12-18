# VentiStudio v6 - Refonte Complète

## 🎯 Objectifs v6

### Performance
- Lighthouse Score: 95+
- FCP < 1.5s
- LCP < 2.5s
- CLS < 0.1
- Mobile-first responsive

### Accessibilité
- WCAG 2.1 Level AA
- Keyboard navigation
- Screen reader support
- Contrast ratio 4.5:1+
- ARIA labels & descriptions

### SEO
- Meta tags (title, description)
- Open Graph tags
- JSON-LD structured data
- XML sitemap
- Canonical links

### Fonctionnalités
- PWA support (service worker)
- Contact form (working)
- Portfolio grid
- Team showcase
- Smooth animations

---

## 📁 Structure Fichiers v6

```
ventistudio.fr/
├── index.html                    # Landing page
├── studio.html                   # Studio page
├── services.html                 # Services page
├── projects.html                 # Portfolio page
├── contact.html                  # Contact form
├── team.html                     # Team page
├── legal.html                    # Legal pages
│
├── css/
│   ├── base.css                 # Design system + variables
│   ├── components.css           # Reusable components
│   ├── layout.css               # Grid & responsive
│   └── animations.css           # Keyframes
│
├── js/
│   ├── app.js                   # Main controller
│   ├── animations.js            # Intersection Observer
│   ├── forms.js                 # Form validation
│   └── service-worker.js        # PWA support
│
├── assets/
│   ├── images/                  # Optimized images
│   ├── videos/                  # Video content
│   ├── fonts/                   # Custom fonts
│   ├── data/                    # JSON data
│   │   ├── projects.json
│   │   ├── team.json
│   │   └── services.json
│   └── favicons/                # Favicon files
│
├── docs/                        # Documentation
│   ├── V6-REFONTE.md           # This file
│   ├── IMPLEMENTATION.md
│   └── ARCHITECTURE.md
│
├── v5-archive/                  # v5 backup
│   ├── index-v5.html
│   └── sitemap-v5.xml
│
├── .htaccess                    # Server config
├── robots.txt                   # SEO
├── manifest.json                # PWA
├── sitemap.xml                  # XML sitemap
├── DEPLOYMENT-CHECKLIST-V6.md  # Deployment guide
└── README.md                    # Project readme
```

---

## 🎨 Design System

### Colors (CSS Variables)
```css
/* Primary */
--color-primary: #2b7a78
--color-primary-dark: #1e5c5a
--color-primary-light: #4a9d9a

/* Accent */
--color-accent: #d4a574
--color-accent-dark: #b8905f

/* Neutral */
--color-text: #1a1a1a
--color-text-light: #666666
--color-bg: #ffffff
--color-bg-light: #f5f5f5

/* Feedback */
--color-success: #28a745
--color-warning: #ffc107
--color-error: #dc3545
```

### Typography
```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif

/* Sizes */
--fs-h1: 2.5rem    /* 40px */
--fs-h2: 2rem      /* 32px */
--fs-h3: 1.5rem    /* 24px */
--fs-body: 1rem    /* 16px */
--fs-small: 0.875rem /* 14px */

/* Weight */
--fw-normal: 400
--fw-medium: 500
--fw-bold: 700
```

### Spacing (8px base)
```css
--space-xs: 0.25rem   /* 4px */
--space-sm: 0.5rem    /* 8px */
--space-md: 1rem      /* 16px */
--space-lg: 1.5rem    /* 24px */
--space-xl: 2rem      /* 32px */
--space-2xl: 3rem     /* 48px */
```

---

## 🔧 Développement

### Local Setup
```bash
# Clone repo
git clone https://github.com/ventistudio/ventistudio.fr.git
cd ventistudio.fr

# Checkout feature branch
git checkout feature/v6-refonte

# Start local server
python3 -m http.server 8000
# Visit: http://localhost:8000
```

### File Modifications

Each HTML page should:
1. Include meta tags (title, description, og:*)
2. Link CSS files in order: base → components → layout → animations
3. Load JS files at end: app → animations → forms
4. Use semantic HTML5 elements
5. Include ARIA labels

### CSS Naming Convention
```css
/* Block Element Modifier (BEM) */
.card { }
.card__header { }
.card__body { }
.card__footer { }
.card--featured { }
.card--small { }
```

### JavaScript Structure
```javascript
// app.js - Main controller
const App = {
  init() { },
  handleNav() { },
  handleScroll() { }
}

// animations.js - Intersection Observer
const Animations = {
  observeElements() { },
  animateOnScroll() { }
}

// forms.js - Form validation
const Forms = {
  validateEmail() { },
  submitForm() { }
}
```

---

## 📊 Performance Optimization

### Images
- Format: WebP with JPEG fallback
- Sizes: 1920px, 1280px, 640px, 320px
- Quality: 80 (WebP)
- Max file: 100KB
- Use `<picture>` for responsive images

### CSS
- Minified in production
- No unused CSS (CSS Purge)
- Mobile-first approach
- CSS variables for maintainability

### JavaScript
- Minified in production
- Deferred loading (defer attribute)
- No blocking scripts
- Service worker for caching

### Fonts
- System font stack preferred
- If custom: @font-face with woff2
- font-display: swap
- Load only necessary weights

---

## ♿ Accessibility

### HTML Structure
```html
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/studio">Studio</a></li>
    </ul>
  </nav>
</header>

<main>
  <section aria-label="Hero">
    <!-- content -->
  </section>
</main>

<footer>
  <!-- content -->
</footer>
```

### Form Labels
```html
<label for="email">Email Address:</label>
<input id="email" type="email" required>

<!-- or -->
<label>
  Email Address:
  <input type="email" required>
</label>
```

### Images Alt Text
```html
<img src="hero.webp" alt="VentiStudio creative team at work" />
```

### Color Contrast
- Normal text: 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum
- Use tools: WebAIM Contrast Checker

---

## 🔍 SEO Checklist

Every page should have:

```html
<!-- Meta Tags -->
<title>Page Title | VentiStudio</title>
<meta name="description" content="Page description (160 chars)">

<!-- Open Graph -->
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://...">
<meta property="og:url" content="https://ventistudio.fr/page">

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VentiStudio",
  "url": "https://ventistudio.fr",
  "logo": "https://ventistudio.fr/logo.png"
}
</script>

<!-- Canonical -->
<link rel="canonical" href="https://ventistudio.fr/page">
```

---

## 🧪 Testing

### Lighthouse Audit
```bash
lighthouse https://ventistudio.fr --view
```
Target: All scores 95+

### Accessibility Audit
```bash
# Using WAVE or axe DevTools Chrome extension
# Check for: contrast, keyboard nav, labels, ARIA
```

### Responsive Testing
- Chrome DevTools: Toggle device toolbar
- Mobile: 320px, 480px
- Tablet: 768px
- Desktop: 1920px

### Cross-Browser
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## 📝 Data Format

### projects.json
```json
[
  {
    "id": "project-1",
    "title": "Project Name",
    "description": "Short description",
    "category": "web|graphic|video",
    "image": "/assets/images/project-1.webp",
    "link": "https://project-url.com",
    "year": 2025
  }
]
```

### team.json
```json
[
  {
    "id": "member-1",
    "name": "Name",
    "role": "Creative Director",
    "bio": "Short bio",
    "image": "/assets/images/team-member.webp",
    "social": {
      "twitter": "https://twitter.com/user",
      "linkedin": "https://linkedin.com/in/user"
    }
  }
]
```

---

## 🚀 Deployment

See `DEPLOYMENT-CHECKLIST-V6.md` for complete guide.

Quick steps:
1. Push to `feature/v6-refonte`
2. Create PR to `main`
3. Pass all checks (Lighthouse CI, GitHub Actions)
4. Merge to `main`
5. GitHub Actions auto-deploys
6. Verify on https://ventistudio.fr

---

## 📞 Contact

**Team:**
- Lùka (Design): @lukaguyonvarch
- Venti (Dev): @ventidev
- Hikari (Product): @hikariumaishi

**Support:** support@ventistudio.fr

---

**Version**: v6.0.0  
**Branch**: feature/v6-refonte  
**Status**: Active Development  
