import test from 'ava';
import delay from 'delay';
import jsdom from 'jsdom';
import m from '.';

const dom = new jsdom.JSDOM();
global.window = dom.window;
global.document = dom.window.document;

require('mutationobserver-shim');

global.MutationObserver = window.MutationObserver;

test('Detect the appearance of an element by id-selector', async t => {
	delay(500).then(() => {
		const el = document.createElement('div');
		el.id = 'late';
		document.body.appendChild(el);
	});

	const checkEl = await m('#late');
	t.is(checkEl.id, 'late');
});

test('Detect the appearance of an element by class-selector', async t => {
	delay(500).then(() => {
		const el = document.createElement('div');
		el.className = 'late-comming';
		document.body.appendChild(el);
	});

	const checkEl = await m('.late-comming');
	t.is(checkEl.className, 'late-comming');
});

test('Check when an element already exists', async t => {
	const el = document.createElement('div');
	el.id = 'exist';
	document.body.appendChild(el);

	const checkEl = await m('#exist');
	t.is(checkEl.id, 'exist');
});

test('Detect elements of the same selector on each parent target', async t => {
	const target1 = document.createElement('p');
	document.body.appendChild(target1);
	const target2 = document.createElement('span');
	document.body.appendChild(target2);

	delay(500).then(() => {
		const el1 = document.createElement('p');
		el1.id = 'late1';
		el1.className = 'late-comming';
		target1.appendChild(el1);

		const el2 = document.createElement('span');
		el2.id = 'late2';
		el2.className = 'late-comming';
		target2.appendChild(el2);
	});

	const checkEl1 = await m('.late-comming', {target: target1});
	t.is(checkEl1.id, 'late1');

	const checkEl2 = await m('.late-comming', {target: target2});
	t.is(checkEl2.id, 'late2');
});

test('Detect if an element can be found within the time limit', async t => {
	delay(500).then(() => {
		const el = document.createElement('div');
		el.id = 'late';
		document.body.appendChild(el);
	});

	const checkEl = await m('#late', {timeout: 800});
	t.is(checkEl.id, 'late');
});

test('Timeout if an element is not found within specified time', async t => {
	delay(800).then(() => {
		const el = document.createElement('div');
		el.id = 'late';
		document.body.appendChild(el);
	});

	const waitingEl = '#late';
	const timeoutEl = await t.throws(m(waitingEl, {timeout: 500}));
	t.is(timeoutEl.message, `Element was not found: ${waitingEl}`);
});
