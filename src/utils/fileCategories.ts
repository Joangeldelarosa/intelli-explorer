/**
 * Mapping of file patterns/suffixes to human-readable group categories.
 * Files are categorized by their extension and optional pattern suffix
 * (e.g., `.controller.ts` → language: TypeScript, pattern: Controllers).
 */

export interface FileCategory {
  /** Display name for the language/type group (e.g., "TypeScript", "JavaScript") */
  language: string;
  /** Icon ID from VS Code's built-in icons */
  icon: string;
}

export interface PatternCategory {
  /** Display name for the pattern sub-group (e.g., "Controllers", "Services") */
  label: string;
  /** Patterns to match before the extension (e.g., [".controller", ".ctrl"]) */
  patterns: string[];
}

/**
 * Map of file extensions to their language category.
 */
export const EXTENSION_CATEGORIES: Record<string, FileCategory> = {
  // TypeScript
  '.ts': { language: 'TypeScript', icon: 'symbol-class' },
  '.tsx': { language: 'TypeScript (React)', icon: 'symbol-class' },
  // JavaScript
  '.js': { language: 'JavaScript', icon: 'symbol-method' },
  '.jsx': { language: 'JavaScript (React)', icon: 'symbol-method' },
  '.mjs': { language: 'JavaScript', icon: 'symbol-method' },
  '.cjs': { language: 'JavaScript', icon: 'symbol-method' },
  // Styles
  '.css': { language: 'Styles', icon: 'symbol-color' },
  '.scss': { language: 'Styles', icon: 'symbol-color' },
  '.sass': { language: 'Styles', icon: 'symbol-color' },
  '.less': { language: 'Styles', icon: 'symbol-color' },
  '.styl': { language: 'Styles', icon: 'symbol-color' },
  // Markup
  '.html': { language: 'HTML', icon: 'globe' },
  '.htm': { language: 'HTML', icon: 'globe' },
  '.xml': { language: 'XML', icon: 'code' },
  '.svg': { language: 'SVG', icon: 'symbol-color' },
  // Data / Config
  '.json': { language: 'JSON', icon: 'json' },
  '.yaml': { language: 'YAML', icon: 'symbol-property' },
  '.yml': { language: 'YAML', icon: 'symbol-property' },
  '.toml': { language: 'TOML', icon: 'symbol-property' },
  '.ini': { language: 'Config', icon: 'gear' },
  '.env': { language: 'Environment', icon: 'gear' },
  // Python
  '.py': { language: 'Python', icon: 'symbol-method' },
  '.pyw': { language: 'Python', icon: 'symbol-method' },
  // Go
  '.go': { language: 'Go', icon: 'symbol-method' },
  // Rust
  '.rs': { language: 'Rust', icon: 'symbol-method' },
  // Java / Kotlin
  '.java': { language: 'Java', icon: 'symbol-class' },
  '.kt': { language: 'Kotlin', icon: 'symbol-class' },
  // C / C++
  '.c': { language: 'C', icon: 'symbol-method' },
  '.h': { language: 'C/C++ Headers', icon: 'symbol-interface' },
  '.cpp': { language: 'C++', icon: 'symbol-method' },
  '.hpp': { language: 'C/C++ Headers', icon: 'symbol-interface' },
  // C#
  '.cs': { language: 'C#', icon: 'symbol-class' },
  // PHP
  '.php': { language: 'PHP', icon: 'symbol-method' },
  // Ruby
  '.rb': { language: 'Ruby', icon: 'symbol-method' },
  // Shell
  '.sh': { language: 'Shell', icon: 'terminal' },
  '.bash': { language: 'Shell', icon: 'terminal' },
  '.zsh': { language: 'Shell', icon: 'terminal' },
  // Documentation
  '.md': { language: 'Markdown', icon: 'markdown' },
  '.txt': { language: 'Text', icon: 'file-text' },
  '.rst': { language: 'reStructuredText', icon: 'file-text' },
  // SQL
  '.sql': { language: 'SQL', icon: 'database' },
  // Docker
  '.dockerfile': { language: 'Docker', icon: 'package' },
  // Other
  '.graphql': { language: 'GraphQL', icon: 'symbol-interface' },
  '.gql': { language: 'GraphQL', icon: 'symbol-interface' },
  '.prisma': { language: 'Prisma', icon: 'database' },
  '.proto': { language: 'Protocol Buffers', icon: 'symbol-interface' },
};

