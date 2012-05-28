/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/metacontext.js
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

  var ENTITY_COUNT = 0

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
   *  Alternatively, a string identifying a node.
   *  
   */
  var MetaContext = function(node, options) {
    if (meta.isString(node))
      node = document.getElementById(node)
    if (!node)
      throw new meta.exception.InvalidParameterException()

    var parent_,
        options_ = options,
        layers_ = {},
        tags_ = {},
        cameraPos_ = [0, 0],
        cameraProj_ = meta.projection.flat(),
        cursorPos_,
        activeLayer_ = 'default',
        hover_ = null,
        focus_ = null,
        focus_default_ = null,
        dragged_ = null,
        textinput_ = null,
        mouse_ = [0, 0],
        w_ = options_ && options_.w,
        h_ = options_ && options_.h,
        canvas_ = void 0

    // @private
    var getActiveLayer_ = function() {
      var layer = layers_[activeLayer_]
      if (!layer)
        throw new meta.exception.NoLayerException()
      return layer
    }

    /**
     * @method getWidth
     */
    this.getWidth = function() {
      return w_
    }

    /**
     * @method getHeight
     */
    this.getHeight = function() {
      return h_
    }

    /**
     * @method getRootNode
     */
    this.getRootNode = function() {
      return parent_
    }

    /**
     * @method camera
     *
     * @param x
     *
     * @param y
     *
     * @return
     */
    this.camera = function(x, y) {
      if (meta.undef(x) || meta.undef(y)) return cameraPos_
      return cameraPos_ = [x, y]
    }

    /**
     * @method cursor
     *
     * @param pos
     *
     * @return
     */
    this.cursor = function(pos) {
      if (!pos) return cursorPos_
      return cursorPos_ = pos.slice(0)
    }

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
     * @return entity
     */
    this.put = function(tags, options) {
      if (meta.isString(tags)) tags = tags.split(' ')
      tags.push('*')
      var l = getActiveLayer_(),
          e = meta.mixSafely({
            id: ENTITY_COUNT++,
            tags: tags,
            layer: l}, options)

      meta.mixSafely(e, {model: {}})
      tags.forEach(function(t) {
          var es = tags_[t]
          if (meta.undef(es)) es = tags_[t] = {}
          es[e.id] = e
          })

      l.put(e)
            
      return e
    }

    /**
     * @method array
     * @param n
     * @param tags
     * @param options
     * @return MetaContext
     */
    this.array = function(n, tags, options) {
      var e = {
        children: []
      }

      while (n--) {
        options.child = n
        options.parent = e
        e.children.push(this.put(tags, options))
      }

      return this.put(tags, e)
    }

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
          tags = meta.args(arguments)

      tags.forEach(function(t) {
          if (meta.isString(t)) t = t.split(' ')
          t.forEach(function(tag) {
              meta.mixSafely(sel, tags_[tag])
              })
          })
      
      return Object.keys(sel).map(function(id) {return sel[id]})
    }

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
      var es = this.select.apply(this, arguments)

      es.forEach(function(e) {
          e.tags.forEach(function(tag) {
              delete tags_[tag][e.id]
              if (Object.keys(tags_[tag]).length === 0)
                delete tags_[tag]
              })
          })

      return es
    }

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
        layers_[name] = new meta.Layer(this, options_)
      }
      activeLayer_ = name
      return this
    }

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
      delete layers_[name]
      return this
    }

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
        throw new meta.exception.InvalidParameterException()
      
      // Do nothing if parent is set and dimensions haven't changed.
      if (w_ === w && h_ === h  && parent_) return this

      w_ = w
      h_ = h

      if (!parent_) parent_ = document.createElement('div')

      var style = canvas_ ?
        '' :
        'width: ' + w + 'px; ' +
        'height: ' + h + 'px; ' +
        'position: relative;'

      parent_.setAttribute('style', style)

      Object.keys(layers_).forEach(function(l) {
          layers_[l].resize(w, h)
          }, this)

      return this
    }

    // Defer to active layer.
    var defer_to_layer = function(method) {
      var f = function() {
        var layer = getActiveLayer_()
        return layer[method].apply(layer, arguments)
      }
      this[method] = f.bind(this)
    }

    var defer_to_all_layers = function(method) {
      var f = function() {
        var args = arguments
        Object.keys(layers_).forEach(function(l) {
            layers_[l][method.slice(0, -3)].apply(layers_[l], args)
             })
      }
      this[method] = f.bind(this)
    }

    // Invoke Context2d method of active layer.
    var invoke_in_layer_context = function(method) {
      var f = function() {
        var layer = getActiveLayer_(),
            ctx = layer.getContext()
        return ctx[method].apply(ctx, arguments)
      }
      this[method] = f.bind(this)
    }

    // Rendering methods on active layer.
    ;['crop'
    , 'erase'
    , 'draw'
    , 'flip'
    , 'prune'
    , 'render'
    , 'memo'
    , 'repaint'
    , 'parallax'
    , 'z'
    , 'index'
    , 'reindex'
    , 'makeDrawing'
    , 'getContext'
    ].forEach(defer_to_layer, this)

    // Rendering methods on all layers.
    ;['cropAll'
    , 'eraseAll'
    , 'drawAll'
    , 'flipAll'
    , 'pruneAll'
    , 'renderAll'
    , 'memoAll'
    , 'repaintAll'
    ].forEach(defer_to_all_layers, this)

    // Context2d methods.
    ;['save'
    , 'restore'
    , 'scale'
    , 'rotate'
    , 'translate'
    , 'transform'
    , 'setTransform'
    , 'createLinearGradient'
    , 'createRadialGradient'
    , 'createPattern'
    , 'clearRect'
    , 'fillRect'
    , 'strokeRect'
    , 'beginPath'
    , 'closePath'
    , 'moveTo'
    , 'lineTo'
    , 'quadraticCurveTo'
    , 'arcTo'
    , 'rect'
    , 'arc'
    , 'fill'
    , 'stroke'
    , 'clip'
    , 'isPointInPath'
    , 'drawFocusRing'
    , 'caretBlinkRate'
    , 'setCaretSelectionRect'
    , 'fillText'
    , 'strokeText'
    , 'measureText'
    , 'drawImage'
    , 'createImageData'
    , 'getImageData'
    , 'putImageData'
    ].forEach(invoke_in_layer_context, this)

    var get = function(attribute) {
      return getActiveLayer_().getContext()[attribute]
    }

    var set = function(attribute, value) {
      getActiveLayer_().getContext()[attribute] = value
    }

    // Define getter/setter for writable Context2d properties.
    var layer_context_attribute = function(attribute) {
      Object.defineProperty(this, attribute, {
          get: get.bind(this, attribute),
          set: set.bind(this, attribute),
          enumerable: true,
          })
    }

    // Context2d attributes layer-multiplexed via getters/setters.
    ;['globalAlpha'
    , 'globalCompositeOperation'
    , 'strokeStyle'
    , 'fillStyle'
    , 'lineWidth'
    , 'lineCap'
    , 'lineJoin'
    , 'miterLimit'
    , 'shadowOffsetX'
    , 'shadowOffsetY'
    , 'shadowBlur'
    , 'shadowColor'
    , 'font'
    , 'textAlign'
    , 'textBaseline'
    ].forEach(layer_context_attribute, this)

    // read-only 'canvas' attribute of Context2d.
    Object.defineProperty(this, 'canvas', {
        get: get.bind(this, 'canvas'),
        set: void 0,
        enumerable: true
        })

    /**
     * @method getAllLayers
     * @return Array<<Layer>>
     */
    this.getAllLayers = function() {
      return Object.keys(layers_).map(function(k) {return layers_[k]})
    }

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
     * @param [<i>sorted</i>]
     *
     * @param [<i>layered</i>]
     *
     * @return Array
     */
    this.pick = function(x, y, sorted, layered) {
      var ls = this.getAllLayers().map(function(layer) {return {
          z: layer.z(),
          es: layer.pick(x, y)
          }})

      // 4 potential outputs based on sorted/layered options
      if (sorted) {
        if (layered) {
          // sorted by layer.z, then e.z
          ls.forEach(function(l) {
              l.es = meta.zsort(l.es).reverse()
              })
          ls = meta.zsort(ls).reverse()
          ls = ls.map(function(l) {return l.es})
          ls = ls.reduce(meta.concat)
        } else {
          // sorted by e.z across layers
          ls = ls.map(function(l) {return l.es})
          ls = ls.reduce(meta.concat)
          ls = meta.zsort(ls).reverse()
        }
      } else {
        if (layered) {
          ls = meta.zsort(ls).reverse()
        }
        ls = ls.map(function(l) {return l.es})
        ls = ls.reduce(meta.concat, [])
      }

      return ls
    }

    var position = function(element) {
      if (!element.offsetParent) return [0, 0]
      return meta.math.vector.plus(
          position(element.offsetParent),
          [element.offsetLeft, element.offsetTop])
    }

    var mouse_pos = function(event) {
      var offset = position(parent_),
          mouse = [event.pageX, event.pageY]
      return meta.math.vector.minus(mouse, offset)
    }

    var handle_click = function(event) {
      event.stopPropagation()

      var mouse = mouse_pos(event),
          hits = this.pick.call(this, mouse[0], mouse[1], true, true)

      if (!hits.length) return

      var top = hits[0]
      if (!top.onclick) return

      top.onclick.apply(top, mouse)

    }

    var handle_dblclick = function(event) {
      event.stopPropagation()

      var mouse = mouse_pos(event),
          hits = this.pick.call(this, mouse[0], mouse[1], true, true)

      if (!hits.length) return

      var top = hits[0]
      if (!top.ondblclick) return

      top.ondblclick.apply(top, mouse)
    }

    var handle_mousemove = function(event) {
      var mouse = mouse_pos(event),
          diff = meta.math.vector.minus(mouse, mouse_),
          hits = this.pick.call(this, mouse[0], mouse[1], true, true),
          top

      if (hits.length) top = hits[0]

      this.cursor(mouse)

      // trigger mouseout event
      if (top != hover_ && hover_ && hover_.onmouseout)
        hover_.onmouseout.apply(hover_, mouse)

      // trigger mouseover event
      if (top && top != hover_ && top.onmouseover)
        top.onmouseover.apply(top, mouse)

      // trigger mousemove event
      if (top && top.onmousemove)
        top.onmousemove.apply(top, mouse)

      // trigger drag event
      if (dragged_ && dragged_.ondrag)
        dragged_.ondrag.call(dragged_, mouse[0], mouse[1], diff[0], diff[1])

      // set the mouse cursor
      if (top && top.cursor) {
        this.getRootNode().style.cursor = top.cursor
      } else {
        this.getRootNode().style.cursor = 'default'
      }

      hover_ = top
      mouse_ = mouse
    }

    var handle_mousedown = function(event) {
      var mouse = mouse_pos(event),
          hits = this.pick.call(this, mouse[0], mouse[1], true, true),
          top

      if (hits.length) {
        top = hits[0]

        // trigger mousedown event
        if (top && top.onmousedown)
          top.onmousedown.apply(top, mouse)

        if (top && top.ondrag) {
          dragged_ = top
        }
      }

      if (top != focus_)
        handle_textinput_blur(event)

      focus_ = focus_default_ = top

      if (focus_ && focus_.onfocus) {
        handle_textinput_focus()
      }

      event.preventDefault()
    }

    var handle_mouseup = function(event) {
      event.stopPropagation()

      var mouse = mouse_pos(event),
          hits = this.pick.call(this, mouse[0], mouse[1], true, true),
          top

      if (hits.length) top = hits[0]

      // trigger mouseup event
      if (top && top.onmouseup)
        top.onmouseup.apply(top, mouse)

      // trigger drop event
      if (dragged_ && dragged_.ondrop)
        dragged_.ondrop.apply(dragged_, mouse)

      // clear dragged entity
      dragged_ = null
    }

    var handle_mouseout = function(event) {
      var mouse = mouse_pos(event)

      // trigger mouseout event
      if (hover_ && hover_.onmouseout)
        hover_.onmouseout.apply(hover_, mouse)

      // trigger drop event
      if (dragged_ && hover_.ondrop)
        dragged_.ondrop.apply(dragged_, mouse)

      // clear dragged entity
      dragged_ = null

      // clear hovered entity
      hover_ = null
    }

    var handle_textinput = function(event) {
      // trigger textinput event
      if (focus_ && focus_.ontextinput) {
        focus_.ontextinput.call(focus_, event, event.data)
      }
      textinput_.value = ''
    }

    var handle_textinput_blur = function(event) {
      // trigger blur event on focused entity
      if (focus_ && focus_.onblur)
        focus_.onblur.call(focus_)
    }

    var handle_textinput_focus = function(event) {
      if (!event) {
        focus_ = focus_default_
      }

      if (focus_ && focus_.onfocus)
        focus_.onfocus.call(focus_)

      if (focus_ && focus_.contentEditable) {
        textinput_.focus()
      }
    }

    // Set up the injected DOM elements.

    this.resize(w_, h_)
    layers_['default'] = new meta.Layer(this, options_)
    node.appendChild(parent_)

    // Listen to DOM mouse events.

    parent_.addEventListener('click', handle_click.bind(this), false)
    parent_.addEventListener('mousedown', handle_mousedown.bind(this), false)
    parent_.addEventListener('mouseup', handle_mouseup.bind(this), false)
    parent_.addEventListener('mousemove', handle_mousemove.bind(this), false)
    parent_.addEventListener('mouseout', handle_mouseout.bind(this), false)
    parent_.addEventListener('dblclick', handle_dblclick.bind(this), false)

    // Listen to DOM textInput event via hidden input.

    textinput_ = document.createElement('input')
    textinput_.style.position = 'fixed'
    textinput_.style.left = '-31337px'
    textinput_.addEventListener('textInput', handle_textinput.bind(this), false)
    textinput_.addEventListener('blur', handle_textinput_blur.bind(this), false)
    textinput_.addEventListener('focus',
        handle_textinput_focus.bind(this), false)
    parent_.appendChild(textinput_)
  }

  var create = function(node, options) {
    if (meta.isString(node))
      node = document.getElementById(node)
    if (!node)
      throw new meta.exception.InvalidParameterException()

    options = meta.mixSafely(options, {
      w: node.clientWidth || 300,
      h: node.clientHeight || 150
    })

    return new MetaContext(node, options)
  }

  meta.mixSafely(meta, {
    MetaContext: MetaContext,
    create: create
  })

}(this.meta2d);
