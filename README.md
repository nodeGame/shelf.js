# Shelf.JS

Shelf.JS is a mesh-up of `amplify.store` and the `cookies` library.

 - http://amplifyjs.com/
 - http://code.google.com/p/cookies/
 
 
It combines the best of the two and adds some other features in order to offer
persistent storage capabilities in the browsers.


# Basic Usage



```javascript
  
  // Store something on the shelf
  
  store('foo', {foo: 'bar'}, {});

  // Grab something from the shelf
  
  store('foo');
  // {foo: 'bar'}
  
  // Check whether the browser offers persistent storage
  if (!store.persistent) {
    alert('Browser storage and cookies are currently disabled');
  }
```

# License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.  
   

