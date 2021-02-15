export interface HasQuerySelector {
	querySelector: Document['querySelector']
}
export interface NodeLike extends HasQuerySelector, Node {
	[otherKey: string]: any
}

export type Options = {
	target: NodeLike
	timeout: number
	observeConfigs: MutationObserverInit
}

export const defaultOptions = (): Options => ({
	target: document,
	timeout: 0,
	observeConfigs: {
		childList: true,
		subtree: true,
		attributes: true,
	},
})

export const mergeOptions = (
	defaultOptions: Options,
	userPassingOptions: Partial<Options>,
): Options => {
	const observeConfigs = {
		...defaultOptions.observeConfigs,
		...userPassingOptions?.observeConfigs,
	}

	const options = {
		...defaultOptions,
		...userPassingOptions,
		observeConfigs,
	}
	return options
}
