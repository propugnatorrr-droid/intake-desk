<?php

declare(strict_types=1);

namespace IntakeDesk\Intake;

final class IntakeValidator
{
    public const SERVICES = ['website', 'web-app', 'integration', 'maintenance'];

    /**
     * @param array<string, mixed> $input
     * @return array{values: array<string, string>, errors: array<string, string>}
     */
    public function forCreate(array $input): array
    {
        $values = [
            'clientName' => $this->text($input['clientName'] ?? ''),
            'email' => strtolower($this->text($input['email'] ?? '')),
            'company' => $this->text($input['company'] ?? ''),
            'service' => $this->text($input['service'] ?? ''),
            'message' => $this->text($input['message'] ?? ''),
        ];

        $errors = [];

        if ($values['clientName'] === '') {
            $errors['clientName'] = 'Enter the client name.';
        } elseif (mb_strlen($values['clientName']) > 120) {
            $errors['clientName'] = 'Keep the name under 120 characters.';
        }

        if ($values['email'] === '') {
            $errors['email'] = 'Enter an email address.';
        } elseif (mb_strlen($values['email']) > 254 || !filter_var($values['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'That email address does not look right.';
        }

        if (mb_strlen($values['company']) > 120) {
            $errors['company'] = 'Keep the company under 120 characters.';
        }

        if (!in_array($values['service'], self::SERVICES, true)) {
            $errors['service'] = 'Choose one of the listed services.';
        }

        if ($values['message'] === '') {
            $errors['message'] = 'Add a short note about what the client needs.';
        } elseif (mb_strlen($values['message']) > 2000) {
            $errors['message'] = 'Keep the note under 2000 characters.';
        }

        return ['values' => $values, 'errors' => $errors];
    }

    /**
     * @param array<string, mixed> $input
     * @return array{values: array<string, string>, errors: array<string, string>}
     */
    public function forUpdate(array $input): array
    {
        $values = [];
        $errors = [];

        $merged = $this->forCreate($input + [
            'clientName' => 'x',
            'email' => 'x@example.com',
            'service' => self::SERVICES[0],
            'message' => 'x',
        ]);

        foreach (['clientName', 'email', 'company', 'service', 'message'] as $field) {
            if (array_key_exists($field, $input)) {
                $values[$field] = $merged['values'][$field];
                if (isset($merged['errors'][$field])) {
                    $errors[$field] = $merged['errors'][$field];
                }
            }
        }

        if (array_key_exists('status', $input)) {
            $status = Status::tryFrom($this->text($input['status']));
            if ($status === null) {
                $errors['status'] = 'Choose a valid status.';
            } else {
                $values['status'] = $status->value;
            }
        }

        if ($values === [] && $errors === []) {
            $errors['_'] = 'Nothing to update.';
        }

        return ['values' => $values, 'errors' => $errors];
    }

    private function text(mixed $value): string
    {
        return is_scalar($value) ? trim((string) $value) : '';
    }
}
