# na-error-propagation

[![npm version](http://img.shields.io/npm/v/na-error-propagation.svg)](https://npmjs.org/package/na-error-propagation)
[![bower version](https://img.shields.io/bower/v/na-error-propagation.svg)](https://github.com/tfoxy/na-error-propagation)
<!--
[![build status](https://img.shields.io/travis/tfoxy/na-error-propagation.svg)](https://travis-ci.org/tfoxy/na-error-propagation)
-->

Calculates the error propagation of an expression, also called [Propagation of uncertainty][Wikipedia article].

Works in Node and the browser.
Uses the [nerdamer library][nerdamer library] to evaluate the expressions, including the differentials.

## Example

[Live Demo](http://jsbin.com/weboqo/embed?js,console)

```js
var ErrorPropagation = require('na-error-propagation');
var nerdamer = require('nerdamer');
GLOBAL.nerdamer = nerdamer;
require('nerdamer/Calculus');
delete GLOBAL.nerdamer;

var errorPropagation = new ErrorPropagation({
  correlation: 'both'
});
errorPropagation.on('differential', function(diff) {
  console.log('differential', diff);
});
var result = errorPropagation.calculate('x + y', {
  x: {value: 8, error: 3},
  y: {value: 15, error: 4}
});
console.log('result', result); // {value: 23, error: {correlated: 10, uncorrelated: 5}}
```

If you want to use the events in the browser, you must set an [EventEmitter library][EventEmitter2 library]
using the `ErrorPropagation.setEventEmitter(EventEmitter)` method.


[Wikipedia article]: https://en.wikipedia.org/wiki/Propagation_of_uncertainty
[nerdamer library]: https://github.com/jiggzson/nerdamer
[EventEmitter2 library]: https://github.com/asyncly/EventEmitter2
