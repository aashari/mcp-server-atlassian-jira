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

		it('should return null when environment variables are missing', () => {
			// Save original values
			const origSiteName = config.get('ATLASSIAN_SITE_NAME');
			const origUserEmail = config.get('ATLASSIAN_USER_EMAIL');
			const origApiToken = config.get('ATLASSIAN_API_TOKEN');

			// Create test environment without credentials
			const testConfig = {
				ATLASSIAN_SITE_NAME: undefined,
				ATLASSIAN_USER_EMAIL: undefined,
				ATLASSIAN_API_TOKEN: undefined,
			};

			// Test with missing credentials
			try {
				// Use Object.defineProperty to temporarily change config.get behavior without mocking
				config.get = (key: string) =>
					testConfig[key as keyof typeof testConfig];

				// Call the function
				const credentials = getAtlassianCredentials();

				// Verify the result is null
				expect(credentials).toBeNull();
			} finally {
				// Restore config behavior for subsequent tests
				config.get = (key: string) => {
					if (key === 'ATLASSIAN_SITE_NAME') return origSiteName;
					if (key === 'ATLASSIAN_USER_EMAIL') return origUserEmail;
					if (key === 'ATLASSIAN_API_TOKEN') return origApiToken;
					return config.get(key);
				};
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
			expect(result).toHaveProperty('values');
			expect(Array.isArray(result.values)).toBe(true);
			expect(result).toHaveProperty('startAt');
			expect(result).toHaveProperty('maxResults');
			expect(result).toHaveProperty('total');

			// If projects are returned, verify their structure
			if (result.values.length > 0) {
				const project = result.values[0];
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
			expect(result).toHaveProperty('values');
			expect(Array.isArray(result.values)).toBe(true);
			expect(result).toHaveProperty('startAt');
			expect(result).toHaveProperty('maxResults');
			expect(result).toHaveProperty('total');
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
			expect(result).toHaveProperty('values');
			expect(Array.isArray(result.values)).toBe(true);
			expect(result).toHaveProperty('startAt');
			expect(result).toHaveProperty('maxResults', 1); // Should respect maxResults=1
			expect(result.values.length).toBeLessThanOrEqual(1);
		}, 15000); // Increased timeout for real API call
	});
});
