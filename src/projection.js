/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/projection.js
 * -----------------------------------------------------------------------------
 * Copyright 2011 Michael Morris-Pearce
 * 
 * This file is part of Meta2D.
 *
 * Meta2D is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Meta2D is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Meta2D.  If not, see <http://www.gnu.org/licenses/>.
 *----------------------------------------------------------------------------*/

!function(meta) {

  'use strict'

  /**
   * @class Projection
   *  <p>
   *  A base class for projecting a vector onto another vector space. The
   *  prototypical example is converting a 2d or 3d coordinate space into a 2d
   *  coordinate space via isometric projection.
   *  </p>
   *
   *  <p>
   *  A forward projection applies the projection.
   *  </p>
   *
   *  <p>
   *  A reverse projection undoes the projection.
   *  </p>
   *
   * @extends Modifiable<<ProjectionType>>
   */

  /**
   * @constructor
   *  Instantiates a base Projection class with abstract <i>forward/reverse</i>
   *  methods.
   */
  var Projection = function() {
    meta.Modifiable.call(this, new meta.ProjectionType())
  }

  /**
   * @method forward
   *  <p><i>Abstract</i>.</p>
   *
   *  <p>
   *  Projects a vector onto a target space.
   *  </p>
   *
   * @param v
   *  An N-dimensional vector represented as an Array<<Number>>[N].
   *
   * @return Array<<Number>>
   */
  Projection.prototype.forward = function(v) {
    throw new meta.exception.InvokedAbstractMethodException()
  }

  /**
   * @method reverse
   *  <p><i>Abstract</i>.</p>
   *
   *  <p>
   *  If determinable, reverses the projection.
   *  </p>
   *
   * @param v
   *  An N-dimensional vector represented as an Array<<Number>>[N].
   *
   * @return Array<<Number>>
   */
  Projection.prototype.reverse = function(v) {
    throw new meta.exception.InvokedAbstractMethodException()
  }

  // @return [meta2d::Projection]
  var flat = function() {
    var o = function() {}

    o.prototype = new Projection()
    o.prototype.forward = function(v) {
      return v
    }
    o.prototype.reverse = function(v) {
      return v
    }

    return new o()
  }

  // @return [meta2d::Projection]
  var iso_from_2d = function(w, h) {
    if (!w || !h) throw new meta.exception.InvalidParameterException()
    var o = function() {}

    o.prototype = new Projection()
    o.prototype.forward = function(v) {
      return [
        (v[0] - v[1]) * 0.5 * w,
        (v[1] + v[0]) * 0.5 * h
      ]
    }
    o.prototype.reverse = function(v) {
      var a = 2 * v[0] / w,
          b = 2 * v[1] / h,
          x = (a + b) / 2,
          y = b - x
      return [x, y]
    }

    return new o()
  }

  // @return [meta2d::Modifier<meta2d.ProjectionType>]
  var shift = function(v_shift) {
    var o = function() {
      meta.Modifier.call(this, meta.ProjectionType)
      this.modify = function(projection) {
        projection.forward = this.wrapForward(projection.forward)
        projection.reverse = this.wrapReverse(projection.reverse)
      }
    }

    o.prototype.wrapForward = function(f) {
      return function(v) {
        return meta.math.vector.plus(f.call(this, v), v_shift)
      }
    }
    o.prototype.wrapReverse = function(f) {
      return function(v) {
        return f.call(this, meta.math.vector.minus(v, v_shift))
      }
    }

    return new o()
  }

  // @return [meta2d::Modifier<meta2d.ProjectionType>]
  var scale = function(v_scale) {
    var o = function() {
      meta.Modifier.call(this, meta.ProjectionType)
      this.modify = function(projection) {
        projection.forward = this.wrapForward(projection.forward)
        projection.reverse = this.wrapReverse(projection.reverse)
      }
    }

    o.prototype.wrapForward = function(f) {
      return function(v) {
        return meta.math.vector.mult(f.call(this, v), v_scale)
      }
    }
    o.prototype.wrapReverse = function(f) {
      return function(v) {
        return f.call(this, meta.math.vector.mult(
              v, meta.math.vector.invert(v_scale)))
      }
    }

    return new o()
  }

  meta.mixSafely(meta, {
    Projection: Projection
  })

  meta.projection = meta.declareSafely(meta.projection, {
    flat: flat,
    iso2d: iso_from_2d,
    shift: shift,
    scale: scale
  })

}(this.meta2d);
