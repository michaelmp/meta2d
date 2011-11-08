(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * @class Image
   *
   * Load an HTML image of any MIME type the UA can handle & extract the pixels
   * as RGBA data. The image automatically loads upon construction.
   *
   * Note that the image must be served from an approved origin.
   * @see http://www.w3.org/TR/html5/the-canvas-element.html
   *  #security-with-canvas-elements
   * @see http://www.w3.org/TR/cors/
   */

  /**
   * @constructor
   * @param [String] src
   * @param [Boolean] wait (optional)
   * @param [Function] onready (optional)
   */
  var Image = function(src, wait, onready) {
    if (!src) throw new meta.exception.InvalidParameterException();
    var img_ = this,
        src_ = src,
        pixels = [],
        w,
        h,
        dummy_ = document.createElement('img');

    // Set the callback for when the image is finished downloading.
    dummy_.onload = function() {
      var canvas = document.createElement('canvas'),
          context,
          idata,
          i;

      // Set some properties now that the image has been fetched.
      canvas.width = w_ = /** infer width */;
      canvas.height = h_ = /** infer height */;
      context  = canvas.getContext('2d');

      // Copy the image into our canvas.
      context.drawImage(dummy_, 0, 0);

      // Access the pixel data via the context.
      idata = context.getImageData(0, 0, w_, h_);

      i = idata.data.length;

      while (i--) {
        pixels_[i] = idata.data[i];
      }

      if (meta.def(onready)) onready.call(img_);
    };

    /**
     * @privileged
     * @method load
     *
     * Start the image download, process pixel data once it's received.
     */
    this.load = function() {
      dummy_.src = src_;
    };

    // Do start the download unless instructed otherwise.
    if (!wait) this.load();

    /**
     * @privileged
     * @method getHTMLImage
     * @return [HTMLImage]
     */
    this.getHTMLImage = function() {
      return dummy_;
    };

    /**
     * @privileged
     * @method getWidth
     * @return [Number]
     */
    this.getWidth = function() {
      return w_;
    };

    /**
     * @privileged
     * @method getHeight
     * @return [Number]
     */
    this.getHeight = function() {
      return h_;
    };

    /**
     * @privileged
     * @method getPixel
     * @param [Number] x
     * @param [Number] y
     * @return [Array<Number>] 4-byte rgba
     */
    this.getPixel = function(x, y) {
      var idx = 4 * ((y * w_) + x);
      return [
        pixels_[idx],
        pixels_[idx+1],
        pixels_[idx+2],
        pixels_[idx+3]
      ];
    };

  };

  meta.mixSafely(meta, {
    Image: Image
  });

}).call(this);
