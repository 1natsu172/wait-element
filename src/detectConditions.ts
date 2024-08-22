export type DetectConditionMatcher<Is extends Element | null> = (
	element: Element | null,
) => element is Is;

export const isAppeared: DetectConditionMatcher<Element> = (
	element: Element | null,
): element is Element => {
	return element !== null;
};

export const isDisappeared: DetectConditionMatcher<null> = (
	element: Element | null,
): element is null => {
	return !isAppeared(element);
};
