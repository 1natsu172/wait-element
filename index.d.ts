declare module '@1natsu/wait-element' {
	// Type definitions for "@1natsu/wait-element" v2.0.0
	// Project: "@1natsu/wait-element"
	// Definitions by: 1natsu <https://github.com/1natsu172>

	/*~ Note that ES6 modules cannot directly export callable functions.
 *~ This file should be imported using the CommonJS-style:
 *~   import x = require('someLibrary');
 *~
 *~ Refer to the documentation to understand common
 *~ workarounds for this limitation of ES6 modules.
 */

	/*~ This declaration specifies that the function
 *~ is the exported object from the file
 */
	export = waitElement

	/*~ multiple overloads for function */
	/**
	 *
	 * @param selector
	 * @param options
	 * @param {string} [options.target] foo
	 */
	declare function waitElement<K extends keyof HTMLElementTagNameMap>(
		selector: K,
		options?: waitElement.Options
	): waitElement.CancelablePromise<HTMLElementTagNameMap[K] | null>

	declare function waitElement<K extends keyof SVGElementTagNameMap>(
		selector: K,
		options?: waitElement.Options
	): waitElement.CancelablePromise<SVGElementTagNameMap[K] | null>

	declare function waitElement<E extends Element = Element>(
		selector: string,
		options?: waitElement.Options
	): waitElement.CancelablePromise<E | null>

	/**
	 * namespace
	 */
	declare namespace waitElement {
		export interface CancelablePromise<T> extends Promise<T> {
			cancel(): void
		}

		/**
		 * Options
		 *
		 * @export
		 * @interface Options
		 */
		export interface Options {
			target?: Node
			timeout?: number
		}
	}
}
