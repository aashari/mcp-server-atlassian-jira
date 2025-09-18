import atlassianIssuesUpdateController from './atlassian.issues.update.controller.js';
import atlassianIssuesService from '../services/vendor.atlassian.issues.service.js';
import { UpdateIssueToolArgsType } from '../tools/atlassian.issues.types.js';
import { UpdateIssueResponse } from '../services/vendor.atlassian.issues.types.js';

// Mock the service
jest.mock('../services/vendor.atlassian.issues.service.js');
const mockAtlassianIssuesService = atlassianIssuesService as jest.Mocked<typeof atlassianIssuesService>;

// Mock the formatter
jest.mock('./atlassian.issues.update.formatter.js', () => ({
	formatUpdateIssueResponse: jest.fn((_response, issueKey, _returnIssue) => 
		`Mock formatted response for ${issueKey}`
	),
}));

describe('atlassianIssuesUpdateController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('updateIssue', () => {
		it('should update issue with basic fields', async () => {
			// Arrange
			const args: UpdateIssueToolArgsType = {
				issueIdOrKey: 'TEST-123',
				fields: {
					summary: 'Updated summary',
					priority: 'High',
				},
			};

			const mockResponse: UpdateIssueResponse = {
				key: 'TEST-123',
				id: '10001',
			};

			mockAtlassianIssuesService.updateIssue.mockResolvedValue(mockResponse);

			// Act
			const result = await atlassianIssuesUpdateController.updateIssue(args);

			// Assert
			expect(mockAtlassianIssuesService.updateIssue).toHaveBeenCalledWith('TEST-123', {
				fields: {
					summary: 'Updated summary',
					priority: { name: 'High' }, // Should be transformed
				},
				update: undefined,
				notifyUsers: true, // Default value
				returnIssue: false, // Default value
				expand: undefined,
			});
			expect(result.content).toBe('Mock formatted response for TEST-123');
		});

		it('should update issue with custom fields', async () => {
			// Arrange
			const args: UpdateIssueToolArgsType = {
				issueIdOrKey: 'TEST-456',
				fields: {
					'customfield_10001': 'Custom value',
					'customfield_10002': 123,
				},
			};

			const mockResponse: UpdateIssueResponse = {
				key: 'TEST-456',
			};

			mockAtlassianIssuesService.updateIssue.mockResolvedValue(mockResponse);

			// Act
			const result = await atlassianIssuesUpdateController.updateIssue(args);

			// Assert
			expect(mockAtlassianIssuesService.updateIssue).toHaveBeenCalledWith('TEST-456', {
				fields: {
					'customfield_10001': 'Custom value',
					'customfield_10002': 123,
				},
				update: undefined,
				notifyUsers: true,
				returnIssue: false,
				expand: undefined,
			});
			expect(result.content).toBe('Mock formatted response for TEST-456');
		});

		it('should handle markdown description conversion', async () => {
			// Arrange
			const args: UpdateIssueToolArgsType = {
				issueIdOrKey: 'TEST-789',
				fields: {
					description: '# Markdown Title\n\nSome **bold** text',
				},
			};

			const mockResponse: UpdateIssueResponse = {
				key: 'TEST-789',
			};

			mockAtlassianIssuesService.updateIssue.mockResolvedValue(mockResponse);

			// Act
			await atlassianIssuesUpdateController.updateIssue(args);

			// Assert
			expect(mockAtlassianIssuesService.updateIssue).toHaveBeenCalledWith('TEST-789', {
				fields: {
					description: expect.objectContaining({
						type: 'doc',
						version: expect.any(Number),
					}),
				},
				update: undefined,
				notifyUsers: true,
				returnIssue: false,
				expand: undefined,
			});
		});

		it('should handle priority field transformation', async () => {
			// Arrange
			const args: UpdateIssueToolArgsType = {
				issueIdOrKey: 'TEST-101',
				fields: {
					priority: '1', // ID format
				},
			};

			const mockResponse: UpdateIssueResponse = {
				key: 'TEST-101',
			};

			mockAtlassianIssuesService.updateIssue.mockResolvedValue(mockResponse);

			// Act
			await atlassianIssuesUpdateController.updateIssue(args);

			// Assert
			expect(mockAtlassianIssuesService.updateIssue).toHaveBeenCalledWith('TEST-101', {
				fields: {
					priority: { id: '1' }, // Should be transformed to ID object
				},
				update: undefined,
				notifyUsers: true,
				returnIssue: false,
				expand: undefined,
			});
		});

		it('should handle assignee field transformation', async () => {
			// Arrange
			const args: UpdateIssueToolArgsType = {
				issueIdOrKey: 'TEST-102',
				fields: {
					assignee: 'accountid:123456',
				},
			};

			const mockResponse: UpdateIssueResponse = {
				key: 'TEST-102',
			};

			mockAtlassianIssuesService.updateIssue.mockResolvedValue(mockResponse);

			// Act
			await atlassianIssuesUpdateController.updateIssue(args);

			// Assert
			expect(mockAtlassianIssuesService.updateIssue).toHaveBeenCalledWith('TEST-102', {
				fields: {
					assignee: { accountId: 'accountid:123456' },
				},
				update: undefined,
				notifyUsers: true,
				returnIssue: false,
				expand: undefined,
			});
		});

		it('should handle components field transformation', async () => {
			// Arrange
			const args: UpdateIssueToolArgsType = {
				issueIdOrKey: 'TEST-103',
				fields: {
					components: ['Component A', '10001'],
				},
			};

			const mockResponse: UpdateIssueResponse = {
				key: 'TEST-103',
			};

			mockAtlassianIssuesService.updateIssue.mockResolvedValue(mockResponse);

			// Act
			await atlassianIssuesUpdateController.updateIssue(args);

			// Assert
			expect(mockAtlassianIssuesService.updateIssue).toHaveBeenCalledWith('TEST-103', {
				fields: {
					components: [
						{ name: 'Component A' },
						{ id: '10001' },
					],
				},
				update: undefined,
				notifyUsers: true,
				returnIssue: false,
				expand: undefined,
			});
		});

		it('should handle update operations', async () => {
			// Arrange
			const args: UpdateIssueToolArgsType = {
				issueIdOrKey: 'TEST-104',
				update: {
					labels: [
						{ add: 'new-label' },
						{ remove: 'old-label' },
					],
				},
			};

			const mockResponse: UpdateIssueResponse = {
				key: 'TEST-104',
			};

			mockAtlassianIssuesService.updateIssue.mockResolvedValue(mockResponse);

			// Act
			await atlassianIssuesUpdateController.updateIssue(args);

			// Assert
			expect(mockAtlassianIssuesService.updateIssue).toHaveBeenCalledWith('TEST-104', {
				fields: undefined,
				update: {
					labels: [
						{ add: 'new-label' },
						{ remove: 'old-label' },
					],
				},
				notifyUsers: true,
				returnIssue: false,
				expand: undefined,
			});
		});

		it('should handle returnIssue option', async () => {
			// Arrange
			const args: UpdateIssueToolArgsType = {
				issueIdOrKey: 'TEST-105',
				fields: {
					summary: 'Updated summary',
				},
				returnIssue: true,
				expand: ['changelog'],
			};

			const mockResponse: UpdateIssueResponse = {
				key: 'TEST-105',
				id: '10005',
				fields: {
					summary: 'Updated summary',
				},
			};

			mockAtlassianIssuesService.updateIssue.mockResolvedValue(mockResponse);

			// Act
			await atlassianIssuesUpdateController.updateIssue(args);

			// Assert
			expect(mockAtlassianIssuesService.updateIssue).toHaveBeenCalledWith('TEST-105', {
				fields: {
					summary: 'Updated summary',
				},
				update: undefined,
				notifyUsers: true,
				returnIssue: true,
				expand: ['changelog'],
			});
		});

		it('should handle notification settings', async () => {
			// Arrange
			const args: UpdateIssueToolArgsType = {
				issueIdOrKey: 'TEST-106',
				fields: {
					summary: 'Updated summary',
				},
				notifyUsers: false,
			};

			const mockResponse: UpdateIssueResponse = {
				key: 'TEST-106',
			};

			mockAtlassianIssuesService.updateIssue.mockResolvedValue(mockResponse);

			// Act
			await atlassianIssuesUpdateController.updateIssue(args);

			// Assert
			expect(mockAtlassianIssuesService.updateIssue).toHaveBeenCalledWith('TEST-106', {
				fields: {
					summary: 'Updated summary',
				},
				update: undefined,
				notifyUsers: false,
				returnIssue: false,
				expand: undefined,
			});
		});

		it('should propagate service errors', async () => {
			// Arrange
			const args: UpdateIssueToolArgsType = {
				issueIdOrKey: 'TEST-ERROR',
				fields: {
					summary: 'Updated summary',
				},
			};

			const mockError = new Error('Service error');
			mockAtlassianIssuesService.updateIssue.mockRejectedValue(mockError);

			// Act & Assert
			await expect(atlassianIssuesUpdateController.updateIssue(args)).rejects.toThrow('Service error');
		});
	});
});
