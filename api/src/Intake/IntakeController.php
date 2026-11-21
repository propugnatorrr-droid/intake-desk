<?php

declare(strict_types=1);

namespace IntakeDesk\Intake;

use IntakeDesk\Http\Request;
use IntakeDesk\Http\Response;

final class IntakeController
{
    public function __construct(
        private readonly IntakeRepository $repository,
        private readonly IntakeValidator $validator,
    ) {
    }

    public function health(): Response
    {
        return Response::json(['status' => 'ok']);
    }

    public function index(Request $request): Response
    {
        $status = $request->query['status'] ?? '';
        if ($status !== '' && Status::tryFrom($status) === null) {
            return Response::error(422, 'Unknown status filter.', ['status' => 'Choose a valid status.']);
        }

        $items = $this->repository->all(
            $status === '' ? null : $status,
            $request->query['q'] ?? null,
            $request->query['sort'] ?? 'newest',
        );

        return Response::json([
            'data' => $items,
            'meta' => ['total' => count($items), 'counts' => $this->repository->countsByStatus()],
        ]);
    }

    /** @param array<string, string> $params */
    public function show(Request $request, array $params): Response
    {
        $item = $this->repository->find((int) $params['id']);

        return $item === null
            ? Response::error(404, 'That enquiry does not exist.')
            : Response::json(['data' => $item]);
    }

    public function create(Request $request): Response
    {
        if ($request->bodyIsInvalid) {
            return Response::error(400, 'The request body is not valid JSON.');
        }

        ['values' => $values, 'errors' => $errors] = $this->validator->forCreate($request->body);
        if ($errors !== []) {
            return Response::error(422, 'Please fix the highlighted fields.', $errors);
        }

        $created = $this->repository->create($values);

        return Response::json(['data' => $created], 201, ['Location' => '/api/intakes/' . $created['id']]);
    }

    /** @param array<string, string> $params */
    public function update(Request $request, array $params): Response
    {
        if ($request->bodyIsInvalid) {
            return Response::error(400, 'The request body is not valid JSON.');
        }

        $id = (int) $params['id'];
        $current = $this->repository->find($id);
        if ($current === null) {
            return Response::error(404, 'That enquiry does not exist.');
        }

        ['values' => $values, 'errors' => $errors] = $this->validator->forUpdate($request->body);
        if ($errors !== []) {
            return Response::error(422, 'Please fix the highlighted fields.', $errors);
        }

        if (isset($values['status'])) {
            $from = Status::from($current['status']);
            $to = Status::from($values['status']);
            if ($from !== $to && !$from->canMoveTo($to)) {
                return Response::error(
                    422,
                    sprintf('An enquiry cannot move from %s to %s.', $from->value, $to->value),
                    ['status' => 'That step is not allowed from the current status.'],
                );
            }
        }

        $updated = $this->repository->update($id, $values, $current['status']);
        if ($updated === null) {
            return Response::error(409, 'Someone else changed this enquiry first. Refresh and try again.');
        }

        return Response::json(['data' => $updated]);
    }
}
