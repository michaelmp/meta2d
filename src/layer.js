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

    /**
     * @method render
     * @param rect
     * @return [Layer]
     */
    this.render = function(rect) {
      var es = rtree_.search(rect).append(entities_),
          drawings = [];
      
      // Sort entities by their z-index
      es = es.sort();

      // Call each entity's ondraw method, allowing direct rendering onto
      // canvas, or return a drawing to use with cache.
      es.forEach(function(e) {
          if (e.draw) {
            drawings.push(e.draw);
          } else if (e.ondraw) {
            ctx_.save();
            drawings.push(e.ondraw.call(e, layer_));
            ctx_.restore();
          }
          });

      // Draw drawings onto cache blocks.
      drawings.forEach(function(d) {
          layer_.draw(d);
          });

      return this;
    };

    /**
     * @method makeDrawing
     *
     * @return [Drawing]
     */
    this.makeDrawing = function() {
      return {
        ctx: new meta.Context(),
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
      var bound = void 0;

      memos_.search(bound).forEach(function(b) {
          var itx = b.rect.intersect(d.rect);
          if (!itx) return;

          b.ctx.save();
          b.ctx.setTransform(t);
          b.ctx.drawImage(d.ctx.canvas, 0, 0);
          b.ctx.restore();
          });

      return this;
    };

    /**
     * @method memo
     * @param rect
     * @return [Layer]
     *  thisArg
     */
    this.memo = function(rect) {
      var newctx = new meta.Context();
      newctx.translate(-rect.x, -rect.y);
      memos_.add(rect, {
        ctx: new meta.Context(),
        rect: rect
      });
      return this;
    };

    /**
     * @method flip
     * @param rect
     * @return [meta::Layer]
     */
    this.flip = function(rect) {
      memos_.search(rect).forEach(function(b) {
          var itx = b.rect.intersect(rect);
          if (!itx) return;
          ctx_.save();
          identity_matrix(ctx_);
          ctx_.globalCompositeOperation = 'copy';
          ctx_.drawImage(
            b.ctx.canvas,
            itx.x - b.rect.x,
            itx.y - b.rect.y,
            itx.w,
            itx.h,
            itx.x - rect.x,
            itx.y - rect.y,
            itx.w,
            itx.h);
          ctx_.restore();
          });
      return this;
    };

    /**
     * @method erase
     * Erase pixel data onscreen and in cache without removing
     * cache.
     * @param [meta::math::Rect] rect
     * @return [meta::Layer]
     */
    this.erase = function(rect) {
      memos_.search(rect).forEach(function(b) {
          b.ctx.clearRect(rect);
          });

      return this;
    };

    /**
     * @method prune
     * Removes cache blocks inside of rect.
     * @param [meta::math::Rect] rect
     * @return [meta::Layer]
     */
    this.prune = function(rect) {
      memos_.searchWithin(rect).forEach(function(b) {
          memos_.remove(b.rect);
          });

      return this;
    };

    /**
     * @method crop
     * Removes cache blocks that do not intersect with rect.
     * @param [meta::math::Rect] rect
     * @return [meta::Layer]
     */
    this.crop = function(rect) {
      memos_.searchWithout(rect).forEach(function(b) {
          memos_.remove(b.rect);
          });

      return this;
    };

    /**
     * @method resize
     *  Change the size of the layer. While preserving the bitmap and
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
     * @param rect
     * A [meta2d::math::Rect].
     * @return [meta2d::Context]
     */
    this.reindex = function(rect) {
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
