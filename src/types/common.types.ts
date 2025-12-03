/**
 * Common type definitions shared across controllers.
 * These types provide a standard interface for controller interactions.
 * Centralized here to ensure consistency across the codebase.
 */

/**
 * Common pagination information for API responses.
 * This is used for providing consistent pagination details to clients.
 * Note: This is now only used internally by controllers and formatPagination.
 */
export interface ResponsePagination {
	/**
	 * Cursor for the next page of results, if available.
	 * This should be passed to subsequent requests to retrieve the next page.
	 */
	nextCursor?: string;

	/**
	 * Whether more results are available beyond the current page.
	 * When true, clients should use the nextCursor to retrieve more results.
	 */
	hasMore: boolean;

	/**
	 * The number of items in the current result set.
	 * This helps clients track how many items they've received.
	 */
	count?: number;

	/**
	 * The total number of items available.
	 * This helps clients track the total number of items in the dataset.
	 */
	total?: number;
}

/**
 * Common response structure for controller operations.
 * All controller methods should return this structure.
 *
 * All output, including pagination information and metadata, is now consolidated
 * into the content field as a single Markdown-formatted string.
 */
export interface ControllerResponse {
	/**
	 * Formatted content to be displayed to the user.
	 * This is a Markdown-formatted string that includes all information
	 * (main content, pagination details, and any metadata) that needs
	 * to be presented to the user.
	 */
	content: string;

	/**
	 * Optional path to the raw API response file.
	 * When the response is truncated, this path allows AI to access the full data.
	 */
	rawResponsePath?: string | null;
}
