/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/ui/selectable.js
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

  proto.onmask = function() {
    if (this.draw) return this.mask = meta.mask.opaque(this.draw)
  }

  proto.onmousedown = function() {
    this.selecting = true
    if (!this.selected && this.onselecting) {
      this.onselecting.call(this)
    } else if (this.onunselecting) {
      this.onunselecting.call(this)
    }
    this.layer.repaint(this)
  }

  proto.onmouseup = function() {
    if (!this.selecting) {
      return null
    }
    this.selecting = false

    this.selected = !this.selected
    if (this.selected && this.onselected) {
      this.onselected.call(this)
    } else if (this.onunselected) {
      this.onunselected.call(this)
    }
    this.layer.repaint(this)
  }

  // TODO: handle mouseup outside of entity

  meta.ui = meta.declareSafely(meta.ui)

  meta.ui.proto = meta.declareSafely(meta.ui.proto, {
    selectable: proto
  })

  meta.ui = meta.declareSafely(meta.ui, {
    selectable: function(e) {
      return meta.mixSafely(e, meta.ui.proto.selectable)
    }
  })

}(this.meta2d);
