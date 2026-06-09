import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', 'dist/', 'public/'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    // Build/CLI/server scripts onde a saída no console é intencional
    files: [
      'scripts/**/*.js',
      'db/**/*.js',
      'utils/**/*.js',
      'functions/**/*.js',
      'server.js',
      'sw.js',
      'inline-critical.js',
      'convert-to-webp.js',
      'eslint.config.js',
      'vite.config.js',
      'test/screenshot.js',
    ],
    rules: {
      'no-console': 'off',
    },
  },
];
