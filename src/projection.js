(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * @class Projection
   *  : Mofiable<ProjectionType>
   *
   * A projection takes a vector and maps it into another. The prototypical
   * example is converting a 2d or 3d coordinate space into a 2d coordinate
   * space via isometric projection.
   *
   * A forward projection applies the projection.
   * A reverse projection undoes the projection.
   */

  // @constructor
  var Projection = function() {
    meta.Modifiable.call(this, new meta.ProjectionType());
  };

  // @abstract
  // @method forward
  Projection.prototype.forward = function() {
    throw new meta.exception.InvokedAbstractMethodException();
  };

  // @abstract
  // @method reverse
  Projection.prototype.reverse = function() {
    throw new meta.exception.InvokedAbstractMethodException();
  };

  // [meta2d::Projection]
  var Flat = function() {};
  Flat.prototype = new Projection();
  Flat.prototype.forward = function(v) {
    return v;
  };
  Flat.prototype.reverse = function(v) {
    return v;
  };

  // @return [meta2d::Projection]
  var iso_from_2d = function(w, h) {
    if (!w || !h) throw new meta.exception.InvalidParameterException();
    var o = function() {};

    o.prototype = new Projection();
    o.prototype.forward = function(v) {
      return [
        (v[0] - v[1]) * 0.5 * w,
        (v[1] - v[0]) * 0.5 * h
      ];
    };
    o.prototype.reverse = function(v) {
      var a = 2 * v[0] / w,
          b = 2 * v[1] / h,
          x = (a + b) / 2,
          y = b - x;
      return [x, y];
    };

    return new o();
  };

  // @return [meta2d::Projection]
  var iso_from_3d = function(w, h, d) {
    if (!w || !h || !d) throw new meta.exception.InvalidParameterException();
    var o = function() {};

    o.prototype = new Projection();
    o.prototype.forward = function(v) {
      return [
        (v[0] - v[2]) * 0.5 * w,
        (v[2] - v[0]) * 0.5 * d + (v[1] * h)
      ];
    };
    o.prototye.reverse = function(v) {
      return null; // underdetermined
    };

    return new o();
  };

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
      var v = f.apply(this, arguments);
      return v.add([this.params.w * 0.5, this.params.h * 0.5]);
    }
  };

  meta.modifier = meta.declareSafely(meta.modifier, {
    CENTER: new Center()
  });

  meta.mixSafely(meta, {Projection: Projection});

  meta.projection = meta.declareSafely(meta.projection, {
    FLAT: new Flat(),
    iso2d: iso_from_2d,
    iso3d: iso_from_3d
  });

}).call(this);
