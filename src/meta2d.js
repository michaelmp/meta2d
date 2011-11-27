/** meta2d.js
 *  Copyright (c) 2011 Michael Morris-Pearce <mikemp@mit.edu>
 * 
 *  An enhanced implementation of the CanvasRenderingContext2D as specified by
 *  the World Wide Web Consortium in HTML5.
 *
 *  Features include: layers, mouse interaction, animation, cacheing, and more!
 *
 *  This file provides the base for the library and should be included first.
 * 
 *      This file is part of Meta2D.
 *
 *      Meta2D is free software: you can redistribute it and/or modify
 *      it under the terms of the GNU General Public License as published by
 *      the Free Software Foundation, either version 3 of the License, or
 *      (at your option) any later version.
 *
 *      Meta2D is distributed in the hope that it will be useful,
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of
 *      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *      GNU General Public License for more details.
 *
 *      You should have received a copy of the GNU General Public License
 *      along with Meta2D.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  Meta2D is hosted at <https://gitorious.org/meta2d/>. Please check there for
 *  up-to-date code, examples, documentation, and other information.
 *----------------------------------------------------------------------------*/
/** jslint vars: true, white: true, indent: 2, maxlen: 80, imperfection: true */

(function () {
  'use strict';

  // The global context (usually the root window in a web client).
  var root = this;

  // Promiscuously mix in properties.
  var mix = function(host, vector) {
    if (!vector) return host;
    for (var a in vector) host[a] = vector[a];
    return host;
  };

  // Only mix in novel properties.
  var safe_mix = function(host, vector) {
    if (!vector) return host;
    for (var a in vector)
      if (! (a in host)) host[a] = vector[a];
    return host;
  };

  // Create a new object/namespace or mix-in with what's already present.
  var declare = function(o, init) {
    return (o && safe_mix(o, init)) || init || {};
  };

  var meta = root.meta2d = declare(root.meta2d, {
    VERSION: '0.epsilon'
  });

  // Some basic utilities.
  var undef = function(o) {return typeof o === 'undefined'},
      def = function(o) {return !meta.undef(o)},
      is_function = function(o) {return typeof o === 'function'},
      is_null = function(o) {
        return (typeof o === 'object' && !o)
        /* || (typeof o ==='null') potential Ecmascript 5.1 */;
      },
      is_number = function(o) {return typeof o === 'number'},
      is_object = function(o) {return typeof o === 'object'},
      is_string = function(o) {return typeof o === 'string'},
      inherits = function(o, parent) {return o instanceof parent;};

  // Some less-basic utilities.

  /** Length of an array */
  var len = function(ary) {
    return ary.length;
  };

  /** Make an honest array out of argument object */
  var args = function(argument_object) {
    return Array.prototype.slice.call(argument_object, 0);
  };

  /** Maximum value */
  var max = function() {
    return args(arguments).reduce(function(a, b) {return (a > b) ? a : b;});
  };

  /** Minimum value */
  var min = function() {
    return args(arguments).reduce(function(a, b) {return (a > b) ? b : a;});
  };

  /** Concatenate two arrays */
  var concat = function(a1, a2) {
    return a1.concat(a2);
  };

  /** Get index in array or null (undefined may be undesirable) */
  var index = function(i, array) {
    if (i >= array.length || i < 0) return null;
    return array[i];
  };

  /** Line up 2 arrays and perform a function on elements pairwise */
  var zip = function(f, a1, a2) {
    var ret = new Array(Math.max(a1.length, a2.length));

    for (var i = 0; i < ret.length; i++) {
      ret[i] = f.call(void 0, index(i, a1), index(i, a2));
    }

    return ret;
  };

  /** Sort an array of entities by their 'z' attribute' */
  var zsort = function(array) {
    return array.sort(function(a, b) {
        return  (a.z || -Infinity) - (b.z || -Infinity);
        });
  };

  /** Get the runtime in milliseconds */
  var time = (function() {
    var start = new Date().getTime();
    return function() {
      return new Date().getTime() - start;
    };
  })();

  /** Get a random number in the interval [0, 1) */
  var rand = function() {
    return Math.random();
  };

  /** Get a random integer in the specified interval (inclusive) */
  var randInt = function(low, high) {
    return Math.floor(low + (high - low + 1) * rand());
  };

  /** Round down a float to an integer */
  var floor = function(val) {
    return val << 0;
  };

  /** Round a float to an integer */
  var round = function(val) {
    return (0.5 + val) << 0;
  };

  /** Convert an array into a string */
  var serialize = function(array) {
    return array.join(',');
  };

  /** Cycle through any number of callbacks */
  var toggle = function() {
    var fs = args(arguments),
        current = 0;
    var f = function() {
      current %= fs.length;
      return fs[current++].call(void 0);
    };
    return f;
  };

  // Modifiable Types
  var MaskType = function() {},
      ProjectionType = function() {},
      TweenType = function() {};

  safe_mix(meta, {
    def: def,
    undef: undef,
    declareSafely: declare,
    mix: mix,
    mixSafely: safe_mix,
    isFunction: is_function,
    isNumber: is_number,
    isNull: is_null,
    isObject: is_object,
    isString: is_string,
    inherits: inherits,
    len: len,
    args: args,
    max: max,
    min: min,
    concat: concat,
    idx: index,
    zip: zip,
    zsort: zsort,
    time: time,
    rand: rand,
    randInt: randInt,
    floor: floor,
    round: round,
    serialize: serialize,
    toggle: toggle,
    MaskType: MaskType,
    ProjectionType: ProjectionType,
    TweenType: TweenType
  });

  // Create a new kind of exception.
  var makeX = function(name) {
    var x = function() {
      this.message = args(arguments).join(':');
      this.name = name;
    };
    x.prototype.toString = function() {
      return this.name + ' - ' + this.message;
    };
    return x;
  };

  // Exceptions used in this library.
  meta.exception = meta.declareSafely(meta.exception, {
    InvalidParameterException: makeX('InvalidParameterException'),
    InvokedAbstractMethodException: makeX('InvokedAbstractMethodException'),
    InvalidTemplateException: makeX('InvalidTemplateException')
  });

}).call(this);
