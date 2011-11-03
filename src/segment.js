(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var Segment = function(start, end) {
    var start_ = start,
        end_ = end,
        forward_;
    if (meta.undef(start_)) start_ = Number.NEGATIVE_INFINITY;
    if (meta.undef(end_)) end_ = Number.POSITIVE_INFINITY;
    forward_ = (start_ <= end_);

    /**
     * @privileged
     * @method getStart
     * @return [Number]
     */
    this.getStart = function() {
      return start_;
    };

    /**
     * @privileged
     * @method getEnd
     * @return [Number]
     */
    this.getEnd = function() {
      return end_;
    };

    /**
     * @privileged
     * @method includes
     * @param t
     * @return [Boolean]
     */
    this.includes = function(t) {
      return forward_ ?
        t >= start_ && t <= end_ :
        t <= start_ && t >= end_;
    };

    /**
     * @privileged
     * @method isForward
     * @return [Boolean]
     */
    this.isForward = function() {
      return forward_;
    };

    /**
     * @privileged
     * @method reverse
     * @return [meta2d::Segment]
     */
    this.reverse = function() {
      return new Segment(end_, start_);
    };

  };

  meta.mixSafely(meta, {Segment: Segment});

  meta.segment = meta.declareSafely(meta.segment, {
    ALWAYS: new Segment(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
  });

}).call(this);
