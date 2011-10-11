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
     */
    var trim = function() {
      if (size <= capacity) return;
      if (!tail) return;
      pluck(tail);
    };

    /**
     * Remove a node and decrease size count.
     */
    var pluck = function(node) {
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
        map[node.key] = undefined;
        size -= 1;
      }
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
     * Sets or overwrites the value associated with key. Size count increases
     * up to capacity iff the key was not already present.
     * @return true iff the new (key, val) is stored in cache.
     */
    this.update = function(key, val) {
      // Retrieve old node if it exists, or make a new one.
      var node = map[key] || {key: key};
      node.val = val;

      // Reorder the list with this node in front.
      prioritize(node);

      // Remove the tail if beyond capacity.
      trim();

      // (key, val) is in cache unless capacity is zero.
      return capacity > 0;
    };

    /**
     * Will not overwrite existing value.
     * @return true iff the new (key, val) is stored in cache.
     */
    this.add = function(key, val) {
      if (map[key]) return false;
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

  meta.LRU = meta.redeclare(meta.LRU, LRU);

}).call(this);

