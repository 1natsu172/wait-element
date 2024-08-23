import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		mockReset: true,
		restoreMocks: true,
		env: {
			RUN_ON_TESTING: "true",
		},
		environment: "jsdom",
	},
});
