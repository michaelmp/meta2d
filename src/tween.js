// provides:
//  meta2d.Tween -- mixin
//  meta2d.tween -- namespace
(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';
  var tween = meta.tween = meta.redeclare(meta.tween);

  var Tween = function() {
    meta.Modifiable.call(this, new meta.TweenType());
  };
  Tween.prototype.fix = function() {
    throw 'Unimplemented tween.';
  };
  meta.Tween = meta.redeclare(meta.Tween, Tween);

  tween.sequence = function(property, params) {
    var o = function() {};
    o.prototype = new Tween();
    // @override
    o.prototype.fix = function(timeframe) {
      return function(index) {
        if (!timeframe.segment.include(index)) return null;
        var frame = {};
        if (!params.step) params.step = 0;
        if (!params.offset) params.offset = 0;
        frame[property] = params.step * index;
        frame[property] += params.offset;
        if (params.bound) frame[property] %= params.bound;
        return frame;
      };
    };
    return new o();
  };

  tween.image = function(name) {
    var o = function() {};
    o.prototype = new Tween();
    //@override
    o.prototype.fix = function(timeframe) {
      return function(index) {
        if (!timeframe.segment.include(index)) return null;
        return {image: name};
      };
    };
    return new o();
  };

}).call(this);

