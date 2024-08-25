import { defu } from "defu";
import { type Detector, isExist } from "./detectors.js";
import type { NodeLike } from "./types.js";

export interface Options {
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
	detector: Detector;

	/**
	 * @type AbortSignal
	 * @default undefined
	 * @description
	 * https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
	 */
	signal: undefined | AbortSignal;
}

export type UserSideOptions = Partial<Options>;

export const getDefaultOptions = (): Options => ({
	target: document,
	unifyProcess: true,
	detector: isExist,
	observeConfigs: {
		childList: true,
		subtree: true,
		attributes: true,
	},
	signal: undefined,
});

export const mergeOptions = (
	defaultOptions: Options,
	userSideOptions: Partial<Options> | undefined,
) => {
	return defu(userSideOptions, defaultOptions);
};
