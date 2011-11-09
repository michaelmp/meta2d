(function() {
  this.printheader('meta2d::Image');

  // use vector equivalence for color comparison
  var same = meta2d.math.vector.equals;

  // thisArg for meta2d::Image.onload callback is the image.
  var integrity_check = function(type) {
    printsection(type);
    assert('data integrity',
      same(this.getPixel(0, 0), [255, 0, 0, 255]) &&
      same(this.getPixel(0, 25), [0, 255, 0, 255]) &&
      same(this.getPixel(0, 50), [0, 0, 255, 255]) &&
      same(this.getPixel(0, 75), [255, 255, 255, 127]));
  };

  new meta2d.Image('RGBAcolors.png', false, integrity_check.bind(void 0, 'png'));

  summarize();

}).call(this);
