import { assert, describe, test } from "vitest";
import {
	type UserSideOptions,
	getDefaultOptions,
	mergeOptions,
} from "./options";

describe("defaultOptions", () => {
	test("should return always the same options", (t) => {
		const options1 = getDefaultOptions();
		const options2 = getDefaultOptions();
		assert.deepEqual(options1, options2);
	});

	test("always return new object", () => {
		const options1 = getDefaultOptions();
		const options2 = getDefaultOptions();
		assert.notStrictEqual(options1, options2);
	});
});

describe("mergeOptions", () => {
	test("should be merged in favor of userSideOptions", () => {
		const defaultSide = getDefaultOptions();
		const userSide = {
			target: window.document.createElement("a"),
			detector: (element) => {
				return { isDetected: true, result: element };
			},
			observeConfigs: { subtree: false, attributeFilter: ["class"] },
			signal: AbortSignal.timeout(1000),
		} as const satisfies UserSideOptions;

		const merged = mergeOptions(userSide, defaultSide);

		assert.deepEqual(merged, {
			unifyProcess: defaultSide.unifyProcess,
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
		const defaultSide = getDefaultOptions();
		const userSide = undefined;

		const merged = mergeOptions(userSide, defaultSide);

		assert.deepEqual(merged, defaultSide);
	});
});
