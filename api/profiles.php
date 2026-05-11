<?php
/**
 * VentiStudio – Profiles API
 *
 * GET    /api/profiles.php?id=clerk_xxx          → profil public
 * GET    /api/profiles.php?me=1                  → mon profil complet (auth)
 * PATCH  /api/profiles.php                       → mettre à jour mon profil (auth)
 * GET    /api/profiles.php?badges=1              → mes badges (auth)
 * PATCH  /api/profiles.php?badges=1              → affichage badges (auth)
 * GET    /api/profiles.php?quests=1              → mes quêtes (auth)
 * POST   /api/profiles.php?quest_trigger=slug    → déclencher avancement quête (auth)
 * GET    /api/profiles.php?connections=1         → mes connexions (auth)
 * POST   /api/profiles.php?connections=1         → ajouter connexion manuelle (auth)
 * DELETE /api/profiles.php?connection_id=X       → supprimer connexion (auth)
 * GET    /api/profiles.php?eggs=1                → mes easter eggs (auth)
 * POST   /api/profiles.php?egg=slug              → débloquer un easter egg (auth)
 */

/* ─── Configuration ──────────────────────────────────────────────────────── */

// Ne pas afficher les erreurs dans la réponse (logguer uniquement)
ini_set('display_errors', 0);
error_reporting(E_ALL);

if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
} else {
    define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
    define('DB_NAME', getenv('DB_NAME') ?: 'ventistudio');
    define('DB_USER', getenv('DB_USER') ?: 'root');
    define('DB_PASS', getenv('DB_PASS') ?: '');

    define('CLERK_SECRET_KEY', getenv('CLERK_SECRET_KEY') ?: '');
    define('CLERK_JWKS_URL', 'https://clerk.ventistudio.eu/.well-known/jwks.json');
}

// Charger la configuration VSEU
if (file_exists(__DIR__ . '/vseu_config.php')) {
    require_once __DIR__ . '/vseu_config.php';
}

// Charger la configuration Klipy
if (file_exists(__DIR__ . '/klipy_config.php')) {
    require_once __DIR__ . '/klipy_config.php';
}

/* ─── Rate Limiting ──────────────────────────────────────────────────────── */
require_once __DIR__ . '/rate_limit.php';

// Apply rate limits based on endpoint
$endpoint = 'default';
$method = $_SERVER['REQUEST_METHOD'];

if (isset($_GET['me'])) {
    $endpoint = 'profiles_me';
} elseif (isset($_GET['id']) || isset($_GET['resolve_username'])) {
    $endpoint = 'profiles_public';
} elseif (isset($_GET['quest_trigger'])) {
    $endpoint = 'quest_trigger';
} elseif (isset($_GET['egg'])) {
    $endpoint = 'egg_unlock';
} elseif (isset($_GET['connection_id']) && $method === 'DELETE') {
    $endpoint = 'connection_add';
} elseif (isset($_GET['connections']) && $method === 'POST') {
    $endpoint = 'connection_add';
} elseif (isset($_GET['badges']) && $method === 'PATCH') {
    $endpoint = 'badge_update';
} elseif (isset($_GET['friend_request']) || isset($_GET['friend_accept']) || isset($_GET['friend_decline']) || isset($_GET['friend_remove'])
       || isset($_GET['follow']) || isset($_GET['unfollow']) || isset($_GET['block']) || isset($_GET['unblock'])) {
    $endpoint = 'social_action';
} elseif (isset($_GET['social']) || isset($_GET['social_counts']) || isset($_GET['friends']) || isset($_GET['followers']) || isset($_GET['following']) || isset($_GET['blocked'])) {
    $endpoint = 'social_state';
} elseif (isset($_GET['report'])) {
    $endpoint = 'report';
} elseif (isset($_GET['master_grant']) || isset($_GET['master_revoke']) || isset($_GET['grant_badge']) || isset($_GET['revoke_badge'])
       || isset($_GET['verify_user']) || isset($_GET['ban_user']) || isset($_GET['unban_user']) || isset($_GET['report_handle'])
       || isset($_GET['master_users']) || isset($_GET['reports_queue']) || isset($_GET['master'])) {
    $endpoint = 'admin_action';
} elseif (isset($_GET['post_media']) || isset($_GET['post_media_get'])) {
    $endpoint = 'gif_add';
} elseif (isset($_GET['react_post']) || isset($_GET['unreact_post'])) {
    $endpoint = 'post_react';
} elseif (isset($_GET['notifications']) || isset($_GET['notif_read'])) {
    $endpoint = 'notifications';
} elseif ($method === 'PATCH') {
    $endpoint = 'profiles_update';
}

applyRateLimit($endpoint);

/* ─── CORS / Headers ─────────────────────────────────────────────────────── */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://ventistudio.eu');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* ─── DB Connection ──────────────────────────────────────────────────────── */

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER, DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        } catch (PDOException $e) {
            error_log("[Profiles] Erreur DB: " . $e->getMessage());
            jsonError(503, 'Erreur de connexion à la base de données: ' . $e->getMessage());
        }
    }
    return $pdo;
}

/* ─── Clerk Auth ─────────────────────────────────────────────────────────── */

function getBearerToken(): ?string {
    // Priorité 1: En-tête Authorization (si Apache le passe)
    $auth = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : '');
    if (str_starts_with($auth, 'Bearer ')) {
        $token = substr($auth, 7);
        error_log("[Profiles] Token extrait depuis Authorization header: " . substr($token, 0, 20) . "...");
        return $token;
    }

    // Debug: voir ce que contient $_GET
    error_log("[Profiles] _GET: " . json_encode($_GET));

    // Priorité 2: Token dans le body (POST/PUT/PATCH) ou query param (GET)
    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!empty($body['token'])) {
            error_log("[Profiles] Token extrait depuis body: " . substr($body['token'], 0, 20) . "...");
            return $body['token'];
        }
    }

    // Priorité 3: Token dans query param (fallback pour GET)
    if (!empty($_GET['token'])) {
        error_log("[Profiles] Token extrait depuis query param: " . substr($_GET['token'], 0, 20) . "...");
        return $_GET['token'];
    }

    error_log("[Profiles] Pas de token trouvé (Authorization header, body ou query param)");
    return null;
}

function decodeJwtPayload(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    $payload = base64_decode(str_pad(strtr($parts[1], '-_', '+/'), strlen($parts[1]) % 4, '=', STR_PAD_RIGHT));
    return json_decode($payload, true);
}

function extractSessionIdFromToken(string $token): string {
    $payload = decodeJwtPayload($token);
    return isset($payload['sid']) ? $payload['sid'] : '';
}

function generateVSEUToken(string $userId): string {
    // Générer un token JWT signé valide 7 jours
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $userId,
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60), // 7 jours
        'iss' => 'ventistudio.eu',
    ]);
    
    $secret = defined('VSEU_TOKEN_SECRET') ? VSEU_TOKEN_SECRET : '';
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyVSEUToken(string $token): ?string {
    // Vérifier un token JWT signé VSEU
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    list($header, $payload, $signature) = $parts;
    
    $secret = defined('VSEU_TOKEN_SECRET') ? VSEU_TOKEN_SECRET : '';
    
    // Vérifier la signature
    $expectedSignature = hash_hmac('sha256', $header . "." . $payload, $secret, true);
    $base64UrlExpectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));
    
    if ($signature !== $base64UrlExpectedSignature) {
        error_log("[Profiles] Signature VSEU token invalide");
        return null;
    }
    
    // Décoder le payload
    $decodedPayload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    if (!$decodedPayload) return null;
    
    // Vérifier l'expiration
    if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
        error_log("[Profiles] VSEU token expiré");
        return null;
    }
    
    return isset($decodedPayload['user_id']) ? $decodedPayload['user_id'] : null;
}

function verifyClerkToken(string $token): ?array {
    // Vérification locale du token JWT sans appel à l'API Clerk
    $payload = decodeJwtPayload($token);
    if (!$payload) {
        error_log("[Profiles] Token JWT invalide (impossible à décoder)");
        return null;
    }
    
    error_log("[Profiles] Token JWT payload: " . json_encode($payload));
    
    // Vérifier si le token est expiré
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        error_log("[Profiles] Token expiré (exp: " . $payload['exp'] . ", maintenant: " . time() . ")");
        return null;
    }
    
    // Vérifier si c'est un session token valide
    if (!isset($payload['sid']) || !isset($payload['sub'])) {
        error_log("[Profiles] Token JWT invalide (manque sid ou sub)");
        return null;
    }
    
    error_log("[Profiles] Token JWT valide - user_id: " . $payload['sub'] . ", session_id: " . $payload['sid']);
    
    return [
        'user_id' => $payload['sub'],
        'session_id' => $payload['sid'],
    ];
}

function getClerkUser(string $userId): ?array {
    if (empty(CLERK_SECRET_KEY)) return null;
    $ch = curl_init('https://api.clerk.com/v1/users/' . urlencode($userId));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . CLERK_SECRET_KEY],
        CURLOPT_TIMEOUT        => 5,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    // curl_close() non nécessaire en PHP 8.0+
    if ($httpCode !== 200 || !$response) return null;
    return json_decode($response, true);
}

