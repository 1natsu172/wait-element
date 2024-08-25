export interface HasQuerySelector {
	querySelector: Document["querySelector"];
}
export interface NodeLike extends HasQuerySelector, Node {
	// biome-ignore lint/suspicious/noExplicitAny: expansion pther properties
	[otherKey: string]: any;
}

export type QuerySelectorResult = ReturnType<HasQuerySelector["querySelector"]>;
