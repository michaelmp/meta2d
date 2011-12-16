/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/ui/progress.js
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

  var proto = {}

  proto.ondraw = function(cx, layer) {
    cx.font = this.font || '14px sans'
    var w = this.size[0] || 100,
        h = this.size[1] || 24,
        ctx = new meta.Context(w, h),
        sat = 50,
        hue = 120,
        grad = ctx.createLinearGradient(0, 0, 0, h)

    grad.addColorStop(0.0, meta.hsl(hue, sat, 90))
    grad.addColorStop(0.2, meta.hsl(hue, sat, 65))
    grad.addColorStop(0.5, meta.hsl(hue, sat, 75))
    grad.addColorStop(1.0, meta.hsl(hue, sat, 65))

    ctx.font = cx.font
    ctx.lineWidth = 1
    ctx.strokeStyle = '#888'
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w * this.value/100, h)
    ctx.strokeRect(0, 0, w, h)
    ctx.fillStyle = '#444'
    ctx.fillText((this.value << 0) + '%', 4, h * 0.7)

    return this.draw = layer.makeDrawing(ctx)
  }

  meta.ui = meta.declareSafely(meta.ui)

  meta.ui.proto = meta.declareSafely(meta.ui.proto, {
    progress: proto
  })

  meta.ui = meta.declareSafely(meta.ui, {
    progress: function(e) {
      return meta.mixSafely(e, meta.ui.proto.progress)
    }
  })

}(this.meta2d);
