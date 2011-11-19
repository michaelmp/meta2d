/** rcache.js
 *  Copyright (c) 2011 Michael Morris-Pearce <mikemp@mit.edu>
 * 
 *      This file is part of Meta2D.
 *
 *      Meta2D is free software: you can redistribute it and/or modify
 *      it under the terms of the GNU General Public License as published by
 *      the Free Software Foundation, either version 3 of the License, or
 *      (at your option) any later version.
 *
 *      Meta2D is distributed in the hope that it will be useful,
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of
 *      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *      GNU General Public License for more details.
 *
 *      You should have received a copy of the GNU General Public License
 *      along with Meta2D.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  Meta2D is hosted at <https://gitorious.org/meta2d/>. Please check there for
 *  up-to-date code, examples, documentation, and other information.
 *----------------------------------------------------------------------------*/
/** jslint vars: true, white: true, indent: 2, maxlen: 80, imperfection: true */

(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var datum_val = function(datum) {
    return datum.val;
  };

  /**
   * @class RCache
   * A cache of rectangle-keyed data, allowing for
   * intersection-based lookups while maintaining a limited
   * number of entries.
   */

  /**
   * @constructor
   * @param size
   */
  var RCache = function(size) {
    var rcache_ = this,
        rtree_ = new meta.RTree(4),
        lru_ = new meta.LRU(size || 16);

    this.add = function(rect, val) {
      var key = meta.serialize(rect);

      // Only proceed if key is not present in cache.
      if (lru_.get(key)) return [];

      return this.update(rect, val);
    };

    this.get = function(rect) {
      var datum = lru_.get(meta.serialize(rect));

      if (!datum) return null;

      return datum.val;
    };

    this.update = function(rect, val) {
      var key = meta.serialize(rect),
          rect = rect.slice(0),
          datum = {rect: rect, val: val},
          dropped = lru_.add(key, datum);

      // Make sure any dropped data are removed from the rtree.
      dropped.forEach(function(d) {
          rtree_.findAndRemove(d.rect);
          });

      // Update the rtree by removing old rect
      rtree_.findAndRemove(rect);
      rtree_.insert(rect, datum);

      return dropped.map(datum_val);
    };

    this.pluck = function(rect) {
      var hit = lru_.pluck(meta.serialize(rect));

      rtree_.findAndRemove(rect);

      return [hit].map(datum_val);
    };

    this.pluckInside = function(rect) {
      var hits = rtree_.searchInsideAndRemove(rect);

      hits.forEach(function(d) {
          lru_.pluck(meta.serialize(d.rect))
          });

      return hits.map(datum_val);
    };

    this.pluckOutside = function(rect) {
      var hits = rtree_.searchOutsideAndRemove(rect);

      hits.forEach(function(d) {
          lru_.pluck(meta.serialize(d.rect));
          });

      return hits.map(datum_val);
    };

    this.search = function(rect) {
      var hits = rtree_.search(rect);

      hits.forEach(function(d) {
          lru_.update(meta.serialize(d.rect), d.val);
          });

      return hits.map(datum_val);
    };

    this.searchInside = function(rect) {
      var hits = rtree_.searchInside(rect);

      hits.forEach(function(d) {
          lru_.update(meta.serialize(d.rect), d.val);
          });

      return hits.map(datum_val);
    };

    this.searchOutside = function(rect) {
      var hits = rtree_.searchOutside(rect);

      hits.forEach(function(d) {
          lru_.update(meta.serialize(d.rect), d.val);
          });

      return hits.map(datum_val);
    };

  };

  meta.mixSafely(meta, {RCache: RCache});

}).call(this);
