/** lru.js
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
   * @class LRU
   *
   * A least-recently-used cache implementation.
   * All operations are constant runtime.
   * @param capacity the maximum number of stored items.
   */
  var LRU = function(capacity) {
    var map = {}; // key --> node
    var head = null; // dbl-linked list of {prev, key, val, next} nodes
    var tail = null;
    var size = 0;
    var capacity = capacity || 1;

    /**
     * Remove node and reinsert at head, maintaining size count.
     */
    var prioritize = function(node) {
      pluck(node);
      pushFront(node);
    };

    /**
     * Unlink the tail element for garbage collection iff the cache is
     * beyond its set capacity, decreasing size count.
     * @return [Array]
     */
    var trim = function() {
      if (size <= capacity) return [];
      if (!tail) return [];
      return pluck(tail);
    };

    /**
     * Remove a node and decrease size count.
     * @return [Array]
     */
    var pluck = function(node) {
      var removed = [];

      // Modify links of adjacent nodes.
      if (tail && (tail.key === node.key)) {
        if (node.prev) {
          tail = node.prev;
          tail.next = null;
        } else {
          tail = null;
        }
      } else if (head && (head.key === node.key)) {
        if (node.next) {
          head = node.next;
          head.prev = null;
        } else {
          head = null;
        }
      } else {
        if (node.next) node.next.prev = node.prev;
        if (node.prev) node.prev.next = node.next;
      }

      // Clean up the node.
      node.prev = node.next = null;

      // Remove the reference.
      if (map[node.key]) {
        removed.push(map[node.key]);
        map[node.key] = undefined;
        size -= 1;
      }

      return removed;
    };

    /**
     * Add node to head and increase size count.
     */
    var pushFront = function(node) {
      node.prev = null;
      node.next = head;
      if (!tail) tail = node;
      if (head) head.prev = node;
      head = node;
      map[node.key] = node;
      size += 1;
    };

    /**
     * Add node to tail end and increase size count.
     */
    var pushBack = function(node) {
      node.prev = tail;
      node.next= null;
      if (!head) head = node;
      if (tail) tail.next = node;
      tail = node;
      map[node.key] = node;
      size += 1;
    };

    /**
     * @return val | null
     */
    this.get = function(key) {
      var node = map[key];
      if (node) {
        prioritize(node);
        return node.val;
      }
      return null;
    };

    /**
     * @return [Array]
     */
    this.pluck = function(key) {
      var node = map[key],
          removed = [];

      if (node) removed = pluck(node);

      return removed;
    };

    /**
     * Sets or overwrites the value associated with key. Size count increases
     * up to capacity iff the key was not already present.
     * @return [Array]
     */
    this.update = function(key, val) {
      // Retrieve old node if it exists, or make a new one.
      var node = map[key] || {key: key};

      node.val = val;

      // Reorder the list with this node in front.
      prioritize(node);

      // (key, val) is in cache unless capacity is zero.
      return trim();
    };

    /**
     * Will not overwrite existing value.
     * @return [Array]
     */
    this.add = function(key, val) {
      if (map[key]) return [];
      return this.update(key, val);
    };

    /**
     * Print the list of values.
     */
    this.debug = function(head) {
      if (node.next) {
        return node.val + ' ' + this.debug(node.next);
      } else {
        return node.val;
      }
    }
  };

  meta.mixSafely(meta, {LRU: LRU});

}).call(this);

