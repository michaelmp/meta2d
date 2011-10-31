(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var DEFAULT_STYLE = 'position: absolute; left:0px; top:0px;';

  var round = function(val) {
    return (0.5 + val) << 0;
  };

  /**
   * Native context attributes that can be manipulated, minus the
   * transformation matrix.
   * @see http://dev.w3.org/html5/2dcontext/Overview.html
   *   #conformance-requirements
   */
  var CONTEXT_ATTRIBUTES = {
    canvas: void 0,
    globalAlpha: void 0,
    globalCompositeOperation: void 0,
    strokeStyle: void 0,
    fillStyle: void 0,
    lineWidth: void 0,
    lineCap: void 0,
    lineJoin: void 0,
    miterLimit: void 0,
    shadowOffsetX: void 0,
    shadowOffsetY: void 0,
    shadowBlur: void 0,
    shadowColor: void 0
  };
  var CONTEXT_ATTRIBUTES_RO = {
    canvas: void 0
  };

  var apply_context_attributes = function(dctx, sctx) {
    for (p in CONTEXT_ATTRIBUTES) {
      if (p in CONTEXT_ATTRIBUTES_RO) continue;
      dctx[p] = sctx[p];
    }
  };

  var identity_matrix = function(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  /**
   * @class Layer
   * 
   * A context onto which graphics are drawn and objects are stored. Layers are
   * drawn low to high z-order (higher overlaps lower).
   *
   * @constructor
   * @param [DOMElement] parent
   * @param [{w, h, parallax, z}] params
   */
  var Layer = function(parent, params) {
    if (meta.undef(params))
      throw new meta.exception.
        InvalidParameterException('params', params);
    if (meta.undef(parent))
      throw new meta.exception.
        InvalidParameterException('parent', parent);

    // Private members
    var layer_ = this,
        entities_ = [],
        parallax_ = params.parallax || void 0,
        parent_ = parent,
        rtree_ = new meta.RTree((params && params.branch) || 10),
        treehash_ = {},
        zorder_ = params.z || 0,
        canvas_ = document.createElement('canvas'),
        rendered_ = new meta.RCache(params.rblocks),
        ctx_;

    canvas_.width = params.w;
    canvas_.height = params.h;
    canvas_.setAttribute('style', DEFAULT_STYLE);
    ctx_ = canvas_.getContext('2d');

    /**
     * @privileged
     * @method render
     * @param [meta::math::Rect] rect
     * @return [meta::Layer]
     */
    this.render = function(rect) {
      var bs = rendered_.search(rect),
          es = rtree_.search(rect).append(entities_),
          drawings = [];
      
      //TODO sort es by z-index

      // call each entity's ondraw,
      // allow direct rendering onto main canvas,
      // store returned drawings
      es.forEach(function(e) {
          if (!('draw' in e)) return;
          drawings.push(e.draw.call(e, layer_));
          });

      // copy all drawings to all intersecting cache blocks,
      // applying onscreen coordinate transformation.
      drawings.forEach(function(d) {
          if (meta.undef(d)) return;
          bs.forEach(function(b) {
              var itx = b.rect.intersect(d.rect);
              if (!itx) return;
              b.ctx.drawImage(
                d.canvas,
                itx.x - d.rect.x,
                itx.y - d.rect.y,
                itx.w,
                itx.h,
                itx.x - b.rect.x,
                itx.y - b.rect.y,
                itx.w,
                itx.h);
              });
          });

      return this;
    };

    /**
     * @privileged
     * @method flip
     * @return [meta::Layer]
     */
    this.flip = function() {
      var vis = this.getVisibleRect(),
          bs = rendered_.search(rect);

      bs.forEach(function(b) {
          var itx = b.rect.intersect(rect);
          if (!itx) return;
          ctx_.save();
          identity_matrix(ctx_);
          ctx_.globalCompositeOperation = 'copy';
          ctx_.drawImage(
            b.canvas,
            itx.x - b.rect.x,
            itx.y - b.rect.y,
            itx.w,
            itx.h,
            itx.x - vis.x,
            itx.y - vis.y,
            itx.w,
            itx.h);
          ctx_.restore();
          });

      return this;
    };

    /**
     * @privileged
     * @method createDrawing
     * Copies the context state to a new context with specified output
     * geometry applied to transformation.
     * @param [meta::math::Rect] rect
     * @return [{canvas, ctx, rect}]
     */
    this.createDrawing = function(rect) {
      var canvas = document.createElement('canvas'),
          ctx;

      canvas.width = rect.w;
      canvas.height = rect.h;
      ctx = canvas.getContext('2d');
      ctx.translate(-rect.x, -rect.y);
      apply_context_attributes(ctx, ctx_);

      return {
        canvas: canvas,
        context: ctx,
        rect: rect
      };
    };

    /**
     * @privileged
     * @method clear
     * Erase pixel data onscreen and in cache without removing
     * cache.
     * @param [meta::math::Rect] rect
     * @return [meta::Layer]
     */
    this.clear = function(rect) {
      rendered_.search(rect).forEach(function(b) {
          b.ctx.clearRect(rect);
          });

      return this;
    };

    /**
     * @privileged
     * @method prune
     * Removes cache blocks inside of rect.
     * @param [meta::math::Rect] rect
     * @return [meta::Layer]
     */
    this.prune = function(rect) {
      rendered_.searchWithin(rect).forEach(function(b) {
          rendered_.remove(b.rect);
          });

      return this;
    };

    /**
     * @privileged
     * @method crop
     * Removes cache blocks that do not intersect with rect.
     * @param [meta::math::Rect] rect
     * @return [meta::Layer]
     */
    this.crop = function(rect) {
      rendered_.searchWithout(rect).forEach(function(b) {
          rendered_.remove(b.rect);
          });

      return this;
    };

    /**
     * @privileged
     * @method resize
     * @param [{w, h}] params
     * @return [meta::Layer]
     */
    this.resize = function(params) {
      canvas_.width = params.w;
      canvas_.height = params.h;
      ctx_ = canvas_.getContext('2d');
    };

    /**
     * @privileged
     * @method getNativeContext
     * @return [CanvasRenderingContext2D]
     */
    this.getNativeContext = function() {
      return ctx_;
    };

    /**
     * @privileged
     * @method addEntity
     * @param [meta::Context] ctx
     * @param [meta::Entity] e
     * @param [meta::math::Rect] bound [optional]
     * @return [meta::Layer]
     */
    this.addEntity = function(ctx, e, bound) {
      if (meta.undef(e))
        throw new meta.exception.
          InvalidParameterException('e', e);
      if (meta.def(bound)) {
        e.data.bound = bound;
        this.rtree.insert(bound, e);
      } else if (meta.def(e.bound)) {
        e.data.bound = e.bound.call(e, ctx);
        this.rtree.insert(e.data.bound, e);
      } else {
        entities_.push(e);
      }
      return this;
    };

    /**
     * @privileged
     * @method getUnindexedEntities
     * @return [Array<meta::Entity>]
     */
    this.getUnindexedEntities = function() {
      return entities_.slice(0); // Return a copy of the array.
    };

    /**
     * @privileged
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

    /**
     * @privileged
     * @method getParallax
     * @return [Number]
     */
    this.getParallax = function() {
      return parallax_;
    };

    /**
     * @privileged
     * @method setParallax
     * @param [Number] value
     * @return [meta::Layer]
     */
    this.setParallax = function(value) {
      if (meta.undef(value))
        throw new meta.exception.
          InvalidParameterException('value', value);
      parallax_ = value;
      return this;
    };

    /**
     * @privileged
     * @method getParent
     * @return [HTMLElement]
     */
    this.getParent = function() {
      return parent_;
    };

    /**
     * @privileged
     * @method getHeight
     * @return [Number]
     */
    this.getHeight = function() {
      return canvas_.height;
    };

    /**
     * @privileged
     * @method getWidth
     * @return [Number]
     */
    this.getWidth = function() {
      return canvas_.width;
    };

    /**
     * @privileged
     * @method getZ
     * @return [Number]
     */
    this.getZ = function() {
      return zorder_;
    };

    /**
     * @privileged
     * @method setZ
     * @param [Number]
     * @return [meta::Layer]
     */
    this.setZ = function(value) {
      if (meta.undef(value))
        throw new meta.exception.
          InvalidParameterException('value', value);
      zorder_ = value;
      this.getNativeCanvas().setAttribute('style',
        DEFAULT_STYLE + ' z-index: ' + value + ';');
      return this;
    };

    /**
     * @privileged
     * @method getContextAttribute
     * @param [String] name
     * @return [any | undefined]
     */
    this.getContextAttribute = function(name) {
      if (name in CONTEXT_ATTRIBUTES)
        return ctx_[name];
      return void 0;
    };

    /**
     * @privileged
     * @method setContextAttribute
     * @param [String] name
     * @param [any] value
     * @return [meta::Context]
     */
    this.setContextAttribute = function(name, value) {
      if (name in CONTEXT_ATTRIBUTES_RO)
        throw new meta.exception.
          ReadOnlyAttributeException(name);
      if (name in CONTEXT_ATTRIBUTES) {
        ctx_[name] = value;
        return this;
      }
      throw new meta.exception.
        NonconformantAttributeException(name);
    };

    /**
     * @method index
     * @param [meta::Context] ctx
     * @return [meta::Layer]
     */
    this.index = function(ctx) {
      var es = this.getUnindexedEntities();
      es.forEach(function(e, idx, array) {
          if (!('bound' in e)) return;
          e.data.bound = e.bound.call(e, ctx);
          rtree_.insert(e.data.bound, e);
          delete array[idx];
          }, this);
      this.setUnindexedEntities(es.filter(meta.def));
      return this;
    };

    /**
     * @method reindex
     * @param [meta::Context] ctx
     * @param [meta::math::Rect] rect
     * @return [meta::Layer]
     */
    this.reindex = function(ctx, rect) {
      if (meta.undef(rect))
        throw new meta.exception.
          InvalidParameterException('rect', rect);
      rtree_.remove(rect).forEach(function(e) {
          this.addEntity(ctx, e);
          }, this);
      this.index();

      return this;
    };

    // Insert this layer's main canvas into the DOM.
    parent_.appendChild(canvas_);
  };

  /**
   * @method getVisibleRect
   * Given a [meta::Context] with possible camera/zoom transformations,
   * computes the rectangle of screen coordinates that would be visible
   * inside the native context after these transformations.
   * @param [meta::Context]
   * @return [meta::math::Rect]
   */
  Layer.prototype.getVisibleRect = function(ctx) {
    if (meta.undef(ctx))
      throw new meta.exception.
        InvalidParameterException('ctx', ctx);
    var pos,
        offset,
        rect = {
          x: 0,
          y: 0,
          w: this.getWidth(),
          h: this.getHeight()
        },
        camera = ctx.getCamera(),
        parallax = this.getParallax();

    if (meta.def(camera) && meta.def(parallax)) {
      pos = ctx.getCameraProjection().forward.call(ctx, ctx.getCamera());
      offset = {
        x: pos.e(1) * this.getParallax.e(1),
        y: pos.e(2) * this.getParallax.e(2)
      };
      rect.x += offset.x;
      rect.y += offset.y;
    }

    return rect;
  };

  meta.Layer = Layer;

}).call(this);

