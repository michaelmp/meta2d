/** collision.js
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
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  // functions that take a rect arg and return true/false
  
  // always collides
  var always = function() {
    return function() {return true;};
  };

  // never collides
  var never = function() {
    return function() {return false;};
  };

  // rectangle intersection
  var bbox = function(rect) {
    var f = function(r) {
      return meta.math.rect.intersect(rect, r);
    };
    return f;
  };

  // drawing is {ctx, transform}
  var alpha = function(d) {
    var f = function (r) {
      var t = meta.math.affine.transform(
              [1, 0, 0, 1, r[0], r[1]],
              d.transform);
          x = t[4],
          y = t[5];
      return d.ctx.canvas.getImageData(x, y, 1, 1).data[3] > 0;
    };
    return f;
  };

  meta.collision = meta.declareSafely(meta.collision, {
    always: always,
    never: never,
    bbox: bbox,
    alpha: alpha,
  });

}).call(this);
