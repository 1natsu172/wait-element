'use strict';

module.exports = (selector, options) => {
	options = Object.assign({
		target: document,
		timeout: 0
	}, options);

	const checkElement = selector => {
		return options.target.querySelector(selector);
	};

	return new Promise((resolve, reject) => {
		let hasDetected = false;
		let timeoutId;

		const configs = {
			childList: true,
			subtree: true
		};

    // Checking already element existed.
		const element = checkElement(selector);
		if (element) {
			hasDetected = true;
			return resolve(element);
		}

		const observer = new MutationObserver(mutations => {
			mutations.some(() => {
				const element = checkElement(selector);

				if (element) {
					hasDetected = true;
					if (options.timeout > 0) {
						clearTimeout(timeoutId);
					}
					observer.disconnect();
					resolve(element);
					return true; // The same as "break" in `Array.some()`
				}

				return false;
			});
		});

    // Start observe.
		observer.observe(options.target, configs);

    // Set timeout.
		if (options.timeout > 0 && !hasDetected) {
			timeoutId = setTimeout(() => {
				if (!hasDetected) {
					observer.disconnect();
					reject(new Error(`Element was not found: ${selector}`));
				}
			}, options.timeout);
		}
	});
};
