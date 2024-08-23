import { defu } from "defu";
export interface HasQuerySelector {
	querySelector: Document["querySelector"];
}
export interface NodeLike extends HasQuerySelector, Node {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	[otherKey: string]: any;
}

export type Options = {
	target: NodeLike;
	immediateResolve: boolean;
	cache: boolean;
	detector:
		| undefined
		| ((element: ReturnType<HasQuerySelector["querySelector"]>) => boolean);
	observeConfigs: MutationObserverInit;
	signal: undefined | AbortSignal;
};

export type UserSideOptions = Partial<Options>;

export const defaultOptions = (): Options => ({
	target: document,
	// FIXME: Abort.timeout(0)で賄えるか考える
	immediateResolve: false,
	cache: true,
	detector: undefined,
	observeConfigs: {
		childList: true,
		subtree: true,
		attributes: true,
	},
	signal: undefined,
});

export const mergeOptions = (
	defaultOptions: Options,
	userSideOptions: Partial<Options>,
) => {
	return defu(userSideOptions, defaultOptions);
};
