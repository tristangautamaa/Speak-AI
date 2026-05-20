# Agent Coding Rules — SPEAK

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Scope Rules

- Work only in `frontend/` unless the user explicitly says to touch `backend/`.
- Never edit files inside `backend/venv/` or `frontend/node_modules/`.
- Do not create new files unless the task cannot be completed by editing existing ones.
- Do not refactor or reorganize code that is not part of the requested change.

## Code Style

- TypeScript everywhere in `frontend/`. No `any` unless absolutely unavoidable.
- Tailwind CSS for all styles — no inline style objects, no CSS modules, no styled-components.
- Zustand for all shared state — do not introduce additional state libraries.
- Pure functions in `lib/` — no side effects, no React imports.
- Hooks in `hooks/` — stateful logic that bridges lib and components.
- Components in `components/` — presentational and composed components.
- No default exports from `lib/` files; prefer named exports.

## Behavior Rules

- No comments explaining WHAT code does. Only comment WHY (hidden constraint, surprising invariant, workaround).
- No speculative abstractions. Three similar lines is better than a premature helper.
- No error handling for impossible scenarios. Trust TypeScript and React guarantees.
- No backwards-compatibility shims. If something is unused, delete it.
- No features beyond what the user requests in a single task.

## Testing

- There are currently no tests. Do not create a test suite unless the user asks.
- Do not add Storybook, Cypress, Playwright, or any testing infrastructure speculatively.

## What NOT to Do

- Do not add OpenAI / Claude API calls until the user specifically requests it.
- Do not add mobile-responsive breakpoints — this is a laptop-only MVP.
- Do not add auth, database, or payment code speculatively.
- Do not deploy or push to any remote unless explicitly asked.
- Do not touch CI/CD configuration.
