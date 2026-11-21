<?php

declare(strict_types=1);

namespace IntakeDesk;

use IntakeDesk\Http\Request;
use IntakeDesk\Http\Response;
use IntakeDesk\Http\Router;
use IntakeDesk\Intake\IntakeController;
use IntakeDesk\Intake\IntakeRepository;
use IntakeDesk\Intake\IntakeValidator;
use PDO;
use Throwable;

final class App
{
    private readonly Router $router;

    public function __construct(PDO $pdo)
    {
        $controller = new IntakeController(new IntakeRepository($pdo), new IntakeValidator());

        $router = new Router();
        $router->add('GET', '/api/health', fn () => $controller->health());
        $router->add('GET', '/api/intakes', fn (Request $r) => $controller->index($r));
        $router->add('POST', '/api/intakes', fn (Request $r) => $controller->create($r));
        $router->add('GET', '/api/intakes/{id}', fn (Request $r, array $p) => $controller->show($r, $p));
        $router->add('PATCH', '/api/intakes/{id}', fn (Request $r, array $p) => $controller->update($r, $p));

        $this->router = $router;
    }

    public function handle(Request $request): Response
    {
        try {
            return $this->router->dispatch($request);
        } catch (Throwable $e) {
            error_log($e->getMessage());

            return Response::error(500, 'Something went wrong on our side. Try again in a moment.');
        }
    }
}
