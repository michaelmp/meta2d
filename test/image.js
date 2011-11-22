/**
 * Tests the integrity of loaded RGB & RGBA PNG files.
 *
 * This test fails in Firefox on account of sub-pixel rendering affecting
 * all colors ([255, 0, 0] becomes [240, 0, 37] for example). 
 */

document.addEventListener('DOMContentLoaded',
(function() {

  var image1, image2;

  var root = this;

  var loadfail = function() {
    root.printheader('meta2d::Image');
    assert('Could not load images.');
    summarize();
  };

  var f = function() {
    root.printheader('meta2d::Image');

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
    image2 = new meta2d.Image('RGBcolors.png', false, f, loadfail);
  };
  image1 = new meta2d.Image('RGBAcolors.png', false, f2, loadfail);


}).bind(this));
