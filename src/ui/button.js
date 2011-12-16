/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/ui/button.js
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
    var m = cx.measureText(this.value).width,
        padding = 5,
        w = (this.size && this.size[0]) || m + 2 * padding,
        h = (this.size && this.size[1]) || 14 + 2 * padding,
        sel = this.selected || this.selecting,
        ctx = new meta.Context(w, h),
        grad = ctx.createLinearGradient(0, 0, 0, h),
        sat = sel ? 10 : 10,
        lum = sel ? 55 : 85,
        fontcolor = sel ? 'white' : '#444',
        bordercolor = sel
          ? this.focused ? '#444' : '#444'
          : this.focused ? '#444' : '#ccc'

    grad.addColorStop(sel ? 1 : 0, meta.hsl(240, sat, lum + 10))
    grad.addColorStop(sel ? 0 : 1, meta.hsl(240, sat, lum))

    ctx.font = '14px sans'
    ctx.lineWidth = 1
    ctx.strokeStyle = bordercolor
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    ctx.strokeRect(0, 0, w, h)
    ctx.fillStyle = fontcolor
    ctx.fillText(this.value, w * 0.5 - m * 0.5, h * 0.7)

    this.draw = layer.makeDrawing(ctx)

    if (this.align === 'v') {
      this.offset = [this.draw.getBounds()[2], 0]
    } else if (this.align === 'h') {
      this.offset = [0, this.draw.getBounds()[3]]
    }

    return this.draw
  }

  proto.onmask = function() {
    if (this.draw) return this.mask = meta.mask.opaque(this.draw)
  }

  proto.onmouseover = function() {
    this.focused = true
    this.layer.repaint(this)
  }

  proto.onmouseout = function() {
    this.focused = false
    this.layer.repaint(this)
  }

  proto.cursor = 'pointer'

  meta.ui = meta.declareSafely(meta.ui)

  meta.ui.proto = meta.declareSafely(meta.ui.proto, {
    button: proto
  })

  meta.ui = meta.declareSafely(meta.ui, {
    button: function(e) {
      return meta.mixSafely(e, meta.ui.proto.button)
    }
  })

}(this.meta2d);
