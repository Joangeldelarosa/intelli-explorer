# Contributing to Intelli Explorer

Thank you for your interest in contributing! Here's how to get started.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| VS Code | ≥ 1.85 |

## Setup

```bash
git clone https://github.com/Joangeldelarosa/intelli-explorer.git
cd intelli-explorer
npm install
```

## Development workflow

```bash
# Compile once
npm run compile

# Watch mode (auto-recompile on save)
npm run watch

# Run the extension in VS Code
# Press F5 → a new Extension Development Host window opens

# Lint
npm run lint

# Run unit tests
npm test
```

## Project structure

```
src/
├── extension.ts                  # Extension entry point (activate/deactivate)
├── providers/
│   ├── fileHierarchyProvider.ts   # File Hierarchy tree data provider
│   └── smartGroupsProvider.ts     # Smart Groups tree data provider
└── utils/
    └── fileCategories.ts          # Language & pattern classification logic
```

## Submitting changes

1. Fork the repo and create a feature branch from `main`.
2. Make your changes, add tests if applicable.
3. Ensure `npm run lint`, `npm run compile`, and `npm test` all pass.
4. Open a pull request describing what you changed and why.

## Code style

- Follow the existing TypeScript conventions in the codebase.
- Use ESLint (`npm run lint`) to catch issues.

## Reporting bugs

Open a [GitHub Issue](https://github.com/Joangeldelarosa/intelli-explorer/issues) with:

- Steps to reproduce.
- Expected vs actual behavior.
- VS Code version and OS.
