import { describe, expectTypeOf, test } from "vitest";
import {
	type Detector,
	type DetectorResultType,
	isExist,
	isNotExist,
} from "./detectors.js";

describe("Detector", () => {
	test("should arguments to be expected", () => {
		expectTypeOf<Detector>().parameters.toEqualTypeOf<[Element | null]>();

		expectTypeOf<Detector>().toBeCallableWith(document.createElement("a"));

		expectTypeOf<Detector>().toBeCallableWith(null);
	});
});

describe("Provided detector utils", () => {
	describe("isExist", () => {
		test("should return Result typeof Element", () => {
			expectTypeOf(isExist(document.createElement("a"))).toMatchTypeOf<
				DetectorResultType<Element> | Promise<DetectorResultType<Element>>
			>();
		});
	});

	describe("isNotExist", () => {
		test("should return Result typeof Element", () => {
			expectTypeOf(isNotExist(document.createElement("a"))).toMatchTypeOf<
				DetectorResultType<null> | Promise<DetectorResultType<null>>
			>();
		});
	});
});
