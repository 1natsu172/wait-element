import { defu } from "defu";
import { type Detector, isExist } from "./detectors.js";
import type { DefaultResult, NodeLike, QuerySelectorReturn } from "./types.js";

export interface Options<
	Result = unknown,
	QuerySelectorResult extends QuerySelectorReturn = QuerySelectorReturn,
> {
	/**
	 * @type HTMLElement
	 * @default document
	 * @description Specify a parent node (specify MutationObserve target).
	 * 	When you know the parent node of the element you want to detect.
	 *
	 * * Please also refer to the [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
	 */
	target: NodeLike;

	/**
	 * @type boolean
	 * @default true
	 * @description Unifies the process of finding an element. If set `true`, increases efficiency. Unify the same arguments(includes options) with each other.
	 */
	unifyProcess: boolean;

	/**
	 * @type MutationObserverInit
	 * @default
	 * {
		childList: true,
		subtree: true,
		attributes: true,
		}
	 * @description
	 * [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
	 */
	observeConfigs: MutationObserverInit;

	/**
	 * @type function
	 * @default isExist
	 * @description Can define functions for resolve conditions.
	 */
	detector: Detector<Result, QuerySelectorResult>;

	/**
	 * @type AbortSignal
	 * @default undefined
	 * @description
	 * https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
	 */
	signal: undefined | AbortSignal;

	/**
	 * @type function
	 * @param selector string
	 * @description Use a matcher other than querySelector
	 */
	customMatcher: ((selector: string) => QuerySelectorResult) | undefined;
}

export type UserSideOptions<
	Result = unknown,
	QuerySelectorResult extends QuerySelectorReturn = QuerySelectorReturn,
> = Partial<Options<Result, QuerySelectorResult>>;

export type InstanceOptions<
	Result = unknown,
	QuerySelectorResult extends QuerySelectorReturn = QuerySelectorReturn,
> = {
	defaultOptions: Options<Result, QuerySelectorResult>;
};

export type DefaultOptions<QuerySelectorResult extends QuerySelectorReturn> =
	Options<DefaultResult, QuerySelectorResult>;

export const getDefaultOptions = <
	QuerySelectorResult extends QuerySelectorReturn = QuerySelectorReturn,
>(): DefaultOptions<QuerySelectorResult> => ({
	target: document,
	unifyProcess: true,
	detector: isExist,
	observeConfigs: {
		childList: true,
		subtree: true,
		attributes: true,
	},
	signal: undefined,
	customMatcher: undefined,
});

export const mergeOptions = <
	Instance_Result,
	Result,
	Instance_QuerySelectorResult extends QuerySelectorReturn,
	QuerySelectorResult extends QuerySelectorReturn,
>(
	userSideOptions: Partial<Options<Result, QuerySelectorResult>> | undefined,
	defaultOptions:
		| Options<Result, QuerySelectorResult>
		| Options<Instance_Result, Instance_QuerySelectorResult>,
) => {
	return defu(userSideOptions, defaultOptions);
};
