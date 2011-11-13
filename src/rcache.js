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
