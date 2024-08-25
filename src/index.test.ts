import { setTimeout as delay } from "node:timers/promises";
import { assert, beforeEach, describe, test } from "vitest";
import { waitElement } from "./index";

const TEST_SANDBOX = "test-sandbox";

/**
 * @description
 * Tests for DOM elements must always be tested against the `sandboxElement`. This is because the global DOM (JSDom) is common between tests, causing DOM elements to conflict.
 * Cleaning the custom element each tests in `beforeEach` is a workaround to avoid this problem.
 *
 * refs: https://github.com/vitest-dev/vitest/issues/5919
 */
describe.shuffle("waitElement", () => {
	let sandboxElement = document.createElement(TEST_SANDBOX);

	const prepareCleanSandbox = () => {
		const isExistSandbox = document.querySelector(TEST_SANDBOX);

		if (isExistSandbox) {
			isExistSandbox.remove();
		}

		// create new instance node and attach
		document.body.appendChild(document.createElement(TEST_SANDBOX));

		// reference from dom
		// @ts-expect-error absolutely exists.
		sandboxElement = document.querySelector(TEST_SANDBOX);
	};

	beforeEach(prepareCleanSandbox);

	describe("basis", () => {
		test("sould detect the appearance of an element by id-selector", async ({
			expect,
		}) => {
			const simulateMutation = () =>
				delay(500).then(() => {
					const element = document.createElement("div");
					element.id = "late";
					sandboxElement.append(element);
				});

			const [, result] = await Promise.all([
				simulateMutation(),
				waitElement("#late"),
			]);

			expect(result?.id).toEqual("late");
		});

		test("should detect the appearance of an element by class-selector", async ({
			expect,
		}) => {
			const simulateMutation = () =>
				delay(500).then(() => {
					const element = document.createElement("div");
					element.className = "late-comming";
					sandboxElement.append(element);
				});

			const [, result] = await Promise.all([
				simulateMutation(),
				waitElement(".late-comming"),
			]);

			expect(result?.className).toEqual("late-comming");
		});

		test("should return element if already exist", async ({ expect }) => {
			const element = document.createElement("div");
			element.id = "exist";
			sandboxElement.append(element);

			const checkElement = await waitElement("#exist");

			expect(checkElement?.id).toEqual("exist");
		});

		test("should detect the target element by delayed add class name", async ({
			expect,
		}) => {
			const id = "exist";
			const className = "added";
			const selector = `#${id}.${className}`;

			const element = document.createElement("div");
			element.id = id;
			sandboxElement.append(element);

			const simulateAddClassName = () =>
				delay(500).then(() => {
					element.classList.add(className);
				});

			const wait = async () => {
				await delay(300);
				const notDetectYet = document.querySelector(selector);
				expect(notDetectYet).toEqual(null);

				return waitElement(selector);
			};

			const [, result] = await Promise.all([simulateAddClassName(), wait()]);

			expect(result?.id).toEqual(id);
			expect(result?.className).toEqual(className);
		});

		test("should detect by target (same selector, no confusion)", async ({
			expect,
		}) => {
			const target1 = document.createElement("p");
			sandboxElement.append(target1);
			const target2 = document.createElement("span");
			sandboxElement.append(target2);

			const appendDomTask = () =>
				delay(500).then(() => {
					const element1 = document.createElement("p");
					element1.id = "late1";
					element1.className = "late-comming";
					target1.append(element1);

					const element2 = document.createElement("span");
					element2.id = "late2";
					element2.className = "late-comming";
					target2.append(element2);
				});

			const wait1 = () => waitElement(".late-comming", { target: target1 });

			const wait2 = () => waitElement(".late-comming", { target: target2 });

			const [, result1, result2] = await Promise.all([
				appendDomTask(),
				wait1(),
				wait2(),
			]);

			expect(result1?.id).toEqual("late1");
			expect(result2?.id).toEqual("late2");
		});
	});

	describe("abortable", () => {
		test("should be able to abort with an AboutController signal", async ({
			expect,
		}) => {
			const ac = new AbortController();

			const checkElement = waitElement("#find", { signal: ac.signal });

			await delay(300);

			ac.abort("abort by user side.");

			await expect(checkElement).rejects.toThrow("abort by user side.");

			assert.include(ac.signal, {
				aborted: true,
				reason: "abort by user side.",
			});
		});

		test("should abort timeout if set AbortSignal.timeout", async () => {
			const element = document.createElement("div");

			const simulateMutation = () =>
				delay(500).then(() => {
					element.id = "late";
					sandboxElement.append(element);
				});

			const expectTimeout = () =>
				waitElement("#late", { signal: AbortSignal.timeout(300) });

			const expectGetElement = () =>
				waitElement("#late", { signal: AbortSignal.timeout(800) });

			const [, result1, result2] = await Promise.allSettled([
				simulateMutation(),
				expectTimeout(),
				expectGetElement(),
			]);

			assert.strictEqual(result1.status, "rejected");
			// @ts-expect-error missing type infer
			assert.instanceOf(result1.reason, DOMException);
			// @ts-expect-error missing type infer
			assert.strictEqual(result1.reason.name, "TimeoutError");

			assert.strictEqual(result2.status, "fulfilled");
			// @ts-expect-error missing type infer
			assert.strictEqual(result2.value.id, "late");
		});
	});

	describe("options", () => {
		describe("detector", () => {
			test("should detect the element using the detector passed", async () => {
				const element = document.createElement("div");
				element.id = "animal";
				element.textContent = "Elephant";
				sandboxElement.append(element);

				const simulateChangeTextContent = async () => {
					await delay(500);
					element.textContent = "Penguin";
					await delay(500);
					element.textContent = "Tiger";
				};

				const waitPenguin = () =>
					waitElement("#animal", {
						detector: ({ element }) => element?.textContent === "Penguin",
					}).then((element) => element?.textContent);

				const waitTiger = () =>
					waitElement("#animal", {
						detector: ({ element }) => element?.textContent === "Tiger",
					}).then((element) => element?.textContent);

				const waitMonkey = () =>
					waitElement("#animal", {
						signal: AbortSignal.timeout(1500),
						detector: ({ element }) => element?.textContent === "Monkey",
					}).then((element) => element?.textContent);

				const [, resultPenguin, resultTiger, resultMonkey] =
					await Promise.allSettled([
						simulateChangeTextContent(),
						waitPenguin(),
						waitTiger(),
						waitMonkey(),
					]);

				assert.include(resultPenguin, {
					status: "fulfilled",
					value: "Penguin",
				});
				assert.include(resultTiger, {
					status: "fulfilled",
					value: "Tiger",
				});

				assert.strictEqual(resultMonkey.status, "rejected");
				// @ts-expect-error missing type infer
				assert.instanceOf(resultMonkey.reason, DOMException);
				// @ts-expect-error missing type infer
				assert.strictEqual(resultMonkey.reason.name, "TimeoutError");
			});
		});

		describe("unifyProcess", () => {
			test("should be different process if set `unifyProcess: false`", async () => {
				const wait = () =>
					waitElement(".not-unify", {
						unifyProcess: false,
					});

				const firstWait = wait();

				for (let index = 0; index <= 5; index++) {
					const sameArgsWait = wait();

					assert.notStrictEqual(firstWait, sameArgsWait);
				}
			});

			test("should be same process if set `unifyProcess: true`", async () => {
				const wait = () =>
					waitElement(".unify", {
						unifyProcess: true,
					});

				const firstWait = wait();

				for (let index = 0; index <= 5; index++) {
					const sameArgsWait = wait();

					assert.strictEqual(firstWait, sameArgsWait);
				}
			});
		});
	});
});
