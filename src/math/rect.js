(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace';

  var math = meta.math = meta.redefine(meta.math, {});

  // @constructor
  // @param (x, y, w ,h) | [{x, y, w, h}]
  var Rect = function() {
    if (arguments.length === 1) {
      this.x = arguments[0].x || 0;
      this.y = arguments[0].y || 0;
      this.w = arguments[0].w || 0;
      this.h = arguments[0].h || 0;
    } else {
      this.x = arguments[0] || 0;
      this.y = arguments[1] || 0;
      this.w = arguments[2] || 0;
      this.h = arguments[3] || 0;
    }
  };

  // @return [null | meta::math::Rect]
  Rect.prototype.intersect = function(r) {
    var x = Math.max(r.x, this.x),
        y = Math.max(r.y, this.y),
        w = (r.x > this.x) ?
            (this.w - r.x + this.x) :
            (r.w - this.x + r.x),
        h = (r.y > this.y) ?
            (this.h - r.y + this.y) :
            (r.h - this.y + r.y);

    if (w <= 0 || h <= 0) return null;

    return new Rect(x, y, w, h);
  };

  // @return [Boolean]
  Rect.prototype.contains = function(r) {
    return r.x >= this.x &&
           r.y >= this.y &&
           r.x + r.w <= this.x + this.w &&
           r.y + r.h <= this.y + this.h;
  };

  // @return [Boolean]
  Rect.prototype.containedBy = function(r) {
    return r.contains(this);
  };

  // @return [Boolean]
  Rect.prototype.sameAs = function(r) {
    return r.x === this.x &&
           r.y === this.y &&
           r.w === this.w &&
           r.h === this.h;
  };

  // @return [Number]
  Rect.prototype.area = function() {
    return this.w * this.h;
  };

  math.Rect = Rect;

}).call(this);