function authenticate(): array {
    $token = getBearerToken();
    if (!$token) jsonError(401, 'Token manquant');

    // Essayer d'abord le token VSEU (valide 7 jours)
    $vseuUserId = verifyVSEUToken($token);
    if ($vseuUserId) {
        error_log("[Profiles] Token VSEU valide - user_id: $vseuUserId");
        // Récupérer les infos utilisateur depuis la base de données
        $db = getDB();
        $stmt = $db->prepare('SELECT * FROM vs_profiles WHERE clerk_user_id = ?');
        $stmt->execute([$vseuUserId]);
        $profile = $stmt->fetch();
        if ($profile) {
            return [
                'id' => $profile['clerk_user_id'],
                'name' => $profile['display_name'],
                'username' => $profile['username'],
                'avatar' => $profile['avatar_url'],
                'using_vseu_token' => true,
            ];
        }
    }

    // Sinon, vérifier avec Clerk
    error_log("[Profiles] Vérification du token auprès de Clerk...");
    $session = verifyClerkToken($token);
    if (!$session || empty($session['user_id'])) {
        error_log("[Profiles] Token invalide ou expiré. Réponse Clerk: " . json_encode($session));
        jsonError(401, 'Token invalide ou expiré');
    }

    error_log("[Profiles] Session valide, user_id: " . $session['user_id']);
    $userId   = $session['user_id'];
    $userInfo = getClerkUser($userId);
    if (!$userInfo) {
        error_log("[Profiles] Utilisateur introuvable dans Clerk");
        jsonError(401, 'Utilisateur introuvable');
    }

    error_log("[Profiles] Utilisateur trouvé: " . (isset($userInfo['username']) ? $userInfo['username'] : 'no username'));
    $publicMeta  = isset($userInfo['public_metadata']) ? $userInfo['public_metadata'] : array();
    $role        = isset($publicMeta['role']) ? $publicMeta['role'] : 'utilisateur';
    $firstName   = isset($userInfo['first_name']) ? $userInfo['first_name'] : '';
    $lastName    = isset($userInfo['last_name']) ? $userInfo['last_name'] : '';
    $username    = isset($userInfo['username']) ? $userInfo['username'] : '';
    $name        = trim($firstName . ' ' . $lastName) !== '' ? trim($firstName . ' ' . $lastName) : ($username !== '' ? $username : 'Utilisateur');

    return [
        'id'       => $userId,
        'name'     => $name,
        'username' => $username,
        'avatar'   => isset($userInfo['image_url']) ? $userInfo['image_url'] : '',
        'role'     => $role,
    ];
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function jsonError(int $code, string $message): void {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

function sanitizeText(?string $s, int $max = 500): string {
    if ($s === null) return '';
    return mb_substr(strip_tags(trim($s)), 0, $max);
}

/* ─── UID Generator ─────────────────────────────────────────────────────────── */

function generateUID(string $cac, string $cup, string $cur, ?string $countryCode = null): string {
    // CAC : Code d'accréditation compte (2 chiffres)
    // CUP : Code Unique Pays (3 chiffres, ISO)
    // CUR : Code Unique par régions (1 chiffre)
    // YYYYMM : Année + mois (6 chiffres)
    // XXXXX : Code séquentiel qui grandit

    $cac = str_pad($cac, 2, '0', STR_PAD_LEFT);
    $cup = str_pad($cup, 3, '0', STR_PAD_LEFT);
    $cur = str_pad($cur, 1, '0', STR_PAD_LEFT);
    $date = date('Ym');

    // Récupérer le dernier séquentiel pour ce mois
    $db = getDB();
    $prefix = $cac . $cup . $cur . $date;
    $stmt = $db->prepare("SELECT MAX(CAST(SUBSTRING(unique_id, 13) AS UNSIGNED)) AS max_seq FROM vs_profiles WHERE unique_id LIKE ?");
    $stmt->execute([$prefix . '%']);
    $result = $stmt->fetch();
    $nextSeq = (isset($result['max_seq']) ? $result['max_seq'] : 0) + 1;

    // Le séquentiel grandit si atteint le maximum (99999 -> 999999, etc.)
    $seq = str_pad($nextSeq, 5, '0', STR_PAD_LEFT);

    return $prefix . $seq;
}

function getCACFromRole(string $role, bool $isVerified, bool $isCertified): string {
    // CAC mappings
    $cacMap = [
        'root' => '10',
        'proprietaire' => '10',
        'fondateur' => '10',
        'admin' => '09',
        'administrateur' => '09',
        'moderator' => '06',
        'moderateur' => '06',
        'manager' => '07',
        'responsable' => '07',
        'staff' => '05',
    ];

    if (isset($cacMap[strtolower($role)])) {
        return $cacMap[strtolower($role)];
    }

    if ($isCertified) return '03';
    if ($isVerified) return '02';
    return '01';
}

function getCUPFromCountryCode(string $countryCode): string {
    // Codes ISO pays vers CUP (001-200)
    $countryMap = [
        'FR' => '001', 'DE' => '002', 'IT' => '003', 'ES' => '004', 'PL' => '005',
        'RO' => '006', 'NL' => '007', 'BE' => '008', 'CZ' => '009', 'GR' => '010',
        'PT' => '011', 'HU' => '012', 'SE' => '013', 'AT' => '014', 'BG' => '015',
        'DK' => '016', 'FI' => '017', 'SK' => '018', 'NO' => '019', 'IE' => '020',
        'HR' => '021', 'LT' => '022', 'SI' => '023', 'LV' => '024', 'EE' => '025',
        'CY' => '026', 'LU' => '027', 'MT' => '028', 'IS' => '029', 'AL' => '030',
        'MK' => '031', 'RS' => '032', 'ME' => '033', 'BA' => '034', 'XK' => '035',
        'TR' => '036', 'UA' => '037', 'BY' => '038', 'MD' => '039', 'RU' => '040',
        'GE' => '041', 'AM' => '042', 'AZ' => '043', 'KZ' => '044', 'UZ' => '045',
        'KG' => '046', 'TJ' => '047', 'TM' => '048', 'AF' => '049', 'PK' => '050',
        'IN' => '051', 'BD' => '052', 'NP' => '053', 'LK' => '054', 'MM' => '055',
        'TH' => '056', 'VN' => '057', 'KH' => '058', 'LA' => '059', 'MY' => '060',
        'SG' => '061', 'ID' => '062', 'PH' => '063', 'BN' => '064', 'TW' => '065',
        'HK' => '066', 'MO' => '067', 'CN' => '068', 'KP' => '069', 'KR' => '070',
        'JP' => '071', 'MN' => '072',
        'US' => '100', 'CA' => '101', 'MX' => '102', 'GT' => '103', 'CU' => '104',
        'HT' => '105', 'DO' => '106', 'JM' => '107', 'PR' => '108', 'PA' => '109',
        'CR' => '110', 'NI' => '111', 'HN' => '112', 'SV' => '113', 'BZ' => '114',
        'CO' => '115', 'VE' => '116', 'EC' => '117', 'PE' => '118', 'BO' => '119',
        'PY' => '120', 'UY' => '121', 'AR' => '122', 'CL' => '123', 'BR' => '124',
        'GY' => '125', 'SR' => '126', 'GF' => '127', 'AU' => '150', 'NZ' => '151',
        'FJ' => '152', 'PG' => '153', 'SB' => '154', 'VU' => '155', 'WS' => '156',
        'TO' => '157', 'KI' => '158', 'TV' => '159', 'NR' => '160', 'PW' => '161',
        'FM' => '162', 'MH' => '163',
        'ZA' => '180', 'NA' => '181', 'BW' => '182', 'ZW' => '183', 'MZ' => '184',
        'ZM' => '185', 'MW' => '186', 'AO' => '187', 'TZ' => '188', 'KE' => '189',
        'UG' => '190', 'ET' => '191', 'SD' => '192', 'SS' => '193', 'ER' => '194',
        'DJ' => '195', 'SO' => '196', 'MG' => '197', 'MU' => '198', 'RE' => '199',
        'YT' => '200',
    ];

    return isset($countryMap[strtoupper($countryCode)]) ? $countryMap[strtoupper($countryCode)] : '000';
}

function getCURFromRegion(string $region): string {
    // CUR : Code Unique par régions (0-9)
    $regionMap = [
        'interne' => '0',
        'antarctique' => '1',
        'oceanie' => '2',
        'caraibes' => '3',
        'amérique du sud' => '4',
        'america del sur' => '4',
        'amérique centrale' => '5',
        'america central' => '5',
        'amérique du nord' => '6',
        'america del norte' => '6',
        'north america' => '6',
        'europe' => '7',
        'asie' => '8',
        'afrique' => '9',
    ];

    return isset($regionMap[strtolower($region)]) ? $regionMap[strtolower($region)] : '7'; // Par défaut Europe
}

/* ─── XP / Level helper ──────────────────────────────────────────────────── */

function xpForLevel(int $level): int {
    return (int)(100 * pow($level, 1.5));
}

function levelFromXp(int $xp): int {
    $level = 1;
    while ($xp >= xpForLevel($level + 1)) {
        $level++;
        if ($level >= 9999) break;
    }
    return $level;
}

function addXp(string $userId, int $amount): void {
    $db = getDB();
    $db->prepare(
        'INSERT INTO vs_user_xp (clerk_user_id, xp_total, level)
         VALUES (:uid, :xp, :lvl)
         ON DUPLICATE KEY UPDATE
           xp_total = xp_total + :xp2,
           level    = :lvl2,
           updated_at = NOW()'
    )->execute([
        ':uid'  => $userId,
        ':xp'   => $amount,
        ':lvl'  => levelFromXp($amount),
        ':xp2'  => $amount,
        ':lvl2' => levelFromXp((int)($db->query(
            'SELECT IFNULL(xp_total,0) + ' . (int)$amount . ' FROM vs_user_xp WHERE clerk_user_id=' . $db->quote($userId)
        )->fetchColumn() ?: $amount)),
    ]);
}

function grantBadge(string $userId, string $badgeSlug): void {
    $db = getDB();
    $row = $db->prepare('SELECT id FROM vs_badges WHERE slug = :slug LIMIT 1');
    $row->execute([':slug' => $badgeSlug]);
    $badge = $row->fetch();
    if (!$badge) return;
    $db->prepare(
        'INSERT IGNORE INTO vs_user_badges (clerk_user_id, badge_id, granted_by)
         VALUES (:uid, :bid, "system")'
    )->execute([':uid' => $userId, ':bid' => $badge['id']]);
}

/* ─── Ensure profile exists ──────────────────────────────────────────────── */

function ensureProfile(array $user): void {
    $db = getDB();

    // Vérifier si la colonne unique_id existe
    $columnExists = false;
    try {
        $db->query("SELECT unique_id FROM vs_profiles LIMIT 1");
        $columnExists = true;
    } catch (PDOException $e) {
        // La colonne n'existe pas encore
    }

    if ($columnExists) {
        // Générer l'UID
        $cac = getCACFromRole($user['role'], false, false); // Par défaut utilisateur
        $cup = getCUPFromCountryCode('FR'); // Par défaut France, à personnaliser
        $cur = getCURFromRegion('europe'); // Par défaut Europe, à personnaliser
        $uniqueId = generateUID($cac, $cup, $cur);

        $db->prepare(
            'INSERT IGNORE INTO vs_profiles (clerk_user_id, unique_id, display_name, username, avatar_url)
             VALUES (:uid, :unique_id, :name, :username, :avatar)'
        )->execute([
            ':uid'        => $user['id'],
            ':unique_id'  => $uniqueId,
            ':name'       => $user['name'],
            ':username'   => $user['username'],
            ':avatar'     => $user['avatar'],
        ]);
    } else {
        // Fallback sans unique_id
        $db->prepare(
            'INSERT IGNORE INTO vs_profiles (clerk_user_id, display_name, username, avatar_url)
             VALUES (:uid, :name, :username, :avatar)'
        )->execute([
            ':uid'      => $user['id'],
            ':name'     => $user['name'],
            ':username' => $user['username'],
            ':avatar'   => $user['avatar'],
        ]);
    }
    $db->prepare(
        'INSERT IGNORE INTO vs_user_xp (clerk_user_id, xp_total, level) VALUES (:uid, 0, 1)'
    )->execute([':uid' => $user['id']]);
}

/* ─── Routing ────────────────────────────────────────────────────────────── */

$method = $_SERVER['REQUEST_METHOD'];
$qs     = $_GET;

if ($method === 'GET' && isset($qs['id'])) {
    handleGetPublicProfile($qs['id']);
} elseif ($method === 'GET' && isset($qs['me'])) {
    handleGetMyProfile();
} elseif ($method === 'PATCH' && !isset($qs['badges']) && !isset($qs['connections']) && !isset($qs['entreprise'])) {
    handleUpdateProfile();
} elseif ($method === 'GET' && isset($qs['badges'])) {
    handleGetBadges();
} elseif ($method === 'PATCH' && isset($qs['badges'])) {
    handleUpdateBadgeDisplay();
} elseif ($method === 'GET' && isset($qs['quests'])) {
    handleGetQuests();
} elseif ($method === 'POST' && isset($qs['quest_trigger'])) {
    handleQuestTrigger($qs['quest_trigger']);
} elseif ($method === 'GET' && isset($qs['connections'])) {
    handleGetConnections();
} elseif ($method === 'POST' && isset($qs['connections'])) {
    handleAddConnection();
} elseif ($method === 'DELETE' && isset($qs['connection_id'])) {
    handleDeleteConnection((int)$qs['connection_id']);
} elseif ($method === 'GET' && isset($qs['eggs'])) {
    handleGetEasterEggs();
} elseif ($method === 'POST' && isset($qs['egg'])) {
    handleUnlockEasterEgg($qs['egg']);
} elseif ($method === 'GET' && isset($qs['forum'])) {
    handleGetForumPosts();
} elseif ($method === 'POST' && isset($qs['forum'])) {
    handleCreateForumPost();
} elseif ($method === 'GET' && isset($qs['post_id'])) {
    handleGetPost((int)$qs['post_id']);
} elseif ($method === 'DELETE' && isset($qs['post_id'])) {
    handleDeletePost((int)$qs['post_id']);
} elseif ($method === 'GET' && isset($qs['activity'])) {
    handleGetActivity();
} elseif ($method === 'GET' && isset($qs['messages'])) {
    handleGetMessages();
} elseif ($method === 'POST' && isset($qs['messages'])) {
    handleSendMessage();
} elseif ($method === 'PATCH' && isset($qs['msg_read'])) {
    handleMarkMessagesRead();
} elseif ($method === 'GET' && isset($qs['search'])) {
    handleSearchProfiles();
} elseif ($method === 'GET' && isset($qs['entreprise'])) {
    handleGetEntreprise();
} elseif ($method === 'PATCH' && isset($qs['entreprise'])) {
    handleUpdateEntreprise();
}
/* ─── Social : friends ───────────────────────────────────── */
elseif ($method === 'GET'    && isset($qs['friends']))         { handleGetFriends(); }
elseif ($method === 'POST'   && isset($qs['friend_request']))  { handleFriendRequest($qs['friend_request']); }
elseif ($method === 'PATCH'  && isset($qs['friend_accept']))   { handleFriendAccept($qs['friend_accept']); }
elseif ($method === 'PATCH'  && isset($qs['friend_decline']))  { handleFriendDecline($qs['friend_decline']); }
elseif ($method === 'DELETE' && isset($qs['friend_remove']))   { handleFriendRemove($qs['friend_remove']); }
/* ─── Social : follow ────────────────────────────────────── */
elseif ($method === 'POST'   && isset($qs['follow']))    { handleFollow($qs['follow']); }
elseif ($method === 'DELETE' && isset($qs['unfollow']))  { handleUnfollow($qs['unfollow']); }
elseif ($method === 'GET'    && isset($qs['followers'])) { handleGetFollowers($qs['followers']); }
elseif ($method === 'GET'    && isset($qs['following'])) { handleGetFollowing($qs['following']); }
/* ─── Social : block / report ────────────────────────────── */
elseif ($method === 'POST'   && isset($qs['block']))    { handleBlock($qs['block']); }
elseif ($method === 'DELETE' && isset($qs['unblock']))  { handleUnblock($qs['unblock']); }
elseif ($method === 'GET'    && isset($qs['blocked']))  { handleGetBlocked(); }
elseif ($method === 'POST'   && isset($qs['report']))   { handleReport($qs['report']); }
/* ─── Social : état + compteurs ──────────────────────────── */
elseif ($method === 'GET' && isset($qs['social']))        { handleGetSocialState($qs['social']); }
elseif ($method === 'GET' && isset($qs['social_counts'])) { handleGetSocialCounts(); }
/* ─── Username resolver ──────────────────────────────────── */
elseif ($method === 'GET' && isset($qs['resolve_username'])) { handleResolveUsername($qs['resolve_username']); }
/* ─── Notifications ──────────────────────────────────────── */
elseif ($method === 'GET'   && isset($qs['notifications'])) { handleGetNotifications(); }
elseif ($method === 'PATCH' && isset($qs['notif_read']))    { handleMarkNotifRead($qs['notif_read']); }
/* ─── Master users (admin) ───────────────────────────────── */
elseif ($method === 'GET'    && isset($qs['master']) && $qs['master'] === 'me') { handleGetMyMasterLevel(); }
elseif ($method === 'GET'    && isset($qs['master_users']))   { handleListMasterUsers(); }
elseif ($method === 'POST'   && isset($qs['master_grant']))   { handleGrantMaster($qs['master_grant']); }
elseif ($method === 'DELETE' && isset($qs['master_revoke']))  { handleRevokeMaster($qs['master_revoke']); }
elseif ($method === 'POST'   && isset($qs['grant_badge']))    { handleAdminGrantBadge($qs['grant_badge']); }
elseif ($method === 'DELETE' && isset($qs['revoke_badge']))   { handleAdminRevokeBadge($qs['revoke_badge']); }
elseif ($method === 'PATCH'  && isset($qs['verify_user']))    { handleAdminVerifyUser($qs['verify_user']); }
elseif ($method === 'POST'   && isset($qs['ban_user']))       { handleAdminBan($qs['ban_user']); }
elseif ($method === 'DELETE' && isset($qs['unban_user']))     { handleAdminUnban($qs['unban_user']); }
elseif ($method === 'GET'    && isset($qs['reports_queue'])) { handleAdminReportsQueue(); }
elseif ($method === 'PATCH'  && isset($qs['report_handle'])) { handleAdminReportHandle((int)$qs['report_handle']); }
/* ─── Forum media (GIFs externes) ────────────────────────── */
elseif ($method === 'GET' && isset($qs['klipy_search'])) { handleKlipySearch($qs['klipy_search']); }
elseif ($method === 'POST'   && isset($qs['post_media']))   { handleAddPostMedia((int)$qs['post_media']); }
elseif ($method === 'GET'    && isset($qs['post_media_get'])) { handleGetPostMedia((int)$qs['post_media_get']); }
/* ─── Forum reactions ────────────────────────────────────── */
elseif ($method === 'POST'   && isset($qs['react_post']))   { handleReactPost((int)$qs['react_post']); }
elseif ($method === 'DELETE' && isset($qs['unreact_post'])) { handleUnreactPost((int)$qs['unreact_post']); }
else {
    jsonError(400, 'Endpoint inconnu');
}

/* ─── GET: profil public ─────────────────────────────────────────────────── */

function handleGetPublicProfile(string $id): void {
    $db = getDB();
    $stmt = $db->prepare(
        'SELECT p.clerk_user_id, p.display_name, p.username, p.avatar_url, p.banner_url,
                p.banner_color, p.bio, p.pronouns, p.location, p.website,
                p.account_type, p.is_verified, p.custom_status, p.accent_color, p.created_at,
                x.xp_total, x.level
         FROM vs_profiles p
         LEFT JOIN vs_user_xp x ON x.clerk_user_id = p.clerk_user_id
         WHERE p.clerk_user_id = :id LIMIT 1'
    );
    $stmt->execute([':id' => $id]);
    $profile = $stmt->fetch();
    if (!$profile) jsonError(404, 'Profil introuvable');

    // Badges affichés
    $badges = $db->prepare(
        'SELECT b.slug, b.name, b.icon_emoji, b.icon_url, b.rarity, ub.display_order
         FROM vs_user_badges ub
         JOIN vs_badges b ON b.id = ub.badge_id
         WHERE ub.clerk_user_id = :id AND ub.is_displayed = 1
         ORDER BY ub.display_order ASC, b.rarity DESC
         LIMIT 8'
    );
    $badges->execute([':id' => $id]);
    $profile['badges'] = $badges->fetchAll();

    // Connexions publiques
    $conns = $db->prepare(
        'SELECT platform, display_name, url, is_verified
         FROM vs_user_connections
         WHERE clerk_user_id = :id AND visibility = "public"
         ORDER BY is_verified DESC, platform ASC'
    );
    $conns->execute([':id' => $id]);
    $profile['connections'] = $conns->fetchAll();

    // Discord link (infos non sensibles)
    $discord = $db->prepare(
        'SELECT discord_username, discord_global_name, discord_avatar, discord_verified, linked_at
         FROM vs_discord_links WHERE clerk_user_id = :id LIMIT 1'
    );
    $discord->execute([':id' => $id]);
    $profile['discord'] = $discord->fetch() ?: null;

    jsonResponse(['profile' => $profile]);
}

/* ─── GET: mon profil complet ────────────────────────────────────────────── */

function handleGetMyProfile(): void {
    $user = authenticate();
    ensureProfile($user);
    $db   = getDB();

    $stmt = $db->prepare(
        'SELECT p.*, x.xp_total, x.level
         FROM vs_profiles p
         LEFT JOIN vs_user_xp x ON x.clerk_user_id = p.clerk_user_id
         WHERE p.clerk_user_id = :id LIMIT 1'
    );
    $stmt->execute([':id' => $user['id']]);
    $profile = $stmt->fetch();

    // Toutes les connexions
    $conns = $db->prepare(
        'SELECT id, platform, display_name, url, is_verified, visibility, created_at
         FROM vs_user_connections WHERE clerk_user_id = :id ORDER BY is_verified DESC, platform ASC'
    );
    $conns->execute([':id' => $user['id']]);
    $profile['connections'] = $conns->fetchAll();

    // Badges (tous, pas uniquement affichés)
    $badges = $db->prepare(
        'SELECT b.id, b.slug, b.name, b.description, b.icon_emoji, b.icon_url, b.rarity, b.category,
                ub.is_displayed, ub.display_order, ub.granted_at
         FROM vs_user_badges ub
         JOIN vs_badges b ON b.id = ub.badge_id
         WHERE ub.clerk_user_id = :id
         ORDER BY ub.display_order ASC, b.rarity DESC'
    );
    $badges->execute([':id' => $user['id']]);
    $profile['badges'] = $badges->fetchAll();

    // Discord
    $discord = $db->prepare(
        'SELECT discord_user_id, discord_username, discord_global_name, discord_avatar, discord_verified, linked_at
         FROM vs_discord_links WHERE clerk_user_id = :id LIMIT 1'
    );
    $discord->execute([':id' => $user['id']]);
    $profile['discord'] = $discord->fetch() ?: null;

    // Profil entreprise si applicable
    if ($profile['account_type'] === 'entreprise') {
        $ent = $db->prepare('SELECT * FROM vs_profiles_entreprise WHERE clerk_user_id = :id LIMIT 1');
        $ent->execute([':id' => $user['id']]);
        $profile['entreprise'] = $ent->fetch() ?: null;
    }

    // Générer et retourner le token VSEU si authentifié via Clerk
    $response = ['profile' => $profile];
    if (!isset($user['using_vseu_token']) || !$user['using_vseu_token']) {
        $response['vseu_token'] = generateVSEUToken($user['id']);
    }
    
    jsonResponse($response);
}

/* ─── PATCH: mettre à jour le profil ────────────────────────────────────── */

function handleUpdateProfile(): void {
    $user = authenticate();
    ensureProfile($user);

    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) jsonError(400, 'Corps invalide');

    $allowed = [
        'display_name', 'bio', 'pronouns', 'location', 'website',
        'banner_color', 'accent_color', 'custom_status', 'status',
        'avatar_url', 'banner_url',
    ];

    $fields = [];
    $params = [':uid' => $user['id']];

    foreach ($allowed as $field) {
        if (!array_key_exists($field, $body)) continue;
        $val = match ($field) {
            'display_name'  => sanitizeText($body[$field], 100),
            'bio'           => sanitizeText($body[$field], 500),
            'pronouns'      => sanitizeText($body[$field], 64),
            'location'      => sanitizeText($body[$field], 128),
            'website'       => filter_var($body[$field], FILTER_VALIDATE_URL) ? $body[$field] : null,
            'banner_color',
            'accent_color'  => preg_match('/^#[0-9A-Fa-f]{6}$/', isset($body[$field]) ? $body[$field] : '') ? $body[$field] : null,
            'custom_status' => sanitizeText($body[$field], 128),
            'status'        => in_array($body[$field], ['online','idle','dnd','offline','invisible']) ? $body[$field] : null,
            'avatar_url',
            'banner_url'    => filter_var($body[$field], FILTER_VALIDATE_URL) ? $body[$field] : ($body[$field] === '' ? '' : null),
            default         => null,
        };
        if ($val !== null || ($field === 'website' && $body[$field] === '')) {
            $fields[] = "`{$field}` = :{$field}";
            $params[":{$field}"] = $val === '' ? null : $val;
        }
    }

    if (empty($fields)) jsonError(400, 'Aucun champ valide à mettre à jour');

    $db = getDB();
    $db->prepare('UPDATE vs_profiles SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE clerk_user_id = :uid')
       ->execute($params);

    // Quête bio
    if (isset($body['bio']) && !empty($body['bio'])) {
        triggerQuestProgress($user['id'], 'bio_written', 1);
    }

    // Quête profil complet
    checkCompleteProfileQuest($user['id']);

    jsonResponse(['success' => true]);
}

/* ─── GET: mes badges ────────────────────────────────────────────────────── */

function handleGetBadges(): void {
    $user = authenticate();
    $db   = getDB();

    $stmt = $db->prepare(
        'SELECT b.id, b.slug, b.name, b.description, b.icon_emoji, b.icon_url, b.rarity, b.category,
                ub.is_displayed, ub.display_order, ub.granted_at
         FROM vs_user_badges ub
         JOIN vs_badges b ON b.id = ub.badge_id
         WHERE ub.clerk_user_id = :id
         ORDER BY ub.display_order ASC, b.rarity DESC'
    );
    $stmt->execute([':id' => $user['id']]);
    jsonResponse(['badges' => $stmt->fetchAll()]);
}

/* ─── PATCH: ordre/affichage badges ─────────────────────────────────────── */

function handleUpdateBadgeDisplay(): void {
    $user = authenticate();
    $body = json_decode(file_get_contents('php://input'), true);
    if (!isset($body['badges']) || !is_array($body['badges'])) jsonError(400, 'Champ "badges" manquant');

    $db = getDB();
    foreach ($body['badges'] as $i => $b) {
        if (!isset($b['badge_id'])) continue;
        $db->prepare(
            'UPDATE vs_user_badges SET is_displayed = :disp, display_order = :ord
             WHERE clerk_user_id = :uid AND badge_id = :bid'
        )->execute([
            ':disp' => isset($b['is_displayed']) ? (int)(bool)$b['is_displayed'] : 1,
            ':ord'  => (int)(isset($b['display_order']) ? $b['display_order'] : $i),
            ':uid'  => $user['id'],
            ':bid'  => (int)$b['badge_id'],
        ]);
    }
    jsonResponse(['success' => true]);
}

/* ─── GET: mes quêtes ────────────────────────────────────────────────────── */

function handleGetQuests(): void {
    $user = authenticate();
    $db   = getDB();

    // Toutes les quêtes + progression utilisateur
    $stmt = $db->prepare(
        'SELECT q.id, q.slug, q.title, q.description, q.xp_reward, q.category,
                q.is_hidden, q.is_repeatable,
                uq.status, uq.progress, uq.completed_at
         FROM vs_quests q
         LEFT JOIN vs_user_quests uq ON uq.quest_id = q.id AND uq.clerk_user_id = :id
         WHERE q.is_hidden = 0 OR uq.quest_id IS NOT NULL
         ORDER BY uq.status DESC, q.category ASC'
    );
    $stmt->execute([':id' => $user['id']]);
    jsonResponse(['quests' => $stmt->fetchAll()]);
}

/* ─── POST: déclencher avancement d'une quête ───────────────────────────── */

function handleQuestTrigger(string $slug): void {
    $user  = authenticate();
    $body  = json_decode(file_get_contents('php://input'), true);
    $delta = max(1, (int)(isset($body['progress']) ? $body['progress'] : 1));
    triggerQuestProgress($user['id'], $slug, $delta);
    jsonResponse(['success' => true]);
}

function triggerQuestProgress(string $userId, string $slug, int $delta = 1): void {
    $db   = getDB();
    $qRow = $db->prepare('SELECT * FROM vs_quests WHERE slug = :slug LIMIT 1');
    $qRow->execute([':slug' => $slug]);
    $quest = $qRow->fetch();
    if (!$quest) return;

    $uq = $db->prepare(
        'SELECT * FROM vs_user_quests WHERE clerk_user_id = :uid AND quest_id = :qid LIMIT 1'
    );
    $uq->execute([':uid' => $userId, ':qid' => $quest['id']]);
    $userQuest = $uq->fetch();

    // Déjà complétée et non répétable → skip
    if ($userQuest && $userQuest['status'] === 'completed' && !$quest['is_repeatable']) return;

    $progress  = (isset($userQuest['progress']) ? $userQuest['progress'] : 0) + $delta;
    $completed = $progress >= 1;

    if (!$userQuest) {
        $db->prepare(
            'INSERT INTO vs_user_quests (clerk_user_id, quest_id, status, progress, completed_at)
             VALUES (:uid, :qid, :status, :progress, :cat)'
        )->execute([
            ':uid'      => $userId,
            ':qid'      => $quest['id'],
            ':status'   => $completed ? 'completed' : 'in_progress',
            ':progress' => $progress,
            ':cat'      => $completed ? date('Y-m-d H:i:s') : null,
        ]);
    } else {
        $db->prepare(
            'UPDATE vs_user_quests SET progress = :progress, status = :status, completed_at = :cat, updated_at = NOW()
             WHERE clerk_user_id = :uid AND quest_id = :qid'
        )->execute([
            ':progress' => $progress,
            ':status'   => $completed ? 'completed' : 'in_progress',
            ':cat'      => $completed ? date('Y-m-d H:i:s') : null,
            ':uid'      => $userId,
            ':qid'      => $quest['id'],
        ]);
    }

    if ($completed) {
        // Récompenses
        if ($quest['xp_reward'] > 0) addXp($userId, (int)$quest['xp_reward']);
        if ($quest['badge_reward']) {
            $badge = $db->prepare('SELECT slug FROM vs_badges WHERE id = :id LIMIT 1');
            $badge->execute([':id' => $quest['badge_reward']]);
            $b = $badge->fetch();
            if ($b) grantBadge($userId, $b['slug']);
        }
        // Quête "10 quêtes"
        $count = (int)$db->prepare(
            'SELECT COUNT(*) FROM vs_user_quests WHERE clerk_user_id = :uid AND status = "completed"'
        )->execute([':uid' => $userId]) ? $db->query(
            'SELECT COUNT(*) FROM vs_user_quests WHERE clerk_user_id = "' . addslashes($userId) . '" AND status = "completed"'
        )->fetchColumn() : 0;
        if ($count >= 10) {
            grantBadge($userId, 'quest_master');
            triggerQuestProgress($userId, 'ten_quests', 10);
        }
    }
}

function checkCompleteProfileQuest(string $userId): void {
    $db = getDB();
    $p  = $db->prepare('SELECT bio, location, website, avatar_url FROM vs_profiles WHERE clerk_user_id = :id LIMIT 1');
    $p->execute([':id' => $userId]);
    $profile = $p->fetch();
    if (!$profile) return;
    $filled = array_filter([$profile['bio'], $profile['location'], $profile['website'], $profile['avatar_url']]);
    if (count($filled) >= 3) triggerQuestProgress($userId, 'complete_profile', 1);
}

/* ─── GET: connexions ────────────────────────────────────────────────────── */

function handleGetConnections(): void {
    $user = authenticate();
    $db   = getDB();

    $conns = $db->prepare(
        'SELECT id, platform, display_name, url, is_verified, visibility, created_at
         FROM vs_user_connections WHERE clerk_user_id = :id ORDER BY is_verified DESC, platform ASC'
    );
    $conns->execute([':id' => $user['id']]);

    $discord = $db->prepare(
        'SELECT discord_user_id, discord_username, discord_global_name, discord_avatar, linked_at
         FROM vs_discord_links WHERE clerk_user_id = :id LIMIT 1'
    );
    $discord->execute([':id' => $user['id']]);

    jsonResponse([
        'connections' => $conns->fetchAll(),
        'discord'     => $discord->fetch() ?: null,
    ]);
}

/* ─── POST: ajouter connexion manuelle ──────────────────────────────────── */

function handleAddConnection(): void {
    $user = authenticate();
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) jsonError(400, 'Corps invalide');

    $platform     = sanitizeText(isset($body['platform']) ? $body['platform'] : '', 64);
    $displayName  = sanitizeText(isset($body['display_name']) ? $body['display_name'] : '', 255);
    $url          = filter_var(isset($body['url']) ? $body['url'] : '', FILTER_VALIDATE_URL) ? (isset($body['url']) ? $body['url'] : null) : null;
    $visibility   = in_array(isset($body['visibility']) ? $body['visibility'] : '', array('public','friends','private')) ? (isset($body['visibility']) ? $body['visibility'] : '') : 'public';

    if (empty($platform) || empty($displayName)) jsonError(400, 'Platform et display_name requis');

    $allowedPlatforms = [
        'xbox','steam','playstation','epic','battlenet','origin','gog','itch',
        'twitter','instagram','youtube','twitch','tiktok','bluesky','mastodon',
        'github','gitlab','linkedin','reddit','spotify','lastfm','soundcloud',
        'anilist','myanimelist','letterboxd','other'
    ];
    if (!in_array(strtolower($platform), $allowedPlatforms)) jsonError(400, 'Plateforme non autorisée');

    $db = getDB();
    $db->prepare(
        'INSERT INTO vs_user_connections (clerk_user_id, platform, display_name, url, visibility)
         VALUES (:uid, :platform, :name, :url, :visibility)
         ON DUPLICATE KEY UPDATE display_name = :name2, url = :url2, visibility = :vis2'
    )->execute([
        ':uid'        => $user['id'],
        ':platform'   => strtolower($platform),
        ':name'       => $displayName,
        ':url'        => $url,
        ':visibility' => $visibility,
        ':name2'      => $displayName,
        ':url2'       => $url,
        ':vis2'       => $visibility,
    ]);

    triggerQuestProgress($user['id'], 'add_connection', 1);

    jsonResponse(['success' => true, 'id' => (int)$db->lastInsertId()], 201);
}

