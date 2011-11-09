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

    // take a base frame and apply tweens on top of it
    var apply_tweens = function(frame, tweens, index) {
      if (!tweens || meta.undef(index)) return frame;
      var merged = meta.mix({}, frame);

      tweens.forEach(function(t) {
          var f = t.tween.call(this, index);
          meta.mix(merged, f);
          }, this);

      return merged;
    };

    /**
     * @method putFrame
     * @param index
     *  A Number specifying when in time the frame is located. Only one frame
     *  may occupy a single time, although overlapping frames will merge their
     *  properties.
     * @param data
     *  An Object containing the frame data.
     * @return [Animation]
     *  thisArg
     */
    this.putFrame = function(index, data) {
      if (meta.undef(index) || !data) return this;
     
      frames_[index] = meta.declareSafely(frames_[index], data);

      return this;
    };

    /**
     * @method getFrame
     *  Generate a frame based on all interpolations affecting the index time.
     * @param index
     *  A Number specifying when in time the frame should be interpolated.
     * @return [Object | null]
     */
    this.getFrame = function(index) {
      if (meta.undef(index)) return null;
      var f = frames_[index] || {},
          intersecting_tweens = tweens_.filter(function(t) {
              return meta.segment.includes(t.segment, index);
              });

      return apply_tweens(f, intersecting_tweens, index);
    };

    /**
     * @method deleteFrame
     *  Removes a frame from the animation, without affecting any tweens
     *  that the frame may have been a keyframe for.
     * @param index
     *  A Number specifying when in time the frame is indexed.
     * @return [Animation]
     *  thisArg
     */
    this.deleteFrame = function(index) {
      delete frames_[index];
      return this;
    };

    /**
     * @method applyTween
     *  Performs interpolation on a timeframe, based on specified keyframes.
     *
     *  In this example, the animation will have property 'a' change in value
     *  from 0 to 1 from time 0 to 5.
     *  <code>
     *  anim.applyTween(slirp('a'), [0, 5], {a: 0}, {a: 1})
     *  
     *  // anim.getFrame(3).a === 0.6
     *  </code>
     * @param tween
     *  The [Tween] to use.
     * @param segment
     *  Optional. A time [Segment] describing the range to apply the tween to.
     *  This range should begin and end with keyframes in the animation if the
     *  tween requires keyframes. If not specified, the infinite range is used.
     * @param keyframes...
     *  Optional. Most tweens that interpolate will require keyframe data.
     * @return [Animation]
     *  thisArg
     */
    this.applyTween = function(tween, segment) {
      if (!segment) segment = meta.segment.ALWAYS;
      if (!tween) throw new meta.exception.InvalidParameterException();
      var keyframes = meta.args(arguments).slice(2),
          fixed = tween.fix.bind(this, segment).apply(this, keyframes);
      if (!fixed) return this;
      if (segment[0] === segment[1]) return this;

      tweens_.push({
          segment: segment,
          tween: fixed
          });

      return this;
    };

    /**
     * @method undoTweens
     *  Removes any tweens in the target area from the animation.
     * @param segment
     *  A time [Segment] identifying all tweens that intersect.
     * @return [Animation]
     * thisArg
     */
    this.undoTweens = function(segment) {
      if (!segment) return this;

      tweens_.forEach(function(t, i, array) {
          if (meta.segment.intersects(t.segment, segment))
            delete array[i];
          });

      return this;
    };
  };

  meta.mixSafely(meta, {
    Animation: Animation
  });

}).call(this);
