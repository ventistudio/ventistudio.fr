# VentiStudio V6 - Installation Guide

## Requirements

- **Web Server**: Apache, Nginx, or any HTTP server
- **HTTPS**: SSL Certificate (Let's Encrypt recommended)
- **Storage**: 200 MB minimum
- **Bandwidth**: 10 GB/month recommended
- **Database**: Optional (static site works without)

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/ventistudio/ventistudio.fr.git
cd ventistudio.fr
git checkout feature/v6-refonte
```

### 2. Deploy Files

Upload all files to your web server:

```bash
# Using rsync
rsync -av --exclude='.*' ./ user@server:/var/www/ventistudio/

# Or using FTP
ftp server.com
# Then upload all files
```

### 3. Configure Web Server

#### Apache (.htaccess already configured)

Ensure mod_rewrite is enabled:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### Nginx

```nginx
server {
    listen 80;
    server_name ventistudio.fr www.ventistudio.fr;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ventistudio.fr www.ventistudio.fr;
    
    ssl_certificate /etc/letsencrypt/live/ventistudio.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ventistudio.fr/privkey.pem;
    
    root /var/www/ventistudio;
    index index.html;
    
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. Enable HTTPS

#### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-apache

# Get certificate
sudo certbot certonly --apache -d ventistudio.fr -d www.ventistudio.fr

# Auto-renewal
sudo certbot renew --dry-run
```

### 5. Configure DNS

Point your domain to server IP:

```
A record: ventistudio.fr -> YOUR_SERVER_IP
A record: www.ventistudio.fr -> YOUR_SERVER_IP
```

### 6. Test Installation

```bash
# Check if files are accessible
curl -I https://ventistudio.fr/

# Verify all pages
curl -I https://ventistudio.fr/index.html
curl -I https://ventistudio.fr/about.html
curl -I https://ventistudio.fr/contact.html

# Test service worker
curl -I https://ventistudio.fr/service-worker.js
```

### 7. Verify Performance

1. Run Lighthouse audit
2. Check Core Web Vitals
3. Test mobile responsiveness
4. Verify all links work
5. Test PWA installation

## Post-Installation

### 1. Set Up Monitoring

- Google Analytics 4
- Error tracking (Sentry)
- Uptime monitoring (Statuspage)
- Performance monitoring (New Relic)

### 2. Configure Email

For contact form to work:

```php
// In a backend handler (not included in static)
$to = 'support@ventistudio.fr';
$subject = $_POST['subject'];
$message = $_POST['message'];
mail($to, $subject, $message);
```

### 3. Set Up Backups

```bash
# Daily backup
0 2 * * * /usr/local/bin/backup.sh

# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /backups/ventistudio-$DATE.tar.gz /var/www/ventistudio/
```

### 4. Enable Caching

```bash
# Browser caching (already in .htaccess)
# CDN caching - use Cloudflare or similar
# Database caching - use Redis if backend added
```

## Troubleshooting

### 404 Errors

- Check .htaccess is present
- Verify mod_rewrite is enabled
- Check file permissions (755 for dirs, 644 for files)

### HTTPS Issues

- Verify SSL certificate is valid
- Check certificate chain
- Redirect HTTP to HTTPS

### Performance Issues

- Enable gzip compression
- Optimize images
- Use CDN for static assets
- Enable browser caching
- Minify CSS/JavaScript

### Service Worker Not Working

- Must be served over HTTPS
- Check service-worker.js is accessible
- Clear browser cache
- Check browser console for errors

## Support

For installation help:
- Discord: https://discord.gg/ventistudio
- Email: support@ventistudio.fr
- Issues: https://github.com/ventistudio/ventistudio.fr/issues
