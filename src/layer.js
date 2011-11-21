/** layer.js
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

  var CANVAS_STYLE = 'position: absolute; left:0px; top:0px;';

  var identity_matrix = function(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  var get_bounds = function(drawing) {
    var t = drawing.transform,
        x1 = 0,
        y1 = 0,
        x2 = 0,
        y2 = drawing.ctx.canvas.height,
        x3 = drawing.ctx.canvas.width,
        y3 = drawing.ctx.canvas.height,
        x4 = drawing.ctx.canvas.width,
        y4 = 0,
        x1T = t[0] * x1 + t[2] * y1 + t[4],
        y1T = t[1] * x1 + t[3] * y1 + t[5],
        x2T = t[0] * x2 + t[2] * y2 + t[4],
        y2T = t[1] * x2 + t[3] * y2 + t[5],
        x3T = t[0] * x3 + t[2] * y3 + t[4],
        y3T = t[1] * x3 + t[3] * y3 + t[5],
        x4T = t[0] * x4 + t[2] * y4 + t[4],
        y4T = t[1] * x4 + t[3] * y4 + t[5],
        top = meta.min(y1T, y2T, y3T, y4T),
        bottom = meta.max(y1T, y2T, y3T, y4T),
        left = meta.min(x1T, x2T, x3T, x4T),
        right = meta.max(x1T, x2T, x3T, x3T);

    return [left, top, right - left, bottom - top];
  };

  /**
   * @class Layer
   */

  /**
   * @constructor
   *
   * @param mcx
   * @param options
   */
  var Layer = function(mcx, options) {
    var layer_ = this,
        entities_ = [],
        parallax_ = (options && options.parallax) || 1,
        parent_ = (mcx && mcx.getRootNode()),
        rtree_ = new meta.RTree((options && options.branch) || 10),
        treehash_ = {},
        zorder_ = (options && options.z) || 0,
        memos_ = new meta.RCache((options && options.rblocks)),
        ctx_ = new meta.Context(
            (options && options.w), (options && options.h));

    // Allow entity and child entites to draw directly.
    // @return array of all drawings.
    var recursive_render = function(e) {
      var drawings = [],
          children = e.children || [],
          d;

      // TODO: Sort children by z
      children = children.sort();

      // Transformations do not affect sibling entities.
      ctx_.save();

      // Apply entity transformations.
      if (e.pos) ctx_.translate(e.pos[0], e.pos[1]);
      if (meta.def(e.angle)) ctx_.rotate(e.angle);
      if (meta.def(e.zoom)) ctx_.scale(e.zoom, e.zoom);

      d = e.ondraw.call(e.model, ctx_, layer_);
      if (d) drawings.push(d);

      // Recurse on any children.
      children.forEach(function(e) {
          drawings = drawings.concat(render_entity(e));
          });

      ctx_.restore();

      return drawings;
    }

    /**
     * @method render
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return [Layer]
     */
    this.render = function(x, y, w, h) {
      var es = rtree_.search([x, y, w, h]).concat(entities_),
          drawings = [];
      
      // TODO: Sort entities by z
      es = es.sort();

      // Call each entity's ondraw method, allowing direct rendering onto
      // canvas, or return a drawing to use with cache.
      es.forEach(function(e) {
          drawings = drawings.concat(recursive_render(e));
          });

      // Draw drawings onto any memo blocks.
      drawings.forEach(function(d) {
          layer_.draw(d);
          });

      return this;
    };

    /**
     * @method makeDrawing
     *
     * @param ctx
     *
     * @return [Drawing]
     */
    this.makeDrawing = function() {
      var ctx;

      if (arguments.length === 2) {
        ctx = new meta.Context(arguments[0], arguments[1]);
      } else if (arguments.length === 1) {
        ctx = arguments[0];
      } else {
        throw new meta.exception.InvalidParameterException();
      }

      return {
        ctx: ctx,
        transform: ctx_.getTransform()
      };
    };

    /**
     * @method draw
     * @param drawing
     * @return [Layer]
     *  thisArg
     */
    this.draw = function(d) {
      var bound = get_bounds(d);

      memos_.search(bound).forEach(function(b) {
          b.ctx.save();
          b.ctx.translate(-b.rect[0], -b.rect[1]);
          b.ctx.transform.apply(b.ctx.transform, d.transform);
          b.ctx.drawImage(d.ctx.canvas, 0, 0);
          b.ctx.restore();
          });

      return this;
    };

    /**
     * @method memo
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return [Layer]
     *  thisArg
     */
    this.memo = function(x, y, w, h) {
      var rect = [x, y, w, h];

      memos_.add(rect, {
        ctx: new meta.Context(rect[2], rect[3]),
        rect: rect
      });

      return this;
    };

    /**
     * @method flip
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return [meta::Layer]
     */

    // I would like to use 'copy' here but FF does not respecting the clipping
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
      var rect = [x, y, w, h]
      memos_.search(rect).forEach(function(b) {
          var itx = meta.math.rect.intersect(b.rect, rect);
          if (!itx) return;
          ctx_.save();
          identity_matrix(ctx_);
          ctx_.clearRect(
            itx[0] - rect[0],
            itx[1] - rect[1],
            itx[2],
            itx[3]);
          ctx_.globalCompositeOperation = 'source-over';
          ctx_.drawImage(
            b.ctx.canvas,
            itx[0] - b.rect[0],
            itx[1] - b.rect[1],
            itx[2],
            itx[3],
            itx[0] - rect[0],
            itx[1] - rect[1],
            itx[2],
            itx[3]);
          ctx_.restore();
          });
      return this;
    };

    /**
     * @method erase
     * Erase pixel data onscreen and in cache without removing
     * cache.
     *
     * @param x
     * @param y
     * @param w
     * @param h
     *
     * @return [meta::Layer]
     */
    this.erase = function(x, y, w, h) {
      var rect = [x, y, w, h];

      memos_.search(rect).forEach(function(b) {
          b.ctx.clearRect.apply(b.ctx, rect);
          });

      return this;
    };

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
      var rect = [x, y, w, h];

      memos_.pluckInside(rect);

      return this;
    };

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
      var rect = [x, y, w, h];

      memos_.pluckOutside(rect);

      return this;
    };

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
      var t = ctx_.getTransform(),
          bitmap = ctx_.canvas;
      ctx_ = new meta.Context(w, h);
      ctx_.drawImage(bitmap, 0, 0);
      ctx_.setTransform(t);
    };

    /**
     * @method getContext
     * @return [Context]
     */
    this.getContext = function() {
      return ctx_;
    };

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
      if (!e) throw new meta.exception.InvalidParameterException();
      if (e.bound) {
        this.rtree.insert(e.bound, e);
      } else if (e.onbound) {
        this.rtree.insert(e.onbound.call(e), e);
      } else {
        entities_.push(e);
      }
      return this;
    };

    /**
     * @method parallax
     * @param p
     * @return [Number]
     */
    this.parallax = function(p) {
      if (meta.undef(p))
        return parallax_;
      parallax_ = p;
      return this;
    };

    /**
     * @method getRootNode
     * @return [HTMLElement]
     */
    this.getRootNode = function() {
      return parent_;
    };

    /**
     * @method getHeight
     * @return [Number]
     */
    this.getHeight = function() {
      return ctx_.canvas.height;
    };

    /**
     * @method getWidth
     * @return [Number]
     */
    this.getWidth = function() {
      return ctx_.canvas.width;
    };

    /**
     * @method z
     * @return [Number]
     */
    this.z = function(z) {
      if (meta.undef(z))
        return zorder_;

      zorder_ = z;
      ctx_.canvas.setAttribute('style',
          CANVAS_STYLE + ' z-index: ' + z + ';');

      return this;
    };

    /**
     * @method index
     * @return [meta::Layer]
     */
    this.index = function() {
      var es = this.getUnindexedEntities();
      es.forEach(function(e, idx, array) {
          if (!('bound' in e)) return;
          e.data.bound = e.bound.call(e);
          rtree_.insert(e.data.bound, e);
          delete array[idx];
          }, this);
      this.setUnindexedEntities(es.filter(meta.def));
      return this;
    };

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
      var rect = [x, y, w, h];

      if (meta.undef(rect))
        throw new meta.exception.
          InvalidParameterException('rect', rect);
      rtree_.remove(rect).forEach(function(e) {
          this.addEntity(e);
          }, this);
      this.index();

      return this;
    };

    /**
     * @method getUnindexedEntities
     * @return [Array<meta::Entity>]
     */
    this.getUnindexedEntities = function() {
      return entities_.slice(0); // Return a copy of the array.
    };

    /**
     * @method setUnindexedEntities
     * @param [Array<meta::Entity>]
     * @return [meta::Context]
     */
    this.setUnindexedEntities = function(array) {
      if (meta.undef(array))
        throw new meta.exception.
          InvalidParameterException('array', array);
      entities_ = array;
      return this;
    };

    // Insert this layer's main canvas into the DOM.
    parent_.appendChild(ctx_.canvas);
  };

  meta.mixSafely(meta, {
    Layer: Layer,
  });

}).call(this);
