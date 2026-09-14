import { defineConfig } from 'oxfmt';

export default defineConfig({
  trailingComma: 'es5',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  endOfLine: 'lf',
  quoteProps: 'consistent',
  sortTailwindcss: {},
  printWidth: 120,
  sortPackageJson: true,
  sortImports: {
    groups: [
      'type-import',
      ['value-builtin', 'value-external'],
      'type-internal',
      'value-internal',
      ['type-parent', 'type-sibling', 'type-index'],
      ['value-parent', 'value-sibling', 'value-index'],
      'unknown',
    ],
  },
});
