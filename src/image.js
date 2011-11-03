// provides:
//  meta2d.Image -- class
(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * @class Image
   *
   * Load a same-origin image and process the pixels as RGBA data. The image
   * must be from the same origin, as the pixel data is read from getImageData.
   *
   * @param params {src, w, h}
   */
  var Image = function(params){
    if (!params) throw 'Invalid Parameters';
    this.src = params.src;
    this.pixels = [];
    this.w = params.w;
    this.h = params.h;
    this.image = document.createElement('img');

    var canvas_ = document.createElement('canvas');
    canvas_.width = this.w;
    canvas_.height = this.h;
    var context_ = canvas_.getContext('2d');
    var img_ = this;

    /**
     * @return {r,g,b,a}
     */
    this.getPixel = function(x, y) {
      var idx = 4 * ((y * this.w) + x);
      return {
        r: this.pixels[idx],
        g: this.pixels[idx+1],
        b: this.pixels[idx+2],
        a: this.pixels[idx+3]
      };
    };

    // Extract the pixel data as an array.
    var process_ = function() {
      context_.drawImage(img_.image, 0, 0);
      var imgdata = context_.getImageData(0, 0, img_.w, img_.h);
      var i = imgdata.data.length;

      while (i--) {
        img_.pixels[i] = imgdata.data[i];
      }

      if ('onload' in img_) {
        img_.onload.call(img_);
      }

      // Free up leftover memory for garbage collection.
      context_ = null;
      canvas_ = null;
    };

    this.img.onload = process_;
    this.img.src = this.src;
  };

  meta.mixSafely(meta, {Image: Image});

}).call(this);

