<?php

declare(strict_types=1);

namespace IntakeDesk;

use PDO;

final class Database
{
    public static function connect(?string $path = null): PDO
    {
        $path ??= getenv('INTAKE_DB') ?: dirname(__DIR__) . '/data/intake.sqlite';

        if ($path !== ':memory:') {
            $dir = dirname($path);
            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
        }

        $pdo = new PDO('sqlite:' . $path);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA journal_mode = WAL');
        $pdo->exec('PRAGMA foreign_keys = ON');

        self::migrate($pdo);

        return $pdo;
    }

    private static function migrate(PDO $pdo): void
    {
        $pdo->exec(<<<'SQL'
            CREATE TABLE IF NOT EXISTS intakes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_name TEXT NOT NULL,
                email TEXT NOT NULL,
                company TEXT NOT NULL DEFAULT '',
                service TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'new',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            SQL);
        $pdo->exec('CREATE INDEX IF NOT EXISTS intakes_status_idx ON intakes (status)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS intakes_created_idx ON intakes (created_at)');
    }
}
