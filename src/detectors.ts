import type { QuerySelectorResult } from "./types.js";

export type Detector = (arg: {
	element: QuerySelectorResult;
}) => boolean | Promise<boolean>;

export const isExist: Detector = ({ element }) => {
	return element !== null;
};

export const isNotExist: Detector = (...args) => {
	return !isExist(...args);
};
