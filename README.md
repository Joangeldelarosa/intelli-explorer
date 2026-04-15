# Intelli Explorer

**Explore your files and folders in a smarter way on VS Code.**

Intelli Explorer is a VS Code extension that provides an intelligent file explorer with two panels:

## Features

### 📁 File Hierarchy (Top Panel)
A standard file tree showing your workspace files and folders in their real directory structure — similar to VS Code's built-in explorer, but inside the Intelli Explorer sidebar.

### 🧠 Smart Groups (Bottom Panel)
Files are automatically grouped by **language/type** and **naming pattern**. For example:

```
TypeScript
  Controllers
    user.controller.ts
    auth.controller.ts
  Services
    user.service.ts
    payment.service.ts
  Models
    user.model.ts
  (Other)
    main.ts
JavaScript
  Utils
    helpers.util.js
  ...
Styles
  app.css
  theme.scss
```

This lets you quickly find all controllers, services, models, etc. regardless of where they live in your directory structure.

### Supported Patterns
The extension automatically detects common naming conventions including:
- **Controllers**, **Services**, **Models**, **Interfaces**, **DTOs**
- **Components**, **Pages**, **Layouts**, **Hooks**, **Stores**
- **Routes**, **Middleware**, **Guards**, **Pipes**, **Interceptors**
- **Tests/Specs**, **Utils/Helpers**, **Config**, **Constants**
- **Migrations**, **Seeds**, **Factories**, **Validators**, **Schemas**
- And many more...

### Supported Languages
TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, C/C++, C#, PHP, Ruby, CSS/SCSS/SASS/Less, HTML, JSON, YAML, SQL, Markdown, and more.

## Getting Started

1. Open a project in VS Code
2. Click the **Intelli Explorer** icon in the Activity Bar (left sidebar)
3. Browse your files in the **File Hierarchy** panel or find them grouped in the **Smart Groups** panel
4. Click any file to open it

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode (auto-recompile on changes)
npm run watch

# Launch in VS Code
# Press F5 in VS Code to open a new Extension Development Host window
```

## License

MIT
