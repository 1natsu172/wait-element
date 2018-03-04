# wait-element [![Build Status](https://travis-ci.org/https://github.com/1natsu172/wait-element.svg?branch=master)](https://travis-ci.org/https://github.com/1natsu172/wait-element)

> Detect the appearance of an element in the browser DOM

## a.k.a promise-querySelector

* Promise API
* Driven by `MutationObserver`
* Detect by `querySelecrtor`

If the target element already exists when execution of "wait-element", it immediately `resolve` and return the element.


## Install

```bash
$ npm install wait-element
```


## Usage

```js
const waitElement = require('wait-element');

(async () => {
  const el = await waitElement('.late-comming');
  console.log(el);
  //=> example: "<div class="late-comming">I'm late</div>"
})();

// When specify a parent element (specify MutationObserve target)
(async () => {
  const parent = await waitElement('#parent');
  const el = await waitElement('.late-comming', { target: parent });
  console.log(el);
  //=> example: "<div class="late-comming">I'm late</div>"
})();

// When setting timeout
(async () => {
  const el = await waitElement('.late-comming', { timeout: 5000 }).catch(err => console.log(err));
  console.log(el);
  //=> If detected element: "<div class="late-comming">I'm late</div>"
  //=> If timeouted: Error: Element was not found: '.late-coming'
})();
```


## API

### waitElement(selector, [options])

#### selector

Type: `string`

Format is [CSS-selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors)

#### options

##### target

Type: `HTMLElement`<br>
Default: `document`

Specify a parent node (specify MutationObserve target).

When you know the parent node of the element you want to detect.

* Please also refer to the [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

##### timeout

Type: `number`<br>
Default: `0`<br>
Unit: ms(Millisecond)

There is no timeout by default.


## Similar

The very similar library.

* [element-ready](https://github.com/sindresorhus/element-ready)
  * Implementation method is different from this library.


## License

MIT © [1natsu172](https://github.com/https://github.com/1natsu172)
