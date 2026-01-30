import { describe, it, expect } from '@jest/globals';
import { AttachToolArgs, GetAttachmentToolArgs } from './atlassian.api.types.js';

describe('Attachment Tool Schemas', () => {
	describe('AttachToolArgs', () => {
		it('should accept valid filePath input', () => {
			const input = {
				issueIdOrKey: 'PROJ-123',
				filePath: '/path/to/file.png',
			};

			const result = AttachToolArgs.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.issueIdOrKey).toBe('PROJ-123');
				expect(result.data.filePath).toBe('/path/to/file.png');
			}
		});

		it('should accept valid textContent with fileName input', () => {
			const input = {
				issueIdOrKey: 'PROJ-123',
				textContent: 'This is the file content',
				fileName: 'notes.txt',
			};

			const result = AttachToolArgs.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.issueIdOrKey).toBe('PROJ-123');
				expect(result.data.textContent).toBe('This is the file content');
				expect(result.data.fileName).toBe('notes.txt');
			}
		});

		it('should reject when both filePath and textContent are provided', () => {
			const input = {
				issueIdOrKey: 'PROJ-123',
				filePath: '/path/to/file.png',
				textContent: 'Some content',
				fileName: 'notes.txt',
			};

			const result = AttachToolArgs.safeParse(input);
			expect(result.success).toBe(false);
		});

		it('should reject when neither filePath nor textContent is provided', () => {
			const input = {
				issueIdOrKey: 'PROJ-123',
			};

			const result = AttachToolArgs.safeParse(input);
			expect(result.success).toBe(false);
		});

		it('should reject textContent without fileName', () => {
			const input = {
				issueIdOrKey: 'PROJ-123',
				textContent: 'This is the file content',
			};

			const result = AttachToolArgs.safeParse(input);
			expect(result.success).toBe(false);
		});

		it('should reject empty issueIdOrKey', () => {
			const input = {
				issueIdOrKey: '',
				filePath: '/path/to/file.png',
			};

			const result = AttachToolArgs.safeParse(input);
			expect(result.success).toBe(false);
		});

		it('should reject missing issueIdOrKey', () => {
			const input = {
				filePath: '/path/to/file.png',
			};

			const result = AttachToolArgs.safeParse(input);
			expect(result.success).toBe(false);
		});
	});

	describe('GetAttachmentToolArgs', () => {
		it('should accept valid attachmentId only', () => {
			const input = {
				attachmentId: '12345',
			};

			const result = GetAttachmentToolArgs.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.attachmentId).toBe('12345');
				expect(result.data.outputPath).toBeUndefined();
			}
		});

		it('should accept attachmentId with outputPath', () => {
			const input = {
				attachmentId: '12345',
				outputPath: '/tmp/downloaded.pdf',
			};

			const result = GetAttachmentToolArgs.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.attachmentId).toBe('12345');
				expect(result.data.outputPath).toBe('/tmp/downloaded.pdf');
			}
		});

		it('should reject empty attachmentId', () => {
			const input = {
				attachmentId: '',
			};

			const result = GetAttachmentToolArgs.safeParse(input);
			expect(result.success).toBe(false);
		});

		it('should reject missing attachmentId', () => {
			const input = {
				outputPath: '/tmp/downloaded.pdf',
			};

			const result = GetAttachmentToolArgs.safeParse(input);
			expect(result.success).toBe(false);
		});
	});
});
