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
