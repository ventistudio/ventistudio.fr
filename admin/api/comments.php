<?php
/**
 * VentiStudio Admin - API Modération des commentaires
 * 
 * GET    /admin/api/comments.php                          — Lister les commentaires en attente
 * GET    /admin/api/comments.php?status=approved          — Lister les commentaires approuvés
 * POST   /admin/api/comments.php?action=approve&id=X     — Approuver un commentaire
 * POST   /admin/api/comments.php?action=reject&id=X      — Rejeter (supprimer) un commentaire
 * DELETE /admin/api/comments.php?id=X                     — Supprimer un commentaire
 */

require_once __DIR__ . '/bootstrap.php';

$method = getMethod();
$action = $_GET['action'] ?? null;
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {
    case 'GET':
        requireAuth();
        listComments();
        break;
    case 'POST':
        requireAuth();
        if ($action === 'approve' && $id) {
            approveComment($id);
        } elseif ($action === 'reject' && $id) {
            rejectComment($id);
        } else {
            // Soumission publique d'un commentaire (pas besoin d'auth)
            submitComment();
        }
        break;
    case 'DELETE':
        requireAuth();
        if (!$id) jsonResponse(['error' => 'ID requis'], 400);
        rejectComment($id);
        break;
    default:
        jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

// ─── Lister les commentaires ─────────────────────────────
function listComments(): void {
    $pdo = Database::getConnection();
    $status = $_GET['status'] ?? 'pending';

    $approved = $status === 'approved' ? 1 : 0;

    $stmt = $pdo->prepare('
        SELECT c.*, n.title AS news_title 
        FROM comments c 
        LEFT JOIN news n ON c.news_id = n.id 
        WHERE c.approved = :approved 
        ORDER BY c.created_at DESC
    ');
    $stmt->execute(['approved' => $approved]);

    jsonResponse([
        'comments' => $stmt->fetchAll(),
        'count'    => $stmt->rowCount(),
    ]);
}

// ─── Approuver un commentaire ────────────────────────────
function approveComment(int $id): void {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('UPDATE comments SET approved = 1 WHERE id = :id AND approved = 0');
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'Commentaire introuvable ou déjà approuvé'], 404);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Commentaire approuvé',
    ]);
}

// ─── Rejeter / Supprimer un commentaire ─────────────────
function rejectComment(int $id): void {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('DELETE FROM comments WHERE id = :id');
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'Commentaire introuvable'], 404);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Commentaire supprimé',
    ]);
}

// ─── Soumettre un commentaire (public) ──────────────────
function submitComment(): void {
    $body = getJsonBody();

    $required = ['news_id', 'author', 'email', 'content'];
    foreach ($required as $field) {
        if (empty(trim((string)($body[$field] ?? '')))) {
            jsonResponse(['error' => "Le champ '$field' est requis"], 400);
        }
    }

    // Validation email
    if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Email invalide'], 400);
    }

    $pdo = Database::getConnection();

    // Vérifier que la news existe
    $newsCheck = $pdo->prepare('SELECT id FROM news WHERE id = :id');
    $newsCheck->execute(['id' => (int)$body['news_id']]);
    if (!$newsCheck->fetch()) {
        jsonResponse(['error' => 'News introuvable'], 404);
    }

    $stmt = $pdo->prepare('
        INSERT INTO comments (news_id, author, email, content, rating, approved) 
        VALUES (:news_id, :author, :email, :content, :rating, 0)
    ');

    $stmt->execute([
        'news_id' => (int)$body['news_id'],
        'author'  => htmlspecialchars(trim($body['author']), ENT_QUOTES, 'UTF-8'),
        'email'   => trim($body['email']),
        'content' => htmlspecialchars(trim($body['content']), ENT_QUOTES, 'UTF-8'),
        'rating'  => min(5, max(1, (int)($body['rating'] ?? 5))),
    ]);

    jsonResponse([
        'success' => true,
        'message' => 'Commentaire soumis, en attente de modération',
    ], 201);
}
