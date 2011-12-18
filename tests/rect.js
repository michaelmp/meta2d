document.addEventListener('DOMContentLoaded',
(function() {
  this.printheader('meta2d::math::rect');

  // constructor
  printsection('Constructor');
  var rect = meta2d.math.rect,
      r0 = rect.rect(),
      r1 = rect.rect(0, 1.0, 2.5, 3),
      r2 = rect.rect(0, 1.0, 2.5, 3),
      r3 = rect.rect(0.00000000000000000001, 1.0, 2.5, 3),
      ro = rect.rect({x: 1, y: 2, w: 3}),
      rp = rect.rect(1, 2, 3),
      r4 = rect.rect(-1, -1, 2, 2),
      r5 = rect.rect(1, 1, 2, 2),
      r6 = rect.rect(0, 0, 2, 2),
      r7 = rect.rect(-0.5, -0.5, 1, 1),
      r8 = rect.intersect(r5, r6),
      r9 = rect.intersect(r4, r6),
      r10 = rect.rect(-1, -1, 2, 2),
      r11 = rect.rect(1, 0, 2, 2),
      r12 = rect.rect(1, -1, 2, 1),
      r13 = rect.rect(0, -1, 0, 2),
      r14 = rect.rect(-1, 0, 2, 0),
      r15 = rect.rect(0, 0, 0, 0);

      
  assert('no args',
    r0[0] === r0[1] &&
    r0[1] === r0[2] &&
    r0[2] === r0[3] &&
    r0[3] === 0);
  assert('partial args',
    rp[0] === 1 &&
    rp[1] === 2 &&
    rp[2] === 3 &&
    rp[3] === 0);
  assert('full args',
    r1[0] === 0 &&
    r1[1] === 1 &&
    r1[2] === 2.5 &&
    r1[3] === 3.0);
  assert('object arg',
    ro[0] === 1 &&
    ro[1] === 2 &&
    ro[2] === 3 &&
    ro[3] === 0);

  // equal 
  printsection('equal');
  assert('different is not same',
      !rect.equal(r0,r1));
  assert('same is same',
      rect.equal(r1,r2));
  assert('decimal point difference is not same',
      !rect.equal(r2,r3));
  assert('reflexivity',
      rect.equal(r1,r2) &&
      rect.equal(r2, r1));

  // intersect
  printsection('intersect');
  assert('intersection with self is self',
      rect.equal(rect.intersect(r4,r4), r4));
  assert('meeting at a corner is not an intersection',
      rect.intersect(r4, r5) === null);
  assert('meeting at x-edge is not an intersection',
      rect.intersect(r11, r12) === null);
  assert('meeting at y-edge is not an intersection',
      rect.intersect(r10, r11) === null);
  assert('line-in-rect intersection is a line',
      rect.intersect(r13, r10) !== null &&
      rect.equal(rect.intersect(r13, r10), r13));
  assert('line-line intersection at a point',
      rect.intersect(r14, r13) !== null &&
      rect.equal(rect.intersect(r14, r13), r15));
  assert('intersection bounds correct',
      r8[0] === 1 &&
      r8[1] === 1 &&
      r8[2] === 1 &&
      r8[3] === 1);
  assert('intersection with subsection is subsection',
      rect.equal(rect.intersect(r4, r7), r7));
  assert('reflexivity',
      rect.equal(rect.intersect(r5, r6), rect.intersect(r6, r5)));

  // contains
  printsection('contains');
  assert('forward contains',
      rect.contains(r4, r7));
  assert('reverse fails when different',
      !rect.contains(r7, r4));
  assert('succeeds when same',
      rect.contains(r4, r4));

  // containedBy
  printsection('containedBy');
  assert('forward contained',
      rect.containedBy(r7, r4));
  assert('reverse fails when different',
      !rect.containedBy(r4, r7));
  assert('succeeds when same',
      rect.containedBy(r4, r4));

  // area
  printsection('area');
  assert('computation',
      rect.area(r2) === 7.5);
  assert('zero-area',
      rect.area(r0) === 0);

  summarize();

}).bind(this), false);
