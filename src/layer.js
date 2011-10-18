(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var DEFAULT_STYLE = 'position: absolute; left:0px; top:0px;';

  var round = function(val) {
    return (0.5 + val) << 0;
  };

  // @static
  // Context properties that should not be mutable by layer.
  var READ_ONLY = {
    canvas: void 0;
  };

  /**
   * @class Layer
   * 
   * A context onto which graphics are drawn and objects are stored. Layers are
   * drawn low to high z-order (higher overlaps lower).
   *
   * @param parent -- HTML element
   * @param params -- parameters
   *
   * @constructor
   */
  var Layer = function(parent, params) {
    var cache_ = meta.cache.IGNORE;
    var corrupt_ = false;
    var objects_ = [];
    var parallax_ = null;
    var parent_ = parent;
    var rtree_ = new meta.RTree((params && params.branch) || 10);
    var treehash_ = {};
    var zorder_ = 0;

    this.getCacheCode = function() {
      return cache_;
    };
    this.setCacheCode = function(value) {
      if (meta.undef(value))
        throw new meta.exception.
          InvalidParameterException('value', value);
      cache_ = value;
      return this;
    };

    this.isCorrupt = function() {
      return corrupt_;
    };

    // put objects
    // retrieve objects

    this.getParallax = function() {
      return parallax_;
    };
    this.setParallax = function(value) {
      if (meta.undef(value))
        throw new meta.exception.
          InvalidParameterException('value', value);
      parallax_ = value;
      return this;
    };

    this.getParent() = function() {
      return parent_;
    };

    this.getZ = function() {
      return zorder_;
    };
    this.setZ = function(value) {
      if (meta.undef(value))
        throw new meta.exception.
          InvalidParameterException('value', value);
      zorder_ = value;
      this.getNativeCanvas().setAttribute('style',
        DEFAULT_STYLE + ' z-index: ' + value + ';');
      return this;
    };

    var canvas_ = document.createElement('canvas');
    var buffer_ = document.createElement('canvas');
    canvas_.width = buffer_.width = this.w = params.w;
    canvas_.height = buffer_.height = this.h = params.h;
    canvas_.setAttribute('style', DEFAULT_STYLE);
    var context_ = canvas_.getContext('2d');
    var buffercontext_ = buffer_.getContext('2d');

    this.getNativeContext = function() {
      return context_;
    };

    /**
     * Default values as specified in Conformance Requirements.
     * @see http://dev.w3.org/html5/2dcontext/Overview.html
     *   #conformance-requirements
     * NOTE: getters/setters & Object.setProperty:'writable' could make this
     * implementation seamless with the w3's interface, but would alienate
     * IE/Opera users.
     */
    var properties_ = {
      canvas: canvas_,
      globalAlpha: context_.globalAlpha,
      globalCompositeOperation: context_.globalCompositeOperation,
      strokeStyle: context_.strokeStyle,
      fillStyle: context_.fillStyle,
      lineWidth: context_.lineWidth,
      lineCap: context_.lineCap,
      lineJoin: context_.lineJoin,
      miterLimit: context_.miterLimit,
      shadowOffsetX: context_.shadowOffsetX,
      shadowOffsetY: context_.shadowOffsetY,
      shadowBlur: context_.shadowBlur,
      shadowColor: context_.shadowColor
    };

    /**
     * Always defer to the context's state, since it may change under us,
     * but keep a backup state in case we need to destroy and recreate the
     * canvas (we can resize the canvas without affecting state, but the need
     * to recreate the canvas may arise in the future). Similarly, we may not
     * want to always accept external modifications to the context, or we may
     * wish to contrast the external state from the internal.
     * NOTE: The 'canvas' property is read only.
     */
    this.getContextProperty = function(name, value) {
      if (name in properties_)
        return properties_[name] = context_[name];
      return void 0;
    };
    this.setContextProperty = function(name, value) {
      if (name in READ_ONLY)
        throw new meta.exception.
          ReadOnlyPropertyException(name);
      if (name in properties_) {
        context_[name] = properties_[name] = value;
        return this;
      }
      throw new meta.exception.
        NonconformantPropertyException(name);
    };


    // Insert this layer's graphical representation into the DOM.
    if (parent_) {
      parent_.appendChild(canvas_);
    };
  };

  Layer.prototype.dirty = function() {
    var code = this.getCacheCode();
    if (!(code & meta.cache.USE)) return this;
    this.setCacheCode(code | meta.cache.DIRTY);
    return this;
  };

  Layer.prototype.undirty = function() {
    var code = this.getCacheCode();
    if (code & meta.cache.USE)
      this.setCacheCode(code & ~meta.cache.DIRTY);
    return this;
  };

  Layer.prototype.index = function(surface) {
    for (var i = 0; i < this.objects.length; i++) {
      var obj = this.objects[i];
      if (!obj.bound) continue;
      obj.data.bound = obj.bound.call(obj, surface);
      this.rtree.insert(obj.data.bound, obj);
      this.objects[i] = undefined;
    };
    this.objects = this.objects.compact();
  };

  Layer.prototype.reindex = function(surface, rect) {
    var layer = this;
    if (rect) {
      this.rtree.remove(rect).each(function(o) {
          layer.put(surface, o);
          });
    }
    this.index();
  };

  Layer.prototype.put = function(surface, object, bound) {
    if (!object) throw 'Invalid parameters.';
    if (bound) {
      object.data.bound = bound;
      this.rtree.insert(bound, object);
    } else if (object.bound) {
      object.data.bound = object.bound.call(object, surface);
      this.rtree.insert(object.data.bound, object);
    } else {
      this.objects.push(object);
    }
  };

  /**
   * Changes the size of the layer's canvas element.
   * @param screen {Boolean} whether screen buffer should be expanded
   *   along with hidden buffer.
   */
  Layer.prototype.resize = function(params, screen) {
    this.buffer.width = params.w;
    this.buffer.height = params.h;
    this.buffercontext = this.buffer.getContext('2d');
    if (screen) {
      this.canvas.width = this.w = params.w;
      this.canvas.height = this.h = params.h;
      this.context = this.canvas.getContext('2d');
    }
    this.dirty();
  };

  /**
   * Resizes if the drawing would not fit inside the canvas.
   * @return true iff the pixel data were erased.
   */
  Layer.prototype.expand = function(params, surface) {
    if (!surface || !params) throw 'Invalid parameters.';
    var image = surface.getImageByName(params.image);
    if (!image) return false;
    params = params || {dx: 0, dy: 0};
    var max_x = params.dx + (params.dw || image.w),
        max_y = params.dy + (params.dh || image.h),
        too_wide = max_x > this.buffer.width,
        too_tall = max_y > this.buffer.height;
    if (too_wide) {
      this.resize({
        w: 2 * max_x,
        h: this.buffer.height
      });
      this.corrupt = true;
    }
    if (too_tall) {
      this.resize({
        w: this.buffer.width,
        h: 2 * max_y
      });
      this.corrupt = true;
    }
    return this.corrupt;
  };

  /**
   * Draws an image to this layer with the specified source and destination
   * geometry.
   * @param list
   * @param surface
   */

  /**
   * Draws a list of draw commands.
   */
  Layer.prototype.draw = function(params, surface) {
    if (!surface || !params) throw 'Invalid parameters.';
    var image = surface.getImageByName(params.image);
    if (!image) return;
    params = params || {dx: 0, dy: 0};

    if (this.parallax) this.expand(params, surface);

    // Blit the pixels.
    if (meta.undef(params.dw)) {
      this.getPrimaryContext(surface).drawImage(
          image.img,
          round(params.dx),
          round(params.dy)
          );
    } else if (meta.undef(params.sx)) {
      this.getPrimaryContext(surface).drawImage(
          image.img,
          round(params.dx),
          round(params.dy),
          round(params.dw),
          round(params.dh)
          );
    } else {
      this.getPrimaryContext(surface).drawImage(
          image.img,
          round(params.sx),
          round(params.sy),
          round(params.sw),
          round(params.sh),
          round(params.dx),
          round(params.dy),
          round(params.dw),
          round(params.dh)
          );
    }
  };

  Layer.prototype.getPrimaryContext = function(surface) {
    return this.buffercontext;
  };

  Layer.prototype.getVisibleRect = function(surface) {
    var rect = {
      x: 0,
      y: 0,
      w: this.w,
      h: this.h
    };
    if (surface.getCamera() && this.parallax) {
      var pos = surface.getCameraProjection().forward.call(
          surface,
          surface.getCamera()
          );
      var offset = {
        x: pos.e(1) * this.parallax.e(1),
        y: pos.e(2) * this.parallax.e(2)
      };
      rect.x += offset.x;
      rect.y += offset.y;
    }
    return rect;
  };

  Layer.prototype.clear = function(surface) {
    if ((this.cache & meta.cache.USE) &&
        !(this.cache & meta.cache.DIRTY)) {
      return;
    }
    var rect = this.getVisibleRect(surface);
    this.getPrimaryContext(surface).clearRect(
        round(rect.x),
        round(rect.y),
        rect.w,
        rect.h
        );
  };

  // only used with double buffering.
  // copies hidden buffer to visible canvas
  Layer.prototype.flip = function(surface) {
    var rect = this.getVisibleRect(surface);

    this.context.globalCompositeOperation = 'copy';
    try {
      this.context.drawImage(
          this.buffer,
          round(rect.x),
          round(rect.y),
          rect.w,
          rect.h,
          0,
          0,
          this.canvas.width,
          this.canvas.height
          );
    } catch (e) {
      this.corrupt = true;
      // TODO: safely expand without the exception.
    }
  };

  meta.Layer = Layer;

}).call(this);