/* ─── DELETE: supprimer connexion ───────────────────────────────────────── */

function handleDeleteConnection(int $connId): void {
    $user = authenticate();
    $db   = getDB();
    $stmt = $db->prepare(
        'DELETE FROM vs_user_connections WHERE id = :id AND clerk_user_id = :uid'
    );
    $stmt->execute([':id' => $connId, ':uid' => $user['id']]);
    if ($stmt->rowCount() === 0) jsonError(404, 'Connexion introuvable');
    jsonResponse(['success' => true]);
}

/* ─── GET: easter eggs ───────────────────────────────────────────────────── */

function handleGetEasterEggs(): void {
    $user = authenticate();
    $db   = getDB();

    $stmt = $db->prepare(
        'SELECT e.id, e.slug, e.title, e.hint, e.xp_reward,
                uee.found_at
         FROM vs_easter_eggs e
         LEFT JOIN vs_user_easter_eggs uee ON uee.egg_id = e.id AND uee.clerk_user_id = :id
         ORDER BY uee.found_at IS NULL ASC, uee.found_at DESC'
    );
    $stmt->execute([':id' => $user['id']]);

    $eggs  = $stmt->fetchAll();
    $found = array_filter($eggs, fn($e) => $e['found_at'] !== null);

    jsonResponse(['eggs' => $eggs, 'found_count' => count($found), 'total' => count($eggs)]);
}

