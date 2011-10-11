// provides:
//  meta2d.Context -- class
(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'could not find main namespace.';

  var OBJECT_COUNT = 0;

  // given an array of ids, returns [ids] x [0, n) --> [id.0, id.n)
  var build_ids = function(ids, n) {
    var newids = new Array();
    ids.each(function(id){
        for (var i = 0; i < n; ++i) {
          newids.push(id+'.'+(i).toPaddedString(1));
        }
        });
    return newids;
  };

  /**
   * @class Context
   */
  var Context = function(parent, params) {
    if (!parent) throw 'invalid arguments.'
    if (meta.isString(parent)) parent = document.getElementById(parent);
    var ctx_ = this;
    var processes_ = new Hash();
    var tagmap_ = new Hash();
    var layers_ = new Hash();    // string --> layer
    var images_ = new Hash();    // string --> image
    var anims_ = new Hash();     // string --> animation
    var audio_ = new Hash();     // string --> audio
    var imagesLoading_ = 0;
    var audioLoading_ = 0;
    var activeLayer_ = '';      // the layer on which graphics are presently drawn
    var defaultWidth_ = 300;    // pixel width
    var defaultHeight_ = 200;   // pixel height
    var mouseFocus_ = null;     // object the mouse is presently focused on
    var camera_ = null;
    var cameraProjection_ = null;
    var mouse_ = null;

    this.getMouse = function() {
      return mouse_;
    };

    this.setMouse = function(pos) {
      mouse_ = pos;
      return this;
    };

    this.getMouseFocus = function() {
      return mouseFocus_;
    };

    this.setMouseFocus = function(o) {
      mouseFocus_ = o;
      return this;
    };

    this.getCamera = function() {
      return camera_;
    };

    this.setCamera = function(pos) {
      camera_ = pos;
      return this;
    };

    this.getCameraProjection = function() {
      return cameraProjection_;
    };

    this.setCameraProjection = function(projection) {
      cameraProjection_ = projection;
      return this;
    };

    this.getAnimationByName = function(name) {
      return anims_.get(name);
    };

    this.setAnimation = function(name, anim) {
      anims_.set(name, anim);
      return this;
    };

    this.getImageByName = function(name) {
      return images_.get(name);
    };

    this.setImage = function(name, image) {
      images_.set(name, image);
      return this;
    };

    this.getProcessByName = function(name) {
      return processes_.get(name);
    };

    this.setProcess = function(name, process) {
      processes_.set(name, process);
      return this;
    };

    this.imagesLoading = function() {
      return imagesLoading_;
    };

    this.audioLoading = function() {
      return audioLoading_;
    };

    this.loading = function() {
      return this.imagesLoading() + this.audioLoading();
    };

    this.getLayerByName = function(name) {
      if (!name) return null;
      return layers_.get(name);
    };

    this.setLayer = function(name, layer) {
      if (!name) return null;
      return layers_.set(name, layer);
    };

    this.getLayerNames = function() {
      return layers_.keys().without('');
    };

    this.getLayers = function() {
      return layers_.values();
    };

    this.getActiveLayer = function() {
      return layers_.get(activeLayer_);
    };

    this.getActiveLayerName = function() {
      return activeLayer_;
    };

    this.setActiveLayer = function(name) {
      if (!this.getLayerByName(name)) return null;
      activeLayer_ = name;
      return name;
    };

    this.getObjectsByTag = function(tag) {
      return tagmap_.get(tag);
    };

    this.getObjectsByTags = function(tags) {
      if (meta.undef(tags)) throw 'Invalid parameters.';
      if (meta.isString(tags)) tags = tags.split(' ');
      var hashset = new Hash();
      var ctx = this;
      tags.each(function(tag) {
          var objects = ctx.getObjectsByTag(tag);
          if (objects) hashset.update(objects);
          });
      return hashset.values();
    };

    this.tagObject = function(tags, object) {
      if (meta.isString(tags)) tags = tags.split(' ');
      tags.each(function(tag) {
          var hashset = tagmap_.get(tag);
          if (!hashset) hashset = new Hash();
          hashset.set(object.id, object);
          tagmap_.set(tag, hashset);
          });
      return this;
    };

    /**
     * return the names of all layers, sorted by z-order.
     *
     * @return [layer, ...]
     */
    this.getSortedLayers = function() {
      var ctx = this;
      var ls = this.getLayerNames().sortBy(function(s){
          return ctx.getLayerByName(s).zorder;
          });
      return ls;
    };

    /**
     * fetches the highest z-order mouse-colliding object at a test point.
     *
     * @param params.x
     *            .y
     * @return object
     */
    this.getHighestObject = function(params) {
      var ls = this.getSortedLayers().reverse();
      for (var i = 0; i < ls.length; ++i) {
        var pos_minus_cam = params;
        var parallax = this.getLayerByName(ls[i]).parallax;
        
        if (parallax && this.getCamera()) {
          var pseudo_pos = this.getCameraProjection().forward.call(
              this,
              this.getCamera()
              );
          pos_minus_cam = {
            dx: params.dx + (pseudo_pos.e(1) * parallax.e(1)),
            dy: params.dy + (pseudo_pos.e(2) * parallax.e(2))
          };
        }
        
        var bound = {
          x: pos_minus_cam.dx,
          y: pos_minus_cam.dy,
          w: 0,
          h: 0};
        var layer = this.getLayerByName(ls[i]);
        var objs = layer.objects.concat(layer.rtree.search(bound));
        var ctx = this;
        objs = objs.filter(function(s) {
            if (meta.undef(s)) return false;
            if (meta.undef(s.clickmask)) return false;
            return s.clickmask.filter(function(mask){
                return mask.collides(ctx, s.data, pos_minus_cam);
                }).length > 0;
            });
        if (!objs.length) continue;
        // todo: additional z-ordering based on (x,y)
        return objs[0];
      }
      return null;
    };

    /**
     * where is the mouse in coordinates relative to the main canvas element?
     *
     * @param event -- html event
     * @return {dx,dy}
     */
    this.getMouseScreenPosition = function(event) {
      return {
        dx: event.pointerX() - this.parent.getLayout().get('left'),
        dy: event.pointerY() - this.parent.getLayout().get('top')
      };
    };

    /**
     * handle canvas-level click event, propagating canvas-level events into object
     * layers.
     *
     * @param event -- html event
     * @return void
     */
    this.click = function(event) {
      var top = this.getHighestObject(this.getMouseScreenPosition(event));
      if (!top) return;
      if (!top.click) return;
      top.click.call(top, this);
      return this;
    };

    /**
     * handle canvas-level mouse motion, propagating canvas-level events into object
     * layers.
     *
     * @param event -- html event
     * @return void
     */
    this.mousemove = function(event) {
      var coords = this.getMouseScreenPosition(event);
      var top = this.getHighestObject(coords);
      var focus = this.getMouseFocus();

      // update mouse position
      this.setMouse(meta.V([coords.dx, coords.dy]));

      // trigger mouseout if focus <-- null
      if (!top) {
        if (focus && focus.mouseout)
          focus.mouseout.call(focus, focus.data);
        this.setMouseFocus(null);
        return;
      }

      // trigger mouseover, mouseout for new focus
      if (top != focus) {
        if (top.mouseover)
          top.mouseover.call(top, top.data);
        if (focus && focus.mouseout)
          focus.mouseout.call(focus, focus.data);
      }

      // trigger mousemove to whomever is in focus
      this.setMouseFocus(top);
      if (top.mousemove)
        top.mousemove.call(top, top.data);

      return this;
    };

    this.parent = document.createElement('div');
    this.params = params || {w: defaultWidth_, h: defaultHeight_};
    this.resize(params);
    parent.appendChild(this.parent);
    Event.observe(this.parent, 'click', this.click.bind(this));
    Event.observe(this.parent, 'mousemove', this.mousemove.bind(this));

    this.setLayer('', new meta.Layer(this.parent, this.params));

    return this;
  };

  /**
   */
  Context.prototype.screenPositionToLayerPosition = function() {
  };

  /**
   */
  Context.prototype.layerPositionToScreenPosition = function() {
  };

  /**
  */
  Context.prototype.select = function(tags) {
    return new meta.Selector(this.getObjectsByTags(tags));
  };

  /**
   * erase graphics on accumulation layer.
   *
   * @return Context
   */
  Context.prototype.clearAccumulationLayer = function() {
    this.getLayerByName('').getPrimaryContext(this).clearRect(
        0, 0, this.params.w, this.params.h);
    return this;
  };

  /**
   * @deprecated
   * erase graphics on main canvas.
   *
   * @return Context
   */
  Context.prototype.clearScreen = function() {
    this.context.clearRect(0, 0, this.params.w, this.params.h);
    return this;
  };

  /**
   * Draws to active layer the list of draw commands.
   */
  Context.prototype.draw = function(list) {
    this.getLayerByName(this.getActiveLayerName()).draw(list, this);
    return this;
  };

  /**
   * create a new animation.
   * @param name -- identifier for animation.
   * @return Animation
   */
  Context.prototype.animation = function(name) {
    if (!name) return null;
    if (!this.getAnimationByName(name))
      this.setAnimation(name, new meta.Animation());
    return this.getAnimationByName(name);
  };

  /**
   * select object(s) that contain some tag.
   *
   * @param tags {String | Array[String]}
   * @return Selector
   */
  Context.prototype.get = function(tags) {
    return this.select(tags);
  };

  /**
   * put several objects into the active layer, indexing over an arbitrary number
   * of dimensions.
   * @return Selector
   */
  Context.prototype.array = function(tag) {
    var dimensions = arguments.length - 1;
    var ids = $A([tag]);
    var ctx = this;
    for (var d = 1; d < dimensions + 1; ++d) {
      ids = build_ids(ids, arguments[d]);
    }
    ids.each(function(id){
        var stringdims = id.split('.').splice(1, dimensions);
        var numdims = stringdims.map(function(s){
          return parseInt(s);
          });
        var data = {
          index: numdims,
          pos: meta.V(numdims)
        };
        ctx.put(tag + ' ' + id, data);
    });
    return this.select(tag);
  };

  /**
   * put a new object identified by a set of tags into the active layer with
   * associated data (optional).
   *
   * @param tags -- {String} | {Array}
   * @param data -- {...}
   * @param bound -- [optional] bounding box for spatial indexing.
   * @return Selector
   */
  Context.prototype.put = function(tags, data, bound) {
    if (meta.isString(tags)) tags = tags.split(' ');

    var o = {
      id: OBJECT_COUNT++,
      data: data,
      tags: tags,
      select: function() {
        return new meta.Selector($A([this]));
      }
    };
    if (!data) o.data = {};
    o.data.layer = o.data.layer || this.getActiveLayerName();

    // have layer keep track of object
    this.getLayerByName(o.data.layer).put(this, o, bound);

    // map each tag to this object
    this.tagObject(tags, o);

    return this.select(tags);
  };

  /**
   * blocks execution of a function until all images and sounds are finished
   * loading.
   *
   * @param f -- callback function when ready
   * @param args -- array of arguments for the callback
   */
  Context.prototype.wait = function(f, args) {
    if (this.loading()) {
      setTimeout(this.wait.curry(f, args), 50);
      return this;
    }
    f.apply(this, args);
    return this;
  };

  /**
   * move object(s) to a new layer.
   *
   * @param tags -- selection tags
   * @param layer -- the destination layer
   */
  Context.prototype.move = function(tags, layer) {
    throw 'Unimplemented.';
  };

  /**
   * set the active layer, creating a new layer if it does not already exist.
   * disallows selection of accumulation layer ('').
   *
   * @param name -- identifier
   * @return Context
   */
  Context.prototype.layer = function(name) {
    if (!name) return this;
    if (!this.getLayerByName(name))
      this.setLayer(name, new meta.Layer(this.parent, this.params));
    this.setActiveLayer(name);
    return this;
  };

  /**
   * builds the spatial index of active layer.
   */
  Context.prototype.index = function() {
    this.getLayerByName(this.getActiveLayerName()).index(this);
    return this;
  };

  /**
   * rebuilds the rtree and updates a specific region of active layer's
   * spatial index.
   */
  Context.prototype.reindex = function(rect) {
    this.getLayerByName(this.getActiveLayerName()).index(this, rect);
    return this;
  };

  /**
   * create a new image.
   *
   * @param name -- identifier
   * @param params -- see image parameters
   * @return Context
   */
  Context.prototype.image = function(name, params) {
    if (!name) return this;
    if (!this.getImageByName(name))
      this.setImage(name, new meta.Image(params));
    return this;
  };

  /**
   * erase graphics from the active layer.
   *
   * @return Context
   */
  Context.prototype.clear = function() {
    this.getLayerByName(this.getActiveLayerName()).clear(this);
    return this;
  };

  /**
   * set the z order of the active layer.
   *
   * @param order -- depth in rendering
   * @return Context
   */
  Context.prototype.z = function(order) {
    this.getLayerByName(this.getActiveLayerName()).z(order);
    return this;
  };

  /**
   * set the parallax of the active layer.
   *
   * @param vector parallax -- proportional response to camera motion
   * @return Context
   */
  Context.prototype.parallax = function(parallax) {
    this.getLayerByName(this.getActiveLayerName()).parallax = parallax;
    return this;
  };

  /**
   * make active layer responsive to camera.
   */
  Context.prototype.useCamera = function() {
    return this.parallax(meta.V([1, 1, 1]));
  };

  /**
   * mark active layer for cacheing.
   */
  Context.prototype.useCache = function() {
    var layer = this.getLayerByName(this.getActiveLayerName());
    var cache = layer.cache;
    cache |= meta.cache.USE;
    cache |= meta.cache.DIRTY;
    layer.cache = cache;
    return this;
  };

  /**
   * mark the active layer in need for redrawing.
   */
  Context.prototype.dirty = function() {
    this.getLayerByName(this.getActiveLayerName()).dirty();
    return this;
  };

  /**
   * unmark the active layer for cacheing..
   */
  Context.prototype.noCache = function() {
    this.getLayerByName(this.getActiveLayerName()).cache = meta.cache.IGNORE;
    return this;
  };

  /**
   * set the camera to position specified, with indicated projection rule.
   *
   * @param {v} posthe new camera position
   * @return Context
   */
  Context.prototype.camera = function(pos, projection) {
    if (!pos) return this.getCamera();
    this.setCamera(pos);
    if (!projection) return this;
    this.setCameraProjection(projection);
    return this;
  };

  /**
   * set the active font for text drawing.
   *
   * @param {string} font -- css font
   * @return Context
   */
  Context.prototype.font = function(font) {
    this.getLayerByName(this.getActiveLayerName())
      .getPrimaryContext(this)
      .font = font;
    return this;
  };

  /**
   * set css-style stroke type.
   *
   * @param {string} color -- e.g.'rgba(255,255,255,0.5)'
   * @return Context
   */
  Context.prototype.style = function(color) {
    this.getLayerByName(this.getActiveLayerName())
      .getPrimaryContext(this)
      .fillStyle = color;
    return this;
  };

  /**
   * fill the active layer with the current style.
   *
   * @return Context
   */
  Context.prototype.fill = function() {
    this.getLayerByName(this.getActiveLayerName())
      .getPrimaryContext(this)
      .fillRect(
        0,
        0,
        this.params.w,
        this.params.h
        );
    return this;
  };

  /**
   * print the message at (x,y) specified in params with the current style.
   *
   * @param string msg -- what to print
   * @param params.{x,y} -- where to print the text on the canvas
   * @return Context
   */
  Context.prototype.text = function(msg, params) {
    if (!params || !params.x || !params.y)
      throw 'Invalid parameters.';
    this.getLayerByName(this.getActiveLayerName())
      .getPrimaryContext(this)
      .fillText(
        msg,
        params.x,
        params.y
        );
    return this;
  };

  /**
   * erase graphic content on all non-prebuffer layers.
   *
   * @return Context
   */
  Context.prototype.clearAll = function() {
    var active = this.getActiveLayerName();
    var ctx = this;
    this.getLayerNames().each(function(name) {
        // Context::layer will skip accumulation layer.
        ctx.layer(name).clear(ctx);
        });
    return this.layer(active);
  };

  /**
  */
  Context.prototype.push = function() {
    this.getLayerByName(this.getActiveLayerName())
      .getPrimaryContext(this)
      .save();
  };

  /**
  */
  Context.prototype.pop = function() {
    this.getLayerByName(this.getActiveLayerName())
      .getPrimaryContext(this)
      .restore();
  };

  /**
  */
  Context.prototype.scale = function(x, y) {
    this.getLayerByName(this.getActiveLayerName())
      .getPrimaryContext(this)
      .scale(x, y);
  };

  /**
  */
  Context.prototype.rotate = function(radians) {
    this.getLayerByName(this.getActiveLayerName())
      .getPrimaryContext(this)
      .rotate(radians);
  };

  /**
  */
  Context.prototype.translate = function(x, y) {
    this.getLayerByName(this.getActiveLayerName())
      .getPrimaryContext(this)
      .translate(x, y);
  };

  /**
  */
  Context.prototype.transform = function(a, b, c, d, e, f) {
    this.getLayerByName(this.getActiveLayerName())
      .getPrimaryContext(this)
      .transform(a, b, c, d, e, f);
  };

  /**
   */
  Context.prototype.compose = function(params) {
    if (meta.def(params.alpha))
      this.getLayerByName(this.getActiveLayerName())
        .getPrimaryContext(this)
        .globalAlpha = params.alpha;
    if (meta.def(params.mode))
      this.getLayerByName(this.getActiveLayerName())
        .getPrimaryContext(this)
        .globalCompositeOperation = params.mode;
  };

  /**
   * @param string name -- name of layer, cannot be empty string.
   * @return Context
   */
  Context.prototype.accumulate = function(name) {
    if (name === '') return this;
    var ctx = this;
    if (meta.undef(name)) {
      var layers = this.getSortedLayers();
      for (var l = 0; l < layers.length; l++) {
        ctx.accumulate(layers[l]);
      }
      return this;
    }

    // Temporarily change active layer.
    var restore = this.getActiveLayerName();
    var layer = this.getLayerByName(name);
    this.setActiveLayer(name);

    // Clear corrupt indicator since layer is about to be completely redrawn.
    if (layer.corrupt) {
      layer.corrupt = undefined;
      layer.dirty();
      //TODO: layer.trim();
    }

    // Save the current layer's context state.
    this.push();

    // Skip if graphics already cached or cache is not used.
    // Note: Graphics are drawn to screen coordinates without camera
    //   transformation onto their respective layer's backbuffer. The
    //   transformation is applied when the buffer flips (Layer::flip).
    if ((layer.cache & meta.cache.DIRTY) ||
        !(layer.cache & meta.cache.USE)) {
      var offset = {
        x: 0,
        y: 0
      };
      if (this.getCamera() && layer.parallax) {
        var pos = this.getCameraProjection().forward.call(
            this, this.getCamera());
        offset = {
          x: pos.e(1) * layer.parallax.e(1),
          y: pos.e(2) * layer.parallax.e(2)
        };
      }
      var screen = {
        x: offset.x,
        y: offset.y,
        w: this.params.w,
        h: this.params.h
      };

      // Get all on-screen or unindexed objects in this layer.
      var objects = layer.objects.concat(layer.rtree.search(screen));

      // Trigger ondraw event, and process returned display list.
      for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        if (meta.undef(obj.draw)) continue;

        // Use projection to define screen coordinates.
        if (obj.projection && obj.data.pos) {
          var pos = obj.projection.forward.call(this, obj.data.pos);
          obj.data.dx = pos.e(1);
          obj.data.dy = pos.e(2);
        }

        // Fetch display list, allow direct rendering & transformations.
        this.push();
        var drawlist = obj.draw.call(obj, this);
        if (drawlist) {
          // Draw everything in display list.
          ctx.draw(drawlist);
        }
        this.pop();

        // restart if the layer was resized.
        if (layer.corrupt) {
          this.pop();
          return this.accumulate(name);
        }
      } // endfor all objects
    } // endif dirty/nocache

    // If using cache, do not redraw this layer until dirtied again.
    layer.undirty();

    // Restore context state.
    this.pop();

    // Restore active layer.
    this.setActiveLayer(restore);

    return this;
  };


  /**
  Context.prototype.applyCameraToPosition = function(pos) {
    if (!(this.getCamera() || this.getCameraProjection())) return pos;
    var layer = this.getLayerByName(this.getActiveLayerName());
    var cam = this.getCameraProjection().forward.call(this, this.getCamera());
    var offset = {
      x: pos.e(1) * layer.parallax.e(1),
      y: pos.e(2) * layer.parallax.e(2)
    };
    return {
      x: pos.x - offset.x,
      y: pos.y - offset.y
    };
  };
  */

  /**
   * Push each layer's backbuffer to screen.
   * @return Context
   */
  Context.prototype.render = function() {
    var ctx = this;
    this.getLayers().each(function(layer) {
      layer.flip(ctx);
    });
  };

  /**
   * @return current runtime in milliseconds.
   * TODO: migrate
   */
  Context.prototype.time = (function() {
      var start_time = (new Date()).getTime();
      return function() {
        return (new Date()).getTime() - start_time;
      };
      })();

  /**
   * @return random float in the interval [0,1).
   * TODO: migrate
   */
  Context.prototype.rand = function() {
    return Math.random();
  };

  /**
   * @return random integer in the given inclusive interval.
   * TODO: migrate
   */
  Context.prototype.randint = function(low, high) {
    return Math.floor(low + (high - low + 1) * this.rand());
  };

  /**
   * set or retrieve a recurring function.
   *
   * @return a process controller | null
   * TODO: improve stability/accuracy
   */
  Context.prototype.process = function(name, params) {
    if (!name) return null;
    var old = this.getProcessByName(name);
    if (!params || !params.rate || !params.f) {
      if (old) return old;
      return null;
    }

    // some closure variables
    var fps_timeout_id,
        fps_time = new Date().getTime(),
        fps_rate,
        fps_count;

    // the function to repeat
    var ctx = this;
    var recurrence = function (f, rate) {
      var ms = new Date().getTime();
      fps_count++;
      if (ms - fps_time > 1000) {
        fps_rate = fps_count;
        fps_count = 0;
        fps_time = ms;
      }
      f.call(ctx);

      var t_pct = (ms - fps_time) / 1000;
      var c_pct = fps_count / rate;
      if (c_pct < t_pct) {
        fps_timeout_id = setTimeout(this.start.bind(this), 0);
      } else {
        fps_timeout_id = setTimeout(this.start.bind(this), 1000/rate);
      }
    };

    // process controller
    var obj = {
      getTimeoutId: function() {
        return fps_timeout_id;
      },
      stop: function() {
        cleartimeout(fps_timeout_id);
        return ctx;
      },
      start: function() {
        recurrence.call(this, params.f, params.rate);
        return ctx;
      },
      getRate: function() {
        return fps_rate;
      }
    };

    // store & return new obj
    if (old) old.stop();
    this.setProcess(name, obj);
    return obj.start();
  };

  /**
   * adjust the size of the canvas and all layers.
   *
   * @param params.w -- parameters
   *            .h
   * @return Context
   */
  Context.prototype.resize = function(params) {
    if (!this.parent) return this;
    if (!params || !params.w || !params.h) throw 'Invalid parameters.';
    this.size = params;
    var style = 'width:' + params.w  + 'px; height:' + params.h + 'px; position: relative';
    this.parent.setAttribute('style', style);
    this.getLayers().each(function (layer) {
        layer.resize(params, true);
        });
    return this;
  };

  meta.Context = Context;

}).call(this);

