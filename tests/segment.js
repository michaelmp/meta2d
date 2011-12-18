document.addEventListener('DOMContentLoaded', (function() {
  this.printheader('meta2d::segment');

  // constructor
  printsection('Constructor');
  var seg = meta2d.segment,
      s1 = seg.segment(),
      s2 = seg.segment(0),
      s3 = seg.segment(void 0, 0),
      s4 = seg.always(),
      s5 = seg.segment(-10, 10),
      s6 = seg.segment(1, -1),
      s7 = seg.segment(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);

  assert('start at infinity',
      seg.start(s1) === seg.start(s3) &&
      seg.start(s1) === seg.start(s4) &&
      seg.start(s4) === Number.NEGATIVE_INFINITY);
  assert('end at infinity',
      seg.end(s1) === seg.end(s2) &&
      seg.end(s2) === seg.end(s4) &&
      seg.end(s4) === Number.POSITIVE_INFINITY);
  assert('normal bounds',
      seg.start(s5) === -10 &&
      seg.end(s5) === 10);

  // include
  printsection('includes');
  assert('finite within double-infinity included',
      seg.includes(s1, -100000, 0, 2340192859812348243));
  assert('finite within single-ended-infinity included',
      seg.includes(s2, 0, 1000, 493508405735908273954879345));
  assert('finite outside single-ended-infinity excluded',
      !seg.includes(s2, -1));
  assert('finite within finite bounds included',
      seg.includes(s5, -10, 0, 1));
  assert('finite outside finite bounds excluded',
      !seg.includes(s5, -11) &&
      !seg.includes(s5, 11));
  assert('infinite outside finite bounds excluded',
      !seg.includes(s5, Number.POSITIVE_INFINITY) &&
      !seg.includes(s5, Number.NEGATIVE_INFINITY));
  assert('infinite not included within infinite bounds',
      !seg.includes(s1, Number.POSITIVE_INFINITY , Number.NEGATIVE_INFINITY));

  // forward
  printsection('isForward');
  assert('isForward',
      seg.isForward(s1) &&
      seg.isForward(s5));
  assert('backward',
      !seg.isForward(s6));
  assert('backward infinity',
      !seg.isForward(s7));

  // reverse
  printsection('reverse');
  assert('start/end swapped',
      seg.reverse(s5)[0] === 10 &&
      seg.reverse(s5)[1] === -10);
  assert('isForward reversed output',
      !seg.isForward(seg.reverse(s5)));

  summarize();

}).bind(this), false);
