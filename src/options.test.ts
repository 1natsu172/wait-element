import test, {beforeEach} from 'ava'
import {JSDOM} from 'jsdom'
import {defaultOptions, mergeOptions} from './options'

beforeEach(() => {
	global.document = new JSDOM().window.document
})

test('defaultOptions: always the same', (t) => {
	const options1 = defaultOptions()
	const options2 = defaultOptions()
	t.deepEqual(options1, options2)
})

test('defaultOptions: always return new object', (t) => {
	const options1 = defaultOptions()
	const options2 = defaultOptions()
	t.not(options1, options2)
})

test('mergeOptions', (t) => {
	const targetElement = new JSDOM().window.document.createElement('a')
	const mergedOptions = mergeOptions(defaultOptions(), {
		target: targetElement,
		timeout: 5000,
		observeConfigs: {subtree: false, attributeFilter: ['class']},
	})
	t.is(mergedOptions.target, targetElement)
	t.is(mergedOptions.timeout, 5000)
	t.deepEqual(mergedOptions.observeConfigs, {
		subtree: false,
		childList: true,
		attributeFilter: ['class'],
		attributes: true,
	})
})
