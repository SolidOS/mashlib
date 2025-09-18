import tseslintPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'

export default [
    {
        ignores: [
            'node_modules/**',
            'dist/**',
        ],
    },
    {
        files: ['src/**/*.js', 'src/**/*.cjs', 'src/**/*.mjs'],

        languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            Atomics: 'readonly',
            SharedArrayBuffer: 'readonly',
        }
        },
        rules: {
        semi: ['error', 'never'],
        quotes: ['error', 'single'],
        'no-console': 'error',
        'no-unused-vars': 'error',
        'no-undef': 'error'
        },
    },
    {
        files: ["src/**/*.ts"],
        plugins: {
            "@typescript-eslint": tseslintPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                Atomics: "readonly",
                SharedArrayBuffer: "readonly",
            },
            parser: tsParser,
            parserOptions: {
                project: ['./tsconfig.json']
            },
        },
        
        rules: {
            semi: ['error', 'never'],
            quotes: ['error', 'single'],
            'no-console': 'warn',
            'no-unused-vars': 'off',
            "@typescript-eslint/no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
        },
    }
]
