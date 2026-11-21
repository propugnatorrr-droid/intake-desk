<?php

declare(strict_types=1);

namespace IntakeDesk\Http;

final class Router
{
    /** @var list<array{method: string, pattern: string, handler: callable}> */
    private array $routes = [];

    public function add(string $method, string $path, callable $handler): void
    {
        $pattern = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $path) . '$#';
        $this->routes[] = ['method' => $method, 'pattern' => $pattern, 'handler' => $handler];
    }

    public function dispatch(Request $request): Response
    {
        if ($request->method === 'OPTIONS') {
            return Response::empty();
        }

        $pathMatched = false;
        foreach ($this->routes as $route) {
            if (preg_match($route['pattern'], $request->path, $matches) !== 1) {
                continue;
            }
            $pathMatched = true;
            if ($route['method'] !== $request->method) {
                continue;
            }
            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

            return ($route['handler'])($request, $params);
        }

        return $pathMatched
            ? Response::error(405, 'That method is not allowed here.')
            : Response::error(404, 'Nothing lives at this address.');
    }
}
