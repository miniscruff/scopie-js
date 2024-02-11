// UMD insanity
// This code sets up support for (in order) AMD, ES6 modules, and globals.
(function(root, factory) {
  //@ts-ignore
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    //@ts-ignore
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals
    root.scopie = root.scopie || factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  return (function() {
    'use strict';

    var scopie = {
      version: "0.1.0",
      isAllowed: isAllowed,
    };

    const scopeSeperator = ',';
    const blockSeperator = '/';
    const wildcard = '*';
    const superWildcard = '**';
    const varPrefix = '@';

    function isAllowed(vars, requiredScopes, actorScopes) {
      console.log("vars", vars)
      console.log("req", requiredScopes)
      console.log("actor", actorScopes)

      const requireds = requiredScopes.split(scopeSeperator);
      const actors = actorScopes.split(scopeSeperator);

      let hasBeenAllowed = false;

      for (const act of actors) {
        const actBlocks = act.split(blockSeperator).splice(1);
        const isAllowBlock = act.startsWith('allow');

        if (isAllowBlock && hasBeenAllowed) {
          continue;
        }

        for (const req of requireds) {
          const reqBlocks = req.split(blockSeperator);
          console.log(actBlocks, reqBlocks);

          if (arrayEq(vars, actBlocks, reqBlocks)) {
            if (!isAllowBlock) {
              return false;
            }
            hasBeenAllowed = true;
          }
        }
      }

      return hasBeenAllowed;
    }

    function arrayEq(vars, a, b) {
      if (a.length !== b.length && a[a.length-1] !== superWildcard) {
        return false;
      }

      for (let i in a) {
        console.log(a[i], b[i]);

        if (a[i] === superWildcard) {
          return true;
        }

        if (a[i] === wildcard) {
          continue;
        }

        if (a[i].startsWith(varPrefix)) {
          const key = a[i].slice(1);
          console.log("found var", key, vars[key], b[i])
          if (vars[key] !== b[i]) {
            return false;
          }
        } else if (a[i] !== b[i]) {
          return false;
        }
      }

      return true;
    }

    return scopie;
  })()
}));
