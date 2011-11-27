/** context.js
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

  var CANVAS_STYLE = 'position: absolute; left:0px; top:0px;';

  /**
   * @class Context
   *
   *  <p>
   *  A Context implements CanvasRenderingContext2D[1] as outlined in HTML5. It
   *  additionally provides a getTransform method.
   *  </p>
   *
   *  <p>
   *  Constructing a Context creates a new HTMLCanvasElement with the specified
   *  width and height and establishes the constructed object as a rendering
   *  context on that canvas.
   *  </p>
   *
   *  <p>
   *  [1]
   *  <a href="
   *  http://dev.w3.org/html5/2dcontext/Overview.html#canvasrenderingcontext2d"
   *  >http://dev.w3.org/html5/2dcontext/Overview.html#canvasrenderingcontext2d
   *  </a>
   *  </p>
   *  
   * @extends CanvasRenderingContext2D
   */

  /**
   * @constructor
   *  <code>
   *  var ctx = new Context(200, 100);
   *  ctx.scale(10, 10);
   *  ctx.translate(10, 5);
   *  ctx.fillRect(-10, -5, 20, 10);
   *
   *  ctx.getTransform();  // [10, 0, 0, 10, 100, 50]
   *  </code>
   *
   * @param w
   *  The canvas width in pixels.
   * @param h
   *  The canvas height in pixels.
   *
   * @param canvas
   *  <i>Optional</i>. Instead of constructing with width and height
   *  parameters, a Context can also be constructed from an HTMLCanvasElement.
   */
  var Context = function(w, h) {
    var ctx_ = this,
        canvas_ = document.createElement('canvas'),
        nativeCtx_,
        matrix_ = meta.math.affine.identity(),
        stack_ = [matrix_];

    canvas_.setAttribute('style', CANVAS_STYLE);

    if (meta.undef(h) && meta.def(w)) {
      // Parse single argument as a canvas.
      canvas_.width = w.width;
      canvas_.height = w.height;
      nativeCtx_ = canvas_.getContext('2d');
      nativeCtx_.drawImage(w, 0, 0);

    } else if (!w || !h || w < 0 || h < 0) {
      throw new meta.exception.InvalidParameterException();
    } else {
      canvas_.width = w;
      canvas_.height = h;
      nativeCtx_ = canvas_.getContext('2d');
    }

    var get = function(attribute) {
      return nativeCtx_[attribute];
    };

    var set = function(attribute, value) {
      nativeCtx_[attribute] = value;
    };

    var do_the_right_thing = function(method) {
      var f = function() {
        return CanvasRenderingContext2D.prototype[method]
          .apply(nativeCtx_, arguments);
      };
      this[method] = f.bind(this);
    };

    [ // straight-up Context2d methods.
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
    ].forEach(do_the_right_thing, this);

    var do_the_other_right_thing = function(attribute) {
      Object.defineProperty(this, attribute, {
          get: get.bind(this, attribute),
          set: set.bind(this, attribute),
          enumerable: true,
          });
    };

    [ // Context2d attributes.
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
    ].forEach(do_the_other_right_thing, this);

    // read-only 'canvas' attribute of Context2d.
    Object.defineProperty(this, 'canvas', {
        enumerable: true,
        writable: false,
        value: canvas_
        });

    this.save = function() {
      matrix_ = matrix_.slice(0);
      stack_.push(matrix_);
      return CanvasRenderingContext2D.prototype.save
        .apply(nativeCtx_, arguments);
    };

    this.restore = function() {
      matrix_ = stack_.pop();
      if (stack_.length <= 0) stack_.push(matrix_);
      return CanvasRenderingContext2D.prototype.restore
        .apply(nativeCtx_, arguments);
    };

    this.scale = function(x, y) {
      matrix_ = meta.math.affine.scale(matrix_, x, y);
      return CanvasRenderingContext2D.prototype.scale
        .apply(nativeCtx_, arguments);
    };

    this.rotate = function(angle) {
      matrix_ = meta.math.affine.rotate(matrix_, angle);
      return CanvasRenderingContext2D.prototype.rotate
        .apply(nativeCtx_, arguments);
    };

    this.translate = function(x, y) {
      matrix_ = meta.math.affine.translate(matrix_, x, y);
      return CanvasRenderingContext2D.prototype.translate
        .apply(nativeCtx_, arguments);
    };

    this.transform = function(a, b, c, d, e, f) {
      matrix_ = meta.math.affine.transform(matrix_, [a, b, c, d, e, f]);
      return CanvasRenderingContext2D.prototype.transform
        .apply(nativeCtx_, arguments);
    };

    this.setTransform = function(a, b, c, d, e, f) {
      matrix_ = [a, b, c, d, e, f];
      return CanvasRenderingContext2D.prototype.setTransform
        .apply(nativeCtx_, arguments);
    };

    /**
     * @method getTransform
     *  Returns the current transformation state on the stack as an array [a, b,
     *  c, d, e, f], where a ... f correspond to values in the matrix below:
     *
     *  <code>
     *  |ace|
     *  |bdf|
     *  |001|
     *  </code>
     *
     * @return Array<<Number>>[6]
     */
    this.getTransform = function() {
      return matrix_.slice(0);
    };

  };

  meta.mixSafely(meta, {
    Context: Context
  });

}).call(this);
