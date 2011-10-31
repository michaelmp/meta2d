(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var OBJECT_COUNT = 0;

  // given an array of ids, returns [ids] x [0, n) --> [id.0, id.n)
  var build_ids = function(ids, n) {
    var newids = [];
    ids.forEach(function(id){
        for (var i = 0; i < n; ++i) {
          newids.push(id+'.'+(i).toPaddedString(1));
        }
        });
    return newids;
  };

  // @thisArg [meta::Context]
  var backoffToSelectedLayer = function(property) {
    return (function() {
        var layer = this.getSelectedLayer();
        if (meta.undef(layer)) return this;
        var context = layer.getNativeContext();
        if (meta.undef(context)) return this;
        if (!(property in context))
          throw new meta.exception.
            NonconformantPropertyException(property);
        context.layer[property].apply(layer, arguments);
        return this;
        }).bind(this);
  };

  /**
   * @class Context
   * This class is kind of important...
   *
   * @constructor
   * Creates a new DOM element and inserts it into the given parent element.
   * Initializes as a single-layered (identified by the empty string '')
   * canvas with height and width specified in the params argument. This and
   * all subsequent layers are represented in the DOM as canvas elements
   * inside of the newly created element (a div, in which all canvases are
   * relatively positioned so as to overlap). This new div element is placed
   * inside of the specified parent element.
   * @param [String|DOMElement] parent
   * @param [{w, h}] params
   */
  var Context = function(parent, params) {
    if (meta.isString(parent))
      parent = document.getElementById(parent);
    if (meta.undef(parent))
      throw new meta.exception.
        InvalidParameterException('parent', parent);
    if (meta.undef(params))
      throw new meta.exception.
        InvalidParameterException('params', params);

    // Private members.
    var ctx_ = this;
    var data_ = {
      animations: {};
      images: {};
      layers: {};
      entities: {};
    };
    var selectedLayers_ = [];
    var focusedEntities_ = [];
    var cursorPosition_ = {};
    var cameraPosition_ = {};
    var cameraProjection_ = {};

    // Public members.
    this.parent = document.createElement('div');
    this.params = params;

    /**
     * @privileged
     * @method addAnimation
     * @param [String] name
     * @param [meta::Animation] animation
     * @return [meta::Context]
     */
    this.addAnimation = function(name, animation) {
      if (meta.undef(name))
        throw new meta.exception.
          InvalidParameterException('name', name);
      if (meta.undef(animation))
        throw new meta.exception.
          InvalidParameterException('animation', animation);
      data_.animations[name] = animation;
      return ctx_;
    };

    /**
     * @privileged
     * @method getAnimationByName
     * @param [String name]
     * @return [meta::Animation]
     */
    this.getAnimationByName = function(name) {
      if (meta.undef(name))
        throw new meta.exception.
          InvalidParameterException('name', name);
      return data_.animations[name];
    };

    /**
     * @privileged
     * @method createArray
     * @param [String|Array<String>] tags
     * @param [meta:Segment]
     */
    this.createArray = function(tags) {
    };
 
    /**
     * @privileged
     * @method getCameraPosition
     * @return [meta::math::Vector]
     */
    this.getCameraPosition = function() {
      return cameraPosition_[0];
    };

    /**
     * @privileged
     * @method setCameraPosition
     * @param [meta::math::Vector] vector
     * @return [meta::Context]
     */
    this.setCameraPosition = function(vector) {
      if (meta.undef(vector))
        throw new meta.exception.
          InvalidParameterException('vector', vector);
      cameraPosition_[0] = vector;
      return ctx_;
    };

    /**
     * @privileged
     * @method getCursorPosition
     * @return [meta::math::Vector]
     */
    this.getCursorPosition = function() {
      return cursorPosition_[0];
    };

    /**
     * @privileged
     * @method setCursorPosition
     * @param [meta::math::Vector] vector
     * @return [meta::Context]
     */
    this.setCursorPosition = function(vector) {
      cursorPosition_[0] = vector;
      return ctx_;
    };

    /**
     * @privileged
     * @method addEntity
     * @param [String|Array<String>] tags
     * @param [meta::Entity] entity
     * @return [meta::Context]
     */
    this.addEntity = function(tags, entity) {
      throw new meta.exception.UnimplementedMethodException('addEntity');
    };

    /**
     * @privileged
     * @method addEntitites
     * @param [String|Array<String>] tags
     * @param [Array<meta::Entity>] entities
     * @return [meta::Context]
     */
    this.addEntities = function(tags, entities) {
      throw new meta.exception.UnimplementedMethodException('addEntities');
    };

    /**
     * @privileged
     * @method createEntity
     * @param [String|Array<String>] tags
     * @param [Object] params
     * @return [meta::Context]
     */
    this.createEntity = function(tags, params) {
      this.addEntity(addEntity(tags, new meta::Entity(params)));
      return ctx_;
    };

    /**
     * @privileged
     * @method setEntityProjection
     * @param [meta::Projection] projection
     * @return [meta::Context]
     */
    this.setEntityProjection = function(projection) {
      throw new meta.exception.UnimplementedMethodException('setEntityProjection');
    };

    /**
     * @privileged
     * @method setEntityFocusMask
     * @param [meta::Collision] mask
     * @return [meta::Context]
     */
    this.setEntityFocusMask = function(mask) {
      throw new meta.exception.UnimplementedMethodException('setEntityFocusMask');
    };

    /**
     * @privileged
     * @method selectEntities
     * @param [String|Array<String>] tags
     * @return [meta::Context]
     */
    this.selectEntities = function(tags) {
      throw new meta.exception.UnimplementedMethodException('selectEntities');
    };

    /**
     * @privileged
     * @method getEntitiesByTags
     * @param [String|Array<String>] tags
     * @return [Array<meta::Entity>]
     */
    this.getEntitiesByTags = function(tags) {
      throw new meta.UnimplementedMethodException('getEntitiesByTags');
    };

    /**
     * @privileged
     * @method getEntityById
     * @param [Number] id
     * @return [meta::Entity]
     */
    this.getEntityById = function(id) {
      throw new meta.UnimplementedMethodException('getEntityById');
    };

    /**
     * @privileged
     * @method removeSelectedEntities
     * @return [meta::Context]
     */
    this.removeSelectedEntities = function() {
      throw new meta.UnimplementedMethodException('removeSelectedEntities');
    };

    /**
     * @privileged
     * @method getEntitySelectionTags
     * @return String
     */
    this.getEntitySelectionTags = function() {
      throw new meta.UnimplementedMethodException('getEntitySelectionTags');
    };

    /**
     * @privileged
     * @method addEntityEventListener
     * @param [String] type
     * @param [Function(meta::Event)] callback)
     * @return [meta::Context]
     */
    this.addEntityEventListener = function(type, callback) {
      return ctx_;
    };

    /**
     * @privileged
     * @method dispatchEvent
     * @param [meta::Event] event
     * @return [meta::Context]
     */
    this.dispatchEvent = function(event) {
      return ctx_;
    };

    /**
     * @privileged
     * @method getFocusedEntities
     * @return [Array<meta::Entity>]
     */
    this.getFocusedEntities = function() {
      return focus_;
    };

    /**
     * @privileged
     * @method setFocusedEntities
     * @param [Array<meta::Entity>] entities
     * @return [meta::Context]
     */
    this.setFocusedEntitites= function(entities) {
      if (!entities)
        throw new meta.InvalidParameterException('entities', entities);
      focus_ = entities;
      return ctx_;
    };

    /**
     * @privileged
     * @method addImage
     * @param [String] name
     * @param [meta::Image] image
     * @return [meta::Context]
     */
    this.addImage = function(name, image) {
      if (meta.undef(name))
        throw new meta.exception.
          InvalidParameterException('name', name);
      if (meta.undef(animation))
        throw new meta.exception.
          InvalidParameterException('image', image);
      data_.images[name] = image;
      return ctx_;
    };

    /**
     * @privileged
     * @method getImageByName
     * @param [String name]
     * @return [meta::Image]
     */
    this.getImageByName = function(name) {
      if (meta.undef(name))
        throw new meta.exception.
          InvalidParameterException('name', name);
      return data_.images[name];
    };

    /**
     * @privileged
     * @method addLayer
     * @param [String] name
     * @param [meta::Layer] layer
     * @return [meta::Context]
     */
    this.addLayer = function() {
      throw new meta.UnimplementedMethodException('addLayer');
    };

    /**
     * @privileged
     * @method createLayer
     * @param [String] name
     * @return [meta::Context]
     */
    this.createLayer = function(name) {
      addLayer(name, new meta.Layer());
      return ctx_;
    };

    /**
     * @privileged
     * @method selectLayer
     * @param [String] name
     * @return [meta::Context]
     */
    this.selectLayer = function(name) {
      if (meta.undef(name))
        throw new meta.InvalidParameterException('name', name);
      selectedLayers_ = [name];
      return ctx_;
    };

    /**
     * @privileged
     * @method getLayerByName
     * @param [String] name
     * @return [meta::Layer]
     */
    this.getLayerByName = function(name) {
      throw new meta.UnimplementedMethodException('getLayerByName');
    };

    /**
     * @privileged
     * @method renameLayer
     * @param [String] name
     * @param [String] newName
     * @return [meta::Context]
     */
    this.renameLayer = function(name, newName) {
      throw new meta.UnimplementedMethodException('renameLayers');
    };

    /**
     * @privileged
     * @method removeLayers
     * @param [String|Array<String>] names
     * @return [meta::Context]
     */
    this.removeLayers = function(names) {
      throw new meta.UnimplementedMethodException('removeLayers');
    };

    /**
     * @privileged
     * @method removeSelectedLayers
     * @return [meta::Context]
     */
    this.removeSelectedLayers = function() {
      throw new meta.UnimplementedMethodException('removeSelectedLayers');
    };

    /**
     * @privileged
     * @method getLayerSelectionName
     * @return String
     */
    this.getLayerSelectionName = function() {
      throw new meta.UnimplementedMethodException('getLayerSelectionName');
    }; 

    /**
    this.getObjectsByTags = function(tags) {
      if (meta.undef(tags)) throw 'Invalid parameters.';
      if (meta.isString(tags)) tags = tags.split(' ');
      var hashset = {};
      var ctx = this;
      tags.forEach(function(tag) {
          var objects = ctx.getObjectsByTag(tag);
          if (objects) hashset.update(objects);
          });
      return hashset.values();
    };

    this.tagObject = function(tags, object) {
      if (meta.isString(tags)) tags = tags.split(' ');
      tags.forEach(function(tag) {
          var hashset = tagmap_.get(tag);
          if (!hashset) hashset = {};
          hashset.set(object.id, object);
          tagmap_.set(tag, hashset);
          });
      return this;
    };

    this.getSortedLayers = function() {
      var ctx = this;
      var ls = this.getLayerNames().sortBy(function(s){
          return ctx.getLayerByName(s).zorder;
          });
      return ls;
    };

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


    this.getMouseScreenPosition = function(event) {
      return {
        dx: event.pointerX() - this.parent.getLayout().get('left'),
        dy: event.pointerY() - this.parent.getLayout().get('top')
      };
    };

    this.click = function(event) {
      var top = this.getHighestObject(this.getMouseScreenPosition(event));
      if (!top) return;
      if (!top.click) return;
      top.click.call(top, this);
      return this;
    };

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
    */


    // CanvasRenderingContext2D methods, multiplexed to selected layer.
    // All are privileged due to strict mode context rules. Defining inside of
    // [[proto]] would require an unexplicitly-bound closure, as the thisArg
    // is not known until instantiation, so 'backoffToSelectedLayer' must
    // return a closure with the instance object explicitly-bound.
    //
    var backoff = backoffToSelectedLayer;
    //
    this.save = backoff.call(this,'save');
    this.restore = backoff.call(this,'restore');
    this.scale = backoff.call(this, 'scale');
    this.rotate = backoff.call(this, 'rotate');
    this.translate = backoff.call(this, 'translate');
    this.transform = backoff.call(this, 'transform');
    this.setTransform = backoff.call(this, 'setTransform');
    //
    this.createLinearGradient = backoff.call('createLinearGradient');
    this.createRadialGradient = backoff.call(this, 'createRadialGradient');
    this.createPattern = backoff.call(this, 'createPattern');
    //
    this.clearRect = backoff.call(this, 'clearRect');
    this.fillRect = backoff.call(this, 'fillRect');
    this.strokeRect = backoff.call(this, 'strokeRect');
    //
    this.beginPath = backoff.call(this, 'beginPath');
    this.closePath = backoff.call(this, 'closePath');
    //
    this.moveTo = backoff.call(this, 'moveTo');
    this.lineTo = backoff.call(this, 'lineTo');
    this.quadraticCurveTo = backoff.call(this, 'quadraticCurveTo');
    this.arcTo = backoff.call(this, 'arcTo');
    this.rect = backoff.call(this, 'rect');
    this.arc = backoff.call(this, 'arc');
    this.fill = backoff.call(this, 'fill');
    this.stroke = backoff.call(this, 'stroke');
    this.clip = backoff.call(this, 'clip');
    //
    this.isPointInPath = backoff.call(this, 'isPointInPath');
    //
    this.drawFocusRing = backoff.call(this, 'drawFocusRing');
    this.caretBlinkRate = backoff.call(this, 'caretBlinkRate');
    this.setCaretSelectionRect = backoff.call(this, 'setCaretSelectionRect');
    //
    this.font = backoff.call(this, 'font');
    this.textAlign = backoff.call(this, 'textAlign');
    this.textBaseline = backoff.call(this, 'textBaseline');
    //
    this.fillText = backoff.call(this, 'fillText');
    this.strokeText = backoff.call(this, 'strokeText');
    this.measureText = backoff.call(this, 'measureText');
    //
    this.drawImage = backoff.call(this, 'drawImage');
    this.createImageData = backoff.call(this, 'createImageData');
    this.getImageData = backoff.call(this, 'getImageData');
    this.putImageData = backoff.call(this, 'putImageData');

    // Initialize the DOM element and 
    this.resize(params);
    parent.appendChild(this.parent);
    Event.observe(this.parent, 'click', this.click.bind(this));
    Event.observe(this.parent, 'mousemove', this.mousemove.bind(this));

  };

  // Access native Context2D members per selected layer.
  // NOTE: Access could be implemented using getters/setters on properties,
  // but getters/setters & read-only property values are poorly-supported
  // in IE & Opera as of this authoring.
  /**
   * @method setContextProperty
   * @param [String] name
   * @param [any] value
   * @return [meta::Context]
   */
  Context.prototype.setContextProperty = function(name, value) {
    var layer = this.getSelectedLayer();
    if (meta.undef(layer)) return this;
    layer.setContextProperty(name, value);
    return this;
  };
  /**
   * @method getContextProperty
   * @param [String] name
   * @return [any]
   */
  Context.prototype.getContextProperty = function(name) {
    var layer = this.getSelectedLayer();
    if (meta.undef(layer)) return void 0;
    return layer.getContextProperty(name);
  };

  /**
   * @method draw
   * Draws a list of drawing instructions on the active layer, cacheing where
   * appropriate.
   * @param [Array<Object>] list
   * @return [meta::Context]
   */
  Context.prototype.draw = function(list) {
    this.getLayerByName(this.getActiveLayerName()).draw(this, list);
    return this;
  };
  
  /**
   * put several objects into the active layer, indexing over an arbitrary number
   * of dimensions.
   * @return Selector
   */
  /**
  Context.prototype.array = function(tag) {
    var dimensions = arguments.length - 1;
    var ids = $A([tag]);
    var ctx = this;
    for (var d = 1; d < dimensions + 1; ++d) {
      ids = build_ids(ids, arguments[d]);
    }
    ids.forEach(function(id){
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
  */

  /**
   * put a new object identified by a set of tags into the active layer with
   * associated data (optional).
   *
   * @param tags -- {String} | {Array}
   * @param data -- {...}
   * @param bound -- [optional] bounding box for spatial indexing.
   * @return Selector
   */
  /**
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
  */

  /**
   * @method render
   * @param [meta::math::Rect] rect
   * @return [meta::Context]
   */
  Context.prototype.render = function(rect) {
    var layers = this.getSortedLayers();
    layers.forEach(function(l) {
        l.render(rect);
        });

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
        if (meta.def(drawlist))
          ctx.draw(drawlist[l]);
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
   * @method flipAllLayers
   * Push each layer's buffered pixel data to the screen.
   * @return [meta::Context]
   */
  Context.prototype.flipAllLayers = function() {
    this.getLayers().forEach(function(l) {
        l.flip(this);
        }, this);
    return this;
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
   * @method resize
   * Adjust the canvas size on all layers.
   *
   * @param [{w, h}] params
   * @return [meta::Context]
   */
  Context.prototype.resize = function(params) {
    if (meta.undef(params)
        meta.undef(params.w) ||
        meta.undef(params.h))
      throw new meta.exception.
        InvalidParameterException('params', params);
    var style =
      'width: ' + params.w + 'px;' +
      'height: ' + params.h + 'px;' +
      'position: relative;';
    this.getParent().setAttribute('style', style);
    this.getLayers().forEach(function(l) {
        l.resize(params);
        }, this);
    return this;
  };

  meta.Context = Context;

}).call(this);

