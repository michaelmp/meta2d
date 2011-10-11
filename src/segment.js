// provides:
//  meta2d.Segment -- class
//  meta2d.segment -- namespace
(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';
  var segment = meta.segment = meta.redeclare(meta.segment);

  var Segment = function(start, end) {
    this.start = start;
    this.end = end;
    this.forward = (start <= end);
  };

  Segment.prototype = {
    include: function(time) {
      return this.forward ?
        time >= this.start && time <= this.end :
        time <= this.start && time >= this.end;
    },
    reverse: function() {
      return new Segment(this.end, this.start);
    }
  };

  meta.Segment = Segment;

  segment.ALWAYS = new Segment(Number.NEGATIVE_INFINITY,
                               Number.POSITIVE_INFINITY);

}).call(this);

