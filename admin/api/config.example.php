<?php
/**
 * VentiStudio Admin - Configuration
 * 
 * Copier ce fichier vers config.php et remplir les valeurs.
 * NE JAMAIS committer config.php dans git.
 */

return [
    'db' => [
        'host'     => 'localhost',
        'port'     => 3306,
        'dbname'   => 'ventistudio',
        'username' => 'root',
        'password' => '',
        'charset'  => 'utf8mb4',
    ],
    'session' => [
        'lifetime' => 3600, // 1 heure
        'name'     => 'VENTIADMIN_SESSID',
    ],
    'security' => [
        'allowed_origins' => ['https://ventistudio.fr', 'http://localhost'],
    ],
];
