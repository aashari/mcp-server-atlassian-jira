import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
	{
		ignores: ['node_modules/**', 'dist/**', 'examples/**'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			'prettier/prettier': 'error',
			indent: ['error', 'tab', { SwitchCase: 1 }],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' },
			],
		},
		languageOptions: {
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: {
				node: 'readonly',
				jest: 'readonly',
			},
		},
	},
	// Special rules for test files
	{
		files: ['**/*.test.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
	eslintConfigPrettier,
);
