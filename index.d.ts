// Type definitions for "@1natsu/wait-element" v2.1.0
// Project: "@1natsu/wait-element"
// Definitions by: 1natsu <https://github.com/1natsu172>

/*~ Note that ES6 modules cannot directly export callable functions.
 *~ This file should be imported using the CommonJS-style:
 *~   import x = require('someLibrary');
 *~
 *~ Refer to the documentation to understand common
 *~ workarounds for this limitation of ES6 modules.
 */

/**
 * @see [GitHub Repo] {@link https://github.com/1natsu172/wait-element}
 */
declare module '@1natsu/wait-element' {
	/*~ This declaration specifies that the function
	 *~ is the exported object from the file
	 */
	export = waitElement

	/*~ multiple overloads function */
	/**
	 * Function
	 *
	 * @param {string} selector Format is [CSS-selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors)
	 * @param {waitElement.Options} [options] waitElement.Options
	 * @returns {(waitElement.CancelablePromise<HTMLElementTagNameMap[K] | SVGElementTagNameMap[K] | E | null>)} Overloaded by {selector} param
	 */
	function waitElement<K extends keyof HTMLElementTagNameMap>(
		selector: K,
		options?: waitElement.Options
	): waitElement.CancelablePromise<HTMLElementTagNameMap[K] | null>

	function waitElement<K extends keyof SVGElementTagNameMap>(
		selector: K,
		options?: waitElement.Options
	): waitElement.CancelablePromise<SVGElementTagNameMap[K] | null>

	function waitElement<E extends Element = Element>(
		selector: string,
		options?: waitElement.Options
	): waitElement.CancelablePromise<E | null>

	/**
	 * @namespace waitElement
	 */
	namespace waitElement {
		/**
		 *
		 * @interface CancelablePromise<T>
		 * @extends {Promise<T>}
		 * @property {function} cancel
		 */
		export interface CancelablePromise<T> extends Promise<T> {
			cancel(): void
		}

		/**
		 *
		 * @property {Node} [Options.target] value is [Node](https://developer.mozilla.org/en-US/docs/Web/API/Node)
		 * @property {number} [Options.timeout]
		 * @typedef {object} Options
		 */
		export interface Options {
			target?: Node
			visible?: boolean 
			timeout?: number
		}
	}
}
