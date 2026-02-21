<?php
/**
 * VentiStudio Admin - API News (CRUD)
 * 
 * GET    /admin/api/news.php              — Lister toutes les news
 * GET    /admin/api/news.php?id=X         — Détail d'une news
 * POST   /admin/api/news.php              — Créer une news
 * PUT    /admin/api/news.php?id=X         — Modifier une news
 * DELETE /admin/api/news.php?id=X         — Supprimer une news
 */

require_once __DIR__ . '/bootstrap.php';

$method = getMethod();
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {
    case 'GET':
        $id ? getNewsById($id) : getAllNews();
        break;
    case 'POST':
        requireAuth();
        createNews();
        break;
    case 'PUT':
        requireAuth();
        if (!$id) jsonResponse(['error' => 'ID requis'], 400);
        updateNews($id);
        break;
    case 'DELETE':
        requireAuth();
        if (!$id) jsonResponse(['error' => 'ID requis'], 400);
        deleteNews($id);
        break;
    default:
        jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

// ─── Lister les news ─────────────────────────────────────
function getAllNews(): void {
    $pdo = Database::getConnection();

    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
    $offset = ($page - 1) * $limit;
    $category = $_GET['category'] ?? null;

    $where = '';
    $params = [];

    if ($category) {
        $where = 'WHERE category = :category';
        $params['category'] = $category;
    }

    // Compteur total
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM news $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // Données paginées
    $sql = "SELECT id, title, author, date, category, excerpt, views, created_at, updated_at 
            FROM news $where 
            ORDER BY date DESC, id DESC 
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    jsonResponse([
        'news'  => $stmt->fetchAll(),
        'total' => $total,
        'page'  => $page,
        'pages' => ceil($total / $limit),
    ]);
}

// ─── Détail d'une news ──────────────────────────────────
function getNewsById(int $id): void {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('SELECT * FROM news WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $news = $stmt->fetch();

    if (!$news) {
        jsonResponse(['error' => 'News introuvable'], 404);
    }

    // Incrémenter les vues
    $pdo->prepare('UPDATE news SET views = views + 1 WHERE id = :id')
        ->execute(['id' => $id]);

    jsonResponse($news);
}

// ─── Créer une news ─────────────────────────────────────
function createNews(): void {
    $body = getJsonBody();

    $required = ['title', 'date', 'category', 'excerpt', 'content'];
    foreach ($required as $field) {
        if (empty(trim($body[$field] ?? ''))) {
            jsonResponse(['error' => "Le champ '$field' est requis"], 400);
        }
    }

    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('
        INSERT INTO news (title, author, date, category, excerpt, content) 
        VALUES (:title, :author, :date, :category, :excerpt, :content)
    ');

    $stmt->execute([
        'title'    => trim($body['title']),
        'author'   => trim($body['author'] ?? 'Équipe VentiStudio'),
        'date'     => $body['date'],
        'category' => $body['category'],
        'excerpt'  => trim($body['excerpt']),
        'content'  => $body['content'],
    ]);

    $newId = (int)$pdo->lastInsertId();

    jsonResponse([
        'success' => true,
        'id'      => $newId,
        'message' => 'Chronique publiée avec succès',
    ], 201);
}

// ─── Modifier une news ──────────────────────────────────
function updateNews(int $id): void {
    $pdo = Database::getConnection();

    // Vérifier que la news existe
    $exists = $pdo->prepare('SELECT id FROM news WHERE id = :id');
    $exists->execute(['id' => $id]);
    if (!$exists->fetch()) {
        jsonResponse(['error' => 'News introuvable'], 404);
    }

    $body = getJsonBody();
    $fields = [];
    $params = ['id' => $id];

    $allowed = ['title', 'author', 'date', 'category', 'excerpt', 'content'];
    foreach ($allowed as $field) {
        if (isset($body[$field])) {
            $fields[] = "$field = :$field";
            $params[$field] = $body[$field];
        }
    }

    if (empty($fields)) {
        jsonResponse(['error' => 'Aucun champ à modifier'], 400);
    }

    $sql = 'UPDATE news SET ' . implode(', ', $fields) . ' WHERE id = :id';
    $pdo->prepare($sql)->execute($params);

    jsonResponse([
        'success' => true,
        'message' => 'Chronique modifiée avec succès',
    ]);
}

// ─── Supprimer une news ─────────────────────────────────
function deleteNews(int $id): void {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('DELETE FROM news WHERE id = :id');
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'News introuvable'], 404);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Chronique supprimée',
    ]);
}