/* ─── POST: débloquer easter egg ────────────────────────────────────────── */

function handleUnlockEasterEgg(string $slug): void {
    $user = authenticate();
    $db   = getDB();

    $eRow = $db->prepare('SELECT * FROM vs_easter_eggs WHERE slug = :slug LIMIT 1');
    $eRow->execute([':slug' => $slug]);
    $egg = $eRow->fetch();
    if (!$egg) jsonError(404, 'Easter egg inconnu');

    // Déjà trouvé ?
    $found = $db->prepare(
        'SELECT id FROM vs_user_easter_eggs WHERE clerk_user_id = :uid AND egg_id = :eid LIMIT 1'
    );
    $found->execute([':uid' => $user['id'], ':eid' => $egg['id']]);
    if ($found->fetch()) jsonError(409, 'Easter egg déjà trouvé');

    $db->prepare(
        'INSERT INTO vs_user_easter_eggs (clerk_user_id, egg_id) VALUES (:uid, :eid)'
    )->execute([':uid' => $user['id'], ':eid' => $egg['id']]);

    if ($egg['xp_reward'] > 0) addXp($user['id'], (int)$egg['xp_reward']);
    if ($egg['badge_reward']) {
        $b = $db->prepare('SELECT slug FROM vs_badges WHERE id = :id LIMIT 1');
        $b->execute([':id' => $egg['badge_reward']]);
        $badge = $b->fetch();
        if ($badge) grantBadge($user['id'], $badge['slug']);
    }

    // Badge egg_hunter ?
    $eggCount = (int)$db->query(
        'SELECT COUNT(*) FROM vs_user_easter_eggs WHERE clerk_user_id = "' . addslashes($user['id']) . '"'
    )->fetchColumn();
    triggerQuestProgress($user['id'], 'first_easter_egg', 1);
    if ($eggCount >= 5) {
        grantBadge($user['id'], 'egg_hunter');
        triggerQuestProgress($user['id'], 'five_easter_eggs', 5);
    }

    $totalEggs = (int)$db->query('SELECT COUNT(*) FROM vs_easter_eggs')->fetchColumn();
    if ($eggCount >= $totalEggs) triggerQuestProgress($user['id'], 'all_easter_eggs', $totalEggs);

    jsonResponse(['success' => true, 'xp_earned' => (int)$egg['xp_reward']]);
}

/* ─── GET: forum ─────────────────────────────────────────────────────────── */

function handleGetForumPosts(): void {
    $db       = getDB();
    $category = sanitizeText(isset($_GET['category']) ? $_GET['category'] : '', 64);
    $page     = max(1, (int)(isset($_GET['page']) ? $_GET['page'] : 1));
    $limit    = 20;
    $offset   = ($page - 1) * $limit;

    $where  = $category ? 'WHERE f.category = :cat AND f.parent_id IS NULL' : 'WHERE f.parent_id IS NULL';
    $params = $category ? [':cat' => $category] : [];

    $stmt = $db->prepare(
        "SELECT f.id, f.author_id, f.title, f.category, f.tags, f.is_pinned, f.views,
                f.created_at, f.updated_at,
                p.display_name AS author_name, p.avatar_url AS author_avatar,
                (SELECT COUNT(*) FROM vs_forum_posts r WHERE r.parent_id = f.id) AS reply_count
         FROM vs_forum_posts f
         LEFT JOIN vs_profiles p ON p.clerk_user_id = f.author_id
         {$where}
         ORDER BY f.is_pinned DESC, f.updated_at DESC
         LIMIT {$limit} OFFSET {$offset}"
    );
    $stmt->execute($params);
    $posts = $stmt->fetchAll();

    foreach ($posts as &$post) {
        if (is_string($post['tags'])) $post['tags'] = json_decode($post['tags'], true);
    }

    jsonResponse(['posts' => $posts, 'page' => $page, 'limit' => $limit]);
}

/* ─── POST: créer post forum ────────────────────────────────────────────── */

function handleCreateForumPost(): void {
    $user = authenticate();
    ensureProfile($user);
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) jsonError(400, 'Corps invalide');

    $title    = sanitizeText(isset($body['title']) ? $body['title'] : '', 255);
    $content  = sanitizeText(isset($body['content']) ? $body['content'] : '', 10000);
    $category = sanitizeText(isset($body['category']) ? $body['category'] : 'general', 64);
    $tags     = is_array(isset($body['tags']) ? $body['tags'] : null) ? array_slice($body['tags'], 0, 10) : array();
    $parentId = isset($body['parent_id']) ? (int)$body['parent_id'] : null;

    if (!$parentId && empty($title)) jsonError(400, 'Titre requis');
    if (empty($content)) jsonError(400, 'Contenu requis');

    $allowedCategories = ['general','aide','feedback','annonces','projets','arts','gaming','off-topic'];
    if (!in_array($category, $allowedCategories)) $category = 'general';

    $db = getDB();

    if ($parentId) {
        $check = $db->prepare('SELECT id, is_locked FROM vs_forum_posts WHERE id = :id AND parent_id IS NULL LIMIT 1');
        $check->execute([':id' => $parentId]);
        $parent = $check->fetch();
        if (!$parent) jsonError(404, 'Post parent introuvable');
        if ($parent['is_locked']) jsonError(403, 'Ce post est verrouillé');
    }

    $db->prepare(
        'INSERT INTO vs_forum_posts (author_id, title, content, category, tags, parent_id)
         VALUES (:uid, :title, :content, :cat, :tags, :parent)'
    )->execute([
        ':uid'     => $user['id'],
        ':title'   => $title,
        ':content' => $content,
        ':cat'     => $category,
        ':tags'    => json_encode($tags),
        ':parent'  => $parentId,
    ]);

    $newId = (int)$db->lastInsertId();

    triggerQuestProgress($user['id'], 'first_forum_post', 1);
    if ($parentId) triggerQuestProgress($user['id'], 'forum_10_replies', 1);
    grantBadge($user['id'], 'first_forum_post');

    jsonResponse(['success' => true, 'id' => $newId], 201);
}

