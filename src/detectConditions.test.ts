import test, { beforeEach } from "ava";
import { JSDOM } from "jsdom";
import { isAppeared, isDisappeared } from "./detectConditions";

beforeEach(() => {
	global.document = new JSDOM().window.document;
});

test("isAppeared: true", (t) => {
	const result = isAppeared(document.createElement("a"));
	t.true(result);
});

test("isAppeared: false", (t) => {
	const result = isAppeared(null);
	t.false(result);
});

test("isDisappeared: true", (t) => {
	const result = isDisappeared(null);
	t.true(result);
});

test("isDisappeared: false", (t) => {
	const result = isDisappeared(document.createElement("a"));
	t.false(result);
});
