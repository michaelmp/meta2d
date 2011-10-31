// provides:
//  meta2d.Animation -- class
//  meta2d.animation -- namespace
(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * @class Animation
   *
   * An animation is a collection of frames and in-be``tween'' rules for
   * interpolation. A tween takes a pair of frames and generates interpolated
   * frames at a desired time. To do an extrapolation, or for a -inf to inf
   * interpolation, simply use Number.POSITIVE_INFINITY or
   * Number.NEGATIVE_INFINITY as a start or end point, respectively.
   *
   * It is recommended that only a single tween act upon a single time range for
   * any given property. No guarantee is made on how two overlapping tweens will
   * interact on the same affected properties. Use a modifier on a tween to
   * build a composite interpolation.
   *
   * A tween may not be zero length, but may have a start frame greater than its
   * end frame so that the effect is easily reversed.
   */
  var Animation = function() {
    var frames_ = {},
        tweens_ = [],
        data_ = {};

    var apply_tweens = function(tween_array, index) {
      var obj_builder = {};
      for (var i = 0; i < tween_array.length; ++i) {
        var obj = tween_array[i].tween.call(this, index);
        if (obj) Object.extend(obj_builder, obj);
      }
      return obj_builder;
    };

    this.putFrame = function(index, data) {
      if (!index || !data) return this;
      frames_[index] = data;
      return this;
    },

    this.getFrame = function(index) {
      if (meta.undef(index)) return null;
      var f = frames_[index];
      if (f) return f;
      var intersecting_tweens = tweens.filter(function(s){
          return s.segment.include(index);
          });
      return apply_tweens(intersecting_tweens, index);
    }

    this.deleteFrame = function(index) {
      delete frames_[index];
      return this;
    };

    this.tween = function(params) {
      if (!params.segment) params.segment = meta.segment.ALWAYS;
      if (!params.tween) throw 'Invalid parameters.';
      var arg = {
        segment: params.segment,
        startframe: frames_[params.segment.start],
        endframe: frames_[params.segment.end]
      };
      var fixed = params.tween.fix.call(this, arg);
      if (!fixed) return this;
      if (params.segment.start === params.segment.end) return this;
      tweens.push({
          segment: params.segment,
          tween: fixed
          });
      return this;
    };
  };

  meta.Animation = Animation;

}).call(this);

