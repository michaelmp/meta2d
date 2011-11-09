/**
 * meta2d.js
 *  Copyright (c) 2011 Michael Morris-Pearce
 * 
 * version: 0.epsilon
 *
 * An enhanced implementation of the CanvasRenderingContext2D as specified by
 * the World Wide Web Consortium in HTML5.
 * @see http://dev.w3.org/html5/2dcontext/
 *
 * Features include: layers, mouse interaction, animation, cacheing, and more!
 *
 * For more information, up-to-date source, examples, and documentation:
 * @see https://gitorious.org/meta2d/
 *                                                                            80
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

  // Only mix in original properties.
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

  // Modifiable Types
  var CollisionType = function() {},
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
    idx: index,
    zip: zip,
    CollisionType: CollisionType,
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
