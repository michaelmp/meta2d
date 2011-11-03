(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * @class Projection
   */
  var Projection = function() {
    meta.Modifiable.call(this, new meta.ProjectionType());
  };

  // @abstract
  Projection.prototype.forward = function() {
    throw new meta.exception.InvokedAbstractMethodException();
  };

  // @abstract
  Projection.prototype.reverse = function() {
    throw new meta.exception.InvokedAbstractMethodException();
  };

  meta.mixSafely(meta, {Projection: Projection});

  var Flat = function() {};
  Flat.prototype = new Projection();
  Flat.prototype.forward = function(pos) {
    return pos;
  };
  Flat.prototype.reverse = function(pos) {
    return pos;
  };

  var axonometric = function(params) {
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

  meta.projection = meta.declareSafely(meta.projection, {
    FLAT: new Flat(),
    axonometric: axonometric
  });

  // [Modifier<ProjectionType>]
  var Center = function() {
    meta.Modifier.call(this, meta.ProjectionType);

    this.modify = function(projection) {
      projection.forward = this.wrap(projection.forward);
      projection.reverse = this.wrap(projection.reverse);
    };
  };
  Center.prototype.wrap = function(f) {
    // #context Surface
    return function() {
      var pos = f.apply(this, arguments);
      return pos.add(meta.V([this.params.w * 0.5, this.params.h * 0.5]));
    }
  };

  meta.modifier = meta.declareSafely(meta.modifier, {
    CENTER: new Center()
  });

}).call(this);
