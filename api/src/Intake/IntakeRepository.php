<?php

declare(strict_types=1);

namespace IntakeDesk\Intake;

use DateTimeImmutable;
use DateTimeZone;
use PDO;

final class IntakeRepository
{
    /** The desk is a short list by design; this keeps a runaway table from flooding the page. */
    private const LIMIT = 200;

    private const SORTS = [
        'newest' => 'created_at DESC, id DESC',
        'oldest' => 'created_at ASC, id ASC',
        'name' => 'client_name COLLATE NOCASE ASC, id ASC',
    ];

    public function __construct(private readonly PDO $pdo)
    {
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function all(?string $status = null, ?string $query = null, string $sort = 'newest'): array
    {
        $where = [];
        $params = [];

        if ($status !== null && $status !== '') {
            $where[] = 'status = :status';
            $params[':status'] = $status;
        }

        if ($query !== null && trim($query) !== '') {
            $where[] = "(client_name LIKE :q ESCAPE '\\' OR company LIKE :q ESCAPE '\\' OR email LIKE :q ESCAPE '\\')";
            $params[':q'] = '%' . addcslashes(trim($query), '%_\\') . '%';
        }

        $order = self::SORTS[$sort] ?? self::SORTS['newest'];
        $sql = 'SELECT * FROM intakes'
            . ($where === [] ? '' : ' WHERE ' . implode(' AND ', $where))
            . ' ORDER BY ' . $order
            . ' LIMIT ' . self::LIMIT;

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return array_map([$this, 'present'], $stmt->fetchAll());
    }

    /**
     * @return array<string, int>
     */
    public function countsByStatus(): array
    {
        $counts = array_fill_keys(Status::values(), 0);
        foreach ($this->pdo->query('SELECT status, COUNT(*) AS n FROM intakes GROUP BY status') as $row) {
            $counts[$row['status']] = (int) $row['n'];
        }

        return $counts;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM intakes WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row === false ? null : $this->present($row);
    }

    /**
     * @param array<string, string> $values
     * @return array<string, mixed>
     */
    public function create(array $values): array
    {
        $now = $this->now();
        $stmt = $this->pdo->prepare(
            'INSERT INTO intakes (client_name, email, company, service, message, status, created_at, updated_at)
             VALUES (:name, :email, :company, :service, :message, :status, :now, :now)'
        );
        $stmt->execute([
            ':name' => $values['clientName'],
            ':email' => $values['email'],
            ':company' => $values['company'],
            ':service' => $values['service'],
            ':message' => $values['message'],
            ':status' => Status::New->value,
            ':now' => $now,
        ]);

        return $this->find((int) $this->pdo->lastInsertId()) ?? [];
    }

    /**
     * When $expectedStatus is given the write only lands if the record still has that status,
     * which stops two simultaneous requests from both passing the same transition check.
     * Returns null when the guard rejects the write.
     *
     * @param array<string, string> $values
     * @return array<string, mixed>|null
     */
    public function update(int $id, array $values, ?string $expectedStatus = null): ?array
    {
        $columns = [
            'clientName' => 'client_name',
            'email' => 'email',
            'company' => 'company',
            'service' => 'service',
            'message' => 'message',
            'status' => 'status',
        ];

        $sets = [];
        $params = [':id' => $id, ':now' => $this->now()];
        foreach ($columns as $field => $column) {
            if (array_key_exists($field, $values)) {
                $sets[] = "$column = :$field";
                $params[":$field"] = $values[$field];
            }
        }

        if ($sets === []) {
            return $this->find($id);
        }

        $sql = 'UPDATE intakes SET ' . implode(', ', $sets) . ', updated_at = :now WHERE id = :id';
        if ($expectedStatus !== null) {
            $sql .= ' AND status = :expected';
            $params[':expected'] = $expectedStatus;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        if ($expectedStatus !== null && $stmt->rowCount() === 0) {
            return null;
        }

        return $this->find($id);
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function present(array $row): array
    {
        $status = Status::from($row['status']);

        return [
            'id' => (int) $row['id'],
            'clientName' => $row['client_name'],
            'email' => $row['email'],
            'company' => $row['company'],
            'service' => $row['service'],
            'message' => $row['message'],
            'status' => $status->value,
            'nextStatuses' => array_map(static fn (Status $s): string => $s->value, $status->next()),
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ];
    }

    private function now(): string
    {
        return (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z');
    }
}
