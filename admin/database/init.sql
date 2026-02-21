-- VentiStudio Admin - Schéma SQL
-- Exécuter ce script pour initialiser la base de données

CREATE DATABASE IF NOT EXISTS ventistudio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ventistudio;

-- Table des administrateurs
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL
) ENGINE=InnoDB;

-- Table des chroniques (news)
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL DEFAULT 'Équipe VentiStudio',
    date DATE NOT NULL,
    category ENUM('update', 'announcement', 'feature', 'event', 'other') NOT NULL DEFAULT 'other',
    excerpt TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    views INT UNSIGNED DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table des commentaires
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_id INT NOT NULL,
    author VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    rating TINYINT UNSIGNED DEFAULT 5,
    approved TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table des votes
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    vote_type ENUM('up', 'down') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_vote (news_id, ip_address),
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table des sessions admin (optionnelle, PHP gère les sessions nativement)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(128) PRIMARY KEY,
    admin_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Index pour les performances
CREATE INDEX idx_news_date ON news(date DESC);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_comments_news ON comments(news_id);
CREATE INDEX idx_comments_approved ON comments(approved);
CREATE INDEX idx_votes_news ON votes(news_id);

-- Insertion de l'admin par défaut (mot de passe: admin123 — À CHANGER immédiatement)
-- Le hash est généré avec password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO admins (username, password_hash) VALUES (
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
) ON DUPLICATE KEY UPDATE username = username;

-- Insertion de la news existante
INSERT INTO news (id, title, author, date, category, excerpt, content) VALUES (
    1,
    'Bienvenue dans VentiStudio v4',
    'Équipe VentiStudio',
    '2026-02-12',
    'announcement',
    'Le lancement officiel de VentiStudio v4 avec une nouvelle interface modernisée, des performances améliorées et des fonctionnalités révolutionnaires.',
    '<p>Nous sommes heureux de vous annoncer le lancement de <strong>VentiStudio v4</strong>, une nouvelle version entièrement revisitée de notre plateforme créative.</p>\n<h3>Principales améliorations :</h3>\n<ul>\n<li>Interface complètement redesignée avec un design glass-morphism moderne</li>\n<li>Performances améliorées de 40%</li>\n<li>Meilleure compatibilité mobile</li>\n<li>Nouveau système d''actualités intégré</li>\n<li>Accessibilité WCAG complète</li>\n</ul>\n<p>Merci à toute la communauté VentiStudio pour votre soutien continu!</p>'
) ON DUPLICATE KEY UPDATE id = id;
