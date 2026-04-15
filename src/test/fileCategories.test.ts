import {
  detectPattern,
  getLanguageCategory,
  EXTENSION_CATEGORIES,
  PATTERN_CATEGORIES,
} from '../utils/fileCategories';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(
      `FAIL: ${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
  }
}

// ---------------------------------------------------------------------------
// Tests — getLanguageCategory
// ---------------------------------------------------------------------------
console.log('\ngetLanguageCategory');

test('returns TypeScript for .ts', () => {
  const cat = getLanguageCategory('.ts');
  assert(cat !== undefined, '.ts should have a category');
  assertEqual(cat!.language, 'TypeScript', 'language');
});

test('returns JavaScript for .js', () => {
  const cat = getLanguageCategory('.js');
  assert(cat !== undefined, '.js should have a category');
  assertEqual(cat!.language, 'JavaScript', 'language');
});

test('returns TypeScript (React) for .tsx', () => {
  const cat = getLanguageCategory('.tsx');
  assert(cat !== undefined, '.tsx should have a category');
  assertEqual(cat!.language, 'TypeScript (React)', 'language');
});

test('returns Python for .py', () => {
  const cat = getLanguageCategory('.py');
  assert(cat !== undefined, '.py should have a category');
  assertEqual(cat!.language, 'Python', 'language');
});

test('returns Go for .go', () => {
  const cat = getLanguageCategory('.go');
  assert(cat !== undefined, '.go should have a category');
  assertEqual(cat!.language, 'Go', 'language');
});

test('returns Rust for .rs', () => {
  const cat = getLanguageCategory('.rs');
  assert(cat !== undefined, '.rs should have a category');
  assertEqual(cat!.language, 'Rust', 'language');
});

test('returns Styles for .css', () => {
  const cat = getLanguageCategory('.css');
  assert(cat !== undefined, '.css should have a category');
  assertEqual(cat!.language, 'Styles', 'language');
});

test('returns Styles for .scss', () => {
  const cat = getLanguageCategory('.scss');
  assert(cat !== undefined, '.scss should have a category');
  assertEqual(cat!.language, 'Styles', 'language');
});

test('is case-insensitive', () => {
  const cat = getLanguageCategory('.TS');
  assert(cat !== undefined, '.TS (uppercase) should resolve');
  assertEqual(cat!.language, 'TypeScript', 'language');
});

test('returns undefined for unknown extension', () => {
  const cat = getLanguageCategory('.xyz');
  assertEqual(cat, undefined, 'unknown ext should be undefined');
});

// ---------------------------------------------------------------------------
// Tests — detectPattern
// ---------------------------------------------------------------------------
console.log('\ndetectPattern');

test('detects .controller pattern', () => {
  const cat = detectPattern('user.controller.ts');
  assert(cat !== undefined, 'should detect controller');
  assertEqual(cat!.label, 'Controllers', 'label');
});

test('detects .service pattern', () => {
  const cat = detectPattern('payment.service.js');
  assert(cat !== undefined, 'should detect service');
  assertEqual(cat!.label, 'Services', 'label');
});

test('detects .model pattern', () => {
  const cat = detectPattern('user.model.ts');
  assert(cat !== undefined, 'should detect model');
  assertEqual(cat!.label, 'Models', 'label');
});

test('detects .test pattern', () => {
  const cat = detectPattern('app.test.ts');
  assert(cat !== undefined, 'should detect test');
  assertEqual(cat!.label, 'Tests', 'label');
});

test('detects .spec pattern', () => {
  const cat = detectPattern('app.spec.ts');
  assert(cat !== undefined, 'should detect spec');
  assertEqual(cat!.label, 'Tests', 'label');
});

test('detects .component pattern', () => {
  const cat = detectPattern('Header.component.tsx');
  assert(cat !== undefined, 'should detect component');
  assertEqual(cat!.label, 'Components', 'label');
});

test('detects .hook pattern', () => {
  const cat = detectPattern('useAuth.hook.ts');
  assert(cat !== undefined, 'should detect hook');
  assertEqual(cat!.label, 'Hooks', 'label');
});

test('detects .middleware pattern', () => {
  const cat = detectPattern('auth.middleware.ts');
  assert(cat !== undefined, 'should detect middleware');
  assertEqual(cat!.label, 'Middleware', 'label');
});

test('detects .guard pattern', () => {
  const cat = detectPattern('roles.guard.ts');
  assert(cat !== undefined, 'should detect guard');
  assertEqual(cat!.label, 'Guards', 'label');
});

test('detects .pipe pattern', () => {
  const cat = detectPattern('validation.pipe.ts');
  assert(cat !== undefined, 'should detect pipe');
  assertEqual(cat!.label, 'Pipes', 'label');
});

test('detects .dto pattern', () => {
  const cat = detectPattern('create-user.dto.ts');
  assert(cat !== undefined, 'should detect dto');
  assertEqual(cat!.label, 'DTOs', 'label');
});

test('detects .repository pattern', () => {
  const cat = detectPattern('user.repository.ts');
  assert(cat !== undefined, 'should detect repository');
  assertEqual(cat!.label, 'Repositories', 'label');
});

test('detects .config pattern', () => {
  const cat = detectPattern('database.config.ts');
  assert(cat !== undefined, 'should detect config');
  assertEqual(cat!.label, 'Config', 'label');
});

test('detects .util pattern', () => {
  const cat = detectPattern('string.util.ts');
  assert(cat !== undefined, 'should detect util');
  assertEqual(cat!.label, 'Utils', 'label');
});

test('detects .schema pattern', () => {
  const cat = detectPattern('user.schema.ts');
  assert(cat !== undefined, 'should detect schema');
  assertEqual(cat!.label, 'Schemas', 'label');
});

test('detects .migration pattern', () => {
  const cat = detectPattern('20240101-init.migration.ts');
  assert(cat !== undefined, 'should detect migration');
  assertEqual(cat!.label, 'Migrations', 'label');
});

test('detects .factory pattern', () => {
  const cat = detectPattern('user.factory.ts');
  assert(cat !== undefined, 'should detect factory');
  assertEqual(cat!.label, 'Factories', 'label');
});

test('detects .store pattern', () => {
  const cat = detectPattern('auth.store.ts');
  assert(cat !== undefined, 'should detect store');
  assertEqual(cat!.label, 'Stores', 'label');
});

test('detects .reducer pattern', () => {
  const cat = detectPattern('cart.reducer.ts');
  assert(cat !== undefined, 'should detect reducer');
  assertEqual(cat!.label, 'Reducers', 'label');
});

test('is case-insensitive for patterns', () => {
  const cat = detectPattern('User.Controller.ts');
  assert(cat !== undefined, 'uppercase pattern should match');
  assertEqual(cat!.label, 'Controllers', 'label');
});

test('returns undefined for plain filename', () => {
  const cat = detectPattern('main.ts');
  assertEqual(cat, undefined, 'no pattern for plain name');
});

test('returns undefined for filename without extension', () => {
  const cat = detectPattern('Dockerfile');
  assertEqual(cat, undefined, 'no pattern without ext');
});

// ---------------------------------------------------------------------------
// Tests — EXTENSION_CATEGORIES integrity
// ---------------------------------------------------------------------------
console.log('\nEXTENSION_CATEGORIES integrity');

test('every entry has a non-empty language', () => {
  for (const [ext, cat] of Object.entries(EXTENSION_CATEGORIES)) {
    assert(cat.language.length > 0, `${ext} has an empty language`);
  }
});

test('every entry has a non-empty icon', () => {
  for (const [ext, cat] of Object.entries(EXTENSION_CATEGORIES)) {
    assert(cat.icon.length > 0, `${ext} has an empty icon`);
  }
});

test('all extension keys start with a dot', () => {
  for (const ext of Object.keys(EXTENSION_CATEGORIES)) {
    assert(ext.startsWith('.'), `${ext} should start with a dot`);
  }
});

// ---------------------------------------------------------------------------
// Tests — PATTERN_CATEGORIES integrity
// ---------------------------------------------------------------------------
console.log('\nPATTERN_CATEGORIES integrity');

test('no duplicate labels', () => {
  const labels = PATTERN_CATEGORIES.map((c) => c.label);
  const unique = new Set(labels);
  assertEqual(labels.length, unique.size, 'labels should be unique');
});

test('every pattern starts with a dot', () => {
  for (const cat of PATTERN_CATEGORIES) {
    for (const p of cat.patterns) {
      assert(p.startsWith('.'), `Pattern "${p}" in ${cat.label} should start with a dot`);
    }
  }
});

test('no duplicate patterns across categories', () => {
  const all: string[] = [];
  for (const cat of PATTERN_CATEGORIES) {
    for (const p of cat.patterns) {
      assert(!all.includes(p), `Pattern "${p}" appears in multiple categories`);
      all.push(p);
    }
  }
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed + failed} tests — ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
