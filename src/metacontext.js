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
   * @class MetaContext
   */

  /**
   * @constructor
   *
   * @param node
   *  An HTML element to append canvases to as child nodes.
   *  If node is a canvas element, will use as single layer.
   *    Additionally, any fallback content can be viewed.
   *  
   */
  var MetaContext = function(node, options) {
    if (meta.isString(node))
      node = document.getElementById(node);
    if (!node)
      throw new meta.exception.InvalidParameterException();

    var parent_ = document.createElement('div'),
        layers_ = {},
        tags_ = {},
        cameraPos_ = [0, 0],
        cameraProj_ = meta.projection.flat(),
        cursorPos_,
        activeLayer_ = 'default',
        focus_ = null,
        w_ = options && options.w,
        h_ = options && options.h,
        canvas_ = void 0;

    // @private
    var getActiveLayer_ = function() {
      var layer = layers_[activeLayer_];
      if (!layer)
        throw new meta.exception.NoLayerException();
      return layer;
    };

    /**
     * @method getWidth
     */
    this.getWidth = function() {
      return w_;
    };

    /**
     * @method getHeight
     */
    this.getHeight = function() {
      return h_;
    };

    /**
     * @method getRootNode
     */
    this.getRootNode = function() {
      return parent_;
    };

    /**
     * @method camera
     *
     * @param pos
     *  A [Vector] location 
     *
     * @return
     */
    this.camera = function(pos) {
      if (!pos) return cameraPos_
      return cameraPos_ = pos.slice(0);
    };

    /**
     * @method cursor
     *
     * @param pos
     *
     * @return
     */
    this.cursor = function(pos) {
      if (!pos) return cursorPos_;
      return cursorPos_ = pos.slice(0);
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
     *  [li] onmousemove [/li]
     *  [/ul]
     *
     * @return [MetaContext2d]
     */
    this.put = function(tags, options) {
      if (meta.isString(tags)) tags = tags.split(' ');
      var e = meta.mixSafely({id: ENTITY_COUNT++, tags: tags}, options),
          l = getActiveLayer_();
      meta.mixSafely(e, {model: {}});

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
      
      return Object.keys(sel).map(function(id) {return sel[id];});
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
      if (! (name in layers_)) {
        layers_[name] = new meta.Layer(this, options);
      }
      activeLayer_ = name;
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
      
      w_ = w;
      h_ = h;

      var style = canvas_ ?
        '' :
        'width: ' + w + 'px; ' +
        'height: ' + h + 'px; ' +
        'position: relative;';

      parent_.setAttribute('style', style);

      Object.keys(layers_).forEach(function(l) {
          layers_[l].resize(w, h);
          }, this);

      return this;
    };

    // Defer to active layer.
    var defer_to_layer = function(method) {
      var f = function() {
        var layer = getActiveLayer_();
        return layer[method].apply(layer, arguments);
      };
      this[method] = f.bind(this);
    };

    var defer_to_all_layers = function(method) {
      var f = function() {
        var args = arguments;
        Object.keys(layers_).forEach(function(l) {
            layers_[l][method.slice(0, -3)].apply(layers_[l], args)
             });
      };
      this[method] = f.bind(this);
    };

    // Invoke Context2d method of active layer.
    var invoke_in_layer_context = function(method) {
      var f = function() {
        var layer = getActiveLayer_(),
            ctx = layer.getContext();
        return ctx[method].apply(ctx, arguments);
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
      'memo',
      'parallax',
      'z',
      'index',
      'reindex',
      'makeDrawing',
      'getContext'
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
      return getActiveLayer_().getContext()[attribute];
    };

    var set = function(attribute, value) {
      getActiveLayer_().getContext()[attribute] = value;
    };

    // Define getter/setter for writable Context2d properties.
    var layer_context_attribute = function(attribute) {
      Object.defineProperty(this, attribute, {
          get: get.bind(this, attribute),
          set: set.bind(this, attribute),
          enumerable: true,
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
        enumerable: true
        });

    /**
     * @method getAllLayers
     * @return Array<<Layer>>
     */
    this.getAllLayers = function() {
      return Object.keys(layers_).map(function(k) {return layers_[k];});
    };

    // pick() method concats all layer output.
    /**
     * @method pick
     *  Returns an array of all entities from all layers that overlap the point
     *  relative to MetaContext left/top in the page.
     *
     * @param x
     *
     * @param y
     *
     * @return Array
     */
    this.pick = function(x, y) {
      return this.getAllLayers()
        .map(function(layer) {return layer.pick(x, y);})
        .reduce(function(a, b) {return a.concat(b);});
    };

    this.resize(w_, h_);
    node.appendChild(parent_);
    layers_['default'] = new meta.Layer(this, options);
    
    var position = function(element) {
      if (!element.offsetParent) return [0, 0];
      return meta.math.vector.plus(
          position(element.offsetParent),
          [element.offsetLeft, element.offsetTop]);
    };

    var mouse_pos = function(event) {
      var offset = position(parent_),
          mouse = [event.pageX, event.pageY];
      return meta.math.vector.minus(mouse, offset);
    }

    var handle_click = function(event) {
      var mouse = mouse_pos(event),
          hits = meta.zsort(this.pick.apply(this, mouse));

      if (!hits.length) return;

      var top = hits[0];
      if (!top.onclick) return;

      top.onclick.call(top.model, event);
    };

    var handle_mousemove = function(event) {
      var mouse = mouse_pos(event),
          hits = meta.zsort(this.pick.apply(this, mouse)),
          top;

      if (hits.length) top = hits[0];

      this.cursor(mouse);

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

    parent_.addEventListener('click', handle_click.bind(this));
    //parent_.addEventListener('mousedown');
    //parent_.addEventListener('mouseup');
    parent_.addEventListener('mousemove', handle_mousemove.bind(this));

  };

  meta.mixSafely(meta, {
    MetaContext: MetaContext
  });

}).call(this);
