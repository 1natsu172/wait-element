import { describe, expectTypeOf, test } from "vitest";
import { createWaitElement, getDefaultOptions, waitElement } from "./index.js";

describe(waitElement.name, () => {
	describe("basis", () => {
		test("should return type of Element if default", async () => {
			const actual = waitElement("a");

			expectTypeOf(actual).toEqualTypeOf<Promise<Element>>();
			expectTypeOf(actual).resolves.toEqualTypeOf<Element>();
		});
	});

	describe("with options", () => {
		describe("detector", () => {
			test("should return type of based detector option result: null", async () => {
				const nullResult = waitElement("a", {
					detector: () => ({ isDetected: true, result: null }),
				});

				expectTypeOf(nullResult).resolves.toEqualTypeOf<null>();
			});

			test("should return type of based detector option result: number", async () => {
				const numberResult = waitElement("a", {
					detector: () => ({ isDetected: true, result: 101 }),
				});
				expectTypeOf(numberResult).resolves.toEqualTypeOf<number>();
			});

			test("should return type of based detector option result: casting", async () => {
				const castResult = waitElement("a", {
					detector: () => ({
						isDetected: true,
						result: null as unknown as HTMLCanvasElement,
					}),
				});

				expectTypeOf(castResult).resolves.toEqualTypeOf<HTMLCanvasElement>();
			});
		});
	});
});

describe("custom instance", () => {
	const customized = createWaitElement({
		defaultOptions: {
			...getDefaultOptions(),
			detector: (element) => ({
				isDetected: true,
				result: element?.textContent?.length,
			}),
		},
	});

	describe("basis", () => {
		test("should return Result type of cutomized", () => {
			const actual = customized("a");

			expectTypeOf(actual).toEqualTypeOf<Promise<number | undefined>>();
			expectTypeOf(actual).resolves.toEqualTypeOf<number | undefined>();
		});
	});

	describe("with options", () => {
		test("should return type of based detector option result: string", async () => {
			const nullResult = waitElement("a", {
				detector: () => ({
					isDetected: true,
					result: "this instance resolved string!",
				}),
			});

			expectTypeOf(nullResult).resolves.toEqualTypeOf<string>();
		});
	});
});
