import { defu } from "defu";
import { type Detector, isExist } from "./detectors.js";
import type { NodeLike } from "./types.js";

export type Options = {
	target: NodeLike;
	unifyProcess: boolean;
	observeConfigs: MutationObserverInit;
	detector: Detector;
	signal: undefined | AbortSignal;
};

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
