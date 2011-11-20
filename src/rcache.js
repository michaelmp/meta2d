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
   *  <p>
   *  A cache of rectangle-indexed data, allowing for intersection-based lookups
   *  while maintaining a limited number of entries.
   *  </p>
   */

  /**
   * @constructor
   *
   * @param capacity
   *  The maximum number of (key, value) pairs stored in the cache.
   */
  var RCache = function(capacity) {
    var rcache_ = this,
        rtree_ = new meta.RTree(4),
        lru_ = new meta.LRU(capacity || 16);

    /**
     * @method add
     *  <p>
     *  Store a (key, value) pair if no value is already present for the key
     *  <i>rect</i>.
     *  </p>
     *
     *  <p>
     *  Returns an array of the least-recent values beyond the cache capacity
     *  that were dropped.
     *  </p>
     *
     *  <p>
     *  The inserted value becomes most-recently-used.
     *  </p>
     *
     * @param rect
     *  The key as an Array<<Number>>[4] representing [x, y, w, h].
     *
     * @param val
     *  Any Object.
     *
     * @return Array
     */
    this.add = function(rect, val) {
      var key = meta.serialize(rect);

      // Only proceed if key is not present in cache.
      if (lru_.get(key)) return [];

      return this.update(rect, val);
    };

    /**
     * @method get
     *  <p>
     *  Retrieve a value associated with the key <i>rect</i>, or null if the
     *  (key, value) pair is not present.
     *  </p>
     *
     *  <p>
     *  The hit value becomes most-recently-used.
     *  </p>
     *
     * @param rect
     *  The key as an Array<<Number>>[4] representing [x, y, w, h].
     *
     * @return Object
     */
    this.get = function(rect) {
      var datum = lru_.get(meta.serialize(rect));

      if (!datum) return null;

      return datum.val;
    };

    /**
     * @method update
     *  <p>
     *  Sets or overwrites the value associated with <i>rect</i>.
     *  </p>
     *
     *  <p>
     *  Returns an array of the least-recent values beyond the cache capacity
     *  that were dropped.
     *  </p>
     *
     *  <p>
     *  The updated value becomes most-recently-used.
     *  </p>
     *
     * @param rect
     *  The key as an Array<<Number>>[4] representing [x, y, w, h].
     *
     * @param val
     *  Any Object.
     *
     * @return Array
     */
    this.update = function(rect, val) {
      var key = meta.serialize(rect),
          rect = rect.slice(0),
          datum = {rect: rect, val: val},
          dropped = lru_.add(key, datum);

      // Make sure any dropped data are removed from the rtree.
      dropped.forEach(function(d) {
          rtree_.find(d.rect, true);
          });

      // Update the rtree by removing old rect
      rtree_.find(rect, true);
      rtree_.insert(rect, datum);

      return dropped.map(datum_val);
    };

    /**
     * @method pluck
     *  <p>
     *  Remove the (key, value) pair associated with <i>rect</i>.
     *  </p>
     *
     *  <p>
     *  Returns an array of the removed value.
     *  </p>
     *
     * @param rect
     *  The key as an Array<<Number>>[4] representing [x, y, w, h].
     *
     * @return Array[1]
     */
    this.pluck = function(rect) {
      var hit = lru_.pluck(meta.serialize(rect));

      rtree_.find(rect, true);

      return [hit].map(datum_val);
    };

    /**
     * @method pluckInside
     *  <p>
     *  Remove all (key, value) pairs whose keys are strictly contained by
     *  <i>rect</i>.
     *  </p>
     *
     *  <p>
     *  Returns an array of the removed values.
     *  </p>
     *
     * @param rect
     *  The key as an Array<<Number>>[4] representing [x, y, w, h].
     *
     * @return Array
     */
    this.pluckInside = function(rect) {
      var hits = rtree_.searchInside(rect, true);

      hits.forEach(function(d) {
          lru_.pluck(meta.serialize(d.rect))
          });

      return hits.map(datum_val);
    };

    /**
     * @method pluckOutside
     *  <p>
     *  Remove all (key, value) pairs whose keys are non-intersecting with
     *  <i>rect</i>.
     *  </p>
     *
     *  <p>
     *  Returns an array of the removed values.
     *  </p>
     *
     * @param rect
     *  The key as an Array<<Number>>[4] representing [x, y, w, h].
     *
     * @return Array
     */
    this.pluckOutside = function(rect) {
      var hits = rtree_.searchOutside(rect, true);

      hits.forEach(function(d) {
          lru_.pluck(meta.serialize(d.rect));
          });

      return hits.map(datum_val);
    };

    /**
     * @method search
     *  <p>
     *  Returns an array of all values whose keys intersect with <i>rect</i>.
     *  </p>
     *
     *  <p>
     *  All search hits become most-recently-used.
     *  </p>
     *
     * @param rect
     *  The key as an Array<<Number>>[4] representing [x, y, w, h].
     *
     * @return Array
     */
    this.search = function(rect) {
      var hits = rtree_.search(rect);

      hits.forEach(function(d) {
          lru_.update(meta.serialize(d.rect), d.val);
          });

      return hits.map(datum_val);
    };

    /**
     * @method searchInside
     *  <p>
     *  Returns an array of all values whose keys are strictly contained by
     *  <i>rect</i>.
     *  </p>
     *
     *  <p>
     *  All search hits become most-recently-used.
     *  </p>
     *
     * @param rect
     *  The key as an Array<<Number>>[4] representing [x, y, w, h].
     *
     * @return Array
     */
    this.searchInside = function(rect) {
      var hits = rtree_.searchInside(rect);

      hits.forEach(function(d) {
          lru_.update(meta.serialize(d.rect), d.val);
          });

      return hits.map(datum_val);
    };

    /**
     * @method searchOutside
     *  <p>
     *  Returns an array of all values whose keys are non-intersecting with
     *  <i>rect</i>.
     *  </p>
     *
     *  <p>
     *  All search hits become most-recently-used.
     *  </p>
     *
     * @param rect
     *  The key as an Array<<Number>>[4] representing [x, y, w, h].
     *
     * @return Array
     */
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
