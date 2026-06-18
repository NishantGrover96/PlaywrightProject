# Generic Copilot Instructions

This file provides general guidance for AI-assisted coding in any repository.

For tools that support root-level instruction discovery, see `AGENTS.md`.

## Core Behavior
- Think before coding. Clarify assumptions when requirements are ambiguous.
- Prefer the simplest solution that satisfies the request.
- Make focused, minimal changes. Avoid unrelated refactors.
- Match the existing style and conventions in files you touch.

## Code Quality
- Prioritize readability over cleverness.
- Keep functions/components small and cohesive.
- Avoid duplication when practical, but do not over-abstract.
- Add concise comments only where logic is non-obvious.

## Type Safety
- Prefer explicit types at boundaries (inputs, outputs, public APIs).
- Avoid `any` unless unavoidable; use safer alternatives and narrowing.
- Remove unused imports, variables, and dead code introduced by your change.

## Testing Guidance
- Treat tests as behavior checks, not implementation checks.
- Add or update tests when changing behavior.
- Prefer small, targeted test runs first, then broader runs if needed.

## Security And Secrets
- Never hardcode secrets, tokens, passwords, or private keys.
- Use environment variables or secure configuration sources.
- Validate and sanitize untrusted input.

## Dependency And File Hygiene
- Reuse existing libraries and utilities before adding new dependencies.
- If adding a dependency, keep it minimal and justify its need.
- Do not rename/move/delete unrelated files unless requested.

## Pre-PR Checklist
- Code builds and relevant tests pass.
- No debug logs, temporary flags, or placeholder code left behind.
- No secrets or sensitive data included in code, config, or tests.
- Changes are scoped to the requested task.
