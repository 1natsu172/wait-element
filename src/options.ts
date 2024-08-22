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
	timeout: number;
	immediateResolve: boolean;
	cache: boolean;
	detector:
		| undefined
		| ((element: ReturnType<HasQuerySelector["querySelector"]>) => boolean);
	observeConfigs: MutationObserverInit;
};

export type UserSideOptions = Partial<Options>;

export const defaultOptions = (): Options => ({
	target: document,
	timeout: 0,
	immediateResolve: false,
	cache: true,
	detector: undefined,
	observeConfigs: {
		childList: true,
		subtree: true,
		attributes: true,
	},
});

export const mergeOptions = (
	defaultOptions: Options,
	userSideOptions: Partial<Options>,
) => {
	return defu(userSideOptions, defaultOptions);
};
