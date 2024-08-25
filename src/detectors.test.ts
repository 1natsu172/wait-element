import { describe, test } from "vitest";
import { waitElement } from ".";
import { isExist, isNotExist } from "./detectors";

describe("detectors", () => {
	describe(isExist.name, () => {
		test("should detect by", async ({ expect }) => {
			document.body.append(document.createElement("a"));

			const result = await waitElement("a", { detector: isExist });

			expect(result).toBeInstanceOf(Element);
		});
	});

	describe(isNotExist.name, () => {
		test("should detect by", async ({ expect }) => {
			const result = await waitElement(".hero", { detector: isNotExist });

			expect(result).toBe(null);
		});
	});
});
