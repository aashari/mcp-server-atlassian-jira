import dotenv from 'dotenv';
import path from 'path';
import { Logger } from './logger.util.js';
import fs from 'fs';
import os from 'os';

// Create a contextualized logger for this file
const configLogger = Logger.forContext('utils/config.util.ts');

// Log config utility initialization
configLogger.debug('Config utility initialized');

/**
 * Configuration loader that handles multiple sources with priority:
 * 1. Direct ENV pass (process.env)
 * 2. .env file in project root
 * 3. Global config file at $HOME/.mcp/configs.json
 */
class ConfigLoader {
	private packageName: string;
	private configLoaded: boolean = false;

	/**
	 * Create a new ConfigLoader instance
	 * @param packageName The package name to use for global config lookup
	 */
	constructor(packageName: string) {
		this.packageName = packageName;
	}

	/**
	 * Load configuration from all sources with proper priority
	 */
	load(): void {
		if (this.configLoaded) {
			configLogger.debug(
				'[src/utils/config.util.ts@load] Configuration already loaded, skipping',
			);
			return;
		}

		configLogger.debug(
			'[src/utils/config.util.ts@load] Loading configuration...',
		);

		// Priority 3: Load from global config file
		this.loadFromGlobalConfig();

		// Priority 2: Load from .env file
		this.loadFromEnvFile();

		// Priority 1: Direct ENV pass is already in process.env
		// No need to do anything as it already has highest priority

		this.configLoaded = true;
		configLogger.debug(
			'[src/utils/config.util.ts@load] Configuration loaded successfully',
		);
	}

	/**
	 * Load configuration from .env file in project root
	 */
	private loadFromEnvFile(): void {
		const methodLogger = Logger.forContext(
			'utils/config.util.ts',
			'loadFromEnvFile',
		);

		try {
			const result = dotenv.config();
			if (result.error) {
				methodLogger.debug(
					'[src/utils/config.util.ts@loadFromEnvFile] No .env file found or error reading it',
				);
				return;
			}
			methodLogger.debug(
				'[src/utils/config.util.ts@loadFromEnvFile] Loaded configuration from .env file',
			);
		} catch (error) {
			methodLogger.error(
				'[src/utils/config.util.ts@loadFromEnvFile] Error loading .env file',
				error,
			);
		}
	}

	/**
	 * Load configuration from global config file at $HOME/.mcp/configs.json
	 */
	private loadFromGlobalConfig(): void {
		const methodLogger = Logger.forContext(
			'utils/config.util.ts',
			'loadFromGlobalConfig',
		);

		try {
			const homedir = os.homedir();
			const globalConfigPath = path.join(homedir, '.mcp', 'configs.json');

			if (!fs.existsSync(globalConfigPath)) {
				methodLogger.debug(
					'[src/utils/config.util.ts@loadFromGlobalConfig] Global config file not found',
				);
				return;
			}

			const configContent = fs.readFileSync(globalConfigPath, 'utf8');
			const config = JSON.parse(configContent);

			if (
				!config[this.packageName] ||
				!config[this.packageName].environments
			) {
				methodLogger.debug(
					`[src/utils/config.util.ts@loadFromGlobalConfig] No configuration found for ${this.packageName}`,
				);
				return;
			}

			const environments = config[this.packageName].environments;
			for (const [key, value] of Object.entries(environments)) {
				// Only set if not already defined in process.env
				if (process.env[key] === undefined) {
					process.env[key] = String(value);
				}
			}

			methodLogger.debug(
				'[src/utils/config.util.ts@loadFromGlobalConfig] Loaded configuration from global config file',
			);
		} catch (error) {
			methodLogger.error(
				'[src/utils/config.util.ts@loadFromGlobalConfig] Error loading global config file',
				error,
			);
		}
	}

	/**
	 * Get a configuration value
	 * @param key The configuration key
	 * @param defaultValue The default value if the key is not found
	 * @returns The configuration value or the default value
	 */
	get(key: string, defaultValue?: string): string | undefined {
		return process.env[key] || defaultValue;
	}

	/**
	 * Get a boolean configuration value
	 * @param key The configuration key
	 * @param defaultValue The default value if the key is not found
	 * @returns The boolean configuration value or the default value
	 */
	getBoolean(key: string, defaultValue: boolean = false): boolean {
		const value = this.get(key);
		if (value === undefined) {
			return defaultValue;
		}
		return value.toLowerCase() === 'true';
	}
}

// Create and export a singleton instance with the package name from package.json
export const config = new ConfigLoader('@aashari/mcp-server-atlassian-jira');