/**
 * Common naming patterns that appear before the file extension.
 * For example, `user.controller.ts` matches the "Controllers" pattern.
 */
export const PATTERN_CATEGORIES: PatternCategory[] = [
  { label: 'Controllers', patterns: ['.controller', '.ctrl'] },
  { label: 'Services', patterns: ['.service', '.svc'] },
  { label: 'Models', patterns: ['.model', '.entity'] },
  { label: 'Interfaces', patterns: ['.interface', '.types', '.type', '.d'] },
  { label: 'DTOs', patterns: ['.dto'] },
  { label: 'Repositories', patterns: ['.repository', '.repo'] },
  { label: 'Middleware', patterns: ['.middleware', '.mw'] },
  { label: 'Guards', patterns: ['.guard'] },
  { label: 'Pipes', patterns: ['.pipe'] },
  { label: 'Interceptors', patterns: ['.interceptor'] },
  { label: 'Decorators', patterns: ['.decorator'] },
  { label: 'Filters', patterns: ['.filter'] },
  { label: 'Resolvers', patterns: ['.resolver'] },
  { label: 'Modules', patterns: ['.module'] },
  { label: 'Routes', patterns: ['.route', '.routes', '.router'] },
  { label: 'Components', patterns: ['.component', '.comp'] },
  { label: 'Pages', patterns: ['.page', '.screen'] },
  { label: 'Layouts', patterns: ['.layout'] },
  { label: 'Hooks', patterns: ['.hook'] },
  { label: 'Stores', patterns: ['.store', '.state', '.slice'] },
  { label: 'Actions', patterns: ['.action', '.actions'] },
  { label: 'Reducers', patterns: ['.reducer'] },
  { label: 'Selectors', patterns: ['.selector', '.selectors'] },
  { label: 'Effects', patterns: ['.effect', '.effects'] },
  { label: 'Utils', patterns: ['.util', '.utils', '.helper', '.helpers'] },
  { label: 'Constants', patterns: ['.constant', '.constants', '.const'] },
  { label: 'Config', patterns: ['.config', '.conf', '.configuration'] },
  { label: 'Tests', patterns: ['.test', '.spec', '.e2e-spec'] },
  { label: 'Migrations', patterns: ['.migration'] },
  { label: 'Seeds', patterns: ['.seed', '.seeder'] },
  { label: 'Factories', patterns: ['.factory'] },
  { label: 'Validators', patterns: ['.validator', '.validation'] },
  { label: 'Schemas', patterns: ['.schema'] },
  { label: 'Enums', patterns: ['.enum', '.enums'] },
  { label: 'Mappers', patterns: ['.mapper'] },
  { label: 'Adapters', patterns: ['.adapter'] },
  { label: 'Strategies', patterns: ['.strategy'] },
  { label: 'Providers', patterns: ['.provider'] },
  { label: 'Exceptions', patterns: ['.exception', '.error'] },
  { label: 'Events', patterns: ['.event', '.events'] },
  { label: 'Subscribers', patterns: ['.subscriber'] },
  { label: 'Listeners', patterns: ['.listener'] },
  { label: 'Jobs', patterns: ['.job', '.queue'] },
  { label: 'Commands', patterns: ['.command'] },
  { label: 'Queries', patterns: ['.query'] },
  { label: 'Handlers', patterns: ['.handler'] },
  { label: 'Sagas', patterns: ['.saga'] },
  { label: 'Styles', patterns: ['.style', '.styles', '.styled'] },
];

/**
 * Given a filename (e.g., "audio.controller.ts"), detect the pattern category
 * that matches the segment before the final extension.
 */
export function detectPattern(fileName: string): PatternCategory | undefined {
  const lowerName = fileName.toLowerCase();

  for (const cat of PATTERN_CATEGORIES) {
    for (const pattern of cat.patterns) {
      // Match pattern before the last extension: name{pattern}.ext
      const regex = new RegExp(`${escapeRegex(pattern)}\\.[^.]+$`);
      if (regex.test(lowerName)) {
        return cat;
      }
    }
  }
  return undefined;
}

/**
 * Get the language category for a given file extension.
 */
export function getLanguageCategory(ext: string): FileCategory | undefined {
  return EXTENSION_CATEGORIES[ext.toLowerCase()];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
