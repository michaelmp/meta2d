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
  var root = this,
      meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var get = function(attribute) {
    return nativeCtx_[attribute];
  };

  var set = function(attribute, value) {
    nativeCtx_[attribute] = value;
  };
  
  /**
   * @class Context
   *  Extends CanvasRenderingContext2D with getTransform and getBounds
   *  methods.
   */

  /**
   * @constructor
   *
   * @param w
   * @param h
   */
  var Context = function(w, h) {
    var ctx_ = this,
        canvas_ = new document.createElement('canvas'),
        nativeCtx_;
    
    canvas_.width = w;
    canvas_.height = h;
    canvas_.setAttribute('style', CANVAS_STYLE);
    nativeCtx_ = canvas_.getContext('2d');

    var do_the_right_thing = function(method) {
      var f = function() {
        return nativeCtx_[method].apply(this, arguments);
      };
      return f.bind(this);
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
          configurable: true,
          enumerable: true,
          writable: true
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
        get: get.bind(this, 'canvas'),
        set: void 0,
        configurable: false,
        enumerable: true,
        writable: false
        });

    this.save = function() {
      matrix_ = matrix_.slice(0);
      stack_.push(matrix_);
      return nativeCtx_.save.apply(this, arguments);
    };

    this.restore = function() {
      matrix_ = stack_.pop();
      return nativeCtx_.restore.apply(this, arguments);
    };

    this.scale = function(x, y) {
      // scale the matrix
      2x2 X [[x, 0] [0, y]]
      
      return nativeCtx_.scale.apply(this, arguments);
    };

    this.rotate = function(angle) {
      // rotate the matrix
      return nativeCtx_.rotate.apply(this, arguments);
    };

    this.translate = function(x, y) {
      // translate the matrix
      return nativeCtx_.translate.apply(this, arguments);
    };

    this.transform = function(a, b, c, d, e, f) {
      // transform the matrix
      return nativeCtx_.transform.apply(this, arguments);
    };

    this.setTransform = function(a, b, c, d, e, f) {
      // set the matrix
      return nativeCtx_.transform.apply(this, arguments);
    };

    this.getTransform = function() {
      return matrix_.slice(0);
    };

  };

  meta.mixSafely(meta, {
    Context: Context
  });

}).call(this);
