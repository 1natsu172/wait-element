import { setTimeout as delay } from "node:timers/promises";
import { describe, test } from "vitest";
import { waitDisappearElement, waitElement } from "./index";

describe("waitElement", () => {
	describe("basis", () => {
		test.todo(
			"sould detect the appearance of an element by id-selector",
			async (t) => {
				const appendDomTask = delay(500).then(() => {
					const element = document.createElement("div");
					element.id = "late";
					document.body.append(element);
				});

				const wait = waitElement("#late");
				const [, checkElement] = await Promise.all([appendDomTask, wait]);
				t.is(checkElement.id, "late");
			},
		);

		test.todo(
			"should detect the appearance of an element by class-selector",
			async (t) => {
				const appendDomTask = delay(500).then(() => {
					const element = document.createElement("div");
					element.className = "late-comming";
					document.body.append(element);
				});

				const wait = waitElement(".late-comming");
				const [, checkElement] = await Promise.all([appendDomTask, wait]);
				t.is(checkElement.className, "late-comming");
			},
		);

		test.todo("should return element from cache if available", async (t) => {
			const element = document.createElement("div");
			element.id = "exist";
			document.body.append(element);

			const checkElement = await waitElement("#exist");
			t.is(checkElement.id, "exist");
		});

		test.todo(
			"should detect the target element by delayed add class name",
			async (t) => {
				const element = document.createElement("div");
				element.id = "exist";
				document.body.append(element);

				const addClassTask = delay(500).then(() => {
					element.classList.add("added");
				});

				const wait = delay(300)
					.then(() => {
						const notDetectYet = document.querySelector("#exist.added");
						t.is(notDetectYet, null);
					})
					.then(() => {
						return waitElement("#exist.added");
					});

				const [, checkElement] = await Promise.all([addClassTask, wait]);
				t.is(checkElement.className, "added");
			},
		);

		test.todo(
			"should detect by target (same selector, no confusion)",
			async (t) => {
				const target1 = document.createElement("p");
				document.body.append(target1);
				const target2 = document.createElement("span");
				document.body.append(target2);

				const appendDomTask = delay(500).then(() => {
					const element1 = document.createElement("p");
					element1.id = "late1";
					element1.className = "late-comming";
					target1.append(element1);

					const element2 = document.createElement("span");
					element2.id = "late2";
					element2.className = "late-comming";
					target2.append(element2);
				});

				const wait1 = waitElement(".late-comming", { target: target1 });

				const wait2 = waitElement(".late-comming", { target: target2 });

				const [, checkElement1, checkElement2] = await Promise.all([
					appendDomTask,
					wait1,
					wait2,
				]);
				t.is(checkElement1.id, "late1");
				t.is(checkElement2.id, "late2");
			},
		);

		test.todo(
			"should be different instances of each called processing",
			async () => {},
		);
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
			test.todo(
				"should detect the element using the detector passed",
				async () => {},
			);
		});
	});
});
