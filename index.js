'use strict';

const PCancelable = require('p-cancelable');

module.exports = (selector, options) => {
	options = Object.assign({
		target: document,
		visible: true,
		timeout: 0
	}, options);

	const checkElement = selector => {
		return options.target.querySelector(selector);
	};

	return new PCancelable((resolve, reject, onCancel) => {
		let observer = {};
		let _hasObserved = false;
		let _timeoutId;

		onCancel(() => {
			if (_timeoutId) {
				clearTimeout(_timeoutId);
			}

			observer.disconnect();
			_hasObserved = true;
		});

		const configs = {
			childList: true,
			subtree: true
		};

		// Checking already element existed.
		const element = checkElement(selector);
		if (element === options.visible) {
			_hasObserved = true;
			return resolve(element);
		}

		observer = new MutationObserver(mutations => {
			mutations.some(() => {
				const element = checkElement(selector);

				if (element === options.visible) {
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
		observer.observe(options.target, configs);

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