/* ─── GET: détail d'un post + ses réponses ───────────────────────────────── */

function handleGetPost(int $postId): void {
    $db = getDB();

    $db->prepare('UPDATE vs_forum_posts SET views = views + 1 WHERE id = :id')->execute([':id' => $postId]);

    $stmt = $db->prepare(
        'SELECT f.id, f.author_id, f.title, f.content, f.category, f.tags,
                f.is_pinned, f.is_locked, f.views, f.created_at, f.updated_at,
                p.display_name AS author_name, p.avatar_url AS author_avatar,
                p.account_type AS author_type, p.is_verified AS author_verified
         FROM vs_forum_posts f
         LEFT JOIN vs_profiles p ON p.clerk_user_id = f.author_id
         WHERE f.id = :id AND f.parent_id IS NULL LIMIT 1'
    );
    $stmt->execute([':id' => $postId]);
    $post = $stmt->fetch();
    if (!$post) jsonError(404, 'Post introuvable');

    if (is_string($post['tags'])) $post['tags'] = json_decode($post['tags'], true);

    $replies = $db->prepare(
        'SELECT f.id, f.author_id, f.content, f.created_at, f.updated_at,
                p.display_name AS author_name, p.avatar_url AS author_avatar,
                p.account_type AS author_type, p.is_verified AS author_verified
         FROM vs_forum_posts f
         LEFT JOIN vs_profiles p ON p.clerk_user_id = f.author_id
         WHERE f.parent_id = :id
         ORDER BY f.created_at ASC'
    );
    $replies->execute([':id' => $postId]);
    $post['replies'] = $replies->fetchAll();

    jsonResponse(['post' => $post]);
}

/* ─── DELETE: supprimer un post ─────────────────────────────────────────── */

function handleDeletePost(int $postId): void {
    $user = authenticate();
    $db   = getDB();

    $stmt = $db->prepare(
        'SELECT author_id FROM vs_forum_posts WHERE id = :id LIMIT 1'
    );
    $stmt->execute([':id' => $postId]);
    $post = $stmt->fetch();
    if (!$post) jsonError(404, 'Post introuvable');

    if ($post['author_id'] !== $user['id'] && !in_array($user['role'], ['staff','admin','entreprise'])) {
        jsonError(403, 'Non autorisé');
    }

    $db->prepare('DELETE FROM vs_forum_posts WHERE id = :id')->execute([':id' => $postId]);
    jsonResponse(['success' => true]);
}

/* ─── GET: activité récente d'un profil ─────────────────────────────────── */

function handleGetActivity(): void {
    $targetId = $_GET['activity'] !== '1' ? sanitizeText($_GET['activity'], 255) : null;

    if (!$targetId) {
        $user = authenticate();
        $targetId = $user['id'];
    }

    $db = getDB();
    $events = [];

    // Posts forum
    $posts = $db->prepare(
        'SELECT "forum_post" AS type, f.id AS ref_id, f.title AS label,
                f.category AS meta, f.created_at AS ts
         FROM vs_forum_posts f
         WHERE f.author_id = :uid AND f.parent_id IS NULL
         ORDER BY f.created_at DESC LIMIT 10'
    );
    $posts->execute([':uid' => $targetId]);
    foreach ($posts->fetchAll() as $r) $events[] = $r;

    // Réponses forum
    $replies = $db->prepare(
        'SELECT "forum_reply" AS type, f.id AS ref_id,
                SUBSTRING(f.content, 1, 80) AS label,
                f.parent_id AS meta, f.created_at AS ts
         FROM vs_forum_posts f
         WHERE f.author_id = :uid AND f.parent_id IS NOT NULL
         ORDER BY f.created_at DESC LIMIT 10'
    );
    $replies->execute([':uid' => $targetId]);
    foreach ($replies->fetchAll() as $r) $events[] = $r;

    // Badges obtenus
    $badges = $db->prepare(
        'SELECT "badge_earned" AS type, b.id AS ref_id, b.name AS label,
                b.rarity AS meta, ub.granted_at AS ts
         FROM vs_user_badges ub
         JOIN vs_badges b ON b.id = ub.badge_id
         WHERE ub.clerk_user_id = :uid
         ORDER BY ub.granted_at DESC LIMIT 10'
    );
    $badges->execute([':uid' => $targetId]);
    foreach ($badges->fetchAll() as $r) $events[] = $r;

    // Quêtes complétées
    $quests = $db->prepare(
        'SELECT "quest_completed" AS type, q.id AS ref_id, q.title AS label,
                q.xp_reward AS meta, uq.completed_at AS ts
         FROM vs_user_quests uq
         JOIN vs_quests q ON q.id = uq.quest_id
         WHERE uq.clerk_user_id = :uid AND uq.status = "completed"
         ORDER BY uq.completed_at DESC LIMIT 10'
    );
    $quests->execute([':uid' => $targetId]);
    foreach ($quests->fetchAll() as $r) $events[] = $r;

    // Easter eggs trouvés
    $eggs = $db->prepare(
        'SELECT "egg_found" AS type, e.id AS ref_id, e.title AS label,
                e.xp_reward AS meta, uee.found_at AS ts
         FROM vs_user_easter_eggs uee
         JOIN vs_easter_eggs e ON e.id = uee.egg_id
         WHERE uee.clerk_user_id = :uid
         ORDER BY uee.found_at DESC LIMIT 10'
    );
    $eggs->execute([':uid' => $targetId]);
    foreach ($eggs->fetchAll() as $r) $events[] = $r;

    // Tri chronologique décroissant
    usort($events, create_function('$a,$b', 'return strcmp(isset($b["ts"]) ? $b["ts"] : "", isset($a["ts"]) ? $a["ts"] : "");'));
    $events = array_slice($events, 0, 30);

    jsonResponse(['activity' => $events]);
}

/* ─── GET: messages reçus + conversation ────────────────────────────────── */

function handleGetMessages(): void {
    $user = authenticate();
    $db   = getDB();

    $withUser = sanitizeText(isset($_GET['with']) ? $_GET['with'] : '', 255);

    if ($withUser) {
        // Conversation avec un utilisateur spécifique
        $stmt = $db->prepare(
            'SELECT m.id, m.from_user_id, m.to_user_id, m.is_read, m.created_at,
                    pf.display_name AS from_name, pf.avatar_url AS from_avatar
             FROM vs_messages m
             LEFT JOIN vs_profiles pf ON pf.clerk_user_id = m.from_user_id
             WHERE (m.from_user_id = :uid AND m.to_user_id = :with)
                OR (m.from_user_id = :with2 AND m.to_user_id = :uid2)
             ORDER BY m.created_at ASC
             LIMIT 100'
        );
        $stmt->execute([':uid' => $user['id'], ':with' => $withUser, ':with2' => $withUser, ':uid2' => $user['id']]);
        $messages = $stmt->fetchAll();

        // Déchiffrer les messages
        $aesKey = !empty(getenv('BRIDGE_AES_KEY')) ? hex2bin(getenv('BRIDGE_AES_KEY')) : null;
        foreach ($messages as &$msg) {
            $msg['content'] = decryptMessage($msg['id'], $aesKey);
        }
        jsonResponse(['messages' => $messages]);
    } else {
        // Liste des conversations (derniers messages par interlocuteur)
        $stmt = $db->prepare(
            'SELECT m.id, m.from_user_id, m.to_user_id, m.created_at, m.is_read,
                    p.display_name AS other_name, p.avatar_url AS other_avatar
             FROM vs_messages m
             JOIN (
               SELECT MAX(id) AS max_id
               FROM vs_messages
               WHERE from_user_id = :uid OR to_user_id = :uid2
               GROUP BY LEAST(from_user_id, to_user_id), GREATEST(from_user_id, to_user_id)
             ) sub ON m.id = sub.max_id
             LEFT JOIN vs_profiles p ON p.clerk_user_id = IF(m.from_user_id = :uid3, m.to_user_id, m.from_user_id)
             ORDER BY m.created_at DESC
             LIMIT 50'
        );
        $stmt->execute([':uid' => $user['id'], ':uid2' => $user['id'], ':uid3' => $user['id']]);
        $convs = $stmt->fetchAll();

        // Compter les non-lus
        $unread = $db->prepare(
            'SELECT COUNT(*) FROM vs_messages WHERE to_user_id = :uid AND is_read = 0'
        );
        $unread->execute([':uid' => $user['id']]);

        jsonResponse(['conversations' => $convs, 'unread_count' => (int)$unread->fetchColumn()]);
    }
}

function decryptMessage(int $msgId, ?string $key): string {
    if (!$key) return '[message chiffré]';
    $db = getDB();
    $row = $db->prepare('SELECT content_encrypted, iv FROM vs_messages WHERE id = :id LIMIT 1');
    $row->execute([':id' => $msgId]);
    $msg = $row->fetch();
    if (!$msg || !$msg['content_encrypted'] || !$msg['iv']) return '';

    $iv         = base64_decode($msg['iv']);
    $raw        = base64_decode($msg['content_encrypted']);
    $tag        = substr($raw, -16);
    $ciphertext = substr($raw, 0, -16);

    $plain = openssl_decrypt($ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    return $plain !== false ? $plain : '[déchiffrement impossible]';
}

/* ─── POST: envoyer un message ───────────────────────────────────────────── */

function handleSendMessage(): void {
    $user = authenticate();
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) jsonError(400, 'Corps invalide');

    $toId   = sanitizeText(isset($body['to_user_id']) ? $body['to_user_id'] : '', 255);
    $text   = mb_substr(trim(isset($body['content']) ? $body['content'] : ''), 0, 2000);
    if (empty($toId) || empty($text)) jsonError(400, 'to_user_id et content requis');
    if ($toId === $user['id']) jsonError(400, 'Tu ne peux pas t\'envoyer un message à toi-même');

    $db = getDB();

    // Vérifier que le destinataire existe
    $check = $db->prepare('SELECT clerk_user_id FROM vs_profiles WHERE clerk_user_id = :id LIMIT 1');
    $check->execute([':id' => $toId]);
    if (!$check->fetch()) jsonError(404, 'Destinataire introuvable');

    // Chiffrer le contenu
    $aesKey = !empty(getenv('BRIDGE_AES_KEY')) ? hex2bin(getenv('BRIDGE_AES_KEY')) : null;
    if (!$aesKey) jsonError(500, 'Clé de chiffrement non configurée');

    $iv         = random_bytes(12);
    $tag        = '';
    $ciphertext = openssl_encrypt($text, 'aes-256-gcm', $aesKey, OPENSSL_RAW_DATA, $iv, $tag, '', 16);
    if ($ciphertext === false) jsonError(500, 'Erreur de chiffrement');

    $db->prepare(
        'INSERT INTO vs_messages (from_user_id, to_user_id, content_encrypted, iv)
         VALUES (:from, :to, :cipher, :iv)'
    )->execute([
        ':from'   => $user['id'],
        ':to'     => $toId,
        ':cipher' => base64_encode($ciphertext . $tag),
        ':iv'     => base64_encode($iv),
    ]);

    jsonResponse(['success' => true, 'id' => (int)$db->lastInsertId()], 201);
}

/* ─── PATCH: marquer messages comme lus ─────────────────────────────────── */

function handleMarkMessagesRead(): void {
    $user   = authenticate();
    $fromId = sanitizeText(isset($_GET['msg_read']) ? $_GET['msg_read'] : '', 255);
    $db     = getDB();

    $stmt = $db->prepare(
        'UPDATE vs_messages SET is_read = 1
         WHERE to_user_id = :uid' . ($fromId ? ' AND from_user_id = :from' : '')
    );
    $params = [':uid' => $user['id']];
    if ($fromId) $params[':from'] = $fromId;
    $stmt->execute($params);

    jsonResponse(['success' => true, 'updated' => $stmt->rowCount()]);
}

/* ─── Niveau de permission entreprise ───────────────────────────────────── */

function getEntreprisePermissionLevel(string $role, string $accountType): int {
    if ($accountType === 'entreprise') return 4;
    $r = strtolower($role);
    if (in_array($r, ['proprietaire', 'fondateur', 'owner']))              return 4;
    if (in_array($r, ['admin', 'administrateur']))                         return 3;
    if (in_array($r, ['moderateur', 'manager', 'responsable', 'staff']))   return 2;
    return 0;
}

/* ─── GET: profil entreprise ─────────────────────────────────────────────── */

function handleGetEntreprise(): void {
    $user = authenticate();
    $db   = getDB();

    $pStmt = $db->prepare('SELECT account_type FROM vs_profiles WHERE clerk_user_id = :id LIMIT 1');
    $pStmt->execute([':id' => $user['id']]);
    $profile = $pStmt->fetch();

    $level = getEntreprisePermissionLevel($user['role'], isset($profile['account_type']) ? $profile['account_type'] : '');
    if ($level === 0) jsonError(403, 'Accès refusé : aucun compte entreprise');

    $stmt = $db->prepare('SELECT * FROM vs_profiles_entreprise WHERE clerk_user_id = :id LIMIT 1');
    $stmt->execute([':id' => $user['id']]);
    $entreprise = $stmt->fetch() ?: null;

    jsonResponse(['entreprise' => $entreprise, 'level' => $level]);
}

