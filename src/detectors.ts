import type { QuerySelectorReturn } from "./types.js";

export type DetectorResultType<Result> =
	| { isDetected: true; result: Result }
	| { isDetected: false };

export type Detector<
	Result = unknown,
	QuerySelectorResult extends QuerySelectorReturn = QuerySelectorReturn,
> = (
	element: QuerySelectorResult,
) => DetectorResultType<Result> | Promise<DetectorResultType<Result>>;

export const isExist: Detector<Element> = (element) => {
	return element !== null
		? { isDetected: true, result: element }
		: { isDetected: false };
};

export const isNotExist: Detector<null> = (element) => {
	return element === null
		? { isDetected: true, result: null }
		: { isDetected: false };
};
