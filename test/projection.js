(function() {
  this.printheader('meta2d::Projection');

  var proj1 = meta2d.projection.FLAT,
      proj2 = meta2d.projection.iso2d(20, 10),
      vec1 = new meta2d.math.Vector(0, 0),
      vec1_p = new meta2d.math.Vector(0, 0),
      vec2 = new meta2d.math.Vector(-1, -1),
      vec2_p = new meta2d.math.Vector(0, -10),
      vec3 = new meta2d.math.Vector(3, 3),
      vec3_p = new meta2d.math.Vector(0, 30),
      vec4 = new meta2d.math.Vector(4, 1),
      vec4_p = new meta2d.math.Vector(30, 25),
      vec5 = new meta2d.math.Vector(1, 4),
      vec5_p = new meta2d.math.Vector(-30, 25);

  var v = meta2d.math.vector;

  printsection('flat projection');
  assert('forward',
    v.equal(proj1.forward(vec1), vec1) &&
    v.equal(proj1.forward(vec2), vec2) &&
    v.equal(proj1.forward(vec3), vec3) &&
    v.equal(proj1.forward(vec4), vec4) &&
    v.equal(proj1.forward(vec5), vec5));
  assert('reverse',
    v.equal(proj1.reverse(vec1), vec1) &&
    v.equal(proj1.reverse(vec2), vec2) &&
    v.equal(proj1.reverse(vec3), vec3) &&
    v.equal(proj1.reverse(vec4), vec4) &&
    v.equal(proj1.reverse(vec5), vec5));

  printsection('isometric projection');
  assert('forward',
    v.equal(proj2.forward(vec1), vec1_p) &&
    v.equal(proj2.forward(vec2), vec2_p) &&
    v.equal(proj2.forward(vec3), vec3_p) &&
    v.equal(proj2.forward(vec4), vec4_p) &&
    v.equal(proj2.forward(vec5), vec5_p));
  assert('reverse',
    v.equal(proj2.reverse(vec1_p), vec1) &&
    v.equal(proj2.reverse(vec2_p), vec2) &&
    v.equal(proj2.reverse(vec3_p), vec3) &&
    v.equal(proj2.reverse(vec4_p), vec4) &&
    v.equal(proj2.reverse(vec5_p), vec5));

  printsection('modified shift');
  proj1.modify(meta2d.projection.shift([-2, 3]));
  proj2.modify(meta2d.projection.shift([3, -2]));
  assert('flat',
      v.equal(proj1.forward(vec1), [-2, 3]) &&
      v.equal(proj1.reverse(vec1), [2, -3]) &&
      v.equal(proj1.forward(vec2), [-3, 2]) &&
      v.equal(proj1.reverse(vec2), [1, -4]) &&
      v.equal(proj1.forward(vec4), [2, 4]) &&
      v.equal(proj1.reverse(vec4), [6, -2]));
  assert('isometric',
      v.equal(proj2.forward(vec1), [3, -2]) &&
      v.equal(proj2.reverse([3, -2]), vec1) &&
      v.equal(proj2.forward(vec2), [3, -12]) &&
      v.equal(proj2.reverse([3, -12]), vec2) &&
      v.equal(proj2.forward(vec4), [33, 23]) &&
      v.equal(proj2.reverse([33, 23]), vec4));

  printsection('modified scale');
  proj1.modify(meta2d.projection.scale([0.5, -2]));
  proj2.modify(meta2d.projection.scale([-3, 1]));
  assert('flat',
      v.equal(proj1.forward(vec1), [-1, -6]) &&
      v.equal(proj1.reverse([-1, -6]), vec1) &&
      v.equal(proj1.forward(vec2), [-1.5, -4]) &&
      v.equal(proj1.reverse([-1.5, -4]), vec2) &&
      v.equal(proj1.forward(vec4), [1, -8]) &&
      v.equal(proj1.reverse([1, -8]), vec4));
  assert('isometric',
      v.equal(proj2.forward(vec1), [-9, -2]) &&
      v.equal(proj2.reverse([-9, -2]), vec1) &&
      v.equal(proj2.forward(vec2), [-9, -12]) &&
      v.equal(proj2.reverse([-9, -12]), vec2) &&
      v.equal(proj2.forward(vec4), [-99, 23]) &&
      v.equal(proj2.reverse([-99, 23]), vec4));
  for (var i = 0; i < 1000; i++) proj1.modify(meta2d.projection.scale([-1, -1]));
  assert('1000x recursion',
      v.equal(proj1.forward(vec1), [-1, -6]) &&
      v.equal(proj1.reverse([-1, -6]), vec1) &&
      v.equal(proj1.forward(vec2), [-1.5, -4]) &&
      v.equal(proj1.reverse([-1.5, -4]), vec2) &&
      v.equal(proj1.forward(vec4), [1, -8]) &&
      v.equal(proj1.reverse([1, -8]), vec4));
  proj1.modify(meta2d.projection.scale([0, 1]));
  assert('zero scale is inf on reversal',
      proj1.reverse([1, 2])[0] === Infinity);

  printsection('modified transformation matrix');
  assert('');

  summarize();

}).call(this);