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
   * @class Layer
   * 
   * A context onto which graphics are drawn and objects are stored. Layers are
   * drawn low to high z-order (higher overlaps lower).
   *
   * @param parent -- HTML element
   * @param params -- parameters
   */
  var Layer = function(parent, params) {
    this.parent = parent;
    this.cache = meta.cache.IGNORE;
    this.corrupt = false;
    this.zorder = 0;
    this.parallax = null;
    this.objects = new Array();
    this.rtree= new meta.RTree(10);
    this.treehash = new Hash();
    this.canvas = document.createElement('canvas');
    this.buffer = document.createElement('canvas');
    this.canvas.width = this.buffer.width = this.w = params.w;
    this.canvas.height = this.buffer.height = this.h = params.h;
    this.canvas.setAttribute('style', DEFAULT_STYLE);
    this.context = this.canvas.getContext('2d');
    this.buffercontext = this.buffer.getContext('2d');
    if (this.parent) {
      this.parent.appendChild(this.canvas);
    }
  };

  Layer.prototype.dirty = function() {
    if (!(this.cache & meta.cache.USE)) return;
      this.cache |= meta.cache.DIRTY;
  };

  Layer.prototype.undirty = function() {
    if (this.cache & meta.cache.USE) {
      this.cache &= ~meta.cache.DIRTY;
    }
  };

  Layer.prototype.z = function(z) {
    this.zorder = z;
    this.canvas.setAttribute('style',
      DEFAULT_STYLE + ' z-index: ' + z + ';');
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
      this.getPrimaryContext(surface).drawImage(image.img,
          round(params.dx),
          round(params.dy)
          );
    } else if (meta.undef(params.sx)) {
      this.getPrimaryContext(surface).drawImage(image.img,
          round(params.dx),
          round(params.dy),
          round(params.dw),
          round(params.dh)
          );
    } else {
      this.getPrimaryContext(surface).drawImage(image.img,
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
      alert(Object.toJSON(rect));
      // TODO: safely expand without the exception.
    }
  };

  meta.Layer = Layer;

}).call(this);

