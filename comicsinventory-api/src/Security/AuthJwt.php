<?php
declare(strict_types=1);

namespace App\Security;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthJwt
{
    public function __construct(
        private string $secret,
        private string $issuer,
        private int $ttl // em segundos
    ) {}

    /** Emite um JWT HS256 com claims padrão + extras */
    public function issue(array $claims = []): string
    {
        $now = time();
        $payload = array_merge([
            'iss' => $this->issuer,
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $this->ttl,
        ], $claims);

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    /** Verifica/decodifica um JWT; lança exceção se inválido/expirado */
    public function verify(string $token): array
    {
        $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
        return (array)$decoded;
    }

    /** Expiração configurada (segundos) */
    public function getTtl(): int
    {
        return $this->ttl;
    }
}
