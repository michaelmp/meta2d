/** mask.js
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

  /**
   * @class Mask
   *
   * @extends Modifiable<<MaskType>>
   */
  var Mask = function() {
    meta.Modifiable.call(this, new meta.MaskType());
  };

  /**
   * @method overlaps
   *  <p>
   *  <i>Abstract</i>.
   *  </p>
   * @param x
   * @param y
   * @return Boolean
   */
  Mask.prototype.overlaps = function(x, y) {
    throw new meta.exception.InvokedAbstractMethodException();
  };

  var opaque = function(d) {
    var o = function() {};

    o.prototype = new Mask();

    o.prototype.overlaps = function(x, y) {
      if (meta.math.affine.isSingular(d.transform))
          return false;

      var t = d.transform,
          t_inv = meta.math.affine.invert(t),
          pixel = meta.math.affine.applyToVector(t_inv, [x, y]);

      return d.ctx.getImageData(pixel[0], pixel[1], 1, 1).data[3] > 0;
    };

    return new o();
  };

  var yes = function() {
    var o = function() {};

    o.prototype = new Mask();

    o.prototype.overlaps = function() {
      return true;
    };

    return new o();
  };

  var no = function() {
    var o = function() {};

    o.prototype = new Mask();

    o.prototype.overlaps = function() {
      return false;
    };

    return new o();
  };

  meta.mixSafely(meta, {
    Mask: Mask
  });

  meta.mask = meta.declareSafely(meta.mask, {
    opaque: opaque,
    yes: yes,
    no: no
  });

}).call(this);
