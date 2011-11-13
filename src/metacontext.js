/** metacontext.js
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
  var root = this,
      meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var ENTITY_COUNT = 0;

  /**
   * @class MetaContext2d
   */

  /**
   * @constructor
   *
   * @param canvas
   *  
   */
  var MetaContext2d = function(canvas) {
    if (meta.isString(canvas))
      canvas = document.getElementById(canvas);
    if (!canvas)
      throw new meta.exception.InvalidParameterException();

    var parent_ = createElement('div'),
        layers_ = {},
        tags_ {},
        cameraPos_ = [0, 0],
        cameraProj_ = meta.projection.flat(),
        cursorPos_,
        activeLayer = 'default',
        focus_ = null;

    // @private
    var getActiveLayer_ = function() {
      var layer = layers_[activeLayer_];
      if (!layer)
        throw new meta.exception.NoLayerException();
      return layer;
    };

    /**
     * @method camera
     *
     * @param pos
     *  A [Vector] location 
     *
     * @return
     */
    this.camera(pos) {
      if (!pos) return cameraPos_
      return cameraPos_ = pos;
    };

    /**
     * @method cursor
     *
     * @param pos
     *
     * @return
     */
    this.cursor(pos) {
      if (!pos) return cursorPos_;
      return cursorPos_ = pos
    };

    /**
     * @method put
     *
     * @param tags
     *  A String of space-separated tag names, or an array of tag names.
     * @param options
     *  Optional. An Object providing additional parameters.
     *
     *  [ul]
     *  [li] pos - A [Vector] describing the entity's position. [/li]
     *  [li] bound - A [Rect] describing the entity's bounding geometry. [/li]
     *  [li] model - An [Object] to use as a context for event callbacks. [/li]
     *  [li] mask [/li]
     *  [li] draw [/li]
     *  [li] onmask [/li]
     *  [li] onproject [/li]
     *  [li] ondraw [/li]
     *  [li] onbound [/li]
     *  [li] onclick [/li]
     *  [li] onmouseover [/li]
     *  [li] onmouseout [/li]
     *  [li] onmousemove [/li]
     *  [/ul]
     *
     * @return [MetaContext2d]
     */
    this.put = function(tags, options) {
      if (meta.isString(tags)) tags = tags.split(' ');
      var e = meta.mixSafely({id: ENTITY_COUNT++, tags: tags}, options),
          l = getActiveLayer_();

      tags.forEach(function(t) {
          var es = tags_[t];
          if (meta.undef(es)) es = tags_[t] = {};
          es[e.id] = e;
          });

      l.put(e);
            
      return this;
    };

    /**
     * @method select
     *  Get a [Selection] of all entities that match any of the tags provided.
     *
     * @param tags...
     *  Takes any number of Strings or Arrays of tags.
     *
     * @return [Array<Entity>]
     */
    this.select = function() {
      var sel = {},
          tags = meta.args(arguments);

      tags.forEach(function(t) {
          if (meta.isString(t)) t = t.split(' ');
          t.forEach(function(tag) {
              meta.mixSafely(sel, tags_[tag]);
              });
          });
      
      return Object.keys(sel).map(function(id) return sel[id];);
    };

    /**
     * @method remove
     *  Remove all entities that match any of the tags provided.
     *
     * @param tags...
     *  Takes any number of Strings or Arrays of tags.
     *
     * @return [Array<Entity>]
     *  Return the entities that were removed.
     */
    this.remove = function() {
      var es = this.select.apply(this, arguments);

      es.forEach(function(e) {
          e.tags.forEach(function(tag) {
              delete tags_[tag][e.id];
              if (Object.keys(tags_[tag]).length === 0)
                delete tags_[tag];
              });
          });

      return es;
    };

    /**
     * @method layer
     *  Set the active layer.
     *
     * @param name
     *  The name of the new active layer. Creates a new layer if not already
     *  present.
     *
     * @return [MetaContext2d]
     *  thisArg
     */
    this.layer = function(name) {
      if (name in layers_) {
        activeLayer_ = name;
      } else {
        layers_[name] = new meta.Layer();
      }
      return this;
    };

    /**
     * @method removeLayer
     *  Removes the specified layer from the MetaContext.
     *
     * @param name
     *  The [String] name of the removed layer.
     *
     * @return [MetaContext2d]
     *  thisArg
     */
    this.removeLayer = function(name) {
      delete layers_[name];
      return this;
    };

    /**
     * @method resize
     *  Change the size of the canvas and all layers.
     *
     * @param w
     *  Pixel width as a [Number].
     * @param h
     *  Pixel height as a [Number].
     *
     * @return [MetaContext2d]
     *  thisArg
     */
    this.resize = function(w, h) {
      if (meta.undef(w) || meta.undef(h))
        throw new meta.exception.InvalidParameterException();
      var style =
        'width: ' + canvas_.width + 'px;' +
        'height: ' + canvas_.height + 'px;' +
        'position: relative;';

      parent_.setAttribute('style', style);
      layers_.forEach(function(layer) {
          layer.resize(w, h);
          }, this);

      return this;
    };

    // Defer to active layer.
    var defer_to_layer = function(method) {
      var f = function() {
        var layer = getActiveLayer_();
        layer[method].apply(layer, arguments);
        return this;
      };
      this[method] = f.bind(this);
    };

    var defer_to_all_layers = function(method) {
      var f = function() {
        var args = arguments;
        layers_.forEach(function(layer) {
            layer[method.slice(0, -3)].apply(layer, args)
            });
      };
      this[method] = f.bind(this);
    };

    // Invoke Context2d method of active layer.
    var invoke_in_layer_context = function(method) {
      var f = function() {
        var layer = getActiveLayer_(),
            ctx = layer.getNativeContext2d();
        ctx[method].apply(ctx, arguments);
      };
      this[method] = f.bind(this);
    };

    [ // Rendering methods on active layer.
      'crop',
      'erase',
      'draw',
      'flip',
      'prune',
      'render',
      'memo'
    ].forEach(defer_to_layer, this);

    [ // Rendering methods on all layers.
      'cropAll',
      'eraseAll',
      'drawAll',
      'flipAll',
      'pruneAll',
      'renderAll',
      'memoAll'
    ].forEach(defer_to_all_layers, this);

    [ // Context2d methods.
      'save',
      'restore',
      'scale',
      'rotate',
      'translate',
      'transform',
      'setTransform',
      'createLinearGradient',
      'createRadialGradient',
      'createPattern',
      'clearRect',
      'fillRect',
      'strokeRect',
      'beginPath',
      'closePath',
      'moveTo',
      'lineTo',
      'quadraticCurveTo',
      'arcTo',
      'rect',
      'arc',
      'fill',
      'stroke',
      'clip',
      'isPointInPath',
      'drawFocusRing',
      'caretBlinkRate',
      'setCaretSelectionRect',
      'fillText',
      'strokeText',
      'measureText',
      'drawImage',
      'createImageData',
      'getImageData',
      'putImageData'
    ].forEach(invoke_in_layer_context, this);

    var get = function(attribute) {
      return getActiveLayer_().getNativeContext2d()[attribute];
    };

    var set = function(attribute, value) {
      getActiveLayer_().getNativeContext2d()[attribute] = value;
    };

    // Define getter/setter for writable Context2d properties.
    var layer_context_attribute = function(attribute) {
      Object.defineProperty(this, attribute, {
          get: get.bind(this, attribute),
          set: set.bind(this, attribute),
          configurable: true,
          enumerable: true,
          writable: true
          });
    };

    [ // Context2d attributes layer-multiplexed via getters/setters.
      'globalAlpha',
      'globalCompositeOperation',
      'strokeStyle',
      'fillStyle',
      'lineWidth',
      'lineCap',
      'lineJoin',
      'miterLimit',
      'shadowOffsetX',
      'shadowOffsetY',
      'shadowBlur',
      'shadowColor',
      'font',
      'textAlign',
      'textBaseline'
    ].forEach(layer_context_attribute, this);

    // read-only 'canvas' attribute of Context2d.
    Object.defineProperty(this, 'canvas', {
        get: get.bind(this, 'canvas'),
        set: void 0,
        configurable: false,
        enumerable: true,
        writable: false
        });

    this.resize(canvas_.width, canvas_.height);
    canvas.appendChild(parent_);
    layers_['default'] = new Layer();
    
    var mouse_screen_pos = function(event) {
      return [
        event.pointerX() - parent_.WTFBBQ.get('left'),
        event.pointerY() - parent_.WTFBBQ.get('top')
      ];
    };

    var handle_click = function(event) {
      var topEntity = high_z_entity_at_pos(pos);
      if (!top) return;
      if (meta.undef(top.click)) return;

      top.onclick.call(top);
    };

    var handle_mousemove = function(event) {
      var pos = mouse_screen_pos(event),
          top = high_z_entity_at_pos(pos);

      this.cursor(pos);

      // trigger mouseout event
      if (top != focus_ && focus_ && focus_.onmouseout)
        focus_.onmouseout.call(focus_);

      // trigger mouseover event
      if (top && top != focus_ && top.onmouseover)
        top.onmouseover.call(top);

      // trigger mousemove event
      if (top && top.onmousemove)
        top.onmousemove.call(top);

      focus_ = top;
    };

    // TODO: observe click, mousemove events.
    

  };

  meta.mixSafely(meta, {
    MetaContext2d: MetaContext2d
  });

}).call(this);
