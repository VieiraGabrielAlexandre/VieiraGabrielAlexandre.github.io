<?php
require __DIR__ . '/../vendor/autoload.php';

use App\Controller\AuthController;
use App\Controller\ItemController;
use App\Repository\ItemRepository;
use App\Response;
use App\Router;
use App\Security\AuthJwt;
use App\Service\ItemService;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Config
$dbCfg = require __DIR__ . '/../config/database.php';
$authCfg = require __DIR__ . '/../config/auth.php';

$pdo = new PDO($dbCfg['dsn'],$dbCfg['user'],$dbCfg['password'],[
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$jwt = new AuthJwt($authCfg['secret'], $authCfg['issuer'], (int)$authCfg['ttl']);// DI
$repo = new ItemRepository($pdo);
$service = new ItemService($repo);
$itemController = new ItemController($service);
$authController = new AuthController($jwt, $authCfg['api_key']);

// Guard (middleware simples)
$authGuard = function() use ($jwt) {
    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.*)$/i', $hdr, $m)) {
        Response::json(['error' => 'Missing Bearer token'], 401); exit;
    }
    try {
        $jwt->verify($m[1]);
    } catch (Throwable $e) {
        Response::json(['error' => 'Invalid or expired token'], 401); exit;
    }
};

// Router
$router = new Router();

// Public (sem auth)
$router->add(
    'POST',
    '/auth/token',
    fn() => $authController->token(json_decode(file_get_contents('php://input'), true) ?? []),
    protected: false
);

// Protegidas
$router->add('GET', '/items', fn() => $itemController->index());
$router->add('GET', '/items/{id}', fn($id) => $itemController->show((int)$id));
$router->add('POST', '/items', fn() => $itemController->store(json_decode(file_get_contents('php://input'), true) ?? []));
$router->add('PUT', '/items/{id}', fn($id) => $itemController->update((int)$id, json_decode(file_get_contents('php://input'), true) ?? []));
$router->add('DELETE', '/items/{id}', fn($id) => $itemController->destroy((int)$id));

// Dispatch
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$router->dispatch($method, rtrim($uri,'/'), $authGuard);