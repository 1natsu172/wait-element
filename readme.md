# wait-element
[![npm](https://img.shields.io/npm/v/@1natsu/wait-element.svg?style=for-the-badge)](https://www.npmjs.com/package/@1natsu/wait-element)
![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@1natsu/wait-element.svg?style=for-the-badge)
![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@1natsu/wait-element.svg?style=for-the-badge)


> Detect the appearance of an element in the browser DOM

## a.k.a promise-querySelector

* Promise API
* Driven by `MutationObserver`
* Detect by `querySelecrtor`
* Possible to abort with `AbortSignal`

If the target element already exists when execution of "wait-element", it immediately `resolve` and return the element.


## Install

```bash
npm install @1natsu/wait-element
```
```bash
yarn add @1natsu/wait-element
```
```bash
pnpm add @1natsu/wait-element
```
```bash
bun add @1natsu/wait-element
```

## Usage

### Module specifiers

```js
import { waitElement } from "@1natsu/wait-element";
```

#### Basically

```js
const el = await waitElement(".late-comming");
console.log(el);
//=> example: "<div class="late-comming">I'm late</div>"
```

#### Specify parent target element (specify MutationObserve target)

```js
const parent = await waitElement("#parent");
const el = await waitElement(".late-comming", { target: parent });
console.log(el);
//=> example: "<div class="late-comming">I'm late</div>"
```

#### Setting timeout

```js
const el = await waitElement(".late-comming", { signal: AbortSignal.timeout(1000) }).catch(err => console.log(err));
console.log(el);
//=> If detected element: "<div class="late-comming">I'm late</div>"
//=> If timeouted: DOMException: TimeoutError
```

#### Abort the waiting

```js
try {
	const waitAbortable = new AbortController();

	const checkElement = waitElement(".late-comming", { signal: waitAbortable.signal });

	waitAbortable.abort("abort this time!");

} catch(error) {
	// After abort handling...
}
```

#### Custom detect condition

```js
const el = await waitElement("#animal", {
  detector: ({ element }) => element?.textContent === "Tiger",
})
console.log(el.textContent);
//=> example: Tiger
```

```js
import { isNotExist } from "@1natsu/wait-element/detectors";

// when resolve if “not exist” or “disappear” at the time of call
const result = await waitElement(".hero", { detector: isNotExist });
//=> result: null
```

#### Unify waiting process

Unifies the process of finding an element. If set `true`, increases efficiency. Unify the same arguments(includes options) with each other.

```js
const A = waitElement(".late-comming", {
	unifyProcess: true,
});

const B = waitElement(".late-comming", {
	unifyProcess: true,
});

const C = waitElement(".late-comming", {
	unifyProcess: true,
	signal: AbortSignal.timeout(1000)
});

const D = waitElement(".late-comming", {
	unifyProcess: false,
});

// Unified:
// A === B
// B !== C
// B !== D
```


## API

### waitElement(selector, [options])

#### selector

Type: `string`

Format is [CSS-selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors)

#### options

Passed options is merged with default configs.

[See TS definition for detailed information](https://github.com/1natsu172/wait-element/blob/master/src/options.ts)

### createWaitElement(initOptions)

Custom waitElement function can be created.

## Similar

The very similar library.

* [element-ready](https://github.com/sindresorhus/element-ready)
  * Implementation method is different from this library.

## License

MIT © [1natsu172](https://github.com/1natsu172)
