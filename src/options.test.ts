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
	test("should be merged in favor of userSideOptions", () => {
		const defaultSide = defaultOptions();
		const userSide = {
			target: window.document.createElement("a"),
			detector: (_element) => {
				return true;
			},
			observeConfigs: { subtree: false, attributeFilter: ["class"] },
			signal: AbortSignal.timeout(1000),
		} as const satisfies UserSideOptions;

		const merged = mergeOptions(defaultSide, userSide);

		assert.deepEqual(merged, {
			unifyProcess: defaultSide.unifyProcess,
			immediateResolve: defaultSide.immediateResolve,
			target: userSide.target,
			detector: userSide.detector,
			observeConfigs: {
				childList: defaultSide.observeConfigs.childList,
				attributes: defaultSide.observeConfigs.attributes,
				subtree: userSide.observeConfigs.subtree,
				attributeFilter: userSide.observeConfigs.attributeFilter,
			},
			signal: userSide.signal,
		});
	});

	test("should return defaultOptions if no passed userSideOptions", () => {
		const defaultSide = defaultOptions();
		const userSide = undefined;

		const merged = mergeOptions(defaultSide, userSide);

		assert.deepEqual(merged, defaultSide);
	});
});
