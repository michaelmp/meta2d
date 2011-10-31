(function() {
  printheader('meta2d::math::Rect');

  // constructor
  println('Constructor');
  var r0 = new meta2d.math.Rect(),
      r1 = new meta2d.math.Rect(0, 0, 10, 10),
      r2 = new meta2d.math.Rect(),
      r3 = new meta2d.math.Rect(),
      r4 = new meta2d.math.Rect(),
      r5 = new meta2d.math.Rect();
  assert(r0.x === r0.y === r0.w === r0.h === 0);
  assert(false);

  // sameAs 

  // intersect

  // contains

  // containedBy

  // area

})();
