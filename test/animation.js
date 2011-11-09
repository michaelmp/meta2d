(function() {
  this.printheader('meta2d::Animation');

  var a1 = new meta2d.Animation();

  printsection('put & get frames');
  assert('correctness',
      a1.putFrame(0, {a: -5}).getFrame(0).a === -5 &&
      a1.putFrame(0, {b: 5}).getFrame(0).a === -5 &&
      a1.getFrame(0).b === 5 &&
      a1.getFrame(1).a === undefined);

  printsection('tweens');
  a1.putFrame(10, {a: 5});
  a1.putFrame(10, {b: 105});
  a1.applyTween(meta2d.tween.constant('a'), [0, 10],
      a1.getFrame(0),
      a1.getFrame(10));
  a1.applyTween(meta2d.tween.constant('a'), [10, 20],
      a1.getFrame(10),
      a1.getFrame(20));
  a1.applyTween(meta2d.tween.linear('b'), [0, 10],
      a1.getFrame(0),
      a1.getFrame(10));
  assert('constant',
      a1.getFrame(0).a === -5 &&
      a1.getFrame(10).a === 5 &&
      a1.getFrame(10.0000000001).a === 5 &&
      a1.getFrame(9.999).a === -5);
  assert('linear',
      a1.getFrame(0).b === 5 &&
      a1.getFrame(10).b === 105 &&
      a1.getFrame(5).b === 55);

  summarize();

})();
