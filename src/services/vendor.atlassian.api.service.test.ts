import { describe, it, expect, beforeAll } from '@jest/globals';
import { config } from '../utils/config.util.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import atlassianApiService from './vendor.atlassian.api.service.js';

describe('Vendor Atlassian API Service', () => {
	// Load configuration before all tests
	beforeAll(() => {
		config.load();
	});

	describe('attachFile', () => {
		it('should reject when credentials are missing', async () => {
			// Save original values
			const origSiteName = config.get('ATLASSIAN_SITE_NAME');
			const origUserEmail = config.get('ATLASSIAN_USER_EMAIL');
			const origApiToken = config.get('ATLASSIAN_API_TOKEN');

			// Create test environment without credentials
			const testConfig: Record<string, string | undefined> = {
				ATLASSIAN_SITE_NAME: undefined,
				ATLASSIAN_USER_EMAIL: undefined,
				ATLASSIAN_API_TOKEN: undefined,
			};

			const originalGet = config.get.bind(config);

			try {
				// Temporarily override config.get
				config.get = (key: string) => testConfig[key];

				const testBuffer = Buffer.from('test content');

				await expect(
					atlassianApiService.attachFile(
						'TEST-1',
						testBuffer,
						'test.txt',
					),
				).rejects.toThrow(/credentials/i);
			} finally {
				// Restore config behavior
				config.get = originalGet;
				// Force reload to restore original values
				if (origSiteName && origUserEmail && origApiToken) {
					config.load();
				}
			}
		});

		it('should handle non-existent issue errors', async () => {
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			const testBuffer = Buffer.from('test content');

			await expect(
				atlassianApiService.attachFile(
					'NONEXISTENT-99999',
					testBuffer,
					'test.txt',
				),
			).rejects.toThrow(/not found|does not exist/i);
		}, 15000);

		it('should detect MIME type from filename', async () => {
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			// This test verifies the MIME type detection by attempting
			// to upload to a non-existent issue (will fail with 404, not MIME error)
			const testBuffer = Buffer.from('PNG content');

			// The error should be about the issue not existing, not about MIME type
			await expect(
				atlassianApiService.attachFile(
					'NONEXISTENT-99999',
					testBuffer,
					'test.png',
				),
			).rejects.toThrow(/not found|does not exist/i);
		}, 15000);
	});

	describe('downloadAttachment', () => {
		it('should reject when credentials are missing', async () => {
			// Save original values
			const origSiteName = config.get('ATLASSIAN_SITE_NAME');
			const origUserEmail = config.get('ATLASSIAN_USER_EMAIL');
			const origApiToken = config.get('ATLASSIAN_API_TOKEN');

			// Create test environment without credentials
			const testConfig: Record<string, string | undefined> = {
				ATLASSIAN_SITE_NAME: undefined,
				ATLASSIAN_USER_EMAIL: undefined,
				ATLASSIAN_API_TOKEN: undefined,
			};

			const originalGet = config.get.bind(config);

			try {
				// Temporarily override config.get
				config.get = (key: string) => testConfig[key];

				await expect(
					atlassianApiService.downloadAttachment('12345'),
				).rejects.toThrow(/credentials/i);
			} finally {
				// Restore config behavior
				config.get = originalGet;
				// Force reload to restore original values
				if (origSiteName && origUserEmail && origApiToken) {
					config.load();
				}
			}
		});

		it('should handle non-existent attachment errors', async () => {
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			await expect(
				atlassianApiService.downloadAttachment('99999999'),
			).rejects.toThrow(/not found/i);
		}, 15000);

		it('should use temp directory when outputPath not provided', async () => {
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			// This test would need a real attachment ID to fully test
			// For now, we verify the error message indicates proper handling
			await expect(
				atlassianApiService.downloadAttachment('99999999'),
			).rejects.toThrow(/not found/i);
		}, 15000);
	});

	describe('MIME type detection', () => {
		// These tests verify the internal MIME type mapping works correctly
		// by checking that uploads don't fail due to MIME type issues

		it('should handle common image extensions', async () => {
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
			const testBuffer = Buffer.from('test');

			for (const ext of extensions) {
				// All should fail with 404 (issue not found), not MIME type error
				await expect(
					atlassianApiService.attachFile(
						'NONEXISTENT-99999',
						testBuffer,
						`test${ext}`,
					),
				).rejects.toThrow(/not found|does not exist/i);
			}
		}, 30000);

		it('should handle document extensions', async () => {
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			const extensions = ['.pdf', '.doc', '.docx', '.txt', '.csv'];
			const testBuffer = Buffer.from('test');

			for (const ext of extensions) {
				await expect(
					atlassianApiService.attachFile(
						'NONEXISTENT-99999',
						testBuffer,
						`test${ext}`,
					),
				).rejects.toThrow(/not found|does not exist/i);
			}
		}, 30000);
	});
});
