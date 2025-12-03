/**
 * Standardized formatting utilities for consistent output across all CLI and Tool interfaces.
 * These functions should be used by all formatters to ensure consistent formatting.
 */

/**
 * Format a date in a standardized way: YYYY-MM-DD HH:MM:SS UTC
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatDate(dateString?: string | Date): string {
	if (!dateString) {
		return 'Not available';
	}

	try {
		const date =
			typeof dateString === 'string' ? new Date(dateString) : dateString;

		// Format: YYYY-MM-DD HH:MM:SS UTC
		return date
			.toISOString()
			.replace('T', ' ')
			.replace(/\.\d+Z$/, ' UTC');
	} catch {
		return 'Invalid date';
	}
}

/**
 * Format a URL as a markdown link
 * @param url - URL to format
 * @param title - Link title
 * @returns Formatted markdown link
 */
export function formatUrl(url?: string, title?: string): string {
	if (!url) {
		return 'Not available';
	}

	const linkTitle = title || url;
	return `[${linkTitle}](${url})`;
}

/**
 * Format a heading with consistent style
 * @param text - Heading text
 * @param level - Heading level (1-6)
 * @returns Formatted heading
 */
export function formatHeading(text: string, level: number = 1): string {
	const validLevel = Math.min(Math.max(level, 1), 6);
	const prefix = '#'.repeat(validLevel);
	return `${prefix} ${text}`;
}

/**
 * Format a list of key-value pairs as a bullet list
 * @param items - Object with key-value pairs
 * @param keyFormatter - Optional function to format keys
 * @returns Formatted bullet list
 */
export function formatBulletList(
	items: Record<string, unknown>,
	keyFormatter?: (key: string) => string,
): string {
	const lines: string[] = [];

	for (const [key, value] of Object.entries(items)) {
		if (value === undefined || value === null) {
			continue;
		}

		const formattedKey = keyFormatter ? keyFormatter(key) : key;
		const formattedValue = formatValue(value);
		lines.push(`- **${formattedKey}**: ${formattedValue}`);
	}

	return lines.join('\n');
}

/**
 * Format a value based on its type
 * @param value - Value to format
 * @returns Formatted value
 */
function formatValue(value: unknown): string {
	if (value === undefined || value === null) {
		return 'Not available';
	}

	if (value instanceof Date) {
		return formatDate(value);
	}

	// Handle URL objects with url and title properties
	if (typeof value === 'object' && value !== null && 'url' in value) {
		const urlObj = value as { url: string; title?: string };
		if (typeof urlObj.url === 'string') {
			return formatUrl(urlObj.url, urlObj.title);
		}
	}

	if (typeof value === 'string') {
		// Check if it's a URL
		if (value.startsWith('http://') || value.startsWith('https://')) {
			return formatUrl(value);
		}

		// Check if it might be a date
		if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
			return formatDate(value);
		}

		return value;
	}

	if (typeof value === 'boolean') {
		return value ? 'Yes' : 'No';
	}

	return String(value);
}

/**
 * Format a separator line
 * @returns Separator line
 */
export function formatSeparator(): string {
	return '---';
}

/**
 * Maximum character limit for AI responses (~10k tokens)
 * 1 token ≈ 4 characters, so 10k tokens ≈ 40,000 characters
 */
const MAX_RESPONSE_CHARS = 40000;

/**
 * Truncate content for AI consumption and add guidance if truncated
 *
 * When responses exceed the token limit, this function truncates the content
 * and appends guidance for the AI to either access the full response from
 * the raw log file or refine the request with better filtering.
 *
 * @param content - The formatted response content
 * @param rawResponsePath - Optional path to the raw response file in /tmp/mcp/
 * @returns Truncated content with guidance if needed, or original content if within limits
 */
export function truncateForAI(
	content: string,
	rawResponsePath?: string | null,
): string {
	if (content.length <= MAX_RESPONSE_CHARS) {
		return content;
	}

	// Truncate at a reasonable boundary (try to find a newline near the limit)
	let truncateAt = MAX_RESPONSE_CHARS;
	const searchStart = Math.max(0, MAX_RESPONSE_CHARS - 500);
	const lastNewline = content.lastIndexOf('\n', MAX_RESPONSE_CHARS);
	if (lastNewline > searchStart) {
		truncateAt = lastNewline;
	}

	const truncatedContent = content.substring(0, truncateAt);
	const originalSize = content.length;
	const truncatedSize = truncatedContent.length;
	const percentShown = Math.round((truncatedSize / originalSize) * 100);

	// Build guidance section
	const guidance: string[] = [
		'',
		formatSeparator(),
		formatHeading('Response Truncated', 2),
		'',
		`This response was truncated to ~${Math.round(truncatedSize / 4000)}k tokens (${percentShown}% of original ${Math.round(originalSize / 1000)}k chars).`,
		'',
		'**To access the complete data:**',
	];

	if (rawResponsePath) {
		guidance.push(
			`- The full raw API response is saved at: \`${rawResponsePath}\``,
		);
	}

	guidance.push(
		'- Consider refining your request with more specific filters or selecting fewer fields',
		'- For paginated data, use smaller page sizes or specific identifiers',
		'- When searching, use more targeted queries to reduce result sets',
	);

	return truncatedContent + guidance.join('\n');
}
