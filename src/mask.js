/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/lru.js
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
   * @class Mask
   *
   * @extends Modifiable<<MaskType>>
   */
  var Mask = function() {
    meta.Modifiable.call(this, new meta.MaskType())
  }

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
    throw new meta.exception.InvokedAbstractMethodException()
  }

  var Opaque = function(d) {
    this.drawing = d
  }

  Opaque.prototype = new Mask()

  Opaque.prototype.overlaps = function(x, y) {
    if (!this.drawing ||
        meta.math.affine.isSingular(this.drawing.transform)) {
      return false
    }

    var t = this.drawing.transform,
        t_inv = meta.math.affine.invert(t),
        pixel = meta.math.affine.applyToVector(t_inv, [x, y])

    return this.drawing.ctx.getImageData(
        pixel[0], pixel[1], 1, 1).data[3] > 0
  }

  var opaque = function(d) {
    return new Opaque(d)
  }

  var BBox = function(d) {
    this.drawing = d
  }

  BBox.prototype = new Mask()

  BBox.prototype.overlaps = function(x, y) {
    if (!this.drawing) return false
    var bounds = this.drawing.getBounds()
    return meta.math.rect.contains(bounds, [x, y, 1, 1]) 
  }

  var bbox = function(d) {
    return new BBox(d)
  }

  var Yes = function() {}

  Yes.prototype = new Mask()

  Yes.prototype.overlaps = function() {
    return true
  }

  var yes = function() {
    return new Yes()
  }

  var No = function() {}

  No.prototype = new Mask()

  No.prototype.overlaps = function() {
    return false
  }

  var no = function() {
    return new No()
  }

  meta.mixSafely(meta, {
    Mask: Mask
  })

  meta.mask = meta.declareSafely(meta.mask, {
    opaque: opaque,
    bbox: bbox,
    yes: yes,
    no: no
  })

}(this.meta2d);
