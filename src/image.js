/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/image.js
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

  /**
   * @class Image
   *
   * <p>
   * A wrapper class for HTMLImageElement. Loads an image and copies the bitmap
   * into a new canvas.
   * </p>
   *
   * <p>
   * An Image has the following properties:
   * <ol>
   *   <li> <i>src</i> - The image source.
   *   <li> <i>htmlImage</i> - The original HTMLImageElement loaded.
   *   <li> <i>ctx</i> - A rendering context on the image data.
   * </ol>
   * </p>
   */

  /**
   * @constructor
   *
   * @param src
   *
   * @param wait
   *  <i>Optional</i>. If true, will defer image loading to <b>load()</b>.
   *
   * @param onload
   *  <i>Optional</i> callback.
   *
   * @param onerror
   *  <i>Optional</i> callback.
   */
  var Image = function(src, wait, onload, onerror) {
    if (!src) throw new meta.exception.InvalidParameterException()

    this.src = src
    this.htmlImage = document.createElement('img')

    // Set the error callback.
    this.htmlImage.onerror = onerror

    // Set callback for when the image is loaded.
    this.htmlImage.onload = (function() {
      // Store the image in a canvas.
      var canvas = document.createElement('canvas')
      canvas.width = this.htmlImage.width
      canvas.height = this.htmlImage.height
      this.ctx = new meta.Context(canvas)
      this.ctx.drawImage(this.htmlImage, 0, 0)

      // Inform the onload callback.
      if (meta.def(onload)) onload.call(this)
    }).bind(this)


    // Start the download unless instructed otherwise.
    !wait && this.load()
  }

  /**
   * @method load
   *  Starts the image download.
   *
   * @return Image
   */
  Image.prototype.load = function() {
    this.htmlImage.src = this.src
      return this
  }

  /**
   * @method getPixel
   *  Returns an array of RGBA values in [0, 255],
   *  or null if (x, y) is outside the image bounds.
   *
   *  <p>
   *  Note that for 
   *  <a href="http://www.w3.org/TR/html5/the-canvas-element.html#security-with-
   *canvas-elements">security reasons</a>, the image source must be an
   *  approved origin.
   * </p>
   *
   * @param x
   *  The column index.
   * @param y
   *  The row index.
   *
   * @return Array<<Number>>[4]
   */
  Image.prototype.getPixel = function(x, y) {
    return this.ctx.getImageData(x, y, 1, 1).data
  }

  meta.mixSafely(meta, {
    Image: Image
  })

}(this.meta2d);
