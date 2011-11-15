document.addEventListener('DOMContentLoaded',
(function() {

  var image1, image2;

  var loadfail = function() {
    this.printheader('meta2d::Image');
    assert('Could not load images.');
    summarize();
  };

  var f = function() {
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

    rgba_check.call(image1);
    rgb_check.call(image2);
    
    summarize();
  };
  
  var f2 = function() {
    image2 = new meta2d.Image('RGBcolors.png', false, f.bind(this), loadfail.bind(this));
  };
  image1 = new meta2d.Image('RGBAcolors.png', false, f2.bind(this), loadfail.bind(this));


}).bind(this));
