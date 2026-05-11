<?php
/**
 * VentiStudio - Rate Limiting Module
 * Protection contre les abus d'API
 * @version 2026.05.07
 */

class RateLimiter {
    private $storageDir;
    private $defaultLimit;
    private $defaultWindow;
    
    public function __construct($storageDir = __DIR__ . '/../cache/ratelimit', $defaultLimit = 100, $defaultWindow = 3600) {
        $this->storageDir = $storageDir;
        $this->defaultLimit = $defaultLimit;
        $defaultWindow = $defaultWindow;

        // Créer le dossier de stockage si inexistant
        if (!is_dir($this->storageDir)) {
            @mkdir($this->storageDir, 0750, true);
        }
    }
    
    /**
     * Vérifie si la requête est autorisée
     * @param string $identifier IP ou user ID
     * @param string $endpoint Endpoint spécifique
     * @param int $limit Nombre max de requêtes
     * @param int $window Fenêtre de temps en secondes
     * @return array ['allowed' => bool, 'remaining' => int, 'reset' => int]
     */
    public function check($identifier, $endpoint = 'default', $limit = null, $window = null) {
        $limit = isset($limit) ? $limit : $this->defaultLimit;
        $window = isset($window) ? $window : $this->defaultWindow;

        $key = $this->sanitizeKey($identifier . ':' . $endpoint);
        $file = $this->storageDir . '/' . $key . '.json';

        $now = time();
        $data = ['count' => 0, 'reset' => $now + $window, 'first' => $now];

        // Mode dégradé : si le dossier n'est pas accessible, toujours autoriser
        if (!is_dir($this->storageDir) || !is_writable($this->storageDir)) {
            return [
                'allowed' => true,
                'remaining' => $limit,
                'reset' => $now + $window,
                'limit' => $limit,
                'window' => $window
            ];
        }

        if (file_exists($file)) {
            $content = @file_get_contents($file);
            $data = json_decode($content, true) ?: $data;

            // Réinitialiser si la fenêtre est expirée
            if ($now > $data['reset']) {
                $data = ['count' => 0, 'reset' => $now + $window, 'first' => $now];
            }
        }

        $data['count']++;

        // Sauvegarder (mode dégradé si échec)
        @file_put_contents($file, json_encode($data), LOCK_EX);

        $remaining = max(0, $limit - $data['count']);
        $allowed = $data['count'] <= $limit;

        return [
            'allowed' => $allowed,
            'remaining' => $remaining,
            'reset' => $data['reset'],
            'limit' => $limit,
            'window' => $window
        ];
    }
    
    /**
     * Vérifie et renvoie une erreur 429 si limité
     */
    public function enforce($identifier, $endpoint = 'default', $limit = null, $window = null) {
        $result = $this->check($identifier, $endpoint, $limit, $window);
        
        // Headers rate limit
        header('X-RateLimit-Limit: ' . $result['limit']);
        header('X-RateLimit-Remaining: ' . $result['remaining']);
        header('X-RateLimit-Reset: ' . $result['reset']);
        
        if (!$result['allowed']) {
            http_response_code(429);
            header('Content-Type: application/json; charset=utf-8');
            header('Retry-After: ' . ($result['reset'] - time()));
            
            echo json_encode([
                'error' => 'Too Many Requests',
                'message' => 'Rate limit exceeded. Please try again later.',
                'retry_after' => $result['reset'] - time(),
                'limit' => $result['limit'],
                'window' => $result['window']
            ]);
            
            exit;
        }
        
        return $result;
    }
    
    /**
     * Nettoie les anciens fichiers de rate limit
     */
    public function cleanup($maxAge = 86400) {
        $now = time();
        $files = glob($this->storageDir . '/*.json');
        
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);
            
