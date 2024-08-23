import type { HasQuerySelector } from "./options.js";

export type Detector = (arg: {
	element: ReturnType<HasQuerySelector["querySelector"]>;
}) => boolean;

export const isExist: Detector = ({ element }) => {
	return element !== null;
};

export const isNotExist: Detector = (...args) => {
	return !isExist(...args);
};
