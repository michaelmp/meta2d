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
  Projection.prototype.forward = function(v) {
    throw new meta.exception.InvokedAbstractMethodException();
  };

  // @abstract
  // @method reverse
  Projection.prototype.reverse = function(v) {
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
        (v[1] + v[0]) * 0.5 * h
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

  // @return [meta2d::Modifier<meta2d.ProjectionType>]
  var shift = function(v_shift) {
    var o = function() {
      meta.Modifier.call(this, meta.ProjectionType);
      this.modify = function(projection) {
        projection.forward = this.wrapForward(projection.forward);
        projection.reverse = this.wrapReverse(projection.reverse);
      };
    };

    o.prototype.wrapForward = function(f) {
      return function(v) {
        return meta.math.vector.plus(f.call(this, v), v_shift);
      };
    };
    o.prototype.wrapReverse = function(f) {
      return function(v) {
        return f.call(this, meta.math.vector.minus(v, v_shift));
      };
    };

    return new o();
  };

  // @return [meta2d::Modifier<meta2d.ProjectionType>]
  var scale = function(v_scale) {
    var o = function() {
      meta.Modifier.call(this, meta.ProjectionType);
      this.modify = function(projection) {
        projection.forward = this.wrapForward(projection.forward);
        projection.reverse = this.wrapReverse(projection.reverse);
      };
    };

    o.prototype.wrapForward = function(f) {
      return function(v) {
        return meta.math.vector.mult(f.call(this, v), v_scale);
      };
    };
    o.prototype.wrapReverse = function(f) {
      return function(v) {
        return f.call(this, meta.math.vector.mult(
              v, meta.math.vector.invert(v_scale)));
      };
    };

    return new o();
  };

  meta.mixSafely(meta, {
    Projection: Projection
  });

  meta.projection = meta.declareSafely(meta.projection, {
    FLAT: new Flat(),
    iso2d: iso_from_2d,
    shift: shift,
    scale: scale
  });

}).call(this);
