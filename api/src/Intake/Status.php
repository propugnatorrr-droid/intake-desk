<?php

declare(strict_types=1);

namespace IntakeDesk\Intake;

/**
 * Lifecycle of an enquiry. The API enforces the same transitions the UI offers,
 * so a stale browser tab can never move a record somewhere it should not go.
 */
enum Status: string
{
    case New = 'new';
    case Contacted = 'contacted';
    case Quoted = 'quoted';
    case Won = 'won';
    case Lost = 'lost';

    /** @return list<Status> */
    public function next(): array
    {
        return match ($this) {
            self::New => [self::Contacted, self::Lost],
            self::Contacted => [self::Quoted, self::Lost],
            self::Quoted => [self::Won, self::Lost],
            self::Won => [],
            self::Lost => [self::New],
        };
    }

    public function canMoveTo(self $target): bool
    {
        return in_array($target, $this->next(), true);
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $s): string => $s->value, self::cases());
    }
}
