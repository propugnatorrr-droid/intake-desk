<?php

declare(strict_types=1);

require dirname(__DIR__) . '/src/autoload.php';

use IntakeDesk\App;
use IntakeDesk\Database;
use IntakeDesk\Http\Request;
use IntakeDesk\Intake\IntakeRepository;
use IntakeDesk\Intake\IntakeValidator;
use IntakeDesk\Intake\Status;
use IntakeDesk\Seeder;

$passed = 0;
$failed = 0;

function check(string $name, bool $condition, string $detail = ''): void
{
    global $passed, $failed;
    if ($condition) {
        $passed++;
        echo "  ok   $name\n";
    } else {
        $failed++;
        echo "  FAIL $name" . ($detail !== '' ? " ($detail)" : '') . "\n";
    }
}

function freshApp(bool $seed = true): App
{
    $pdo = Database::connect(':memory:');
    if ($seed) {
        Seeder::seedIfEmpty($pdo);
    }

    return new App($pdo);
}

/** @return array{status: int, body: array<string, mixed>} */
function call(App $app, string $method, string $path, array $query = [], array $body = [], bool $badBody = false): array
{
    $response = $app->handle(new Request($method, $path, $query, $body, $badBody));

    return ['status' => $response->status, 'body' => $response->payload ?? []];
}

echo "Status transitions\n";
check('new can move to contacted', Status::New->canMoveTo(Status::Contacted));
check('new cannot jump to won', !Status::New->canMoveTo(Status::Won));
check('won is final', Status::Won->next() === []);
check('lost can be reopened', Status::Lost->canMoveTo(Status::New));

echo "Validation\n";
$validator = new IntakeValidator();
$bad = $validator->forCreate(['clientName' => '', 'email' => 'nope', 'service' => 'cooking', 'message' => '']);
check('create reports every bad field', count($bad['errors']) === 4, json_encode(array_keys($bad['errors'])));
$good = $validator->forCreate([
    'clientName' => '  Ada  ', 'email' => 'ADA@Example.com', 'company' => '',
    'service' => 'website', 'message' => 'Hello',
]);
check('create trims and lowercases', $good['errors'] === [] && $good['values']['email'] === 'ada@example.com' && $good['values']['clientName'] === 'Ada');
$empty = $validator->forUpdate([]);
check('update with nothing is rejected', isset($empty['errors']['_']));
$status = $validator->forUpdate(['status' => 'sideways']);
check('update rejects unknown status', isset($status['errors']['status']));

echo "List and filters\n";
$app = freshApp();
$all = call($app, 'GET', '/api/intakes');
check('list returns seeded rows', $all['status'] === 200 && $all['body']['meta']['total'] === 8);
check('counts include every status', count($all['body']['meta']['counts']) === 5);
$quoted = call($app, 'GET', '/api/intakes', ['status' => 'quoted']);
check('status filter works', $quoted['body']['meta']['total'] === 2);
$search = call($app, 'GET', '/api/intakes', ['q' => 'linden']);
check('search matches company', $search['body']['meta']['total'] === 1);
$wild = call($app, 'GET', '/api/intakes', ['q' => '%']);
check('percent sign is searched literally', $wild['body']['meta']['total'] === 0);
$badFilter = call($app, 'GET', '/api/intakes', ['status' => 'maybe']);
check('unknown status filter is a 422', $badFilter['status'] === 422);
$byName = call($app, 'GET', '/api/intakes', ['sort' => 'name']);
check('sort by name orders A to Z', $byName['body']['data'][0]['clientName'] === 'Aisha Rahman');

echo "Create and update\n";
$app = freshApp(false);
$empty = call($app, 'GET', '/api/intakes');
check('empty database returns an empty list', $empty['body']['meta']['total'] === 0);
$created = call($app, 'POST', '/api/intakes', [], [
    'clientName' => 'Grace', 'email' => 'grace@example.com', 'company' => 'Hopper Ltd',
    'service' => 'web-app', 'message' => 'Need a portal.',
]);
check('create returns 201', $created['status'] === 201 && $created['body']['data']['status'] === 'new');
$id = $created['body']['data']['id'];
$invalid = call($app, 'POST', '/api/intakes', [], ['clientName' => '']);
check('invalid create returns 422 with fields', $invalid['status'] === 422 && isset($invalid['body']['error']['fields']));
$broken = call($app, 'POST', '/api/intakes', [], [], true);
check('broken JSON returns 400', $broken['status'] === 400);

$step = call($app, 'PATCH', "/api/intakes/$id", [], ['status' => 'contacted']);
check('allowed step succeeds', $step['status'] === 200 && $step['body']['data']['status'] === 'contacted');
$jump = call($app, 'PATCH', "/api/intakes/$id", [], ['status' => 'won']);
check('skipping a step returns 422', $jump['status'] === 422);
$same = call($app, 'PATCH', "/api/intakes/$id", [], ['status' => 'contacted']);
check('same status is accepted as a no-op', $same['status'] === 200);
$edit = call($app, 'PATCH', "/api/intakes/$id", [], ['company' => 'Hopper and Co']);
check('field edit succeeds', $edit['status'] === 200 && $edit['body']['data']['company'] === 'Hopper and Co');
$badEdit = call($app, 'PATCH', "/api/intakes/$id", [], ['email' => 'broken']);
check('invalid edit returns 422', $badEdit['status'] === 422);

echo "Guards\n";
$pdo = Database::connect(':memory:');
$repository = new IntakeRepository($pdo);
$row = $repository->create([
    'clientName' => 'Guard Test', 'email' => 'guard@example.com', 'company' => '',
    'service' => 'website', 'message' => 'Check the guard.',
]);
check('write is refused when the status moved underneath it', $repository->update($row['id'], ['status' => 'contacted'], 'quoted') === null);
check('record is untouched after a refused write', $repository->find($row['id'])['status'] === 'new');
$accepted = $repository->update($row['id'], ['status' => 'contacted'], 'new');
check('write lands when the expected status matches', $accepted !== null && $accepted['status'] === 'contacted');
$long = $validator->forCreate([
    'clientName' => 'Ada', 'email' => str_repeat('a', 250) . '@example.com',
    'service' => 'website', 'message' => 'Hello',
]);
check('overlong email is rejected', isset($long['errors']['email']));
check('seeding twice does not duplicate rows', (function () {
    $db = Database::connect(':memory:');
    Seeder::seedIfEmpty($db);
    Seeder::seedIfEmpty($db);

    return (int) $db->query('SELECT COUNT(*) FROM intakes')->fetchColumn() === 8;
})());

echo "Routing\n";
check('missing record is a 404', call($app, 'GET', '/api/intakes/9999')['status'] === 404);
check('patching a missing record is a 404', call($app, 'PATCH', '/api/intakes/9999', [], ['status' => 'contacted'])['status'] === 404);
check('unknown path is a 404', call($app, 'GET', '/api/nothing')['status'] === 404);
check('wrong method is a 405', call($app, 'DELETE', '/api/intakes')['status'] === 405);
check('health responds', call($app, 'GET', '/api/health')['body']['status'] === 'ok');
check('preflight is empty 204', call($app, 'OPTIONS', '/api/intakes')['status'] === 204);

echo "\n$passed passed, $failed failed\n";
exit($failed === 0 ? 0 : 1);
