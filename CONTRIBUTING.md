# Contributing to react-nibble

Thank you for your interest in contributing to react-nibble! This document provides guidelines and instructions for contributing.

## Prerequisites

- **Node.js** >= 22
- **Bun** 1.3.9
- **Editor**: Zed (recommended), VSCode, or Cursor

## Development Setup

```bash
# Clone the repository
git clone https://github.com/funsaized/react-nibble.git
cd react-nibble

# Install dependencies
bun install
```

## Common Commands

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `bun lint`          | Run ESLint                   |
| `bun lint:fix`      | Run ESLint with auto-fix     |
| `bun format`        | Format code with Prettier    |
| `bun format:check`  | Check formatting             |
| `bun typecheck`     | Run TypeScript type checking |
| `bun test`          | Run tests                    |
| `bun test:coverage` | Run tests with coverage      |
| `bun build`         | Build all packages           |

## Branching

Create branches from `main` using the following naming conventions:

- `feat/*` for new features
- `fix/*` for bug fixes
- `docs/*` for documentation changes

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — a new feature
- `fix:` — a bug fix
- `docs:` — documentation only changes
- `chore:` — maintenance tasks
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or correcting tests

Scope is optional but encouraged: `feat(core):`, `fix(ui):`, `docs(server):`.

## Pull Request Process

1. Ensure `bun lint`, `bun test`, and `bun typecheck` all pass.
2. Add a changeset if your change affects the public API: `bunx changeset`.
3. Fill out the PR template completely.
4. Request review from a maintainer.

## Reporting Issues

Please use the [issue templates](https://github.com/funsaized/react-nibble/issues/new/choose) to report bugs, request features, or ask questions.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.
