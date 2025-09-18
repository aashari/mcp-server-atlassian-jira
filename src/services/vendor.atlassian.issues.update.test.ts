import atlassianIssuesService from './vendor.atlassian.issues.service.js';
import { fetchAtlassian, getAtlassianCredentials } from '../utils/transport.util.js';
import { validateResponse } from '../utils/validation.util.js';
import { UpdateIssueParams, UpdateIssueResponse } from './vendor.atlassian.issues.types.js';

// Mock dependencies
jest.mock('../utils/transport.util.js');
jest.mock('../utils/validation.util.js');

const mockFetchAtlassian = fetchAtlassian as jest.MockedFunction<typeof fetchAtlassian>;
const mockGetAtlassianCredentials = getAtlassianCredentials as jest.MockedFunction<typeof getAtlassianCredentials>;
const mockValidateResponse = validateResponse as jest.MockedFunction<typeof validateResponse>;

describe('atlassianIssuesService.updateIssue', () => {
	const mockCredentials = {
		siteName: 'test-site',
		userEmail: 'test@example.com',
		apiToken: 'test-token',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAtlassianCredentials.mockReturnValue(mockCredentials);
	});

	it('should update issue with basic fields', async () => {
		// Arrange
		const issueKey = 'TEST-123';
		const params: UpdateIssueParams = {
			fields: {
				summary: 'Updated summary',
				priority: { name: 'High' },
			},
		};

		const mockApiResponse = {
			key: 'TEST-123',
			id: '10001',
		};

		const expectedResponse: UpdateIssueResponse = {
			key: 'TEST-123',
			id: '10001',
		};

		mockFetchAtlassian.mockResolvedValue(mockApiResponse);
		mockValidateResponse.mockReturnValue(expectedResponse);

		// Act
		const result = await atlassianIssuesService.updateIssue(issueKey, params);

		// Assert
		expect(mockFetchAtlassian).toHaveBeenCalledWith(
			mockCredentials,
			'/rest/api/3/issue/TEST-123',
			{
				method: 'PUT',
				body: {
					fields: {
						summary: 'Updated summary',
						priority: { name: 'High' },
					},
				},
			}
		);
		expect(mockValidateResponse).toHaveBeenCalledWith(
			mockApiResponse,
			expect.any(Object), // UpdateIssueResponseSchema
			'update issue TEST-123'
		);
		expect(result).toEqual(expectedResponse);
	});

	it('should update issue with query parameters', async () => {
		// Arrange
		const issueKey = 'TEST-456';
		const params: UpdateIssueParams = {
			fields: {
				summary: 'Updated summary',
			},
			notifyUsers: false,
			returnIssue: true,
			expand: ['changelog'],
		};

		const mockApiResponse = {
			key: 'TEST-456',
			id: '10002',
			fields: {
				summary: 'Updated summary',
			},
		};

		const expectedResponse: UpdateIssueResponse = {
			key: 'TEST-456',
			id: '10002',
			fields: {
				summary: 'Updated summary',
			},
		};

		mockFetchAtlassian.mockResolvedValue(mockApiResponse);
		mockValidateResponse.mockReturnValue(expectedResponse);

		// Act
		const result = await atlassianIssuesService.updateIssue(issueKey, params);

		// Assert
		expect(mockFetchAtlassian).toHaveBeenCalledWith(
			mockCredentials,
			'/rest/api/3/issue/TEST-456?notifyUsers=false&returnIssue=true&expand=changelog',
			{
				method: 'PUT',
				body: {
					fields: {
						summary: 'Updated summary',
					},
				},
			}
		);
		expect(result).toEqual(expectedResponse);
	});

	it('should update issue with update operations', async () => {
		// Arrange
		const issueKey = 'TEST-789';
		const params: UpdateIssueParams = {
			update: {
				labels: [
					{ add: 'new-label' },
					{ remove: 'old-label' },
				],
			},
		};

		const mockApiResponse = {
			key: 'TEST-789',
		};

		const expectedResponse: UpdateIssueResponse = {
			key: 'TEST-789',
		};

		mockFetchAtlassian.mockResolvedValue(mockApiResponse);
		mockValidateResponse.mockReturnValue(expectedResponse);

		// Act
		const result = await atlassianIssuesService.updateIssue(issueKey, params);

		// Assert
		expect(mockFetchAtlassian).toHaveBeenCalledWith(
			mockCredentials,
			'/rest/api/3/issue/TEST-789',
			{
				method: 'PUT',
				body: {
					update: {
						labels: [
							{ add: 'new-label' },
							{ remove: 'old-label' },
						],
					},
				},
			}
		);
		expect(result).toEqual(expectedResponse);
	});

	it('should handle 204 No Content response', async () => {
		// Arrange
		const issueKey = 'TEST-204';
		const params: UpdateIssueParams = {
			fields: {
				summary: 'Updated summary',
			},
		};

		// Mock 204 response (undefined)
		mockFetchAtlassian.mockResolvedValue(undefined);

		// Act
		const result = await atlassianIssuesService.updateIssue(issueKey, params);

		// Assert
		expect(result).toEqual({
			key: 'TEST-204',
		});
		expect(mockValidateResponse).not.toHaveBeenCalled();
	});

	it('should include all optional parameters in request body', async () => {
		// Arrange
		const issueKey = 'TEST-FULL';
		const params: UpdateIssueParams = {
			fields: {
				summary: 'Updated summary',
			},
			update: {
				labels: [{ add: 'label1' }],
			},
			historyMetadata: {
				type: 'myplugin:type',
				description: 'Text description',
			},
			properties: [
				{
					key: 'prop1',
					value: 'value1',
				},
			],
		};

		const mockApiResponse = {
			key: 'TEST-FULL',
		};

		mockFetchAtlassian.mockResolvedValue(mockApiResponse);
		mockValidateResponse.mockReturnValue(mockApiResponse);

		// Act
		await atlassianIssuesService.updateIssue(issueKey, params);

		// Assert
		expect(mockFetchAtlassian).toHaveBeenCalledWith(
			mockCredentials,
			'/rest/api/3/issue/TEST-FULL',
			{
				method: 'PUT',
				body: {
					fields: {
						summary: 'Updated summary',
					},
					update: {
						labels: [{ add: 'label1' }],
					},
					historyMetadata: {
						type: 'myplugin:type',
						description: 'Text description',
					},
					properties: [
						{
							key: 'prop1',
							value: 'value1',
						},
					],
				},
			}
		);
	});

	it('should throw error when credentials are missing', async () => {
		// Arrange
		mockGetAtlassianCredentials.mockReturnValue(null);

		const issueKey = 'TEST-NO-CREDS';
		const params: UpdateIssueParams = {
			fields: {
				summary: 'Updated summary',
			},
		};

		// Act & Assert
		await expect(atlassianIssuesService.updateIssue(issueKey, params)).rejects.toThrow(
			'Atlassian credentials required to update issue TEST-NO-CREDS'
		);
	});

	it('should propagate fetch errors', async () => {
		// Arrange
		const issueKey = 'TEST-ERROR';
		const params: UpdateIssueParams = {
			fields: {
				summary: 'Updated summary',
			},
		};

		const mockError = new Error('Network error');
		mockFetchAtlassian.mockRejectedValue(mockError);

		// Act & Assert
		await expect(atlassianIssuesService.updateIssue(issueKey, params)).rejects.toThrow(
			'Unexpected error updating Jira issue TEST-ERROR: Network error'
		);
	});

	it('should handle validation errors', async () => {
		// Arrange
		const issueKey = 'TEST-VALIDATION';
		const params: UpdateIssueParams = {
			fields: {
				summary: 'Updated summary',
			},
		};

		const mockApiResponse = {
			invalid: 'response',
		};

		const validationError = new Error('Validation failed');
		mockFetchAtlassian.mockResolvedValue(mockApiResponse);
		mockValidateResponse.mockImplementation(() => {
			throw validationError;
		});

		// Act & Assert
		await expect(atlassianIssuesService.updateIssue(issueKey, params)).rejects.toThrow('Validation failed');
	});
});
