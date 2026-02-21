<?php
/**
 * VentiStudio Admin - Helpers communs pour l'API
 */

require_once __DIR__ . '/Database.php';

// Démarrer la session
$configPath = file_exists(__DIR__ . '/config.php') ? __DIR__ . '/config.php' : __DIR__ . '/config.example.php';
$appConfig = require $configPath;

session_name($appConfig['session']['name'] ?? 'VENTIADMIN_SESSID');
session_set_cookie_params([
    'lifetime' => $appConfig['session']['lifetime'] ?? 3600,
    'path'     => '/admin/',
    'secure'   => isset($_SERVER['HTTPS']),
    'httponly'  => true,
    'samesite'  => 'Strict',
]);
session_start();

// Headers API JSON + CORS
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $appConfig['security']['allowed_origins'] ?? [];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

/**
 * Réponse JSON standard
 */
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Vérifie que l'admin est authentifié
 */
function requireAuth(): void {
    if (empty($_SESSION['admin_id'])) {
        jsonResponse(['error' => 'Non authentifié'], 401);
    }
}

/**
 * Récupère le body JSON de la requête
 */
function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Récupère la méthode HTTP
 */
function getMethod(): string {
    return $_SERVER['REQUEST_METHOD'];
}
