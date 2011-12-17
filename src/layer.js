/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/layer.js
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

  var CANVAS_STYLE = 'position: absolute; left:0px; top:0px;'

  var mask = function(e, x, y) {
    if (e.mask) return e.mask.overlaps(x, y)
    if (!e.onmask) return false
    var m = e.onmask.call(e)
    if (!m) return false
    return m.overlaps(x, y)
  }

  /**
   * @class Layer
   *  <p>
   *  A Layer represents one slice of a composed drawing area. Layers are
   *  visually sorted by their <i>z</i> property, with higher-valued layers
   *  overlapping lower-valued layers.
   *  </p>
   *
   *  <p>
   *  Layers store visual entities and are responsible for controlling the
   *  entity scene graph.
   *  </p>
   *
   *  <p>
   *  Every layer contains one on-screen canvas element to which it draws
   *  graphics. This canvas can be drawn to directly with the <b>getContext()
   *  </b> method, or indirectly with <b>draw()</b> and <b>flip()</b>.
   *  </p>
   *
   *  <p>
   *  Layers provide controlled access to the on-screen canvas through a
   *  backbuffer. Using the backbuffer requires additional copying of graphic
   *  data, but allows for sane sharing of a single canvas.
   *  </p>
   *
   *  <p>
   *  Entities that define a <i>draw</i> property are included in the scene
   *  graph rendering. The rendering process includes any children entities of a
   *  drawn entity.
   *  </p>
   *
   *  <code>
   *  mcx.put('', {
   *    ondraw: function(cx) {
   *      cx.fillRect(0, 0, 100, 100)
   *    }
   *  })
   *  
   *  mcx.repaint()
   *  <hr>
   *  var drawing = ...
   *  
   *  mcx.put('', {
   *    draw: drawing
   *  })
   *  
   *  mcx.repaint()
   *  </code>
   */

  /**
   * @constructor
   *
   * @param mcx
   * @param options
   */
  var Layer = function(mcx, options) {
    if (!options || !options.w || !options.h)
      throw new meta.exception.InvalidParameterException()

    var layer_ = this,
        entities_ = [],
        parallax_ = (options && options.parallax) || 1,
        parent_ = (mcx && mcx.getRootNode()),
        rtree_ = new meta.RTree((options && options.branch) || 10),
        treehash_ = {},
        zorder_ = (options && options.z) || 0,
        memos_ = new meta.RCache((options && options.rblocks)),
        ctx_

    // Allow entity and child entites to draw directly.
    // Return array of all drawings to render()
    var recursive_render = function(e) {
      var drawings = [],
          children = e.children || [],
          d,
          font = []

      children = meta.zsort(children)

      // Transformations do not affect sibling entities.
      ctx_.save()

      // Apply entity transformations.
      if (e.pos) ctx_.translate(e.pos[0], e.pos[1])
      if (meta.def(e.angle)) ctx_.rotate(e.angle)
      if (meta.def(e.zoom)) ctx_.scale(e.zoom, e.zoom)
      
      // Global state properties.
      if (meta.def(e.alpha)) ctx_.globalAlpha = e.alpha
      if (meta.def(e.composite)) ctx_.globalCompositeOperation = e.composite

      // Set the font.
      if (e.font) {
        font.push(e.font)
      } else {
        if (e.fontstyle) font.push(e.fontstyle)
        if (e.fontweight) font.push(e.fontweight)
        if (e.fontsize) font.push(e.fontsize)
        if (e.fontfamily) font.push(e.fontfamily)
      }
      ctx_.font = font.join(' ')

      if (e.draw) {
        drawings.push(e.draw)
      } else if (e.ondraw) {
        d = e.ondraw.call(e, ctx_, layer_)
        if (d) drawings.push(d)
      }

      // Recurse on any children.
      children.forEach(function(e) {
        drawings = drawings.concat(recursive_render(e))
      })

      ctx_.restore()

      // Affect sibling position.
      if (e.parent && e.offset) {
        ctx_.translate(e.offset[0], e.offset[1])
      }

      return drawings
    }

    /**
     * @method render
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return Layer
     */
    this.render = function(x, y, w, h) {
      var rect = [
        x || 0,
        y || 0,
        w || this.getWidth(),
        h || this.getHeight()
      ]
      var es = rtree_.search(rect).concat(entities_),
          drawings = []
      
      // Only start with top-level entities. Recurse to children.
      es = es.filter(function(e) {return !e.parent})

      // Sort by 'z' property.
      es = meta.zsort(es)

      // Call each entity's ondraw method, allowing direct rendering onto
      // canvas, or return a drawing to use with cache.
      es.forEach(function(e) {
          drawings = drawings.concat(recursive_render(e))
          })

      // Draw drawings onto any memo blocks.
      drawings.forEach(function(d) {
          layer_.draw(d)
          })

      return this
    }

    /**
     * @method makeDrawing
     *
     * @param ctx
     *
     * @return Drawing
     */
    this.makeDrawing = function() {
      var d = new meta.Drawing(arguments[0], arguments[1])

      // Copy certain properties from layer context.
      d.ctx.globalAlpha = ctx_.globalAlpha
      d.ctx.globalCompositeOperation = ctx_.globalCompositeOperation
      d.transform = ctx_.getTransform()

      return d
    }

    /**
     * @method draw
     * @param drawing
     * @return Layer
     *  thisArg
     */
    this.draw = function(d) {
      var bound = d.getBounds()

      memos_.search(bound).forEach(function(b) {
          b.ctx.save()

          // Draw to block-local coordinates.
          b.ctx.translate(-b.rect[0], -b.rect[1])

          // Apply the drawing's transformation.
          b.ctx.transform.apply(b.ctx, d.transform)

          // Apply alpha.
          b.ctx.globalAlpha = d.ctx.globalAlpha
          b.ctx.globalCompositeOperation = d.ctx.globalCompositeOperation

          b.ctx.drawImage(d.ctx.canvas, 0, 0)

          b.ctx.restore()
          })

      return this
    }

    /**
     * @method memo
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return Layer
     *  thisArg
     */
    this.memo = function(x, y, w, h) {
      var rect = [
        x || 0,
        y || 0,
        w || this.getWidth(),
        h || this.getHeight()
      ]

      memos_.add(rect, {
        ctx: new meta.Context(rect[2], rect[3]),
        rect: rect
      })

      return this
    }

    /**
     * @method flip
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return Layer
     */

    // I would like to use 'copy' here but FF does not respect the clipping
    // region in composite operations.
    //
    // 24 May '11
    // hixie: "They are to be applied as part of the drawing model, at which
    // point the clipping region is also applied. (Without a clipping region,
    // these operators act on the whole bitmap with every operation)."
    // http://dev.w3.org/html5/2dcontext/Overview.html#compositing
    //
    // 22 Oct '11
    // roc@moz: "It's crystal clear that what we currently implement is what
    // the spec currently requires."
    // https://bugzilla.mozilla.org/show_bug.cgi?id=366283
    //
    // By my reading, Chrome is wrong because they take the destination
    // rect as an implicit clipping region, even though it is not part of
    // the drawing model.
    //
    // FF is also wrong, because the clipping region has no effect for copy
    // and several other composition types.
    //
    this.flip = function(x, y, w, h) {
      var rect = [
        (x || 0) + mcx.camera()[0],
        (y || 0) + mcx.camera()[1],
        w || this.getWidth(),
        h || this.getHeight()
      ]

      memos_.search(rect).forEach(function(b) {
          var itx = meta.math.rect.intersect(b.rect, rect)
          if (!itx) return

          // Make sure flipped edges are consistent.
          itx = itx.map(meta.floor)

          ctx_.save()

          // Ignore the transformation state in use by user.
          ctx_.setTransform.apply(ctx_, meta.math.affine.identity())

          // Erase the target area.
          ctx_.clearRect(
            itx[0] - mcx.camera()[0],
            itx[1] - mcx.camera()[1],
            itx[2],
            itx[3])

          // Copy the source area.
          ctx_.globalCompositeOperation = 'source-over'
          ctx_.drawImage(
            b.ctx.canvas,
            itx[0] - b.rect[0],
            itx[1] - b.rect[1],
            itx[2],
            itx[3],
            itx[0] - mcx.camera()[0],
            itx[1] - mcx.camera()[1],
            itx[2],
            itx[3])

          ctx_.restore()
          })

      return this
    }

    /**
     * @method erase
     * Erase pixel data in memos.
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return Layer
     */
    this.erase = function(x, y, w, h) {
      var rect = [
        x || 0,
        y || 0,
        w || this.getWidth(),
        h || this.getHeight()
      ]

      memos_.search(rect).forEach(function(b) {
          var itx = meta.math.rect.intersect(b.rect, rect)
          if (!itx) return
          b.ctx.clearRect(
            meta.round(itx[0] - b.rect[0]),
            meta.round(itx[1] - b.rect[1]),
            meta.round(itx[2]),
            meta.round(itx[3]))
          })

      return this
    }

    /**
     * @method prune
     * Removes cache blocks inside of rect.
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return [meta::Layer]
     */
    this.prune = function(x, y, w, h) {
      if (arguments.length < 4) {
        memos_ = new meta.RCache((options && options.rblocks))
        return this
      }

      var rect = [
        x || 0,
        y || 0,
        w || this.getWidth(),
        h || this.getHeight()
      ]

      memos_.pluckInside(rect)

      return this
    }

    /**
     * @method crop
     * Removes cache blocks that do not intersect with rect.
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return [meta::Layer]
     */
    this.crop = function(x, y, w, h) {
      var rect = [
        x || 0,
        y || 0,
        w || this.getWidth(),
        h || this.getHeight()
      ]

      memos_.pluckOutside(rect)

      return this
    }

    /**
     * @method repaint
     *
     * Very simple, potentially expensive, render & flip.
     *
     * @return [Layer]
     */
    this.repaint = function() {
      var d, b
      if (arguments.length === 1) {
        d = arguments[0].draw
        if (d) {
          b = d.getBounds()
          delete arguments[0].draw
          this.erase.apply(this, b)
          this.render.apply(this, b)
          this.flip.apply(this, b)
        } else {
          this.erase(0, 0, this.getWidth(), this.getHeight())
          this.render(0, 0, this.getWidth(), this.getHeight())
          this.flip(0, 0, this.getWidth(), this.getHeight())
        }
      } else if (arguments.length === 4) {
        this.erase.apply(this, arguments)
        this.render.apply(this, arguments)
        this.flip.apply(this, arguments)
      } else {
        this.erase(0, 0, this.getWidth(), this.getHeight())
        this.render(0, 0, this.getWidth(), this.getHeight())
        this.flip(0, 0, this.getWidth(), this.getHeight())
      }
      return this
    }

    /**
     * @method resize
     *  Change the size of the layer while preserving the bitmap and
     *  transformation matrix. Other state is lost, including the stack.
     *
     * @param w
     *  Pixel width as a [Number].
     * @param h
     *  Pixel height as a [Number].
     *
     * @return [Layer]
     *  thisArg
     */
    this.resize = function(w, h) {
      var t, bitmap

      // Remove the old canvas from the DOM.
      if (ctx_) {
        parent_.removeChild(ctx_.canvas)
        t = ctx_.getTransform(),
        bitmap = ctx_.canvas
      }

      // Create a new canvas & context, copying old bitmap & transform
      // if possible.
      ctx_ = new meta.Context(w, h)
      if (bitmap) ctx_.drawImage(bitmap, 0, 0)
      if (t) ctx_.setTransform.apply(ctx_, t)

      // Reassert the old z-order in the new canvas style.
      this.z(this.z())

      // Insert new canvas into the DOM.
      parent_.appendChild(ctx_.canvas)
    }

    /**
     * @method getContext
     * @return [Context]
     */
    this.getContext = function() {
      return ctx_
    }

    /**
     * @method put
     *  Store an entity in the layer, indexing if bounds are defined.
     * 
     * @param e
     *  The entity to store.
     *
     * @return [Layer]
     *  thisArg
     */
    this.put = function(e) {
      if (!e) throw new meta.exception.InvalidParameterException()
      if (e.bound) {
        rtree_.insert(e.bound, e)
      } else if (e.onbound) {
        rtree_.insert(e.onbound.call(e), e)
      } else {
        entities_.push(e)
      }
      return this
    }

    /**
     * @method pick
     *  Returns an array of entities that overlap the given Context-relative
     *  pixel coordinates, as determined by their <i>onmask</i> property.
     *
     * @param x
     *  The relative distance from the left of the contained Context.
     *
     * @param y
     *  The relative distance from the top of the contained Context.
     *
     * @return Array
     */
    this.pick = function(x, y) {
      x += mcx.camera()[0]
      y += mcx.camera()[1]
      var es = rtree_.search([x, y, 1, 1]).concat(entities_)
      var filtered = es.filter(
          (function(e) {return mask(e, x, y)}).bind(void 0))
      return filtered
    }

    /**
     * @method parallax
     * @param p
     * @return [Number]
     */
    this.parallax = function(p) {
      if (meta.undef(p))
        return parallax_
      parallax_ = p
      return this
    }

    /**
     * @method getRootNode
     * @return [HTMLElement]
     */
    this.getRootNode = function() {
      return parent_
    }

    /**
     * @method getHeight
     * @return [Number]
     */
    this.getHeight = function() {
      return ctx_.canvas.height
    }

    /**
     * @method getWidth
     * @return [Number]
     */
    this.getWidth = function() {
      return ctx_.canvas.width
    }

    /**
     * @method z
     * @return [Number]
     */
    this.z = function(z) {
      if (meta.undef(z))
        return zorder_

      zorder_ = z
      ctx_.canvas.setAttribute('style',
          CANVAS_STYLE + ' z-index: ' + z + '')

      return this
    }

    /**
     * @method index
     * @return [meta::Layer]
     */
    this.index = function() {
      var es = this.getUnindexedEntities()
      es.forEach(function(e, idx, array) {
          var b = e.bound
          if (!b && e.onbound) b = e.onbound.call(e.model)
          if (!b) return
          rtree_.insert(b, e)
          delete array[idx]
          }, this)
      this.setUnindexedEntities(es.filter(meta.def))
      return this
    }

    /**
     * @method reindex
     * Index any unindexed entities by their bounding logic.
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return [meta2d::Context]
     */
    this.reindex = function(x, y, w, h) {
      var rect = [x, y, w, h]

      if (meta.undef(rect))
        throw new meta.exception.
          InvalidParameterException('rect', rect)
      rtree_.remove(rect).forEach(function(e) {
          this.addEntity(e)
          }, this)
      this.index()

      return this
    }

    /**
     * @method getUnindexedEntities
     * @return [Array<meta::Entity>]
     */
    this.getUnindexedEntities = function() {
      return entities_.slice(0) // Return a copy of the array.
    }

    /**
     * @method setUnindexedEntities
     * @param [Array<meta::Entity>]
     * @return [meta::Context]
     */
    this.setUnindexedEntities = function(array) {
      if (meta.undef(array))
        throw new meta.exception.
          InvalidParameterException('array', array)
      entities_ = array
      return this
    }

    // Create a canvas and insert it into the DOM.
    this.resize(options.w, options.h)

  }

  meta.mixSafely(meta, {
    Layer: Layer,
  })

}(this.meta2d);
