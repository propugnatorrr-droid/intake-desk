<?php

declare(strict_types=1);

require dirname(__DIR__) . '/src/autoload.php';

use IntakeDesk\App;
use IntakeDesk\Database;
use IntakeDesk\Http\Request;
use IntakeDesk\Seeder;

$pdo = Database::connect();
Seeder::seedIfEmpty($pdo);

$origin = getenv('APP_ORIGIN') ?: 'http://localhost:5173';

(new App($pdo))->handle(Request::fromGlobals())->send($origin);
