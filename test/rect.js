(function() {
  this.printheader('meta2d::math::Rect');

  // constructor
  printsection('Constructor');
  var r0 = new meta2d.math.Rect(),
      r1 = new meta2d.math.Rect(0, 1.0, 2.5, 3),
      r2 = new meta2d.math.Rect(0, 1.0, 2.5, 3),
      r3 = new meta2d.math.Rect(0.00000000000000000001, 1.0, 2.5, 3),
      ro = new meta2d.math.Rect({x: 1, y: 2, w: 3}),
      rp = new meta2d.math.Rect(1, 2, 3);
  assert('no args',
    r0.x === r0.y &&
    r0.y === r0.w &&
    r0.w === r0.h &&
    r0.h === 0);
  assert('partial args',
    rp.x === 1 &&
    rp.y === 2 &&
    rp.w === 3 &&
    rp.h === 0);
  assert('full args',
    r1.x === 0 &&
    r1.y === 1 &&
    r1.w === 2.5 &&
    r1.h === 3.0);
  assert('object arg',
    ro.x === 1 &&
    ro.y === 2 &&
    ro.w === 3 &&
    ro.h === 0);

  // sameAs 
  printsection('sameAs');
  assert('different is not same',
      !r0.sameAs(r1));
  assert('same is same',
      r1.sameAs(r2));
  assert('decimal point difference is not same',
      !r2.sameAs(r3));
  assert('reflexivity',
      r1.sameAs(r2) &&
      r2.sameAs(r1));

  // intersect
  printsection('intersect');
  var r4 = new meta2d.math.Rect(-1, -1, 2, 2),
      r5 = new meta2d.math.Rect(1, 1, 2, 2),
      r6 = new meta2d.math.Rect(0, 0, 2, 2),
      r7 = new meta2d.math.Rect(-0.5, -0.5, 1, 1);
  assert('intersection with self is self',
      r4.intersect(r4).sameAs(r4));
  assert('meeting at a corner is not an intersection',
      r4.intersect(r5) === null);
  var r8 = r5.intersect(r6),
      r9 = r4.intersect(r6),
      r10 = new meta2d.math.Rect(-1, -1, 2, 2),
      r11 = new meta2d.math.Rect(1, 0, 2, 2),
      r12 = new meta2d.math.Rect(1, -1, 2, 1),
      r13 = new meta2d.math.Rect(0, -1, 0, 2),
      r14 = new meta2d.math.Rect(-1, 0, 2, 0),
      r15 = new meta2d.math.Rect(0, 0, 0, 0);
  assert('meeting at x-edge is not an intersection',
      r11.intersect(r12) === null);
  assert('meeting at y-edge is not an intersection',
      r10.intersect(r11) === null);
  assert('line-in-rect intersection is a line',
      r13.intersect(r10) !== null &&
      r13.intersect(r10).sameAs(r13));
  assert('line-line intersection at a point',
      r14.intersect(r13) !== null &&
      r14.intersect(r13).sameAs(r15));
  assert('intersection bounds correct',
      r8.x === 1 &&
      r8.y === 1 &&
      r8.w === 1 &&
      r8.h === 1);
  assert('intersection with subsection is subsection',
      r4.intersect(r7).sameAs(r7));
  assert('reflexivity',
      r5.intersect(r6).sameAs(r6.intersect(r5)));

  // contains
  printsection('contains');
  assert('forward contains',
      r4.contains(r7));
  assert('reverse fails when different',
      !r7.contains(r4));
  assert('succeeds when same',
      r4.contains(r4));


  // containedBy
  printsection('containedBy');
  assert('forward contained',
      r7.containedBy(r4));
  assert('reverse fails when different',
      !r4.containedBy(r7));
  assert('succeeds when same',
      r4.containedBy(r4));

  // area
  printsection('area');
  assert('computation',
      r2.area() === 7.5);
  assert('zero-area',
      r0.area() === 0);

  summarize();

})();
