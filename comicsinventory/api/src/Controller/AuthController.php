<?php
namespace App\Controller;

use App\Response;
use App\Security\AuthJwt;

class AuthController
{
    public function __construct(private AuthJwt $jwt, private string $apiKey) {}

    // POST /auth/token  {"api_key":"..."}
    public function token(array $body): void
    {
        if (!isset($body['api_key']) || $body['api_key'] !== $this->apiKey) {
            Response::json(['error' => 'Invalid credentials'], 401);
            return;
        }

        $token = $this->jwt->issue(['sub' => 'api-client']);
        Response::json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => $this->jwt->getTtl(),
        ], 201);
    }
}
