(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * @class RCache
   * A cache of rectangle-keyed data, allowing for
   * intersection-based lookups while maintaining a limited
   * number of entries.
   */
  var RCache = function(size) {
    var rcache_ = this,
        rtree_ = new meta.RTree(4),
        lru_ = new meta.LRU(size || 16);

    this.add = function(rect, val) {
      var dropped = lru_.add(meta.serialize(rect), val);

      dropped.forEach(function(v) {
          rtree_.findAndRemove(v.rect);
          });
      if (dropped.length) {
        rtree_.findAndRemove(rect);
        rtree_.insert(rect, val);
      }

      return this;
    };

    this.get = function(rect) {
      return lru_.get(rect);
    };

    this.update = function(rect, val) {
      var dropped = lru_.update(meta.serialize(rect), val);

      dropped.forEach(function(v) {
          rtree_.findAndRemove(v.rect);
          });
      rtree_.findAndRemove(rect);
      rtree_.insert(rect, val);

      return this;
    };

    this.pluck = function(rect) {
      lru_.pluck(meta.serialize(rect));
      rtree_.findAndRemove(rect);

      return this;
    };

    this.pluckInside = function(rect) {
      var hits = rtree_.searchInside(rect);

      hits.forEach(function(v) {
          rcache_.pluck(v.rect);
          });

      return this;
    };

    this.pluckOutside = function(rect) {
      var hits = rtree_.searchOutside(rect);

      hits.forEach(function(v) {
          rcache_.pluck(v.rect);
          });

      return this;
    };
  };

  meta.mixSafely(meta, {RCache: RCache});

}).call(this);
