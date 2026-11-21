# Intake Desk

A small tracker for client enquiries, from the first message to signed work. It is a working front end and API, built to show how I handle the unglamorous parts of an interface: real loading, empty and error states, forms that explain themselves, and a status workflow the server enforces.

All names and companies in the sample data are fictional.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript (strict), Vite |
| Styling | Emotion, with design tokens in `web/src/theme.ts` |
| Routing | React Router 7 (data router: loaders, actions, error elements) |
| HTTP | Axios, behind one typed client |
| API | PHP 8.4, plain PDO and SQLite, no framework |
| Local setup | Docker and docker compose |

## Run it

With Docker:

```bash
docker compose up --build
```

Then open http://localhost:8000.

Without Docker, in two terminals:

```bash
# API on :8080
cd api
php -S localhost:8080 -t public public/index.php

# UI on :5173 (proxies /api to :8080)
cd web
npm install
npm run dev
```

The first request creates the SQLite file and seeds eight sample enquiries.

## Tests

```bash
cd api && php tests/run.php     # 35 checks: transitions, validation, filters, write guard, routing
cd web && npm test              # list states, form errors, edit flow, workflow, not found
cd web && npm run build         # type check, then production build
```

## What is worth a look

- **Status workflow lives in the API.** `api/src/Intake/Status.php` defines which moves are legal. The UI only offers the legal ones, and the server still rejects the rest, so a stale tab cannot push a record somewhere it should not go.
- **Filters live in the URL.** Status, search and sort are query parameters read by the route loader, so a filtered view can be shared and reloaded exactly as it was. See `web/src/routes/ListPage.tsx`.
- **Two people, one record.** A status change is written with the status it expects to find, so if someone else moved the record first the API answers 409 instead of overwriting them.
- **Every state is designed.** Loading shows a skeleton, an empty desk invites the first enquiry, an empty filter offers to clear itself, and a failed request explains what happened and offers a retry.
- **Forms explain themselves.** Fields have visible labels, errors sit next to the field, and after a failed submit focus moves to a summary that links to each problem (`web/src/components/IntakeForm.tsx`).
- **Keyboard and screen readers.** Skip link, visible focus rings, focus moves to the content on navigation, status changes are announced, and nothing relies on colour alone.
- **Search is literal.** A `%` or `_` in the search box is escaped, not treated as a wildcard.

## Decisions I would defend

- No UI framework or component kit. The interface is small enough that a handful of styled primitives is easier to read than a dependency.
- Plain PHP instead of a framework. The API is five routes, and the point is to show the request path clearly: router, controller, validator, repository.
- SQLite so the project runs with nothing to install. The repository is the only place SQL appears, so swapping the database means rewriting one file.

## Not production hardened

This is a demo. The API has no authentication or rate limiting, serves with PHP's built-in server, and lists at most 200 enquiries with no pagination. The seams for each of those are marked by the router and repository, but they are not built.

## Layout

```
api/   PHP API: src/, public/, tests/
web/   React app: src/api, src/components, src/routes, src/lib
```
