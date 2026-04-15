# Intelli Explorer

[![CI](https://github.com/Joangeldelarosa/intelli-explorer/actions/workflows/ci.yml/badge.svg)](https://github.com/Joangeldelarosa/intelli-explorer/actions/workflows/ci.yml)
[![VS Code](https://img.shields.io/badge/VS%20Code-%3E%3D1.85-blue)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Explore your files and folders in a smarter way on VS Code.**

Intelli Explorer is a VS Code extension that adds a sidebar with two panels: a traditional **File Hierarchy** and an intelligent **Smart Groups** view that automatically organizes files by language and naming convention.

---

## Features

### 📁 File Hierarchy (Top Panel)

A standard file tree showing your workspace files and folders in their real directory structure — similar to VS Code's built-in explorer, but inside the Intelli Explorer sidebar.

### 🧠 Smart Groups (Bottom Panel)

Files are automatically grouped by **language/type** and **naming pattern**. For example:

```
TypeScript (12)
  Controllers (3)
    user.controller.ts
    auth.controller.ts
    order.controller.ts
  Services (2)
    user.service.ts
    payment.service.ts
  Models (1)
    user.model.ts
  (Other) (6)
    main.ts
    ...
JavaScript (4)
  Utils (2)
    helpers.util.js
    ...
Styles (3)
  app.css
  theme.scss
  ...
```

This lets you quickly find all controllers, services, models, etc. regardless of where they live in your directory structure.

### Supported Patterns

The extension automatically detects 40+ common naming conventions including:

- **Controllers**, **Services**, **Models**, **Interfaces**, **DTOs**
- **Components**, **Pages**, **Layouts**, **Hooks**, **Stores**
- **Routes**, **Middleware**, **Guards**, **Pipes**, **Interceptors**
- **Tests/Specs**, **Utils/Helpers**, **Config**, **Constants**
- **Migrations**, **Seeds**, **Factories**, **Validators**, **Schemas**
- **Reducers**, **Selectors**, **Effects**, **Sagas**, **Actions**
- And many more…

### Supported Languages

TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, C/C++, C#, PHP, Ruby, CSS/SCSS/SASS/Less, HTML, JSON, YAML, SQL, Markdown, GraphQL, Prisma, Protocol Buffers, and more.

---

## Getting Started

1. Install the extension (see [Installation](#installation) below).
2. Open a project in VS Code.
3. Click the **Intelli Explorer** icon in the Activity Bar (left sidebar).
4. Browse your files in the **File Hierarchy** panel or find them grouped in the **Smart Groups** panel.
5. Click any file to open it.

---

## Installation

### From the VS Code Marketplace (recommended)

1. Open **VS Code**.
2. Go to the **Extensions** panel (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Search for **Intelli Explorer**.
4. Click **Install**.

### From a `.vsix` file (local install)

If you have a packaged `.vsix` file (e.g., from a GitHub release or a local build):

```bash
code --install-extension intelli-explorer-0.1.0.vsix
```

Or inside VS Code:

1. Open the **Extensions** panel (`Ctrl+Shift+X` / `Cmd+Shift+X`).
2. Click the **⋯** (More Actions) menu at the top-right of the panel.
3. Select **Install from VSIX…**
4. Browse to and select the `.vsix` file.

### Build and install from source

```bash
# 1. Clone the repo
git clone https://github.com/Joangeldelarosa/intelli-explorer.git
cd intelli-explorer

# 2. Install dependencies
npm install

# 3. Compile TypeScript
npm run compile

# 4. Package the extension into a .vsix file
npm run package          # produces intelli-explorer-<version>.vsix

# 5. Install the .vsix in VS Code
code --install-extension intelli-explorer-0.1.0.vsix
```

> **Tip:** After installing, reload VS Code (`Ctrl+Shift+P` → `Developer: Reload Window`).

---

## Development

### Prerequisites

| Tool    | Version |
| ------- | ------- |
| Node.js | ≥ 18    |
| npm     | ≥ 9     |
| VS Code | ≥ 1.85  |

### Setup

```bash
git clone https://github.com/Joangeldelarosa/intelli-explorer.git
cd intelli-explorer
npm install
```

### Common commands

```bash
npm run compile   # Compile TypeScript → out/
npm run watch     # Watch mode (auto-recompile on save)
npm run lint      # Run ESLint on src/
npm test          # Run unit tests
npm run package   # Package the extension as .vsix
npm run clean     # Delete compiled output
```

### Debugging in VS Code

1. Open the project in VS Code.
2. Press **F5** — this launches a new **Extension Development Host** window with the extension loaded.
3. Any changes you make will be recompiled automatically if `npm run watch` is running.

### Project structure

```
intelli-explorer/
├── .github/workflows/
│   ├── ci.yml                     # CI — lint, build & test on every push/PR
│   └── release.yml                # Build .vsix, create GitHub release on tag push
├── .vscode/
│   ├── launch.json                # F5 debug configuration
│   └── tasks.json                 # Default build task (watch)
├── resources/
│   └── icon.svg                   # Activity bar icon
├── src/
│   ├── extension.ts               # Extension entry point (activate / deactivate)
│   ├── providers/
│   │   ├── fileHierarchyProvider.ts   # File Hierarchy tree data provider
│   │   └── smartGroupsProvider.ts     # Smart Groups tree data provider
│   ├── test/
│   │   └── fileCategories.test.ts     # Unit tests for utility functions
│   └── utils/
│       └── fileCategories.ts          # Language & pattern classification
├── .eslintrc.json
├── .gitignore
├── .vscodeignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json                  # Main compilation config
└── tsconfig.test.json             # Test compilation config
```

---

## CI / CD

### Continuous Integration

Every push and pull request to `main` triggers the **CI** workflow (`.github/workflows/ci.yml`):

1. **Lint** — `npm run lint`
2. **Compile** — `npm run compile`
3. **Test** — `npm test`

Tests run on Node.js 18 and 20.

### Releasing a new version

1. Bump the version in `package.json`:
   ```bash
   npm version patch   # or minor / major
   ```
2. Push the tag:
   ```bash
   git push origin main --tags
   ```
3. The **Release** workflow (`.github/workflows/release.yml`) will:
   - Lint, compile, and test.
   - Package the extension with `vsce package`.
   - Create a **GitHub Release** with the `.vsix` attached.
   - Optionally publish to the **VS Code Marketplace** (requires the `VSCE_PAT` secret and the `PUBLISH_TO_MARKETPLACE` repository variable set to `true`).

### Publishing to the VS Code Marketplace

1. Create a Personal Access Token (PAT) at <https://dev.azure.com> with **Marketplace > Manage** scope.
2. Add it as a repository secret named `VSCE_PAT`.
3. Create a repository variable `PUBLISH_TO_MARKETPLACE` with value `true`.
4. The next tag push will auto-publish.

For manual publishing:

```bash
npm install -g @vscode/vsce
vsce login joangeldelarosa
vsce publish
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, development workflow, and submission guidelines.

---

## License

[MIT](LICENSE) © Joangel de la Rosa
