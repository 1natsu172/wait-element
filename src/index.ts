import deepmerge from 'deepmerge'
import PCancelable from 'p-cancelable'

type Options = {
	target: Document,
	timeout: number,
	observeConfigs: MutationObserverInit
}

const defaultOptions: Options = {
	target: document,
	timeout: 0,
	observeConfigs: {
		childList: true,
		subtree: true,
		attributes: true
	}
}

export function waitElement(selector: string, _options?: Partial<Options>): PCancelable<Element> {

	const options = deepmerge(defaultOptions, _options || {})

	const checkElement = (selector: string) => {
		return options.target.querySelector(selector);
	};

	return new PCancelable((resolve, reject, onCancel) => {
		let observer: MutationObserver;
		let _hasObserved = false;
		let _timeoutId: ReturnType<typeof setTimeout>;

		onCancel(() => {
			if (_timeoutId) {
				clearTimeout(_timeoutId);
			}

			observer.disconnect();
			_hasObserved = true;
		});

		// Checking already element existed.
		const element = checkElement(selector);
		if (element) {
			_hasObserved = true;
			return resolve(element);
		}

		observer = new MutationObserver(mutations => {
			mutations.some(() => {
				const element = checkElement(selector);

				if (element) {
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