            if ($data && isset($data['reset']) && $now > $data['reset'] + $maxAge) {
                unlink($file);
            }
        }
    }
    
    /**
     * Récupère l'identifiant client (IP ou User ID)
     */
    public static function getClientIdentifier() {
        // Priorité: User ID > IP + User Agent

        // Essayer de récupérer le user ID depuis Clerk
        $auth = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : '');
        if (str_starts_with($auth, 'Bearer ')) {
            $token = substr($auth, 7);
            $payload = self::decodeJwtPayload($token);
            if ($payload && isset($payload['sub'])) {
                return 'user:' . $payload['sub'];
            }
        }
        
        // Fallback sur IP
        $ip = isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : (isset($_SERVER['HTTP_CF_CONNECTING_IP']) ? $_SERVER['HTTP_CF_CONNECTING_IP'] : (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown'));
        
        // Pour éviter les collisions en environnement partagé
        $ua = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        $ip = is_array($ip) ? $ip[0] : $ip;
        
        return 'ip:' . md5($ip . substr($ua, 0, 50));
    }
    
    private static function decodeJwtPayload($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        $payload = base64_decode(str_pad(strtr($parts[1], '-_', '+/'), strlen($parts[1]) % 4, '=', STR_PAD_RIGHT));
        return json_decode($payload, true);
    }
    
    private function sanitizeKey($key) {
        return preg_replace('/[^a-zA-Z0-9_-]/', '_', $key);
    }
}

// Endpoints rate limits configuration
const RATE_LIMITS = [
    // Public endpoints - limites permissives
    'default' => ['limit' => 100, 'window' => 3600],      // 100/h
    'profiles_public' => ['limit' => 60, 'window' => 3600], // 60/h pour profils publics
    
    // Auth endpoints - limites strictes
    'profiles_me' => ['limit' => 300, 'window' => 3600],    // 300/h (usage normal)
    'profiles_update' => ['limit' => 50, 'window' => 3600], // 50/h (PATCH)
    'discord_link' => ['limit' => 10, 'window' => 3600],    // 10/h (OAuth sensible)
    
    // Write operations - très strictes
    'badge_update' => ['limit' => 30, 'window' => 3600],
    'quest_trigger' => ['limit' => 60, 'window' => 3600],
    'egg_unlock' => ['limit' => 20, 'window' => 3600],
    'message_send' => ['limit' => 100, 'window' => 3600],
    'forum_post' => ['limit' => 30, 'window' => 3600],
    'connection_add' => ['limit' => 20, 'window' => 3600],
    
    // Endpoints sociaux
    'social_action'   => ['limit' => 60,  'window' => 3600], // friend/follow/block
    'social_state'    => ['limit' => 200, 'window' => 3600], // lectures état social
    'report'          => ['limit' => 10,  'window' => 3600], // signalements (anti-abus)
    'admin_action'    => ['limit' => 200, 'window' => 3600], // master users
    'gif_add'         => ['limit' => 30,  'window' => 3600], // ajout GIF par post
    'post_react'      => ['limit' => 100, 'window' => 3600], // réactions
    'notifications'   => ['limit' => 300, 'window' => 3600], // lecture notifs
];

/**
 * Helper pour appliquer le rate limit
 * @param string $endpoint Clé dans RATE_LIMITS
 */
function applyRateLimit($endpoint = 'default') {
    $limiter = new RateLimiter();
    $identifier = RateLimiter::getClientIdentifier();
    
    $config = isset(RATE_LIMITS[$endpoint]) ? RATE_LIMITS[$endpoint] : RATE_LIMITS['default'];
    
    return $limiter->enforce($identifier, $endpoint, $config['limit'], $config['window']);
}

/**
 * Vérifier rate limit sans bloquer (pour monitoring)
 */
function checkRateLimit($endpoint = 'default') {
    $limiter = new RateLimiter();
    $identifier = RateLimiter::getClientIdentifier();
    
    $config = isset(RATE_LIMITS[$endpoint]) ? RATE_LIMITS[$endpoint] : RATE_LIMITS['default'];
    
    $result = $limiter->check($identifier, $endpoint, $config['limit'], $config['window']);
    
    // Headers informatifs
    header('X-RateLimit-Limit: ' . $result['limit']);
    header('X-RateLimit-Remaining: ' . $result['remaining']);
    header('X-RateLimit-Reset: ' . $result['reset']);
    
    return $result;
}
