import { setTimeout as delay } from "node:timers/promises";
import { assert, beforeEach, describe, test } from "vitest";
import { waitElement } from "./index";

describe("waitElement", () => {
	describe("basis", () => {
		test("sould detect the appearance of an element by id-selector", async ({
			expect,
		}) => {
			const simulateMutation = () =>
				delay(500).then(() => {
					const element = document.createElement("div");
					element.id = "late";
					document.body.append(element);
				});

			const [, result] = await Promise.all([
				simulateMutation(),
				waitElement("#late"),
			]);

			expect(result.id).toEqual("late");
		});

		test("should detect the appearance of an element by class-selector", async ({
			expect,
		}) => {
			const simulateMutation = () =>
				delay(500).then(() => {
					const element = document.createElement("div");
					element.className = "late-comming";
					document.body.append(element);
				});

			const [, result] = await Promise.all([
				simulateMutation(),
				waitElement(".late-comming"),
			]);

			expect(result.className).toEqual("late-comming");
		});

		test("should return element if already exist", async ({ expect }) => {
			const element = document.createElement("div");
			element.id = "exist";
			document.body.append(element);

			const checkElement = await waitElement("#exist");

			expect(checkElement.id).toEqual("exist");
		});

		test("should detect the target element by delayed add class name", async ({
			expect,
		}) => {
			const id = "exist";
			const className = "added";
			const selector = `#${id}.${className}`;

			const element = document.createElement("div");
			element.id = id;
			document.body.append(element);

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

			expect(result.id).toEqual(id);
			expect(result.className).toEqual(className);
		});

		test("should detect by target (same selector, no confusion)", async ({
			expect,
		}) => {
			const target1 = document.createElement("p");
			document.body.append(target1);
			const target2 = document.createElement("span");
			document.body.append(target2);

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

			expect(result1.id).toEqual("late1");
			expect(result2.id).toEqual("late2");
		});
	});

	describe("abortable", () => {
		test.todo(
			"should be able to be aborted with an AboutController signal",
			async (t) => {
				const checkElement = waitElement("#find");

				await delay(300);
				checkElement.cancel();

				await delay(300).then(() => {
					const element = document.createElement("div");
					element.id = "late";
					document.body.append(element);
				});

				await t.throwsAsync(checkElement);
				t.true(checkElement.isCanceled);
			},
		);

		test.todo("should abort timeout if set AbortSignal.timeout", async (t) => {
			const appendDomTask = delay(500).then(() => {
				const element = document.createElement("div");
				element.id = "late";
				document.body.append(element);
			});

			const wait = waitElement("#late", { timeout: 800 });

			const [, checkElement] = await Promise.all([appendDomTask, wait]);
			t.is(checkElement.id, "late");
		});
	});

	describe("options", () => {
		describe("detector", () => {
			test("should detect the element using the detector passed", async ({
				expect,
			}) => {
				const element = document.createElement("div");
				element.id = "animal";
				element.textContent = "Elephant";
				document.body.append(element);

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

				assert.equal(resultPenguin, { status: "fulfilled", value: "Penguin" });
				assert.equal(resultTiger, { status: "fulfilled", value: "Tiger" });
				assert.equal(resultMonkey, { status: "rejected", reason: "timeout" });
			});
		});

		describe("unifyProcess", () => {
			test.todo(
				"should be different process without unifyProcess",
				async () => {},
			);

			test.todo("should be same process with unifyProcess", async () => {});
		});
	});
});
