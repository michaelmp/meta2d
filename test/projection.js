(function() {
  this.printheader('meta2d::Projection');

  var proj1 = meta2d.projection.FLAT,
      proj2 = meta2d.projection.iso2d(20, 10),
      proj3 = meta2d.projection.iso3d(10, 20, 30),
      vec1 = new meta2d.math.Vector(0, 0),
      vec1_p = new meta2d.math.Vector(0, 0),
      vec2 = new meta2d.math.Vector(-1, -1),
      vec2_p = new meta2d.math.Vector(-20, -10),
      vec3 = new meta2d.math.Vector(3, 3),
      vec3_p = new meta2d.math.Vector(60, 30),
      vec4 = new meta2d.math.Vector(4, 1),
      vec4_p = new meta2d.math.Vector(80, 10),
      vec5 = new meta2d.math.Vector(1, 4),
      vec5_p = new meta2d.math.Vector(20, 40);

  var v = meta2d.math.vector;

  printsection('flat projection');
  assert('correct computation',
    v.equal(proj1.forward(vec1), vec1) &&
    v.equal(proj1.reverse(vec1), vec1) &&
    v.equal(proj1.forward(vec2), vec2) &&
    v.equal(proj1.reverse(vec2), vec2) &&
    v.equal(proj1.forward(vec3), vec3) &&
    v.equal(proj1.reverse(vec3), vec3) &&
    v.equal(proj1.forward(vec4), vec4) &&
    v.equal(proj1.reverse(vec4), vec4) &&
    v.equal(proj1.forward(vec5), vec5) &&
    v.equal(proj1.reverse(vec5), vec5));

  printsection('isometric projection');
  assert('correct computation',
    v.equal(proj2.forward(vec1), vec1_p) &&
    v.equal(proj2.forward(vec2), vec2_p) &&
    v.equal(proj2.forward(vec3), vec3_p) &&
    v.equal(proj2.forward(vec4), vec4_p) &&
    v.equal(proj2.forward(vec5), vec5_p));

  printsection('modified shift');

  printsection('modified scale');

  printsection('modified screen-centered');

  summarize();

}).call(this);
