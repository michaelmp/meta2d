/**
 * meta2d.js
 *  Copyright (c) 2011 Michael Morris-Pearce
 * 
 * version: 0.epsilon
 *
 * An enhanced implementation of the CanvasRenderingContext2D specification as
 * specified by W3C:
 * @see http://dev.w3.org/html5/2dcontext/
 *
 * For more information, up-to-date source, examples, and documentation:
 * @see https://gitorious.org/meta2d/
 *
 * Acknowledgements:
 * Many of the ideas and styles used were inspired by the work of others:
 * - prototype.js
 * - underscore.js
 * - ...
 *                                                                            80
 *----------------------------------------------------------------------------*/
/** jslint vars: true, white: true, indent: 2, maxlen: 80, human: true */

(function () {
  'use strict';

  // The global context (usually the root window in a web client).
  var root = this;

  // Promiscuously mix in properties.
  var mix = function(host, vector) {
    if (!vector) return host;
    for (a in vector) host[a] = vector[a];
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

  var meta = root.meta2d = declare(root.meta2d, {VERSION: '0.epsilon'});

  // Some basic utilities.
  var undef = function(o) {return typeof o === 'undefined'},
      def = function(o) {return !meta.undef(o)},
      is_string = function(o) {return typeof o === 'string'},
      is_object = function(o) {return typeof o === 'object'},
      is_number = function(o) {return typeof o === 'number'},
      is_function = function(o) {return typeof o === 'function'},
      inherits = function(o, parent) {return o instanceof parent;};

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
    isString: is_string,
    isObject: is_object,
    isNumber: is_number,
    isFunction: is_function,
    inherits: inherits,
    CollisionType: CollisionType,
    ProjectionType: ProjectionType,
    TweenType: TweenType
  });

  // Create a new kind of exception.
  var makeX = function(name) {
    var x = function() {
      this.message = arguments.join(':');
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
