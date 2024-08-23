import PCancelable from "p-cancelable";
import {
	type DetectConditionMatcher,
	isAppeared,
	isDisappeared,
} from "./detectors";
import { type Options, defaultOptions, mergeOptions } from "./options";

function createWaitElement<Result extends Element | null>(
	isMatchDetectCondition: DetectConditionMatcher<Result>,
) {
	return (
		selector: string,
		_options?: Partial<Options>,
	): PCancelable<Result> => {
		const options = _options
			? mergeOptions(defaultOptions(), _options)
			: defaultOptions();

		const checkElement = (selector: string) => {
			return options.target.querySelector(selector);
		};

		return new PCancelable((resolve, reject, onCancel) => {
			let _hasObserved = false;
			let _timeoutId: ReturnType<typeof setTimeout>;

			const observer: MutationObserver = new MutationObserver((mutations) => {
				mutations.some(() => {
					const element = checkElement(selector);

					if (isMatchDetectCondition(element)) {
						if (_timeoutId) {
							clearTimeout(_timeoutId);
						}

						observer.disconnect();
						_hasObserved = true;
						resolve(element);
						return true; // The same as "break" in `Array.some()`
					}

					return false;
				});
			});

			onCancel(() => {
				if (_timeoutId) {
					clearTimeout(_timeoutId);
				}

				observer.disconnect();
				_hasObserved = true;
			});

			// Checking already element existed.
			const element = checkElement(selector);
			if (isMatchDetectCondition(element)) {
				_hasObserved = true;
				resolve(element);
				return;
			}

			// Start observe.
			observer.observe(options.target, options.observeConfigs);

			// Set timeout.
			if (options.timeout > 0 && !_hasObserved) {
				_timeoutId = setTimeout(() => {
					if (!_hasObserved) {
						observer.disconnect();
						reject(new Error(`Element was not found: ${selector}`));
					}
				}, options.timeout);
			}
		});
	};
}

export const waitElement = createWaitElement(isAppeared);
export const waitDisappearElement = createWaitElement(isDisappeared);
