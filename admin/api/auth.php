<?php
/**
 * VentiStudio Admin - API Authentification
 * 
 * POST /admin/api/auth.php?action=login     — Connexion
 * POST /admin/api/auth.php?action=logout    — Déconnexion
 * GET  /admin/api/auth.php?action=check     — Vérifier la session
 * POST /admin/api/auth.php?action=password  — Changer le mot de passe
 */

require_once __DIR__ . '/bootstrap.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        handleCheck();
        break;
    case 'password':
        handlePassword();
        break;
    default:
        jsonResponse(['error' => 'Action inconnue'], 400);
}

// ─── Login ───────────────────────────────────────────────
function handleLogin(): void {
    if (getMethod() !== 'POST') {
        jsonResponse(['error' => 'Méthode non autorisée'], 405);
    }

    $body = getJsonBody();
    $username = trim($body['username'] ?? 'admin');
    $password = $body['password'] ?? '';

    if (empty($password)) {
        jsonResponse(['error' => 'Mot de passe requis'], 400);
    }

    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('SELECT id, username, password_hash FROM admins WHERE username = :username LIMIT 1');
    $stmt->execute(['username' => $username]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        // Délai anti-brute-force
        sleep(1);
        jsonResponse(['error' => 'Identifiants incorrects'], 401);
    }

    // Regénérer l'ID de session (fixation de session)
    session_regenerate_id(true);

    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_username'] = $admin['username'];
    $_SESSION['login_time'] = time();

    // Mettre à jour le dernier login
    $pdo->prepare('UPDATE admins SET last_login = NOW() WHERE id = :id')
        ->execute(['id' => $admin['id']]);

    jsonResponse([
        'success' => true,
        'username' => $admin['username'],
    ]);
}

// ─── Logout ──────────────────────────────────────────────
function handleLogout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();

    jsonResponse(['success' => true]);
}

// ─── Check Session ───────────────────────────────────────
function handleCheck(): void {
    if (!empty($_SESSION['admin_id'])) {
        jsonResponse([
            'authenticated' => true,
            'username' => $_SESSION['admin_username'] ?? 'admin',
        ]);
    }
    jsonResponse(['authenticated' => false], 200);
}

// ─── Change Password ─────────────────────────────────────
function handlePassword(): void {
    if (getMethod() !== 'POST') {
        jsonResponse(['error' => 'Méthode non autorisée'], 405);
    }

    requireAuth();

    $body = getJsonBody();
    $currentPassword = $body['current_password'] ?? '';
    $newPassword = $body['new_password'] ?? '';

    if (strlen($newPassword) < 8) {
        jsonResponse(['error' => 'Le nouveau mot de passe doit faire au moins 8 caractères'], 400);
    }

    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('SELECT password_hash FROM admins WHERE id = :id');
    $stmt->execute(['id' => $_SESSION['admin_id']]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($currentPassword, $admin['password_hash'])) {
        jsonResponse(['error' => 'Mot de passe actuel incorrect'], 403);
    }

    $newHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $pdo->prepare('UPDATE admins SET password_hash = :hash WHERE id = :id')
        ->execute(['hash' => $newHash, 'id' => $_SESSION['admin_id']]);

    jsonResponse(['success' => true, 'message' => 'Mot de passe modifié avec succès']);
}
