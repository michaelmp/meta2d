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
   * @param params
   */
  var Image = function(params){
    if (!params) throw 'Invalid Parameters';
    this.src = params.src;
    this.data = [];
    this.w = params.w;
    this.h = params.h;
    this.img = document.createElement('img');

    var canvas = document.createElement('canvas');
    canvas.width = this.w;
    canvas.height = this.h;
    var context = canvas.getContext('2d');
    var that = this;

    /**
     * @return {r,g,b,a}
     */
    this.getPixel = function(x, y){
      var idx = 4 * ((y * this.w) + x);
      return {
        r: this.data[idx],
        g: this.data[idx+1],
        b: this.data[idx+2],
        a: this.data[idx+3]
      };
    };

    this.process = function(){
      context.drawImage(that.img, 0, 0);
      var imgdata = context.getImageData(0, 0, that.w, that.h);
      for (var i = 0; i < imgdata.data.length; i += 1) {
        that.data[i] = imgdata.data[i];
      }
      if (that.onload !== undefined) {
        that.onload();
      }
      context = null;
      canvas = null;
      meta.images_loading -= 1;
    };

    this.img.onload = this.process;
    meta.images_loading += 1;
    this.img.src = this.src;
  };

  meta.Image = Image;

}).call(this);

