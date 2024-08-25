import ManyKeysMap from "many-keys-map";

import { type Options, getDefaultOptions, mergeOptions } from "./options";
import type { QuerySelectorResult } from "./types.js";

const unifyCache = new ManyKeysMap<unknown, Promise<unknown>>();

type InitOptions = {
	defaultOptions: Options;
};

export function createWaitElement(initOptions: Partial<InitOptions> = {}) {
	const { defaultOptions = getDefaultOptions() } = initOptions;

	// FIXME: Generics like `<Result extends QuerySelectorResult>`, but incorrectly resolve types
	return (
		selector: string,
		options?: Partial<Options>,
	): Promise<QuerySelectorResult> => {
		const { target, unifyProcess, observeConfigs, detector, signal } =
			mergeOptions(defaultOptions, options);

		const unifyPromiseKey = [
			selector,
			target,
			unifyProcess,
			observeConfigs,
			detector,
			signal,
		];

		const cachedPromise = unifyCache.get(unifyPromiseKey);

		if (unifyProcess && cachedPromise) {
			return cachedPromise as Promise<QuerySelectorResult>;
		}

		const detectPromise = new Promise<QuerySelectorResult>(
			// biome-ignore lint/suspicious/noAsyncPromiseExecutor: avoid nesting promise
			async (resolve, reject) => {
				// reject if already aborted
				if (signal?.aborted) {
					return reject(signal.reason);
				}

				const observer: MutationObserver = new MutationObserver(
					async (mutations) => {
						for (const _ of mutations) {
							if (signal?.aborted) {
								observer.disconnect();
								break;
							}

							const { element, isDetected } = await detectElement({
								selector,
								target: target,
								detector: detector,
							});

							if (isDetected) {
								observer.disconnect();
								resolve(element);
								break;
							}
						}
					},
				);

				// Abortable API by signal option
				signal?.addEventListener(
					"abort",
					() => {
						observer.disconnect();
						return reject(signal.reason);
					},
					{ once: true },
				);

				// Checking already element existed.
				const { element, isDetected } = await detectElement({
					selector,
					target: target,
					detector: detector,
				});

				if (isDetected) {
					return resolve(element);
				}

				// Start observe.
				observer.observe(target, observeConfigs);
			},
		).finally(() => {
			unifyCache.delete(unifyPromiseKey);
		});

		unifyCache.set(unifyPromiseKey, detectPromise);

		return detectPromise;
	};
}

async function detectElement({
	target,
	selector,
	detector,
}: {
	target: Options["target"];
	selector: string;
	detector: Options["detector"];
}): Promise<{ element: QuerySelectorResult; isDetected: boolean }> {
	const element = target.querySelector(selector);

	return { element, isDetected: await detector({ element }) };
}

export const waitElement = createWaitElement();
