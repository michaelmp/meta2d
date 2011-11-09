(function() {
  this.printheader('meta2d::Tween');

  var seg1 = new meta2d.Segment(0, 10),
      seg2 = new meta2d.Segment(),
      seg3 = new meta2d.Segment(-5, 5),
      twn1 = new meta2d.tween.constant('a', 5),
      twn2 = new meta2d.tween.constant('b', 'b'),
      twn3 = new meta2d.tween.constant('c', {}),
      twn4 = new meta2d.tween.linear('a'),
      twn5 = new meta2d.tween.variant('a', meta2d.tween.step),
      twn6 = new meta2d.tween.variant('a', meta2d.tween.sine),
      twn7 = new meta2d.tween.variant('a', meta2d.tween.square),
      twn8 = new meta2d.tween.constant('a');
      f1 = {a: -10},
      f2 = {a: 0},
      f3 = {a: 10};


  printsection('constant attribute');
  assert('valid in time range',
      twn1.fix(seg1)(0).a === 5 &&
      twn1.fix(seg1)(3).a === 5 &&
      twn1.fix(seg1)(10).a === undefined &&
      twn2.fix(seg1)(5).b === 'b' &&
      twn8.fix(seg1, f2, f3)(5).a === 0 &&
      typeof twn3.fix(seg1)(6).c === 'object');
  assert('invalid outside time range',
      meta2d.undef(twn1.fix(seg1)(-1).a) &&
      meta2d.undef(twn1.fix(seg1)(11).a));
  assert('valid in infinite time range',
      twn1.fix(seg2)(-100).a === 5 &&
      twn1.fix(seg2)(0).a === 5 &&
      twn1.fix(seg2)(100000).a === 5);

  printsection('linear attribute');
  assert('correct computation',
      twn4.fix(seg1, f2, f3)(0).a === 0 &&
      twn4.fix(seg1, f2, f3)(1).a === 1 &&
      twn4.fix(seg1, f2, f3)(10).a === undefined &&
      twn4.fix(seg3, f1, f3)(-2.5).a === -5 &&
      twn4.fix(seg3, f1, f3)(2.5).a === 5);
  assert('NaN in infinite range',
      isNaN(twn4.fix(seg2, f2, f3)(100).a));
  
  printsection('time-variant attribute');
  assert('step function',
      twn5.fix(seg2)(-0.0000000001).a === 0 &&
      twn5.fix(seg2)(0.0000000001).a === 1);
  assert('sine function',
      twn6.fix(seg2)(0).a === 0 &&
      1 - twn6.fix(seg2)(Math.PI / 2).a <= 0.000001);
  assert('square function',
      twn7.fix(seg2)(Math.PI / 2).a === 1 &&
      twn7.fix(seg2)(Math.PI * 1.5).a === -1);

  printsection('modified time-shift');
  twn5.modify(meta2d.modifier.shift(-1)); 
  assert('correctness',
      twn5.fix(seg2)(0.999999999).a === 0 &&
      twn5.fix(seg2)(1.000000001).a === 1);

  printsection('modified time-reverse');
  twn5.modify(meta2d.modifier.reverse());
  assert('correctness',
      twn5.fix(seg2)(-0.99999999).a === 0 &&
      twn5.fix(seg2)(-1.00000001).a === 1);
  for (var i = 0; i< 1000; i++) twn5.modify(meta2d.modifier.reverse());
  assert('depth',
      twn5.fix(seg2)(-0.99999999).a === 0);

  printsection('modified offset');
  twn5.modify(meta2d.modifier.offset('a', 2));
  assert('correctness',
      twn5.fix(seg2)(-0.99999999).a === 2 &&
      twn5.fix(seg2)(-1.00000001).a === 3);

  printsection('modified scale');
  twn5.modify(meta2d.modifier.scale('a', -0.5));
  assert('correctness',
      twn5.fix(seg2)(-0.99999999).a === -1 &&
      twn5.fix(seg2)(-1.00000001).a === -1.5);

  printsection('modified limit');
  twn5.modify(meta2d.modifier.offset('a', 1.25));
  twn5.modify(meta2d.modifier.limit('a', -0.2, 0.2));
  assert('correctness',
      twn5.fix(seg2)(-0.99999999).a === 0.2 &&
      twn5.fix(seg2)(-1.00000001).a === -0.2);

  printsection('modified quantization');
  assert('');

  printsection('modified envelope');
  assert('');

  printsection('modified extrapolation');
  assert('');

  printsection('modified s-curve');
  assert('');

  printsection('modified noise');
  assert('');

  summarize();

})();
