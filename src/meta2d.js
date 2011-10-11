/**
 * meta2d.js
 *  Copyright (c) 2011 Michael Morris-Pearce
 * 
 * version: 0.0
 *
 * An enhanced implementation of the CanvasRenderingContext2D specification as
 * specified by W3C:
 * @see http://dev.w3.org/html5/2dcontext/
 *
 * For more information, examples, and documentation:
 * @see https://gitorious.org/meta2d/
 *                                                                            80
 *----------------------------------------------------------------------------*/
/** jslint vars: true, white: true, indent: 2, maxlen: 80 */

(function () {
  'use strict';

  // The global context (usually 'window' in a web client).
  var root = this;

  // Safely create or reuse a namespace.
  var redeclare = function(o, init) {return o || init || {}};

  // Create or reuse namespace, along with a short-hand name.
  var meta = root.meta2d = redeclare(root.meta2d);

  // The version of this code.
  meta.VERSION = '0.0';

  // Basic utilities.
  meta.undef = function(o) {return typeof o === 'undefined'};
  meta.def = function(o) {return !meta.undef(o)};
  meta.isString = function(o) {return typeof o === 'string'};
  meta.isObject = function(o) {return typeof obj === 'object'};
  meta.isNumber = function(o) {return typeof obj === 'number'};
  meta.isFunction = function(o) {return typeof obj === 'function'};
  meta.inherits = function(o, parent) {throw 'Unimplemented.'};
  meta.redeclare = redeclare;

  // External functionality.
  var V = Vector.create || $V;
  if (!V) throw 'Requires vector math: import sylvester.js';
  meta.V = V;

  // Cache bitcodes.
  meta.cache = redeclare(meta.cache, {
    IGNORE: 0,
    USE: 1 << 0,
    DIRTY: 1 << 1
  });

  // Modifiable Types
  meta.CollisionType = meta.redeclare(
    meta.CollisionType,
    function() {}
    );
  meta.ProjectionType = meta.redeclare(
    meta.ProjectionType,
    function() {}
    );
  meta.TweenType = meta.redeclare(
    meta.TweenType,
    function() {}
    );

}).call(this);