/* ─── PATCH: mettre à jour le profil entreprise ──────────────────────────── */

function handleUpdateEntreprise(): void {
    $user = authenticate();
    $db   = getDB();

    $pStmt = $db->prepare('SELECT account_type FROM vs_profiles WHERE clerk_user_id = :id LIMIT 1');
    $pStmt->execute([':id' => $user['id']]);
    $profile = $pStmt->fetch();

    $level = getEntreprisePermissionLevel($user['role'], isset($profile['account_type']) ? $profile['account_type'] : '');
    if ($level < 2) jsonError(403, 'Permissions insuffisantes');

    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) jsonError(400, 'Corps invalide');

    // Champs autorisés selon le niveau
    $allowedByLevel = [
        2 => ['description', 'contact_email', 'social_links'],
        3 => ['description', 'contact_email', 'social_links', 'industry', 'employees_range'],
        4 => ['description', 'contact_email', 'social_links', 'industry', 'employees_range',
               'company_name', 'company_logo', 'company_banner', 'founded_year'],
    ];
    $allowed = isset($allowedByLevel[min($level, 4)]) ? $allowedByLevel[min($level, 4)] : array();

    $fields = [];
    $params = [':uid' => $user['id']];

    foreach ($allowed as $field) {
        if (!array_key_exists($field, $body)) continue;
        $val = match ($field) {
            'company_name'     => sanitizeText($body[$field], 200),
            'description'      => sanitizeText($body[$field], 1000),
            'industry'         => sanitizeText($body[$field], 100),
            'employees_range'  => sanitizeText($body[$field], 50),
            'contact_email'    => filter_var($body[$field], FILTER_VALIDATE_EMAIL) ? $body[$field] : null,
            'company_logo',
            'company_banner'   => filter_var($body[$field], FILTER_VALIDATE_URL) ? $body[$field] : ($body[$field] === '' ? null : null),
            'social_links'     => is_array($body[$field]) ? json_encode($body[$field]) : null,
            'founded_year'     => (is_numeric($body[$field]) && $body[$field] >= 1900 && $body[$field] <= 2100) ? (int)$body[$field] : null,
            default            => null,
        };
        if ($val !== null || (in_array($field, ['description','industry']) && $body[$field] === '')) {
            $fields[] = "`{$field}` = :{$field}";
            $params[":{$field}"] = $val;
        }
    }

    if (empty($fields)) jsonError(400, 'Aucun champ valide à mettre à jour');

    // Upsert : créer la ligne si elle n'existe pas encore
    $db->prepare(
        'INSERT INTO vs_profiles_entreprise (clerk_user_id, company_name)
         VALUES (:uid, :name)
         ON DUPLICATE KEY UPDATE clerk_user_id = :uid'
    )->execute([':uid' => $user['id'], ':name' => $user['name']]);

    $db->prepare(
        'UPDATE vs_profiles_entreprise SET ' . implode(', ', $fields) . ', updated_at = NOW()
         WHERE clerk_user_id = :uid'
    )->execute($params);

    jsonResponse(['success' => true, 'level' => $level]);
}

/* ─── GET: recherche de profils ──────────────────────────────────────────── */

