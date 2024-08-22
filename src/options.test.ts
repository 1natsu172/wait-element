import { assert, describe, test } from "vitest";
import { type UserSideOptions, defaultOptions, mergeOptions } from "./options";

describe("defaultOptions", () => {
	test("should return always the same options", (t) => {
		const options1 = defaultOptions();
		const options2 = defaultOptions();
		assert.deepEqual(options1, options2);
	});

	test("always return new object", () => {
		const options1 = defaultOptions();
		const options2 = defaultOptions();
		assert.notStrictEqual(options1, options2);
	});
});

describe("mergeOptions", () => {
	test("should be merged in favor of userSideOptions", (t) => {
		const defaultSide = defaultOptions();
		const userSide = {
			target: window.document.createElement("a"),
			timeout: 5000,
			detector: (_element) => {
				return true;
			},
			observeConfigs: { subtree: false, attributeFilter: ["class"] },
		} as const satisfies UserSideOptions;

		const merged = mergeOptions(defaultSide, userSide);

		assert.deepEqual(merged, {
			cache: defaultSide.cache,
			immediateResolve: defaultSide.immediateResolve,
			target: userSide.target,
			timeout: userSide.timeout,
			detector: userSide.detector,
			observeConfigs: {
				childList: defaultSide.observeConfigs.childList,
				attributes: defaultSide.observeConfigs.attributes,
				subtree: userSide.observeConfigs.subtree,
				attributeFilter: userSide.observeConfigs.attributeFilter,
			},
		});
	});
});
