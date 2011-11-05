(function() {
  this.printheader('meta2d::math::vector');

  var v1 = [],
      v2 = [0],
      v3 = [1, 2, 3],
      v4 = [4, 2, 6],
      v5 = [-5, 10, -15, 20],
      v6 = [20, -15, 10, -5],
      v7 = v6.concat(v2),
      v8 = [20, -15, 10, -5, 0];

  var v = meta2d.math.vector;

  printsection('operations');
  assert('equal',
    v.equal(v1, v1) &&
    v.equal(v6, v6, v6) &&
    !v.equal(v4, v5) &&
    !v.equal(v3, v4) &&
    !v.equal(v5, v6) &&
    !v.equal(v6, v7) &&
    v.equal(v7, v8));
  assert('scale',
    v.equal(v.scale(v1, 100), v1),
    !v.equal(v.scale(v3, 0), v2),
    v.equal(v.scale(v5, 0), v.scale(v6, 0)),
    v.equal(v.scale(v4, -0.5), [-2, -1, -3]));
  assert('plus',
    v.equal(v.plus(v1, v2), v2) &&
    v.equal(v.plus(v2, v2), v2) &&
    v.equal(v.plus(v3, v4), v.plus(v4, v3)) &&
    !v.equal(v.plus(v3, v6), v.plus(v3, v8)) &&
    !v.equal(v.plus(v1, v3), v.plus(v1, v4)) &&
    v.equal(v.plus(v1, v3), v.plus(v2, v3)) &&
    !v.equal(v.plus(v3, v5), v.plus(v4, v5)));
  assert('minus',
    v.equal(v.minus(v4, v3), [3, 0, 3]) &&
    v.equal(v.minus(v8, v6), [0, 0, 0, 0, 0]) &&
    !v.equal(v.minus(v3, v4), v.minus(v4, v3)));
  assert('mult',
    v.equal(v.mult(v3, [4, 1, 2]), v4),
    !v.equal(v.mult(v5, [-4, -1.5, -0.66666666, -0.25]), v6),
    v.equal(v.mult(v5, v6), v.mult(v6, v5)));

  summarize();

}).call(this);
