<?php
namespace App;

class Router {
    private array $routes = [];

    public function add(string $method, string $path, callable $handler, bool $protected = true) {
        $this->routes[] = compact('method','path','handler','protected');
    }

    public function dispatch(string $method, string $uri, callable $authGuard) {
        foreach ($this->routes as $route) {
            $pattern = "@^" . preg_replace('@\\{([a-z_]+)\\}@','(?P<$1>[^/]+)',$route['path']) . "$@";
            if ($method === $route['method'] && preg_match($pattern,$uri,$matches)) {
                if ($route['protected']) {
                    $authGuard(); // valida Authorization: Bearer ...
                }
                return call_user_func_array($route['handler'], array_filter($matches,'is_string',ARRAY_FILTER_USE_KEY));
            }
        }
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error'=>'Route not found']);
    }
}