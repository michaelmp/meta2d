(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * @class Segment
   *  Segment === Array of length 2.
   */
  var Segment = function(start, end) {
    if (meta.undef(start))
      start = Number.NEGATIVE_INFINITY;
    if (meta.undef(end))
      end = Number.POSITIVE_INFINITY;
    this.push(start, end);
  };
  Segment.prototype = new Array();

  var start = function(seg) {
    return seg[0];
  };

  var end = function(seg) {
    return seg[1];
  };

  var is_forward = function(seg) {
    return start(seg) <= end(seg);
  };

  var reverse = function(seg) {
    return [seg[1], seg[0]];
  };

  // inclusive at start, exclusive at end
  var includes = function(seg) {
    var queries = meta.args(arguments).slice(1);

    return queries.every(function(q) {
        return is_forward(seg) ?
          q >= start(seg) && q < end(seg) :
          q <= start(seg) && q > end(seg);
          });
  };

  var intersects = function(seg) {
    var segs = meta.args(arguments).slice(1);

    return segs.every(function(s) {
        return includes(seg, start(s))
            || includes(seg, end(s));
        });
  };

  meta.mixSafely(meta, {
    Segment: Segment
  });

  meta.segment = meta.declareSafely(meta.segment, {
    ALWAYS: [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
    start: start,
    end: end,
    isForward: is_forward,
    reverse: reverse,
    includes: includes,
    intersects: intersects
  });

}).call(this);
