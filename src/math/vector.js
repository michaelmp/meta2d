/** vector.js
 *  Copyright (c) 2011 Michael Morris-Pearce <mikemp@mit.edu>
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

(function() {
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  // a Vector is an Array
  var vector = function() {
    var ret = new Array();
    return ret.concat(meta.args(arguments));
  };

  /** and 2 values */
  var ander = function(a, b) {
    if (meta.undef(a)) a = false;
    if (meta.undef(b)) b = false;
    return !!a && !!b;
  };

  /** add 2 values */
  var adder = function(a, b) {
    a = a || 0;
    b = b || 0;
    return a + b;
  };

  /** multiply 2 values */
  var multiplier = function(a, b) {
    if (meta.undef(a) || meta.isNull(a)) a = 1;
    if (meta.undef(b) || meta.isNull(b)) b = 1;
    return a * b;
  };

  /** return true if two values are equivalent */
  var equality = function(a, b) {
    return a === b;
  };

  var max2 = function(a, b) {
    return meta.max(a, b);
  };

  /** all vectors are equivalent */
  var equal = function() {
    if (arguments.length < 1)
      return new meta.exception.InvalidParameterException();
    var arguments = meta.args(arguments),
        max = arguments.map(meta.len).reduce(max2),
        ref, i, brk;
    if (max === 0) return true;

    for (i = 0; i < max; i++) {
      ref = meta.idx(i, arguments[0]);
      arguments.forEach(function(array) {
          if (!equality(meta.idx(i, array), ref)) brk = true;
          });
      if (brk) return false;
    }

    return true;
  };

  /** sum any number of vectors */
  var plus = function() {
    return meta.args(arguments).reduce(meta.zip.bind(void 0, adder));
  };

  /** scale a vector */
  var scale = function(v, val) {
    return v.map(function(e) {
        return e * val;
        });
  };

  /** subtract one vector from another */
  var minus = function(v1, v2) {
    return meta.zip(adder, v1, scale(v2, -1));
  };

  /** multiply corresponding elements in any number of vectors */
  var mult = function() {
    return meta.args(arguments).reduce(meta.zip.bind(void 0, multiplier));
  };

  /** reciprocal each element in a vector */
  var invert = function(v) {
    return v.map(function(e) {return 1/e;});
  };

  meta.math.vector = meta.declareSafely(meta.math.vector, {
    vector: vector,
    equal: equal,
    plus: plus,
    minus: minus,
    scale: scale,
    mult: mult,
    invert: invert
  });

}).call(this);
