import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		mockReset: true,
		restoreMocks: true,
		testTimeout: 50e3, // 50sec
		env: {
			RUN_ON_TESTING: "true",
		},
		browser: {
			enabled: true,
			provider: playwright(),
			headless: true,
			instances: [
				{ browser: "chromium" },
				{ browser: "firefox" },
				{ browser: "webkit" },
			],
		},
		coverage: {
			provider: "v8",
		},
		typecheck: {
			enabled: true,
		},
	},
});
