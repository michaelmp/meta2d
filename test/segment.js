(function() {
  this.printheader('meta2d::Segment');

  // constructor
  printsection('Constructor');
  var s1 = new meta2d.Segment();
  var s2 = new meta2d.Segment(0);
  var s3 = new meta2d.Segment(void 0, 0);
  var s4 = meta2d.segment.ALWAYS;
  var s5 = new meta2d.Segment(-10, 10);
  assert('start at infinity',
      s1.getStart() === s3.getStart() &&
      s1.getStart() === s4.getStart() &&
      s4.getStart() === Number.NEGATIVE_INFINITY);
  assert('end at infinity',
      s1.getEnd() === s2.getEnd() &&
      s2.getEnd() === s4.getEnd() &&
      s4.getEnd() === Number.POSITIVE_INFINITY);
  assert('normal bounds',
      s5.getStart() === -10 &&
      s5.getEnd() === 10);

  // include
  printsection('includes');
  assert('finite within double-infinity included',
      s1.includes(-100000) &&
      s1.includes(0) &&
      s1.includes(2340192859812348243));
  assert('finite within single-ended-infinity included',
      s2.includes(0) &&
      s2.includes(1000) &&
      s2.includes(493508405735908273954879345));
  assert('finite outside single-ended-infinity excluded',
      !s2.includes(-1));
  assert('finite within finite bounds included',
      s5.includes(-10) &&
      s5.includes(0) &&
      s5.includes(10));
  assert('finite outside finite bounds excluded',
      !s5.includes(-11) &&
      !s5.includes(11));
  assert('infinite outside finite bounds excluded',
      !s5.includes(Number.POSITIVE_INFINITY) &&
      !s5.includes(Number.NEGATIVE_INFINITY));
  assert('include infinite in infinite bounds',
      s1.includes(Number.POSITIVE_INFINITY) &&
      s1.includes(Number.NEGATIVE_INFINITY));

  // isforward
  printsection('isForward');
  var s6 = new meta2d.Segment(1, -1),
      s7 = new meta2d.Segment(Number.POSITIVE_INFINITY,
                              Number.NEGATIVE_INFINITY);
  assert('forward',
      s1.isForward());
  assert('backward',
      !s6.isForward());
  assert('backward infinity',
      !s7.isForward());

  // reverse
  printsection('reverse');
  assert('start/end swapped',
      s5.reverse().getStart() === 10 &&
      s5.reverse().getEnd() === -10);
  assert('isForward reversed output',
      !s5.reverse().isForward());

  summarize();

})();
