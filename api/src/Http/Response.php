<?php

declare(strict_types=1);

namespace IntakeDesk\Http;

final class Response
{
    /**
     * @param array<string, mixed>|null $payload
     * @param array<string, string> $headers
     */
    public function __construct(
        public readonly int $status,
        public readonly ?array $payload = null,
        public readonly array $headers = [],
    ) {
    }

    /**
     * @param array<string, mixed> $payload
     * @param array<string, string> $headers
     */
    public static function json(array $payload, int $status = 200, array $headers = []): self
    {
        return new self($status, $payload, $headers);
    }

    /** @param array<string, string> $fields */
    public static function error(int $status, string $message, array $fields = []): self
    {
        return new self($status, ['error' => ['message' => $message, 'fields' => (object) $fields]]);
    }

    public static function empty(int $status = 204): self
    {
        return new self($status);
    }

    public function send(string $allowedOrigin): void
    {
        http_response_code($this->status);
        header('Access-Control-Allow-Origin: ' . $allowedOrigin);
        header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Vary: Origin');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store');
        foreach ($this->headers as $name => $value) {
            header("$name: $value");
        }

        if ($this->payload !== null) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($this->payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
    }
}
