/** projection.js
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
   * @class Projection
   *  : Mofiable<ProjectionType>
   *
   * A projection takes a vector and maps it into another. The prototypical
   * example is converting a 2d or 3d coordinate space into a 2d coordinate
   * space via isometric projection.
   *
   * A forward projection applies the projection.
   * A reverse projection undoes the projection.
   */

  // @constructor
  var Projection = function() {
    meta.Modifiable.call(this, new meta.ProjectionType());
  };

  // @abstract
  // @method forward
  Projection.prototype.forward = function(v) {
    throw new meta.exception.InvokedAbstractMethodException();
  };

  // @abstract
  // @method reverse
  Projection.prototype.reverse = function(v) {
    throw new meta.exception.InvokedAbstractMethodException();
  };

  // @return [meta2d::Projection]
  var flat = function() {
    var o = function() {};

    o.prototype = new Projection();
    o.prototype.forward = function(v) {
      return v;
    };
    o.prototype.reverse = function(v) {
      return v;
    };

    return new o();
  };

  // @return [meta2d::Projection]
  var iso_from_2d = function(w, h) {
    if (!w || !h) throw new meta.exception.InvalidParameterException();
    var o = function() {};

    o.prototype = new Projection();
    o.prototype.forward = function(v) {
      return [
        (v[0] - v[1]) * 0.5 * w,
        (v[1] + v[0]) * 0.5 * h
      ];
    };
    o.prototype.reverse = function(v) {
      var a = 2 * v[0] / w,
          b = 2 * v[1] / h,
          x = (a + b) / 2,
          y = b - x;
      return [x, y];
    };

    return new o();
  };

  // @return [meta2d::Modifier<meta2d.ProjectionType>]
  var shift = function(v_shift) {
    var o = function() {
      meta.Modifier.call(this, meta.ProjectionType);
      this.modify = function(projection) {
        projection.forward = this.wrapForward(projection.forward);
        projection.reverse = this.wrapReverse(projection.reverse);
      };
    };

    o.prototype.wrapForward = function(f) {
      return function(v) {
        return meta.math.vector.plus(f.call(this, v), v_shift);
      };
    };
    o.prototype.wrapReverse = function(f) {
      return function(v) {
        return f.call(this, meta.math.vector.minus(v, v_shift));
      };
    };

    return new o();
  };

  // @return [meta2d::Modifier<meta2d.ProjectionType>]
  var scale = function(v_scale) {
    var o = function() {
      meta.Modifier.call(this, meta.ProjectionType);
      this.modify = function(projection) {
        projection.forward = this.wrapForward(projection.forward);
        projection.reverse = this.wrapReverse(projection.reverse);
      };
    };

    o.prototype.wrapForward = function(f) {
      return function(v) {
        return meta.math.vector.mult(f.call(this, v), v_scale);
      };
    };
    o.prototype.wrapReverse = function(f) {
      return function(v) {
        return f.call(this, meta.math.vector.mult(
              v, meta.math.vector.invert(v_scale)));
      };
    };

    return new o();
  };

  meta.mixSafely(meta, {
    Projection: Projection
  });

  meta.projection = meta.declareSafely(meta.projection, {
    flat: flat,
    iso2d: iso_from_2d,
    shift: shift,
    scale: scale
  });

}).call(this);
