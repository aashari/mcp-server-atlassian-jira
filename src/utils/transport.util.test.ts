import { getAtlassianCredentials, fetchAtlassian } from './transport.util.js';
import { config } from './config.util.js';

/**
 * Generic response type for Jira API paginated results
 */
interface PaginatedResponse<T> {
	values: T[];
	startAt: number;
	maxResults: number;
	total: number;
}

/**
 * Minimal project structure for testing
 */
interface ProjectSummary {
	id: string;
	key: string;
	name: string;
}

describe('Transport Utility', () => {
	// Load configuration before all tests
	beforeAll(() => {
		// Load configuration from all sources
		config.load();
	});

	describe('getAtlassianCredentials', () => {
		it('should return credentials when environment variables are set', () => {
			// This test will be skipped if credentials are not available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			// Verify the structure of the credentials
			expect(credentials).toHaveProperty('siteName');
			expect(credentials).toHaveProperty('userEmail');
			expect(credentials).toHaveProperty('apiToken');

			// Verify the credentials are not empty
			expect(credentials.siteName).toBeTruthy();
			expect(credentials.userEmail).toBeTruthy();
			expect(credentials.apiToken).toBeTruthy();
		});

		it('should include cloudId when ATLASSIAN_CLOUD_ID is set', () => {
			const testCloudId = 'test-cloud-id-12345';
			const testConfig: Record<string, string | undefined> = {
				ATLASSIAN_SITE_NAME: undefined,
				ATLASSIAN_USER_EMAIL: 'test@example.com',
				ATLASSIAN_API_TOKEN: 'test-token',
				ATLASSIAN_CLOUD_ID: testCloudId,
			};

			const originalGet = config.get.bind(config);

			try {
				config.get = (key: string) => testConfig[key];
				const credentials = getAtlassianCredentials();

				expect(credentials).not.toBeNull();
				expect(credentials?.cloudId).toBe(testCloudId);
				expect(credentials?.siteName).toBeUndefined();
			} finally {
				config.get = originalGet;
			}
		});

		it('should work with siteName only (no cloudId)', () => {
			const testConfig: Record<string, string | undefined> = {
				ATLASSIAN_SITE_NAME: 'test-site',
				ATLASSIAN_USER_EMAIL: 'test@example.com',
				ATLASSIAN_API_TOKEN: 'test-token',
				ATLASSIAN_CLOUD_ID: undefined,
			};

			const originalGet = config.get.bind(config);

			try {
				config.get = (key: string) => testConfig[key];
				const credentials = getAtlassianCredentials();

				expect(credentials).not.toBeNull();
				expect(credentials?.siteName).toBe('test-site');
				expect(credentials?.cloudId).toBeUndefined();
			} finally {
				config.get = originalGet;
			}
		});

		it('should return null when neither siteName nor cloudId is set', () => {
			const testConfig: Record<string, string | undefined> = {
				ATLASSIAN_SITE_NAME: undefined,
				ATLASSIAN_USER_EMAIL: 'test@example.com',
				ATLASSIAN_API_TOKEN: 'test-token',
				ATLASSIAN_CLOUD_ID: undefined,
			};

			const originalGet = config.get.bind(config);

			try {
				config.get = (key: string) => testConfig[key];
				const credentials = getAtlassianCredentials();

				expect(credentials).toBeNull();
			} finally {
				config.get = originalGet;
			}
		});

		it('should return null when environment variables are missing', () => {
			const originalGet = config.get.bind(config);

			const testConfig: Record<string, string | undefined> = {
				ATLASSIAN_SITE_NAME: undefined,
				ATLASSIAN_USER_EMAIL: undefined,
				ATLASSIAN_API_TOKEN: undefined,
				ATLASSIAN_CLOUD_ID: undefined,
			};

			// Test with missing credentials
			try {
				config.get = (key: string) => testConfig[key];
				const credentials = getAtlassianCredentials();

				// Verify the credentials are null
				expect(credentials).toBeNull();
			} finally {
				config.get = originalGet;
			}
		});
	});

	describe('fetchAtlassian', () => {
		it('should successfully fetch data from the Atlassian API', async () => {
			// This test will be skipped if credentials are not available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			// Make a call to a real API endpoint - project search
			const result = await fetchAtlassian<
				PaginatedResponse<ProjectSummary>
			>(credentials, '/rest/api/3/project/search', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			// Verify the response structure from real API
			expect(result.data).toHaveProperty('values');
			expect(Array.isArray(result.data.values)).toBe(true);
			expect(result.data).toHaveProperty('startAt');
			expect(result.data).toHaveProperty('maxResults');
			expect(result.data).toHaveProperty('total');

			// If projects are returned, verify their structure
			if (result.data.values.length > 0) {
				const project = result.data.values[0];
				expect(project).toHaveProperty('id');
				expect(project).toHaveProperty('key');
				expect(project).toHaveProperty('name');
			}
		}, 15000); // Increased timeout for real API call

		it('should handle API errors correctly', async () => {
			// This test will be skipped if credentials are not available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			// Call a non-existent endpoint and expect it to throw
			await expect(
				fetchAtlassian(
					credentials,
					'/rest/api/3/non-existent-endpoint',
				),
			).rejects.toThrow();
		}, 15000); // Increased timeout for real API call

		it('should normalize paths that do not start with a slash', async () => {
			// This test will be skipped if credentials are not available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			// Call the function with a path that doesn't start with a slash
			const result = await fetchAtlassian<
				PaginatedResponse<ProjectSummary>
			>(credentials, 'rest/api/3/project/search', {
				method: 'GET',
			});

			// Verify the response structure from real API
			expect(result.data).toHaveProperty('values');
			expect(Array.isArray(result.data.values)).toBe(true);
			expect(result.data).toHaveProperty('startAt');
			expect(result.data).toHaveProperty('maxResults');
			expect(result.data).toHaveProperty('total');
		}, 15000); // Increased timeout for real API call

		it('should support custom request options', async () => {
			// This test will be skipped if credentials are not available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			// Custom request options including pagination
			const options = {
				method: 'GET' as const,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			};

			// Call a real endpoint with pagination parameter
			const result = await fetchAtlassian<
				PaginatedResponse<ProjectSummary>
			>(credentials, '/rest/api/3/project/search?maxResults=1', options);

			// Verify the response structure and pagination
			expect(result.data).toHaveProperty('values');
			expect(Array.isArray(result.data.values)).toBe(true);
			expect(result.data).toHaveProperty('startAt');
			expect(result.data).toHaveProperty('maxResults', 1); // Should respect maxResults=1
			expect(result.data.values.length).toBeLessThanOrEqual(1);
		}, 15000); // Increased timeout for real API call
	});
});
