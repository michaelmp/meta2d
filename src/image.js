/** image.js
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
   * @param onload
   *  Optional. A callback for when the image has been successfully loaded and
   *  the pixel data have been read.
   *
   * @param onerror
   *  Optional. A callback for when something goes wrong loading the image.
   */
  var Image = function(src, wait, onload, onerror) {
    if (!src) throw new meta.exception.InvalidParameterException();
    var img_ = this,
        src_ = src,
        pixels_ = [],
        w_,
        h_,
        dummy_ = document.createElement('img'),
        canvas_,
        context_;

    // Set the error callback.
    dummy_.onerror = onerror;

    // Set the callback for when the image is finished downloading.
    dummy_.onload = function() {
      var idata, i;
      canvas_ = document.createElement('canvas');

      // Set some properties now that the image has been fetched.
      canvas_.width = w_ = dummy_.width;
      canvas_.height = h_ = dummy_.height;
      context_ = canvas_.getContext('2d');

      // Copy the image into our canvas.
      context_.drawImage(dummy_, 0, 0);

      // Access the pixel data via the context.
      idata = context_.getImageData(0, 0, w_, h_);

      i = idata.data.length;
      while (i--) pixels_[i] = idata.data[i];

      if (meta.def(onload)) onload.call(img_);
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

    /**
     * @method getHTMLImage
     *
     * @return [HTMLImage]
     */
    this.getHTMLImage = function() {
      return dummy_;
    };

    /**
     * @method getCanvas
     *
     * @return [HTMLCanvas]
     */
    this.getCanvas = function() {
      return canvas_;
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

    // Start the download unless instructed otherwise.
    if (!wait) this.load();

  };

  meta.mixSafely(meta, {
    Image: Image
  });

}).call(this);
