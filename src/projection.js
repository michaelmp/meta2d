// provides:
//  meta2d.Projection -- abstract base class
//  meta2d.projection -- namespace
(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';
  var projection = meta.projection = meta.redeclare(meta.projection);

  /**
   * @abstract
   * @class Projection
   */
  var Projection = function() {
    meta.Modifiable.call(this, new meta.ProjectionType());
  };
  Projection.prototype.forward = function() {
    throw 'Unimplemented projection.';
  };
  Projection.prototype.reverse = function() {
    throw 'Unimplemented projection.';
  };

  //
  var Flat = function() {};
  Flat.prototype = new Projection();
  Flat.prototype.forward = function(pos) {
    return pos;
  };
  Flat.prototype.reverse = function(pos) {
    return pos;
  };
  projection.FLAT = new Flat();

  //
  projection.axonometric = function(params) {
    var o = function() {};
    o.prototype = new Projection();
    o.prototype.forward = function(pos) {
      if (meta.undef(params.xoffset)) params.xoffset = 0;
      if (meta.undef(params.yoffset)) params.yoffset = 0;
      if (meta.undef(params.xskew)) params.xskew = 1;
      if (meta.undef(params.yskew)) params.yskew = 1;
      var x = params.xoffset + (pos.e(1) - pos.e(2))
        * 0.5 * params.xskew;
      var y = params.yoffset + (pos.e(2) + pos.e(1))
        * 0.5 * params.yskew;
      return meta.V([x, y]);
    };
    o.prototype.reverse = function(pos) {
      if (meta.undef(params.xoffset)) params.xoffset = 0;
      if (meta.undef(params.yoffset)) params.yoffset = 0;
      if (meta.undef(params.xskew)) params.xskew = 1;
      if (meta.undef(params.yskew)) params.yskew = 1;
      var a = (pos.e(1) - params.xoffset) / (0.5 * params.xskew);
      var b = (pos.e(2) - params.yoffset) / (0.5 * params.yskew);
      var x = (a + b) / 2;
      var y = b - x;
      return meta.V([x, y]);
    };
    return new o();
  };

}).call(this);

