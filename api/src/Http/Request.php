<?php

declare(strict_types=1);

namespace IntakeDesk\Http;

final class Request
{
    /** Anything larger than this is not a real enquiry. */
    private const MAX_BODY = 65536;

    /**
     * @param array<string, string> $query
     * @param array<string, mixed> $body
     */
    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query = [],
        public readonly array $body = [],
        public readonly bool $bodyIsInvalid = false,
    ) {
    }

    public static function fromGlobals(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $raw = file_get_contents('php://input', false, null, 0, self::MAX_BODY + 1) ?: '';

        $body = [];
        $invalid = strlen($raw) > self::MAX_BODY;
        if ($raw !== '' && !$invalid) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $body = $decoded;
            } else {
                $invalid = true;
            }
        }

        $query = array_map(static fn ($v): string => is_string($v) ? $v : '', $_GET);

        return new self($method, rtrim($path, '/') ?: '/', $query, $body, $invalid);
    }
}
