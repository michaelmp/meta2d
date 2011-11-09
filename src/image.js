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
   * Note that the image must be served from an approved origin. Read:
   *  [url] http://www.w3.org/TR/html5/the-canvas-element.html
   *    #security-with-canvas-elements [/url]
   *  [url] http://www.w3.org/TR/cors/ [/url]
   */

  /**
   * @constructor
   *
   * @param src
   *  A string sufficiently identifying the location of the image. All
   *  protocols & formats supported by the UA for an HTMLImage are allowed.
   *
   * @param wait
   *  Optional. If true, do not begin downloading the image until load() is
   *  called.
   *
   * @param onready
   *  Optional. A callback for when the image has been successfully loaded.
   */
  var Image = function(src, wait, onready) {
    if (!src) throw new meta.exception.InvalidParameterException();
    var img_ = this,
        src_ = src,
        pixels_ = [],
        w_,
        h_,
        dummy_ = document.createElement('img');

    // Set the callback for when the image is finished downloading.
    dummy_.onload = function() {
      var canvas = document.createElement('canvas'),
          context,
          idata,
          i;

      // Set some properties now that the image has been fetched.
      canvas.width = w_ = dummy_.width;
      canvas.height = h_ = dummy_.height;
      context = canvas.getContext('2d');

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
     * @method load
     *
     * Start the image download & process pixel data once it's received.
     *
     * @return [Image]
     *  thisArg
     */
    this.load = function() {
      dummy_.src = src_;
      return this;
    };

    // Do start the download unless instructed otherwise.
    if (!wait) this.load();

    /**
     * @method getHTMLImage
     *
     * @return [HTMLImage]
     */
    this.getHTMLImage = function() {
      return dummy_;
    };

    /**
     * @method getWidth
     *
     * @return [Number]
     *  The width of the image in pixels.
     */
    this.getWidth = function() {
      return w_;
    };

    /**
     * @method getHeight
     *
     * @return [Number]
     *  The height of the image in pixels.
     */
    this.getHeight = function() {
      return h_;
    };

    /**
     * @method getPixel
     *
     * @param x
     *  The column index.
     * @param y
     *  The row index.
     *
     * @return [Array<Number>]
     *  An array of the RGBA values as one byte each.
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
