<?php
// config/auth.php
return [
    'secret'  => $_ENV['JWT_SECRET']  ?? 'changeme',
    'issuer'  => $_ENV['JWT_ISSUER']  ?? 'comicsinventory-api',
    'ttl'     => (int)($_ENV['JWT_TTL'] ?? 1800),
    'api_key' => $_ENV['API_KEY']     ?? '',   // << ESSENCIAL
];