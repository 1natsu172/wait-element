import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		mockReset: true,
		restoreMocks: true,
		testTimeout: 50e3, // 50sec
		env: {
			RUN_ON_TESTING: "true",
		},
		environment: "jsdom",
		coverage: {
			provider: "v8",
		},
	},
});
