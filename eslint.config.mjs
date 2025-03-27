import { builtinModules } from 'module';

import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
    plugins: [
      'eslint-plugin-import',
      'eslint-plugin-unused-imports',
      'eslint-plugin-simple-import-sort',
    ],
    rules: {
      // React
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          shorthandFirst: false,
          shorthandLast: true,
          ignoreCase: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],

      // Imports
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'unused-imports/no-unused-imports': ['warn'],
      'import/first': ['warn'],
      'import/newline-after-import': ['warn'],
      'import/no-named-as-default': ['off'],
      'simple-import-sort/exports': ['warn'],
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            // Side effect imports.
            ['^\\u0000'],
            // Node.js builtins, react, and third-party packages.
            [`^(${builtinModules.join('|')})(/|$)`, '^react'],
            // Path aliased root, parent imports, and just `..`.
            ['^@/', '^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Relative imports, same-folder imports, and just `.`.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports.
            ['^.+\\.s?css$'],
          ],
        },
      ],

      // TypeScript
      '@typescript-eslint/no-empty-object-type': ['off'],
    },
  }),
];

export default eslintConfig;
