# ✅ CHECKLIST DE DÉPLOIEMENT V6 – VentiStudio.fr

**Destinataire**: Équipe VentiStudio  
**Date**: 19 décembre 2025  
**Durée estimée**: 2-3 jours  
**URL Repo**: https://github.com/ventistudio/ventistudio.fr  

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Jour 1: Préparation

- [ ] **Git Setup**
  - [ ] Clone repo: `git clone https://github.com/ventistudio/ventistudio.fr.git`
  - [ ] Naviguez: `cd ventistudio.fr`
  - [ ] Vérifiez main: `git checkout main && git pull`

- [ ] **Branche Feature Créée** ✅ FAIT
  - [ ] Branch créée: `feature/v6-refonte`
  - [ ] URL: https://github.com/ventistudio/ventistudio.fr/tree/feature/v6-refonte
  - [ ] Status: Ready for development

- [ ] **Archiver v5**
  - [ ] Créer dossier: `mkdir -p v5-archive`
  - [ ] Copier `index.html` → `v5-archive/index-v5.html`
  - [ ] Copier `sitemap.xml` → `v5-archive/sitemap-v5.xml`
  - [ ] Créer `v5-archive/README.md` avec notice d'archivage
  - [ ] Commit: `git add v5-archive/ && git commit -m "archive: backup v5"`

- [ ] **Créer structure dossiers**
  - [ ] `mkdir -p css js assets/{images,videos,fonts,data,favicons} docs v6-files`
  - [ ] Vérifier structure créée

---

### Jour 2: Structure & Fichiers HTML

- [ ] **HTML Pages**
  - [ ] Créer/Mettre à jour `index.html` (landing page v6)
  - [ ] Créer `studio.html` (page studio)
  - [ ] Créer `services.html` (services offerts)
  - [ ] Créer `projects.html` (portfolio)
  - [ ] Créer `contact.html` (formulaire contact)
  - [ ] Créer `team.html` (équipe)
  - [ ] Créer `legal.html` (mentions légales)

- [ ] **CSS Files**
  - [ ] Créer `css/base.css` (design system + variables)
  - [ ] Créer `css/components.css` (buttons, cards, forms)
  - [ ] Créer `css/layout.css` (grid, responsive)
  - [ ] Créer `css/animations.css` (keyframes, transitions)
  - [ ] Vérifier imports dans index.html

- [ ] **JavaScript Files**
  - [ ] Créer `js/app.js` (contrôleur principal)
  - [ ] Créer `js/animations.js` (Intersection Observer)
  - [ ] Créer `js/forms.js` (validation, soumission)
  - [ ] Créer `js/service-worker.js` (PWA support)
  - [ ] Vérifier scripts chargés en main

- [ ] **Configuration Files**
  - [ ] Mettre à jour `.htaccess` (headers, caching, HTTPS redirect)
  - [ ] Mettre à jour `robots.txt` (sitemap, crawl rules)
  - [ ] Mettre à jour `manifest.json` (PWA config)
  - [ ] Créer `sitemap.xml` (nouvelle structure v6)
  - [ ] Test: `curl -I https://ventistudio.fr/robots.txt`