function handleSearchProfiles(): void {
    $q     = sanitizeText(isset($_GET['search']) ? $_GET['search'] : '', 100);
    $limit = min(20, max(1, (int)(isset($_GET['limit']) ? $_GET['limit'] : 10)));

    if (strlen($q) < 2) jsonError(400, 'Requête trop courte (min 2 caractères)');

    $db   = getDB();
    $like = '%' . $q . '%';
    $stmt = $db->prepare(
        'SELECT clerk_user_id, display_name, username, avatar_url,
                account_type, is_verified, custom_status
         FROM vs_profiles
         WHERE display_name LIKE :q OR username LIKE :q2
         ORDER BY is_verified DESC, display_name ASC
         LIMIT :lim'
    );
    $stmt->bindValue(':q',   $like, PDO::PARAM_STR);
    $stmt->bindValue(':q2',  $like, PDO::PARAM_STR);
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();

    jsonResponse(['results' => $stmt->fetchAll()]);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOCIAL : FRIENDS / FOLLOWS / BLOCKS / REPORTS / NOTIFS / MASTER USERS
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Helpers ────────────────────────────────────────────── */

function assertTargetExists(string $targetId): void {
    if (empty($targetId) || $targetId === '1') jsonError(400, 'Identifiant cible requis');
    $db = getDB();
    $s = $db->prepare('SELECT 1 FROM vs_profiles WHERE clerk_user_id = :id LIMIT 1');
    $s->execute([':id' => $targetId]);
    if (!$s->fetch()) jsonError(404, 'Utilisateur introuvable');
}

function isBlockedBetween(string $a, string $b): bool {
    $db = getDB();
    $s  = $db->prepare(
        'SELECT 1 FROM vs_user_blocks
         WHERE (blocker_id = :a AND blocked_id = :b)
            OR (blocker_id = :b2 AND blocked_id = :a2)
         LIMIT 1'
    );
    $s->execute([':a' => $a, ':b' => $b, ':a2' => $a, ':b2' => $b]);
    return (bool)$s->fetch();
}

function notify(string $userId, string $type, ?string $actorId = null, ?string $refType = null, ?int $refId = null, ?string $content = null): void {
    if ($userId === $actorId) return;
    $db = getDB();
    $db->prepare(
        'INSERT INTO vs_notifications (clerk_user_id, type, actor_id, ref_type, ref_id, content)
         VALUES (:uid, :type, :actor, :rt, :rid, :content)'
    )->execute([
        ':uid'     => $userId,
        ':type'    => $type,
        ':actor'   => $actorId,
        ':rt'      => $refType,
        ':rid'     => $refId,
        ':content' => $content,
    ]);
}

/* ─── FRIENDS ────────────────────────────────────────────── */

function handleGetFriends(): void {
    $user = authenticate();
    $db   = getDB();

    // Demandes reçues en attente
    $pending = $db->prepare(
        'SELECT f.id, f.requester_id, f.created_at,
                p.display_name, p.username, p.avatar_url
         FROM vs_friendships f
         JOIN vs_profiles p ON p.clerk_user_id = f.requester_id
         WHERE f.addressee_id = :uid AND f.status = "pending"
         ORDER BY f.created_at DESC'
    );
    $pending->execute([':uid' => $user['id']]);

    // Demandes envoyées en attente
    $sent = $db->prepare(
        'SELECT f.id, f.addressee_id, f.created_at,
                p.display_name, p.username, p.avatar_url
         FROM vs_friendships f
         JOIN vs_profiles p ON p.clerk_user_id = f.addressee_id
         WHERE f.requester_id = :uid AND f.status = "pending"
         ORDER BY f.created_at DESC'
    );
    $sent->execute([':uid' => $user['id']]);

    // Amis acceptés (dans les 2 sens)
    $friends = $db->prepare(
        'SELECT f.id, f.accepted_at,
                CASE WHEN f.requester_id = :uid THEN f.addressee_id ELSE f.requester_id END AS friend_id,
                p.display_name, p.username, p.avatar_url, p.status, p.custom_status
         FROM vs_friendships f
         JOIN vs_profiles p ON p.clerk_user_id =
              (CASE WHEN f.requester_id = :uid2 THEN f.addressee_id ELSE f.requester_id END)
         WHERE (f.requester_id = :uid3 OR f.addressee_id = :uid4) AND f.status = "accepted"
         ORDER BY p.display_name ASC'
    );
    $friends->execute([':uid' => $user['id'], ':uid2' => $user['id'], ':uid3' => $user['id'], ':uid4' => $user['id']]);

    jsonResponse([
        'pending'  => $pending->fetchAll(),
        'sent'     => $sent->fetchAll(),
        'friends'  => $friends->fetchAll(),
    ]);
}

function handleFriendRequest(string $targetId): void {
    $user = authenticate();
    assertTargetExists($targetId);
    if ($targetId === $user['id']) jsonError(400, 'Tu ne peux pas t\'ajouter toi-même');
    if (isBlockedBetween($user['id'], $targetId)) jsonError(403, 'Action impossible');

    $db = getDB();
    // Si déjà accepté, ignorer
    $exists = $db->prepare(
        'SELECT id, status, requester_id FROM vs_friendships
         WHERE (requester_id = :a AND addressee_id = :b)
            OR (requester_id = :b2 AND addressee_id = :a2)
         LIMIT 1'
    );
    $exists->execute([':a' => $user['id'], ':b' => $targetId, ':a2' => $user['id'], ':b2' => $targetId]);
    $row = $exists->fetch();

    if ($row) {
        if ($row['status'] === 'accepted') jsonError(409, 'Vous êtes déjà amis');
        // Si l'autre nous avait déjà demandé → accepter d'office
        if ($row['status'] === 'pending' && $row['requester_id'] === $targetId) {
            $db->prepare('UPDATE vs_friendships SET status = "accepted", accepted_at = NOW() WHERE id = :id')
               ->execute([':id' => $row['id']]);
            notify($targetId, 'friend_accepted', $user['id']);
            triggerQuestProgress($user['id'], 'add_connection', 1);
            jsonResponse(['success' => true, 'status' => 'accepted']);
        }
        if ($row['status'] === 'pending') jsonError(409, 'Demande déjà envoyée');
    }

    $db->prepare(
        'INSERT INTO vs_friendships (requester_id, addressee_id, status)
         VALUES (:a, :b, "pending")
         ON DUPLICATE KEY UPDATE status = "pending"'
    )->execute([':a' => $user['id'], ':b' => $targetId]);

    notify($targetId, 'friend_request', $user['id']);
    jsonResponse(['success' => true, 'status' => 'pending']);
}

function handleFriendAccept(string $targetId): void {
    $user = authenticate();
    assertTargetExists($targetId);
    $db = getDB();
    $stmt = $db->prepare(
        'UPDATE vs_friendships SET status = "accepted", accepted_at = NOW()
         WHERE requester_id = :req AND addressee_id = :me AND status = "pending"'
    );
    $stmt->execute([':req' => $targetId, ':me' => $user['id']]);
    if ($stmt->rowCount() === 0) jsonError(404, 'Demande introuvable');
    notify($targetId, 'friend_accepted', $user['id']);
    jsonResponse(['success' => true]);
}

function handleFriendDecline(string $targetId): void {
    $user = authenticate();
    $db = getDB();
    $stmt = $db->prepare(
        'DELETE FROM vs_friendships
         WHERE requester_id = :req AND addressee_id = :me AND status = "pending"'
    );
    $stmt->execute([':req' => $targetId, ':me' => $user['id']]);
    jsonResponse(['success' => true, 'removed' => $stmt->rowCount()]);
}

function handleFriendRemove(string $targetId): void {
    $user = authenticate();
    $db = getDB();
    $stmt = $db->prepare(
        'DELETE FROM vs_friendships
         WHERE (requester_id = :a AND addressee_id = :b)
            OR (requester_id = :b2 AND addressee_id = :a2)'
    );
    $stmt->execute([':a' => $user['id'], ':b' => $targetId, ':a2' => $user['id'], ':b2' => $targetId]);
    jsonResponse(['success' => true, 'removed' => $stmt->rowCount()]);
}

/* ─── FOLLOWS ────────────────────────────────────────────── */

function handleFollow(string $targetId): void {
    $user = authenticate();
    assertTargetExists($targetId);
    if ($targetId === $user['id']) jsonError(400, 'Tu ne peux pas te suivre toi-même');
    if (isBlockedBetween($user['id'], $targetId)) jsonError(403, 'Action impossible');

    $db = getDB();
    $db->prepare(
        'INSERT IGNORE INTO vs_user_follows (follower_id, following_id)
         VALUES (:a, :b)'
    )->execute([':a' => $user['id'], ':b' => $targetId]);

    notify($targetId, 'new_follower', $user['id']);

    // Badge "influencer" si 100+ followers
    $cnt = (int)$db->query('SELECT COUNT(*) FROM vs_user_follows WHERE following_id = ' . $db->quote($targetId))->fetchColumn();
    if ($cnt >= 100) grantBadge($targetId, 'influencer');

    jsonResponse(['success' => true]);
}

function handleUnfollow(string $targetId): void {
    $user = authenticate();
    $db = getDB();
    $stmt = $db->prepare('DELETE FROM vs_user_follows WHERE follower_id = :a AND following_id = :b');
    $stmt->execute([':a' => $user['id'], ':b' => $targetId]);
    jsonResponse(['success' => true, 'removed' => $stmt->rowCount()]);
}

function handleGetFollowers(string $targetId): void {
    if ($targetId === '1') { $user = authenticate(); $targetId = $user['id']; }
    $db = getDB();
    $stmt = $db->prepare(
        'SELECT f.follower_id, f.created_at,
                p.display_name, p.username, p.avatar_url
         FROM vs_user_follows f
         JOIN vs_profiles p ON p.clerk_user_id = f.follower_id
         WHERE f.following_id = :id
         ORDER BY f.created_at DESC
         LIMIT 100'
    );
    $stmt->execute([':id' => $targetId]);
    jsonResponse(['followers' => $stmt->fetchAll()]);
}

function handleGetFollowing(string $targetId): void {
    if ($targetId === '1') { $user = authenticate(); $targetId = $user['id']; }
    $db = getDB();
    $stmt = $db->prepare(
        'SELECT f.following_id, f.created_at,
                p.display_name, p.username, p.avatar_url
         FROM vs_user_follows f
         JOIN vs_profiles p ON p.clerk_user_id = f.following_id
         WHERE f.follower_id = :id
         ORDER BY f.created_at DESC
         LIMIT 100'
    );
    $stmt->execute([':id' => $targetId]);
    jsonResponse(['following' => $stmt->fetchAll()]);
}

/* ─── BLOCKS ─────────────────────────────────────────────── */

function handleBlock(string $targetId): void {
    $user = authenticate();
    assertTargetExists($targetId);
    if ($targetId === $user['id']) jsonError(400, 'Tu ne peux pas te bloquer toi-même');
    $body   = json_decode(file_get_contents('php://input'), true);
    $reason = sanitizeText(isset($body['reason']) ? $body['reason'] : '', 255);

    $db = getDB();
    $db->prepare(
        'INSERT INTO vs_user_blocks (blocker_id, blocked_id, reason)
         VALUES (:a, :b, :r)
         ON DUPLICATE KEY UPDATE reason = :r2'
    )->execute([':a' => $user['id'], ':b' => $targetId, ':r' => $reason, ':r2' => $reason]);

    // Effets de bord : supprime amitié + follow dans les 2 sens
    $db->prepare('DELETE FROM vs_friendships WHERE (requester_id = :a AND addressee_id = :b) OR (requester_id = :b2 AND addressee_id = :a2)')
       ->execute([':a' => $user['id'], ':b' => $targetId, ':a2' => $user['id'], ':b2' => $targetId]);
    $db->prepare('DELETE FROM vs_user_follows WHERE (follower_id = :a AND following_id = :b) OR (follower_id = :b2 AND following_id = :a2)')
       ->execute([':a' => $user['id'], ':b' => $targetId, ':a2' => $user['id'], ':b2' => $targetId]);

    jsonResponse(['success' => true]);
}

function handleUnblock(string $targetId): void {
    $user = authenticate();
    $db = getDB();
    $stmt = $db->prepare('DELETE FROM vs_user_blocks WHERE blocker_id = :a AND blocked_id = :b');
    $stmt->execute([':a' => $user['id'], ':b' => $targetId]);
    jsonResponse(['success' => true, 'removed' => $stmt->rowCount()]);
}

function handleGetBlocked(): void {
    $user = authenticate();
    $db = getDB();
    $stmt = $db->prepare(
        'SELECT b.blocked_id, b.reason, b.created_at,
                p.display_name, p.username, p.avatar_url
         FROM vs_user_blocks b
         LEFT JOIN vs_profiles p ON p.clerk_user_id = b.blocked_id
         WHERE b.blocker_id = :uid
         ORDER BY b.created_at DESC'
    );
    $stmt->execute([':uid' => $user['id']]);
    jsonResponse(['blocked' => $stmt->fetchAll()]);
}

/* ─── REPORTS ────────────────────────────────────────────── */

function handleReport(string $targetId): void {
    $user = authenticate();
    $body = json_decode(file_get_contents('php://input'), true);
    $reason     = sanitizeText(isset($body['reason']) ? $body['reason'] : 'other', 64);
    $targetType = sanitizeText(isset($body['target_type']) ? $body['target_type'] : 'profile', 32);
    $details    = sanitizeText(isset($body['details']) ? $body['details'] : '', 2000);
    $refId      = isset($body['ref_id']) ? (int)$body['ref_id'] : null;

    $allowedTypes   = ['profile','forum_post','message','connection'];
    $allowedReasons = ['spam','harassment','hate','sexual','violence','scam','impersonation','other'];
    if (!in_array($targetType, $allowedTypes))   $targetType = 'profile';
    if (!in_array($reason, $allowedReasons))     $reason     = 'other';

    $db = getDB();
    $db->prepare(
        'INSERT INTO vs_user_reports (reporter_id, target_id, target_type, target_ref_id, reason, details)
         VALUES (:rid, :tid, :tt, :rfid, :reason, :details)'
    )->execute([
        ':rid' => $user['id'], ':tid' => $targetId, ':tt' => $targetType,
        ':rfid' => $refId, ':reason' => $reason, ':details' => $details,
    ]);
    jsonResponse(['success' => true], 201);
}

/* ─── SOCIAL STATE / COUNTS ──────────────────────────────── */

function handleGetSocialState(string $targetId): void {
    $user = authenticate();
    assertTargetExists($targetId);
    $db = getDB();

    $checkFollow = $db->prepare('SELECT 1 FROM vs_user_follows WHERE follower_id = :a AND following_id = :b LIMIT 1');
    $checkFollow->execute([':a' => $user['id'], ':b' => $targetId]);
    $isFollowing = (bool)$checkFollow->fetch();

    $checkFollow2 = $db->prepare('SELECT 1 FROM vs_user_follows WHERE follower_id = :a AND following_id = :b LIMIT 1');
    $checkFollow2->execute([':a' => $targetId, ':b' => $user['id']]);
    $followerOfMe = (bool)$checkFollow2->fetch();

    $checkBlock1 = $db->prepare('SELECT 1 FROM vs_user_blocks WHERE blocker_id = :a AND blocked_id = :b LIMIT 1');
    $checkBlock1->execute([':a' => $user['id'], ':b' => $targetId]);
    $blocked = (bool)$checkBlock1->fetch();

    $checkBlock2 = $db->prepare('SELECT 1 FROM vs_user_blocks WHERE blocker_id = :a AND blocked_id = :b LIMIT 1');
    $checkBlock2->execute([':a' => $targetId, ':b' => $user['id']]);
    $blocking = (bool)$checkBlock2->fetch();

    $fStmt = $db->prepare(
        'SELECT status, requester_id FROM vs_friendships
         WHERE (requester_id = :a AND addressee_id = :b)
            OR (requester_id = :b2 AND addressee_id = :a2)
         LIMIT 1'
    );
    $fStmt->execute([':a' => $user['id'], ':b' => $targetId, ':a2' => $user['id'], ':b2' => $targetId]);
    $f = $fStmt->fetch();

    $friendStatus = 'none';
    if ($f) {
        if ($f['status'] === 'accepted')                                  $friendStatus = 'friends';
        elseif ($f['status'] === 'pending' && $f['requester_id'] === $user['id']) $friendStatus = 'request_sent';
        elseif ($f['status'] === 'pending')                               $friendStatus = 'request_received';
    }

    jsonResponse([
        'is_following'  => (bool)$isFollowing,
        'follower_of_me'=> $followerOfMe,
        'is_blocked'    => $blocked,    // je l'ai bloqué
        'blocked_by'    => $blocking,   // il m'a bloqué
        'friend_status' => $friendStatus,
    ]);
}

function handleGetSocialCounts(): void {
    $user = authenticate();
    $db = getDB();

    $friends = (int)$db->query(
        'SELECT COUNT(*) FROM vs_friendships
         WHERE status = "accepted" AND (requester_id = ' . $db->quote($user['id']) . ' OR addressee_id = ' . $db->quote($user['id']) . ')'
    )->fetchColumn();

    $followers = (int)$db->query('SELECT COUNT(*) FROM vs_user_follows WHERE following_id = ' . $db->quote($user['id']))->fetchColumn();
    $following = (int)$db->query('SELECT COUNT(*) FROM vs_user_follows WHERE follower_id  = ' . $db->quote($user['id']))->fetchColumn();
    $pending   = (int)$db->query('SELECT COUNT(*) FROM vs_friendships WHERE status = "pending" AND addressee_id = ' . $db->quote($user['id']))->fetchColumn();

    // Badge "top_friend" si 50+
    if ($friends >= 50) grantBadge($user['id'], 'top_friend');

    jsonResponse([
        'friends'         => $friends,
        'followers'       => $followers,
        'following'       => $following,
        'pending_requests'=> $pending,
    ]);
}

/* ─── USERNAME RESOLVER ──────────────────────────────────── */

function handleResolveUsername(string $username): void {
    $username = trim(ltrim($username, '@'));
    if (strlen($username) < 1) jsonError(400, 'Username requis');

    $db = getDB();
    $stmt = $db->prepare(
        'SELECT clerk_user_id, display_name, username, avatar_url, account_type, is_verified
         FROM vs_profiles WHERE username = :u LIMIT 1'
    );
    $stmt->execute([':u' => $username]);
    $profile = $stmt->fetch();
    if (!$profile) jsonError(404, 'Profil introuvable');
    jsonResponse(['profile' => $profile]);
}

/* ─── NOTIFICATIONS ──────────────────────────────────────── */

function handleGetNotifications(): void {
    $user = authenticate();
    $db = getDB();
    $stmt = $db->prepare(
        'SELECT n.id, n.type, n.actor_id, n.ref_type, n.ref_id, n.content, n.is_read, n.created_at,
                p.display_name AS actor_name, p.avatar_url AS actor_avatar, p.username AS actor_username
         FROM vs_notifications n
         LEFT JOIN vs_profiles p ON p.clerk_user_id = n.actor_id
         WHERE n.clerk_user_id = :uid
         ORDER BY n.is_read ASC, n.created_at DESC
         LIMIT 50'
    );
    $stmt->execute([':uid' => $user['id']]);
    $notifs = $stmt->fetchAll();

    $unread = (int)$db->query(
        'SELECT COUNT(*) FROM vs_notifications WHERE clerk_user_id = ' . $db->quote($user['id']) . ' AND is_read = 0'
    )->fetchColumn();

    jsonResponse(['notifications' => $notifs, 'unread' => $unread]);
}

function handleMarkNotifRead(string $id): void {
    $user = authenticate();
    $db = getDB();
    if ($id === 'all') {
        $db->prepare('UPDATE vs_notifications SET is_read = 1 WHERE clerk_user_id = :uid')
           ->execute([':uid' => $user['id']]);
    } else {
        $db->prepare('UPDATE vs_notifications SET is_read = 1 WHERE id = :id AND clerk_user_id = :uid')
           ->execute([':id' => (int)$id, ':uid' => $user['id']]);
    }
    jsonResponse(['success' => true]);
}

/* ═══ MASTER USERS ═══════════════════════════════════════════ */

function getMasterRole(string $userId): ?string {
    $db = getDB();
    $s  = $db->prepare('SELECT role FROM vs_master_users WHERE clerk_user_id = :id LIMIT 1');
    $s->execute([':id' => $userId]);
    $row = $s->fetch();
    return $row ? $row['role'] : null;
}

function requireMasterRole(array $allowed): array {
    $user = authenticate();
    $role = getMasterRole($user['id']);
    if (!$role || !in_array($role, $allowed)) jsonError(403, 'Permissions master insuffisantes');
    return ['user' => $user, 'role' => $role];
}

function handleGetMyMasterLevel(): void {
    $user = authenticate();
    $role = getMasterRole($user['id']);
    jsonResponse(['role' => $role, 'is_master' => $role !== null]);
}

function handleListMasterUsers(): void {
    requireMasterRole(['root','admin']);
    $db = getDB();
    $stmt = $db->query(
        'SELECT m.clerk_user_id, m.role, m.granted_by, m.granted_at, m.notes,
                p.display_name, p.username, p.avatar_url
         FROM vs_master_users m
         LEFT JOIN vs_profiles p ON p.clerk_user_id = m.clerk_user_id
         ORDER BY FIELD(m.role,"root","admin","moderator","support"), m.granted_at DESC'
    );
    jsonResponse(['masters' => $stmt->fetchAll()]);
}

function handleGrantMaster(string $targetId): void {
    $ctx  = requireMasterRole(['root']);
    assertTargetExists($targetId);
    $body = json_decode(file_get_contents('php://input'), true);
    $role = in_array(isset($body['role']) ? $body['role'] : '', array('admin','moderator','support')) ? (isset($body['role']) ? $body['role'] : '') : 'moderator';
    $notes= sanitizeText(isset($body['notes']) ? $body['notes'] : '', 500);

    $db = getDB();
    $db->prepare(
        'INSERT INTO vs_master_users (clerk_user_id, role, granted_by, notes)
         VALUES (:id, :role, :by, :notes)
         ON DUPLICATE KEY UPDATE role = :role2, notes = :notes2, granted_by = :by2'
    )->execute([
        ':id' => $targetId, ':role' => $role, ':by' => $ctx['user']['id'], ':notes' => $notes,
        ':role2' => $role, ':notes2' => $notes, ':by2' => $ctx['user']['id'],
    ]);

    // Grant le badge correspondant
    if ($role === 'moderator')      grantBadge($targetId, 'moderator_badge');
    elseif ($role === 'admin')      grantBadge($targetId, 'master');

    jsonResponse(['success' => true, 'role' => $role]);
}

function handleRevokeMaster(string $targetId): void {
    requireMasterRole(['root']);
    if ($targetId === 'user_2olKsdD74YamIINwpWl0e7XRxBh') jsonError(403, 'Le compte racine ne peut être révoqué');
    $db = getDB();
    $db->prepare('DELETE FROM vs_master_users WHERE clerk_user_id = :id')->execute([':id' => $targetId]);
    jsonResponse(['success' => true]);
}

function handleAdminGrantBadge(string $targetId): void {
    requireMasterRole(['root','admin','moderator']);
    assertTargetExists($targetId);
    $body = json_decode(file_get_contents('php://input'), true);
    $slug = sanitizeText(isset($body['slug']) ? $body['slug'] : '', 64);
    if (empty($slug)) jsonError(400, 'Slug requis');
    grantBadge($targetId, $slug);
    notify($targetId, 'badge_granted', null, 'badge', null, "Tu as obtenu le badge « {$slug} »");
    jsonResponse(['success' => true]);
}

function handleAdminRevokeBadge(string $targetId): void {
    requireMasterRole(['root','admin']);
    $slug = sanitizeText(isset($_GET['slug']) ? $_GET['slug'] : '', 64);
    if (empty($slug)) jsonError(400, 'Slug requis');
    $db = getDB();
    $db->prepare(
        'DELETE ub FROM vs_user_badges ub
         JOIN vs_badges b ON b.id = ub.badge_id
         WHERE ub.clerk_user_id = :uid AND b.slug = :slug'
    )->execute([':uid' => $targetId, ':slug' => $slug]);
    jsonResponse(['success' => true]);
}

function handleAdminVerifyUser(string $targetId): void {
    requireMasterRole(['root','admin']);
    $body = json_decode(file_get_contents('php://input'), true);
    $v = !empty($body['is_verified']) ? 1 : 0;
    $db = getDB();
    $db->prepare('UPDATE vs_profiles SET is_verified = :v WHERE clerk_user_id = :uid')
       ->execute([':v' => $v, ':uid' => $targetId]);
    if ($v) {
        grantBadge($targetId, 'certified');
        notify($targetId, 'account_verified', null, null, null, 'Ton compte a été certifié.');
    }
    jsonResponse(['success' => true, 'is_verified' => (bool)$v]);
}

function handleAdminBan(string $targetId): void {
    $ctx = requireMasterRole(['root','admin','moderator']);
    $body = json_decode(file_get_contents('php://input'), true);
    $reason   = sanitizeText(isset($body['reason']) ? $body['reason'] : '', 1000);
    $expires  = !empty($body['expires_at']) ? $body['expires_at'] : null;
    $db = getDB();
    $db->prepare(
        'INSERT INTO vs_user_bans (clerk_user_id, reason, banned_by, expires_at, is_active)
         VALUES (:uid, :r, :by, :exp, 1)
         ON DUPLICATE KEY UPDATE reason = :r2, banned_by = :by2, expires_at = :exp2, is_active = 1, banned_at = NOW()'
    )->execute([
        ':uid' => $targetId, ':r' => $reason, ':by' => $ctx['user']['id'], ':exp' => $expires,
        ':r2' => $reason, ':by2' => $ctx['user']['id'], ':exp2' => $expires,
    ]);
    jsonResponse(['success' => true]);
}

function handleAdminUnban(string $targetId): void {
    requireMasterRole(['root','admin']);
    $db = getDB();
    $db->prepare('UPDATE vs_user_bans SET is_active = 0 WHERE clerk_user_id = :uid')
       ->execute([':uid' => $targetId]);
    jsonResponse(['success' => true]);
}

function handleAdminReportsQueue(): void {
    requireMasterRole(['root','admin','moderator']);
    $db = getDB();
    $stmt = $db->query(
        'SELECT r.*, 
                rp.display_name AS reporter_name, rp.username AS reporter_username,
                tp.display_name AS target_name,   tp.username AS target_username
         FROM vs_user_reports r
         LEFT JOIN vs_profiles rp ON rp.clerk_user_id = r.reporter_id
         LEFT JOIN vs_profiles tp ON tp.clerk_user_id = r.target_id
         WHERE r.status IN ("open","reviewing")
         ORDER BY r.created_at DESC
         LIMIT 100'
    );
    jsonResponse(['reports' => $stmt->fetchAll()]);
}

function handleAdminReportHandle(int $reportId): void {
    $ctx = requireMasterRole(['root','admin','moderator']);
    $body = json_decode(file_get_contents('php://input'), true);
    $status = in_array(isset($body['status']) ? $body['status'] : '', array('reviewing','closed','rejected')) ? (isset($body['status']) ? $body['status'] : '') : 'reviewing';
    $db = getDB();
    $db->prepare(
        'UPDATE vs_user_reports SET status = :st, handled_by = :by, handled_at = NOW()
         WHERE id = :id'
    )->execute([':st' => $status, ':by' => $ctx['user']['id'], ':id' => $reportId]);
    jsonResponse(['success' => true]);
}

/* ═══ FORUM MEDIA (GIFs externes) ═══════════════════════════ */

function isAllowedGifUrl(string $url): bool {
    $host = parse_url($url, PHP_URL_HOST);
    if (!$host) return false;
    $host = strtolower($host);
    $allowed = [
        'tenor.com', 'media.tenor.com', 'c.tenor.com',
        'giphy.com', 'media.giphy.com', 'media0.giphy.com', 'media1.giphy.com',
        'media2.giphy.com', 'media3.giphy.com', 'media4.giphy.com',
        'klipy.com', 'cdn.klipy.com', 'media.klipy.com',
        'i.imgur.com', 'imgur.com',
    ];
    foreach ($allowed as $a) {
        if ($host === $a || str_ends_with($host, '.' . $a)) return true;
    }
    return false;
}

function detectProvider(string $url): string {
    $parsed = parse_url($url, PHP_URL_HOST);
    $host = strtolower($parsed !== false ? $parsed : '');
    if (str_contains($host, 'tenor'))  return 'tenor';
    if (str_contains($host, 'giphy'))  return 'giphy';
    if (str_contains($host, 'klipy'))  return 'klipy';
    if (str_contains($host, 'imgur'))  return 'imgur';
    return 'other';
}

function hasRootBadge(string $userId): bool {
    $db = getDB();
    $stmt = $db->prepare(
        'SELECT COUNT(*) FROM vs_user_badges ub
         JOIN vs_badges b ON b.id = ub.badge_id
         WHERE ub.clerk_user_id = :uid AND b.slug = "root"'
    );
    $stmt->execute([':uid' => $userId]);
    return (int)$stmt->fetchColumn() > 0;
}

function searchKlipyGifs(string $query, int $limit = 10): array {
    // API Klipy pour rechercher des GIFs
    $apiKey = defined('KLIPY_API_KEY') ? KLIPY_API_KEY : '';
    if (empty($apiKey)) return [];
    
    $url = 'https://api.klipy.com/v1/gifs/search?q=' . urlencode($query) . '&limit=' . $limit;
    
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $apiKey],
        CURLOPT_TIMEOUT        => 5,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    // curl_close() non nécessaire en PHP 8.0+
    
    if ($httpCode !== 200 || !$response) return [];
    
    $data = json_decode($response, true);
    return $data['gifs'] ?? [];
}

