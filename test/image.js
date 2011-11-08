(function() {
  this.printheader('meta2d::Image');

  var integrity_check = function(type) {
    printsection(type);
    assert('data integrity',
      false);
  };

  new meta2d.Image('', false, integrity_check.bind(void 0, 'png'));
  new meta2d.Image('', false, integrity_check.bind(void 0, 'tga'));
  new meta2d.Image('', false, integrity_check.bind(void 0, 'gif'));

  summarize();

}).call(this);
