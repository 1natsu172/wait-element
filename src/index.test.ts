import { assert, beforeEach, describe, test, vi } from "vitest";
import { waitElement } from "./index";

const delay = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, ms));

const TEST_SANDBOX = "test-sandbox";

/**
 * @description
 * Tests for DOM elements must always be tested against the `sandboxElement`. In browser mode, the tests in a file run on one shared document, so elements left by one test would be found by the selectors of another.
 * Recreating the sandbox element in `beforeEach` gives each test an empty subtree to work in.
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
		test("should detect the appearance of an element by id-selector", async ({
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

		test("should detect an element appended by a microtask queued before the call", async ({
			expect,
		}) => {
			const element = document.createElement("div");
			element.id = "microtask";
			Promise.resolve().then(() => sandboxElement.append(element));

			const result = await Promise.race([
				waitElement("#microtask"),
				delay(500).then(() => "pending"),
			]);

			expect(result).toBe(element);
		});

		test("should detect an element appended while the initial detector is awaiting", async ({
			expect,
		}) => {
			const element = document.createElement("div");
			element.id = "during-initial-check";

			const waiting = waitElement("#during-initial-check", {
				detector: async (element) => {
					await delay(50);
					return element
						? { isDetected: true, result: element }
						: { isDetected: false };
				},
			});
			delay(10).then(() => sandboxElement.append(element));

			const result = await Promise.race([
				waiting,
				delay(500).then(() => "pending"),
			]);

			expect(result).toBe(element);
		});

		test("should settle once when an observer callback detects before the initial check finishes", async ({
			expect,
		}) => {
			const observeSpy = vi.spyOn(MutationObserver.prototype, "observe");
			const disconnectSpy = vi.spyOn(MutationObserver.prototype, "disconnect");
			const calls: string[] = [];
			const element = document.createElement("div");
			element.id = "race";

			const waiting = waitElement("#race", {
				// The initial check (no element yet) takes longer than the check run by the observer callback.
				detector: async (element) => {
					const label = element ? "found" : "null";
					calls.push(`start:${label}`);
					await delay(element ? 10 : 80);
					calls.push(`end:${label}`);
					return element
						? { isDetected: true, result: element }
						: { isDetected: false };
				},
			});
			await delay(5);
			sandboxElement.append(element);

			const result = await Promise.race([
				waiting,
				delay(500).then(() => "pending"),
			]);

			expect(result).toBe(element);
			expect(calls).not.toContain("end:null");

			// Let the initial check finish after the promise has settled.
			await delay(150);
			expect(calls).toEqual([
				"start:null",
				"start:found",
				"end:found",
				"end:null",
			]);
			expect(observeSpy).toHaveBeenCalledTimes(1);
			expect(disconnectSpy).toHaveBeenCalledTimes(1);
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
			assert.strictEqual(result1.reason.constructor.name, "DOMException");
			// @ts-expect-error missing type infer
			assert.strictEqual(result1.reason.name, "TimeoutError");

			assert.strictEqual(result2.status, "fulfilled");
			// @ts-expect-error missing type infer
			assert.strictEqual(result2.value.id, "late");
		});

		test("should not resume observing when aborted while the initial check is awaiting", async ({
			expect,
		}) => {
			const observerCalls: string[] = [];
			const originalObserve = MutationObserver.prototype.observe;
			const originalDisconnect = MutationObserver.prototype.disconnect;
			vi.spyOn(MutationObserver.prototype, "observe").mockImplementation(
				function (this: MutationObserver, ...args) {
					observerCalls.push("observe");
					return originalObserve.apply(this, args);
				},
			);
			vi.spyOn(MutationObserver.prototype, "disconnect").mockImplementation(
				function (this: MutationObserver) {
					observerCalls.push("disconnect");
					return originalDisconnect.apply(this);
				},
			);
			const detector = vi.fn(async () => {
				await delay(80);
				return { isDetected: false } as const;
			});
			const ac = new AbortController();

			const waiting = waitElement("#aborted-while-initial-check", {
				detector,
				signal: ac.signal,
			});
			await delay(5);
			ac.abort("abort while initial check");

			await expect(waiting).rejects.toBe("abort while initial check");

			// Let the initial check finish after the abort.
			await delay(150);
			expect(observerCalls).toEqual(["observe", "disconnect"]);
		});

		test("should reject if already signal aborted", async () => {
			try {
				await waitElement(".aborted", {
					signal: AbortSignal.abort("already aborted for test"),
				});
			} catch (error) {
				assert.strictEqual(error, "already aborted for test");
			}
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
						detector: (element) =>
							element?.textContent === "Penguin"
								? { isDetected: true, result: element }
								: { isDetected: false },
					}).then((element) => element?.textContent);

				const waitTiger = () =>
					waitElement("#animal", {
						detector: (element) =>
							element?.textContent === "Tiger"
								? { isDetected: true, result: element }
								: { isDetected: false },
					}).then((element) => element?.textContent);

				const waitMonkey = () =>
					waitElement("#animal", {
						signal: AbortSignal.timeout(1500),
						detector: (element) =>
							element?.textContent === "Monkey"
								? { isDetected: true, result: element }
								: { isDetected: false },
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

				assert(resultMonkey.status === "rejected");
				assert.strictEqual(
					resultMonkey.reason.constructor.name,
					"DOMException",
				);
				assert.strictEqual(resultMonkey.reason.name, "TimeoutError");
			});

			test("should be awaitable detector", async () => {
				const element = document.createElement("div");
				element.id = "awaitable";
				element.textContent = "good";
				sandboxElement.append(element);

				const result = await waitElement("#awaitable", {
					detector: async (element) => {
						return {
							isDetected: true,
							result: await delay(100).then(
								() => `${element?.textContent} awaitable!`,
							),
						};
					},
				});

				assert.strictEqual(result, "good awaitable!");
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

		describe("customMatcher", () => {
			test("should query once per mutation batch, not once per record", async ({
				expect,
			}) => {
				const customMatcher = vi.fn((selector: string) =>
					document.querySelector(selector),
				);
				const waiting = waitElement("#batched", { customMatcher });
				await delay(0);
				customMatcher.mockClear();

				const noise = document.createElement("div");
				sandboxElement.append(noise);
				for (let i = 0; i < 50; i++) {
					noise.setAttribute("data-i", String(i));
				}
				await delay(0);
				expect(customMatcher).toHaveBeenCalledTimes(1);

				const element = document.createElement("div");
				element.id = "batched";
				sandboxElement.append(element);

				expect(await waiting).toBe(element);
				expect(customMatcher).toHaveBeenCalledTimes(2);
			});

			test("should detect the appearance of an element via customMatcher", async ({
				expect,
			}) => {
				const element = document.createElement("div");
				element.id = "late";

				const simulateMutation = () =>
					delay(500).then(() => {
						sandboxElement.append(element);
					});

				const customMatcher = vi.fn((selector: string) => {
					return document.evaluate(
						selector,
						document,
						null,
						XPathResult.FIRST_ORDERED_NODE_TYPE,
						null,
					).singleNodeValue as Element | null;
				});

				const [, result] = await Promise.all([
					simulateMutation(),
					waitElement("//test-sandbox//div[@id='late']", {
						customMatcher,
					}),
				]);

				expect(result).toBe(element);
				// The initial check finds nothing; a later check run by the observer finds the element.
				expect(customMatcher.mock.results[0]?.value).toBeNull();
				expect(customMatcher.mock.results.at(-1)?.value).toBe(element);
			});
		});
	});
});
