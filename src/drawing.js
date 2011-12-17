/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/drawing.js
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
   * @class Drawing
   *  <p>
   *  A Drawing is a bitmap paired with a transformation, together describing
   *  what and where the bitmap should appear on the screen. A Drawing has two
   *  key properties:
   *  <ol>
   *    <li><i>ctx</i> - A rendering context.
   *    <li><i>transform</i> - The context transformation at time of creation.
   *  </ol>
   *  </p>
   *  <p>
   *  Drawings are useful when the transformation state of a Context must be
   *  remembered independent of the <i>save</i>/<i>restore</i> stack.
   *  </p>
   *  <p>
   *  The <i>draw</i> property of entities expects a Drawing. Layers use this
   *  property to remember what the entity looks like &amp; where it should
   *  be redrawn, long after the transformation state on the context has
   *  changed.
   *  </p>
   *  <p>
   *  In the example below, Layer.makeDrawing creates a new Drawing with its
   *  transformation set to the layer context's current transformation. When
   *  the layer redraws the entity it will reuse the value stored in <i>draw
   *  </i>, avoiding the need for <i>ondraw</i> to redraw the path.
   *  </p>
   *  <code>
   *  mcx.put('', {
   *    ondraw: function(cx, layer) {
   *      var ctx = new meta2d.Context(w, h)
   *  
   *      ctx.beginPath()
   *      ...
   *  
   *      return this.draw = layer.makeDrawing(ctx)
   *    }
   *  })
   *  </code>
   */

  /**
   * @constructor
   *  Creates a new Context with the specified width and height, or takes an
   *  existing Context, and saves its current transformation state.
   * @param w
   *  The width of the bitmap.
   * @param h
   *  The height of the bitmap.
   * @param context
   *  <i>Optional</i>. You may create a Drawing from an existing Context.
   */
  var Drawing = function(){
    if (arguments[0] && arguments[1]) {
      this.ctx = new meta.Context(arguments[0], arguments[1])
    } else if (arguments[0]) {
      this.ctx = arguments[0]
    } else {
      throw new meta.exception.InvalidParameterException()
    }
    this.transform = this.ctx.getTransform()
  }

  /**
   * @method getBounds
   *  Returns the rect [x, y, w, h] describing the screen coordinates that
   *  entirely contain the drawing after applying its transform.
   * @return Array<<Number>>[4]
   */
  Drawing.prototype.getBounds = function() {
    var t,
        x1, x2, x3, x4,
        y1, y2, y3, y4,
        x1T, x2T, x3T, x4T,
        y1T, y2T, y3T, y4T,
        top, bottom, left, right

    t = this.transform
    x1 = y1 = x2 = y4 = 0
    y2 = y3 = this.ctx.canvas.height
    x3 = x4 = this.ctx.canvas.width

    x1T = t[0] * x1 + t[2] * y1 + t[4]
    y1T = t[1] * x1 + t[3] * y1 + t[5]
    x2T = t[0] * x2 + t[2] * y2 + t[4]
    y2T = t[1] * x2 + t[3] * y2 + t[5]
    x3T = t[0] * x3 + t[2] * y3 + t[4]
    y3T = t[1] * x3 + t[3] * y3 + t[5]
    x4T = t[0] * x4 + t[2] * y4 + t[4]
    y4T = t[1] * x4 + t[3] * y4 + t[5]

    top = Math.min(Math.min(Math.min(y1T, y2T), y3T), y4T)
    bottom = Math.max(Math.max(Math.max(y1T, y2T), y3T), y4T)
    left = Math.min(Math.min(Math.min(x1T, x2T), x3T), x4T)
    right = Math.max(Math.max(Math.max(x1T, x2T), x3T), x4T)

    return [left, top, right - left, bottom - top]
  }
 
  meta.mixSafely(meta, {
    Drawing: Drawing
  })

}(this.meta2d);
