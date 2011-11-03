(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * @abstract
   * @class Collision
   */
  var Collision = function() {
    meta.Modifiable.call(this, new meta.CollisionType());
  };
  Collision.prototype.collides = function(surface, obj1, obj2) {
    throw 'Unimplemented collision.';
  };

  meta.mixSafely(meta, {Collision: Collision});

  var Everywhere = function() {};
  Everywhere.prototype = new Collision();
  // @override
  Everywhere.prototype.collides = function() {
    return true;
  };

  var Nowhere = function() {};
  Nowhere.prototype = new Collision();
  // @override
  Nowhere.prototype.collides = function() {
    return false;
  };

  var BBox = function() {};
  BBox.prototype = new Collision();
  // @override
  BBox.prototype.collides = function(undefined, r1, r2) {
    if (meta.undef(r2.x) ||
        meta.undef(r2.y)) return false;
    if (meta.undef(r1.x) ||
        meta.undef(r1.y)) return false;
    if (meta.undef(r2.w)) r2.w = 0;
    if (meta.undef(r2.h)) r2.h = 0;
    if (meta.undef(r1.w)) r1.w = 0;
    if (meta.undef(r1.h)) r1.h = 0;
    if (r2.x > (r1.x + r1.w)) return false;
    if ((r2.x + r2.w) < r1.x) return false;
    if (r2.y > (r1.y + r1.h)) return false;
    if ((r2.y + r2.h) < r1.y) return false;
    return true;
  };

  var Alpha = function() {};
  Alpha.prototype = new Collision();
  // @override
  Alpha.prototype.collides = function(surface, data, point) {
    if (meta.undef(point.dx) ||
        meta.undef(point.dy))
      return false;
    if (meta.undef(data.dx) ||
        meta.undef(data.dy))
      return false;
    if (!data.image)
      return false;
    var image = surface.getImageByName(data.image);
    if (!image)
      return false;
    var xpercent = (point.dx - data.dx),
        ypercent = (point.dy - data.dy),
        sw = image.w,
        sh = image.h,
        sx = data.sx,
        sy = data.sy;
    if (meta.undef(sx))
      sx = 0;
    if (meta.undef(sy))
      sy = 0;
    if (!meta.undef(data.sw))
      sw = data.sw;
    if (!meta.undef(data.sh))
      sh = data.sh;
    if (!meta.undef(data.dw)) {
      xpercent /= data.dw;
    } else {
      xpercent /= sw;
    }
    if (!meta.undef(data.dh)) {
      ypercent /= data.dh;
    } else {
      ypercent /= sh;
    }
    if (xpercent < 0 || xpercent >= 1 ||
        ypercent < 0 || ypercent >= 1)
      return false;
    var col = sx + xpercent * sw;
    var row = sy + ypercent * sh;
    col = col.round();
    row = row.round();
    var pixel = image.getPixel(col, row);
    return pixel.a > 0;
  };

  var dynamicAlpha = function(frame) {
    var o = function() {};
    o.prototype = new Collision();
    // @override
    o.prototype.collides = function(surface, data, point) {
      return meta.collision.ALPHA.collides(surface, frame, point);
    };
    return new o();
  };

  meta.collision = meta.declareSafely(meta.collision, {
    EVERYWHERE: new Everywhere(),
    NOWHERE: new Nowhere(),
    BBOX: new BBox(),
    ALPHA: new Alpha(),
    dynamicAlpha: dynamicAlpha
  });

}).call(this);
