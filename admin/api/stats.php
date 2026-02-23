<?php
/**
 * VentiStudio Admin - API Statistiques
 * 
 * GET /admin/api/stats.php — Statistiques du dashboard
 */

require_once __DIR__ . '/bootstrap.php';
requireAuth();

$pdo = Database::getConnection();

// Total des news
$totalNews = (int)$pdo->query('SELECT COUNT(*) FROM news')->fetchColumn();

// News ce mois-ci
$currentMonth = date('Y-m');
$stmt = $pdo->prepare("SELECT COUNT(*) FROM news WHERE date LIKE :month");
$stmt->execute(['month' => "$currentMonth%"]);
$newsThisMonth = (int)$stmt->fetchColumn();

// Total des vues
$totalViews = (int)$pdo->query('SELECT COALESCE(SUM(views), 0) FROM news')->fetchColumn();

// Total des votes
$totalVotes = (int)$pdo->query('SELECT COUNT(*) FROM votes')->fetchColumn();

// Total commentaires en attente
$pendingComments = (int)$pdo->query('SELECT COUNT(*) FROM comments WHERE approved = 0')->fetchColumn();

// Total commentaires approuvés
$approvedComments = (int)$pdo->query('SELECT COUNT(*) FROM comments WHERE approved = 1')->fetchColumn();

// Répartition par catégorie
$categories = $pdo->query('
    SELECT category, COUNT(*) AS count 
    FROM news 
    GROUP BY category 
    ORDER BY count DESC
')->fetchAll();

// News les plus vues (top 5)
$topNews = $pdo->query('
    SELECT id, title, views, date 
    FROM news 
    ORDER BY views DESC 
    LIMIT 5
')->fetchAll();

// Activité récente (dernières 10 news)
$recentNews = $pdo->query('
    SELECT id, title, date, category, created_at 
    FROM news 
    ORDER BY created_at DESC 
    LIMIT 10
')->fetchAll();

jsonResponse([
    'totalNews'        => $totalNews,
    'newsThisMonth'    => $newsThisMonth,
    'totalViews'       => $totalViews,
    'totalVotes'       => $totalVotes,
    'pendingComments'  => $pendingComments,
    'approvedComments' => $approvedComments,
    'categories'       => $categories,
    'topNews'          => $topNews,
    'recentNews'       => $recentNews,
]);