- [ ] **Documentation**
  - [ ] Créer `docs/V6-REFONTE.md` (vue d'ensemble)
  - [ ] Créer `docs/IMPLEMENTATION.md` (détails techniques)
  - [ ] Créer `docs/ARCHITECTURE.md` (structure globale)
  - [ ] Mettre à jour `README.md` (point d'entrée)
  - [ ] Créer `CHANGELOG.md` (v5 → v6 changes)
  - [ ] Créer `V6-DEPLOYMENT-PLAN.md` (PR template)

- [ ] **GitHub Actions**
  - [ ] Créer `.github/workflows/lighthouse-ci.yml`
  - [ ] Créer `.github/workflows/deploy.yml`
  - [ ] Vérifier permissions workflows

---

### Jour 2-3: Assets & Data

- [ ] **Images Optimization**
  - [ ] Hero image (1920x1080): WebP + JPEG fallback
  - [ ] Project images (6+ projets): optimisés 1920/1280/640/320px
  - [ ] Team avatars (4 membres): 400x400 optimisés
  - [ ] SVG icons: réutilisables, <10KB chaque
  - [ ] Vérifier: tous les fichiers < 100KB
  - [ ] Format: JPG → WebP (quality 80)

- [ ] **Favicons & Branding**
  - [ ] Générer: favicon.ico, .png, .webp, .svg
  - [ ] Installer dans `assets/favicons/`
  - [ ] Test: Vérifier affichage dans navigateur

- [ ] **Data JSON**
  - [ ] Remplir `assets/data/projects.json` (6+ projets)
  - [ ] Remplir `assets/data/team.json` (4 membres + roles)
  - [ ] Remplir `assets/data/services.json` (3 services)
  - [ ] Valider JSON: `node -e "require('./assets/data/projects.json')"`

---

## 🔍 TESTING & VERIFICATION

### Jour 3: QA Testing

- [ ] **Functional Testing**
  - [ ] Tous les liens: ✅ 200 OK
  - [ ] Navigation: fluide sur tous les breakpoints
  - [ ] Formulaires: soumettent et envoient emails
  - [ ] Portfolio filters: fonctionnels si présents
  - [ ] Easter eggs: Konami code activé (optionnel)
  - [ ] Vérifier: 0 console errors

- [ ] **Performance Testing (Lighthouse)**
  - [ ] Command: `lighthouse https://ventistudio.fr --view`
  - [ ] Performance: ≥ 95
  - [ ] Accessibility: ≥ 95
  - [ ] Best Practices: ≥ 95
  - [ ] SEO: 100
  - [ ] Core Web Vitals:
    - [ ] FCP < 1.5s
    - [ ] LCP < 2.5s
    - [ ] CLS < 0.1

- [ ] **Responsive Testing**
  - [ ] Mobile (320px): ✅ OK
  - [ ] Tablet (768px): ✅ OK
  - [ ] Desktop (1920px): ✅ OK
  - [ ] Images scale correctly
  - [ ] Text readable sans zoom
  - [ ] Touch targets ≥ 44x44px

- [ ] **Accessibility Testing**
  - [ ] Keyboard navigation: Tab → Enter → OK
  - [ ] Screen reader (NVDA/JAWS): test complet
  - [ ] Color contrast: ≥ 4.5:1 (AA)
  - [ ] Focus visible sur inputs
  - [ ] ARIA labels: present sur interactive elements
  - [ ] Form labels: associated (for="id")

- [ ] **SEO Testing**
  - [ ] Meta tags: title, description present
  - [ ] Open Graph tags: og:image, og:title, og:description
  - [ ] JSON-LD structured data: vérifier format
  - [ ] Sitemap.xml: valid et complet
  - [ ] robots.txt: correct
  - [ ] Canonical links: present

- [ ] **Security Testing**
  - [ ] HTTPS enforced (redirection 301)
  - [ ] Security headers: CSP, X-Frame-Options, X-Content-Type-Options
  - [ ] No console errors/warnings
  - [ ] Form validation working
  - [ ] No sensitive data exposed (check localStorage)
  - [ ] CORS headers correct

---

## 🚀 DEPLOYMENT

### Pre-Deployment

- [ ] **Git Commits**
  - [ ] `git add .`
  - [ ] `git status` (vérifier tous les fichiers)
  - [ ] Commit messages clairs:
    - [ ] "feat: v6 landing page"
    - [ ] "feat: css design system"
    - [ ] "feat: javascript app controller"
    - [ ] "docs: v6 deployment guide"
  - [ ] `git log --oneline -10` (vérifier commits)

- [ ] **GitHub Setup**
  - [ ] Repo accessible: ✅
  - [ ] Permissions vérifiées (push access): ✅
  - [ ] SSH/HTTPS keys configurées: ✅

### Deployment Steps

- [ ] **Push to GitHub**
  - [ ] `git push origin feature/v6-refonte`
  - [ ] Vérifier sur GitHub: https://github.com/ventistudio/ventistudio.fr/branches

- [ ] **Create Pull Request**
  - [ ] URL: https://github.com/ventistudio/ventistudio.fr/pulls
  - [ ] Title: `refonte: VentiStudio v6 release`
  - [ ] Description: (voir template ci-dessous)
  - [ ] Reviewer: @ventistudio team
  - [ ] Merge method: "Create a merge commit"

- [ ] **PR Review & Approval**
  - [ ] Code review par team: ✅
  - [ ] Lighthouse CI checks: ✅
  - [ ] GitHub Actions checks: ✅
  - [ ] All conversations resolved: ✅

- [ ] **Merge to Main**
  - [ ] Approuver PR
  - [ ] Merge à main
  - [ ] Delete branche feature
  - [ ] Vérifier: https://github.com/ventistudio/ventistudio.fr/commits/main

### Post-Deployment

- [ ] **Monitor Deployment**
  - [ ] Attendre GitHub Actions (auto-deploy): ~5 min
  - [ ] Vérifier status: https://github.com/ventistudio/ventistudio.fr/commits/main
  - [ ] Vérifier site live: https://ventistudio.fr (200 OK)
  - [ ] Check uptime: Site accessible sans 5xx

- [ ] **Verify Production**
  - [ ] Site accessible en HTTPS: ✅
  - [ ] Lighthouse audit passé (≥95): ✅
  - [ ] No console errors on live site: ✅
  - [ ] Forms working en production: ✅
  - [ ] Images loading correctly: ✅
  - [ ] Analytics tracking (si Plausible): ✅

- [ ] **SEO & Monitoring**
  - [ ] Soumettre sitemap.xml à Google Search Console
  - [ ] Soumettre à Bing Webmaster Tools
  - [ ] Request indexing de pages key (home, projects)
  - [ ] Monitor Lighthouse CI results
  - [ ] Setup alerts (BetterStack, Sentry si utilisé)

- [ ] **Communication**
  - [ ] Notifier team: "VentiStudio v6 déployé en production ✨"
  - [ ] Update status page (si présent)
  - [ ] Announce on Discord/social media (optionnel)
  - [ ] Email stakeholders

---

## 🔧 CONFIGURATION POST-DEPLOYMENT

### Email & Contact

- [ ] **Configurer Formulaire Contact**
  - [ ] Setup service: Formspree / EmailJS / custom backend
  - [ ] Test email reception (send test form)
  - [ ] Configure auto-reply
  - [ ] Setup email forwarding
  - [ ] Verify: contact@ventistudio.fr accessible

- [ ] **Newsletter (optionnel)**
  - [ ] Configurer: Mailchimp ou alternative
  - [ ] Setup subscribe form
  - [ ] Test subscription
  - [ ] Verify: emails reçus

### Analytics

- [ ] **Plausible Setup** (si utilisé)
  - [ ] Account created: https://plausible.io
  - [ ] Domain added: ventistudio.fr
  - [ ] Tracking code installed dans `<head>`
  - [ ] Test tracking: make visit, check dashboard
  - [ ] Setup goals: Contact submission, Project view, etc

- [ ] **Google Search Console**
  - [ ] Verify domain ownership
  - [ ] Submit sitemap.xml
  - [ ] Check indexing status
  - [ ] Monitor search performance

### Monitoring & Alerts

- [ ] **BetterStack Uptime** (optionnel)
  - [ ] Configure monitor for ventistudio.fr
  - [ ] Set check interval (every 5 min)
  - [ ] Setup alerts (email, Slack)
  - [ ] Test alert system

- [ ] **Error Tracking (Sentry)** (optionnel)
  - [ ] Setup account
  - [ ] Configure JavaScript SDK
  - [ ] Test error capture
  - [ ] Setup notifications

---

## 🎉 POST-LAUNCH (1-2 semaines)

- [ ] **Monitor Metrics**
  - [ ] Track user engagement (Plausible)
  - [ ] Monitor error rates (Sentry si utilisé)
  - [ ] Check Core Web Vitals
  - [ ] Review Lighthouse scores

- [ ] **Gather Feedback**
  - [ ] User feedback form (si présent)
  - [ ] Social media mentions
  - [ ] Email feedback
  - [ ] Team feedback

- [ ] **Optimization Cycle**
  - [ ] Identify slow pages
  - [ ] Optimize bottlenecks
  - [ ] Fix bugs reported
  - [ ] Improve UX based on feedback

- [ ] **Documentation Update**
  - [ ] Update RUNBOOK
  - [ ] Document lessons learned
  - [ ] Update disaster recovery plan
  - [ ] Create maintenance calendar

---

## ⚠️ ROLLBACK PROCEDURE

**Si problème critique en production:**

```bash
# Option 1: Revert latest commit
git revert HEAD
git push origin main

# Option 2: Reset to previous version
git reset --hard HEAD~1
git push -f origin main

# Monitor status
# https://ventistudio.fr
```

**Escalation:**
- [ ] Notify team immediately
- [ ] Stop auto-deployment
- [ ] Investigate issue
- [ ] Revert if necessary
- [ ] Post-mortem analysis

---

## 📞 CONTACTS & EMERGENCY

**Team Leads:**
- Lùka (Creative/Design): @lukaguyonvarch
- Venti (Dev/Backend): @ventidev
- Hikari (Product): @hikariumaishi

**Emergency Contact:**
- support@ventistudio.fr
- Discord: https://discord.gg/ventistudio

**Status & Monitoring:**
- Live Site: https://ventistudio.fr
- GitHub Repo: https://github.com/ventistudio/ventistudio.fr
- GitHub Commits: https://github.com/ventistudio/ventistudio.fr/commits/main

---

## 📊 SUCCESS METRICS

**After 1 week:**
- [ ] ≥ 95% uptime
- [ ] Lighthouse Performance ≥ 95
- [ ] 0 critical errors
- [ ] User feedback: positive
- [ ] Page load times: improved vs v5
- [ ] Form submissions: working 100%

---

## 📝 DEPLOYMENT NOTES

**Deployed by**: ___________________  
**Date**: 19 décembre 2025  
**Status**: 🟢 Production  
**Version**: v6.0.0  
**Branch Merged**: feature/v6-refonte → main  

**Post-deployment notes:**
```
[Notes here]
```

---

## 🎯 V6 RELEASE HIGHLIGHTS

✨ **Nouveautés v6:**
- Design system moderne (CSS variables)
- Performance optimisée (Lighthouse 95+)
- Accessible (WCAG 2.1 AA)
- PWA ready (service worker)
- SEO optimisé (structured data)
- Mobile-first responsive
- Animation fluides (Intersection Observer)
- Contact form working

---

*Deployment checklist for VentiStudio v6*  
*Branch: feature/v6-refonte*  
*Ready for launch ✨*
