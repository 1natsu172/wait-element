import { describe, test } from "vitest";
import { isExist, isNotExist } from "./detectors";

describe("detectors", () => {
	describe(isExist.name, () => {
		test("should detect by", () => {
			const result = isExist({
				element: document.createElement("a"),
				cache: new WeakMap(),
			});
			t.true(result);
		});
	});

	describe(isNotExist.name, () => {
		test("should detect by", () => {
			const result = isNotExist({
				element: document.createElement("a"),
				cache: new WeakMap(),
			});
			t.true(result);
		});
	});
});
