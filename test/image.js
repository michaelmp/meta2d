document.addEventListener('DOMContentLoaded',
(function() {
  this.printheader('meta2d::Image');

  // use vector equivalence for color comparison
  var same = meta2d.math.vector.equal;

  // thisArg for meta2d::Image.onload callback is the image.
  var rgba_check = function() {
    assert('rgba correctness',
      same(this.getPixel(0, 0), [255, 0, 0, 255]) &&
      same(this.getPixel(0, 25), [0, 255, 0, 255]) &&
      same(this.getPixel(0, 50), [0, 0, 255, 255]) &&
      same(this.getPixel(0, 75), [255, 255, 255, 127]));
  };

  var rgb_check = function() {
    assert('rgb correctness',
      same(this.getPixel(0, 0), [255, 0, 0, 255]) &&
      same(this.getPixel(0, 25), [0, 255, 0, 255]) &&
      same(this.getPixel(0, 50), [0, 0, 255, 255]) &&
      same(this.getPixel(0, 75), [255, 255, 255, 255]));
  };
  
  var loadfail = function() {
    assert('Load test image');
  };

  new meta2d.Image('RGBAcolors.png', false, rgba_check, loadfail);
  new meta2d.Image('RGBcolors.png', false, rgb_check, loadfail);

  summarize();

}).bind(this));
