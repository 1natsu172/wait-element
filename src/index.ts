import ManyKeysMap from "many-keys-map";

import type { DetectorResultType } from "./detectors.js";
import {
	type InstanceOptions,
	type Options,
	type UserSideOptions,
	getDefaultOptions,
	mergeOptions,
} from "./options";
import type { QuerySelectorReturn } from "./types.js";

const unifyCache = new ManyKeysMap<unknown, Promise<unknown>>();

export function createWaitElement<
	Instance_Result = unknown,
	Instance_QuerySelectorResult extends
		QuerySelectorReturn = QuerySelectorReturn,
>(
	instanceOptions: InstanceOptions<
		Instance_Result,
		Instance_QuerySelectorResult
	>,
) {
	const { defaultOptions } = instanceOptions;

	return <
		Result = Instance_Result,
		QuerySelectorResult extends QuerySelectorReturn = QuerySelectorReturn,
	>(
		selector: string,
		options?: UserSideOptions<Result, QuerySelectorResult>,
	): Promise<Result> => {
		// NOTE: defuはマージで優先した型へ絞り込んで返さずユニオン型で返すためキャストしている。`options?: UserSideOptions<Result,…>` のジェネリクスで実際には型は動的に解決されるため問題ない。
		const {
			target,
			unifyProcess,
			observeConfigs,
			detector,
			signal,
			customMatcher,
		} = mergeOptions(options, defaultOptions) as unknown as Options<
			Result,
			QuerySelectorResult
		>;

		const unifyPromiseKey = [
			selector,
			target,
			unifyProcess,
			observeConfigs,
			detector,
			signal,
			customMatcher,
		];

		const cachedPromise = unifyCache.get(unifyPromiseKey);

		if (unifyProcess && cachedPromise) {
			return cachedPromise as Promise<Result>;
		}

		const detectPromise = new Promise<Result>(
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

							const detectResult = await detectElement({
								selector,
								target: target,
								detector: detector,
								customMatcher,
							});

							if (detectResult.isDetected) {
								observer.disconnect();
								resolve(detectResult.result);
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
				const detectResult = await detectElement({
					selector,
					target: target,
					detector: detector,
					customMatcher,
				});

				if (detectResult.isDetected) {
					return resolve(detectResult.result);
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

async function detectElement<
	Result = unknown,
	QuerySelectorResult extends QuerySelectorReturn = QuerySelectorReturn,
>({
	target,
	selector,
	detector,
	customMatcher,
}: {
	target: Options<Result, QuerySelectorResult>["target"];
	selector: string;
	detector: Options<Result, QuerySelectorResult>["detector"];
	customMatcher: Options<Result, QuerySelectorResult>["customMatcher"];
}): Promise<DetectorResultType<Result>> {
	const element = customMatcher
		? customMatcher(selector)
		: (target.querySelector(selector) as QuerySelectorResult);

	return await detector(element);
}

export const waitElement = createWaitElement({
	defaultOptions: getDefaultOptions(),
});

export { getDefaultOptions };
