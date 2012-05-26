# Shelf.JS

Shelf.JS is a mesh-up of `amplify.store` and the `cookies` library.

 - http://amplifyjs.com/
 - http://code.google.com/p/cookies/
 
 
It combines the best of the two and adds some other features in order to offer
persistent storage capabilities in the browsers. 

## amplify.store

amplify.store is a wrapper for various persistent client-side storage systems. amplify.store supports IE 5+, Firefox 2+, Safari 4+, Chrome, Opera 10.5+, iPhone 2+, Android 2+ and provides a consistent API to handle storage cross-browser.

amplify.store is meant to allow you to utilize all the latest storage technologies for those browsers that have them, while gracefully degrading for those without support. 

## cookies library

This is a Javascript library for accessing and manipulating HTTP cookies in the web browser. You can get one or a list of cookies, set cookies, delete cookies, test if the browser accepts cookies. When JSON support is available, any JS value can be set to a cookie--it will be automatically serialized before being written to the cookie.

# Usage

## Basic

```javascript
  
  // Store something on the first shelf available
  store('foo', {foo: 'bar'}, {});

  // Grab something from the shelf
  store('foo');
  // {foo: 'bar'}
  
  // Storing something on a specific shelf
  store.cookie(foo2, {foo2: 'bar2'});
  
```

## Checkings and configuration

```javascript

  // Check whether the browser offers persistent storage
  if (!store.persistent) {
    alert('Browser storage and cookies are currently disabled');
  }
  
  // Check / set verbosity level
  store.verbosity = 1;
  
  // Check / set default shelf
  store.type = 'memory';

```

# License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.  
   