function searchKlipyStickers(string $query, int $limit = 10): array {
    // API Klipy pour rechercher des stickers
    $apiKey = defined('KLIPY_API_KEY') ? KLIPY_API_KEY : '';
    if (empty($apiKey)) return [];
    
    $url = 'https://api.klipy.com/v1/stickers/search?q=' . urlencode($query) . '&limit=' . $limit;
    
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $apiKey],
        CURLOPT_TIMEOUT        => 5,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    // curl_close() non nécessaire en PHP 8.0+
    
    if ($httpCode !== 200 || !$response) return [];
    
    $data = json_decode($response, true);
    return $data['stickers'] ?? [];
}

function handleKlipySearch(string $query): void {
    $type = isset($_GET['type']) ? $_GET['type'] : 'gifs';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    
    if ($type === 'stickers') {
        $results = searchKlipyStickers($query, $limit);
        jsonResponse(['stickers' => $results]);
    } else {
        $results = searchKlipyGifs($query, $limit);
        jsonResponse(['gifs' => $results]);
    }
}

function handleAddPostMedia(int $postId): void {
    $user = authenticate();
    $db = getDB();

    // Le post doit appartenir à l'utilisateur
    $stmt = $db->prepare('SELECT author_id FROM vs_forum_posts WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $postId]);
    $post = $stmt->fetch();
    if (!$post) jsonError(404, 'Post introuvable');
    if ($post['author_id'] !== $user['id']) jsonError(403, 'Non autorisé');

    $body = json_decode(file_get_contents('php://input'), true);
    $url       = filter_var(isset($body['external_url']) ? $body['external_url'] : '', FILTER_VALIDATE_URL);
    $preview   = filter_var(isset($body['preview_url']) ? $body['preview_url'] : '', FILTER_VALIDATE_URL);
    $width     = isset($body['width'])  ? (int)$body['width']  : null;
    $height    = isset($body['height']) ? (int)$body['height'] : null;
    $position  = isset($body['position']) ? (int)$body['position'] : 0;

    if (!$url) jsonError(400, 'URL invalide');
    
    // Vérifier si l'utilisateur a le badge root pour autoriser les URL directes
    $hasRoot = hasRootBadge($user['id']);
    $provider = detectProvider($url);
    
    // Si pas de badge root, n'autoriser que Klipy
    if (!$hasRoot && $provider !== 'klipy') {
        jsonError(400, 'Seuls les GIFs Klipy sont autorisés');
    }

    // Max 4 médias par post
    $cntStmt = $db->prepare('SELECT COUNT(*) FROM vs_forum_media WHERE post_id = :id');
    $cntStmt->execute([':id' => $postId]);
    $cnt = (int)$cntStmt->fetchColumn();
    if ($cnt >= 4) jsonError(409, 'Maximum 4 GIFs par post');

    $db->prepare(
        'INSERT INTO vs_forum_media (post_id, media_type, provider, external_url, preview_url, width, height, position)
         VALUES (:pid, "gif", :prov, :url, :prev, :w, :h, :pos)'
    )->execute([
        ':pid'  => $postId, ':prov' => $provider, ':url' => $url,
        ':prev' => $preview ?: null, ':w' => $width, ':h' => $height, ':pos' => $position,
    ]);

    jsonResponse(['success' => true, 'id' => (int)$db->lastInsertId(), 'provider' => $provider], 201);
}

function handleGetPostMedia(int $postId): void {
    $db = getDB();
    $stmt = $db->prepare(
        'SELECT id, media_type, provider, external_url, preview_url, width, height, position
         FROM vs_forum_media WHERE post_id = :id ORDER BY position ASC, id ASC'
    );
    $stmt->execute([':id' => $postId]);
    jsonResponse(['media' => $stmt->fetchAll()]);
}

/* ═══ FORUM REACTIONS ═══════════════════════════════════════ */

function handleReactPost(int $postId): void {
    $user = authenticate();
    $body = json_decode(file_get_contents('php://input'), true);
    $reaction = sanitizeText(isset($body['reaction']) ? $body['reaction'] : 'like', 32);
    $allowed = ['like','love','laugh','sad','angry','fire','clap'];
    if (!in_array($reaction, $allowed)) jsonError(400, 'Réaction invalide');

    $db = getDB();
    $check = $db->prepare('SELECT author_id FROM vs_forum_posts WHERE id = :id LIMIT 1');
    $check->execute([':id' => $postId]);
    $post = $check->fetch();
    if (!$post) jsonError(404, 'Post introuvable');

    $db->prepare(
        'INSERT IGNORE INTO vs_forum_reactions (post_id, clerk_user_id, reaction)
         VALUES (:p, :u, :r)'
    )->execute([':p' => $postId, ':u' => $user['id'], ':r' => $reaction]);

    if ($post['author_id'] !== $user['id']) {
        notify($post['author_id'], 'post_reaction', $user['id'], 'forum_post', $postId, $reaction);
    }
    jsonResponse(['success' => true]);
}

function handleUnreactPost(int $postId): void {
    $user = authenticate();
    $reaction = sanitizeText(isset($_GET['reaction']) ? $_GET['reaction'] : 'like', 32);
    $db = getDB();
    $db->prepare(
        'DELETE FROM vs_forum_reactions WHERE post_id = :p AND clerk_user_id = :u AND reaction = :r'
    )->execute([':p' => $postId, ':u' => $user['id'], ':r' => $reaction]);
    jsonResponse(['success' => true]);
}
