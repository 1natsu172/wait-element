// import { type SuiteHooks, beforeEach } from "vitest";

// FIXME: https://github.com/vitest-dev/vitest/issues/2741 この問題がなおったらgsetupでglobalにsandboxElementを用意するようにする
// 実装方法はこれ
// https://vitest.dev/guide/test-context.html#beforeeach-and-aftereach
// https://vitest.dev/config/#setupfiles

/**
 * @description
 * Tests for DOM elements must always be tested against the `sandboxElement`. In browser mode, the tests in a file run on one shared document, so elements left by one test would be found by the selectors of another.
 * Recreating the sandbox element in `beforeEach` gives each test an empty subtree to work in.
 */
// const prepareCleanSandbox: SuiteHooks["beforeEach"][number] = (context) => {
// 	const TEST_SANDBOX = "test-sandbox";

// 	const isExistSandbox = document.querySelector(TEST_SANDBOX);

// 	if (isExistSandbox) {
// 		isExistSandbox.remove();
// 	}

// 	// create new instance node and attach
// 	document.body.appendChild(document.createElement(TEST_SANDBOX));

// 	// reference from dom
// 	// @ts-expect-error https://github.com/vitest-dev/vitest/issues/2741
// 	context.sandboxElement = document.querySelector(TEST_SANDBOX);
// };

// // prepare before each suite
// beforeEach(prepareCleanSandbox);
