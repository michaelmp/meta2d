/** rtree.js
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

  var rect = meta.math.rect;

  var expand = function(rect1, rect2) {
    var l1 = rect1[0], l2 = rect2[0],
        t1 = rect1[1], t2 = rect2[1],
        r1 = rect1[0] + rect1[2], r2 = rect2[0] + rect2[2],
        b1 = rect1[1] + rect1[3], b2 = rect2[1] + rect2[3];
    var top = Math.min(t1, t2),
        bottom = Math.max(b1, b2),
        right = Math.max(r1, r2),
        left = Math.min(l1, l2);
    return [
      left,
      top,
      right - left,
      bottom - top
    ];
  };

  var least_expansion = function(children, rect) {
    var expanded = children.map(function(node) {
        return {
          newrect: expand(node.rect, rect),
          noderef: node
        };
        });
    var bestnode = expanded.sortBy(function(node) {
        return node.newrect[2] * node.newrect[3];
        })[0];
    return {
      child: bestnode.noderef,
      rect: bestnode.newrect
    };
  };

  /**
   * @class RTree
   */
  var RTree = function (capacity) {
    this.children; // [{rtree, rect}], not kept by leaf nodes
    this.data; // [{object, rect}], only kept by leaf nodes
    this.capacity = capacity || 3;
  };

  /**
   * Print something to debug with.
   */
  /*
  RTree.prototype.debug = function(w, h, layer, scale) {
    var top = !layer;
    layer = layer || new meta.Layer(void 0, {w: w, h: h});
    if (scale) layer.context.scale(scale, scale);
    if (this.children) {
      this.children.forEach(function(child) {
          child.rtree.debug(w, h, layer, void 0);
          layer.context.strokeStyle = 'rgba(0,0,255,0.2)';
          layer.context.lineWidth = 1;
          layer.context.strokeRect(child.rect.x,
            child.rect.y,
            child.rect.w,
            child.rect.h);
          });
    }
    if (this.data) {
      this.data.forEach(function(datum) {
          layer.context.fillStyle = 'rgba(255,0,0,0.2)';
          layer.context.fillRect(datum.rect.x,
            datum.rect.y,
            datum.rect.w,
            datum.rect.h);
          });
    }
    if (top) {
      return layer.canvas;
    }
  };
  */

  RTree.prototype.query = function(f, remove) {
    var hits = [],
        merged = [];

    if (this.data) {
      this.data.forEach(function(d, idx, array) {
          if (!f.call(void 0, d.rect)) return;
          hits.push(d.object);
          if (remove) array[idx] = void 0;
          });
      if (remove) this.data = this.data.filter(meta.def);
      return hits;
    }

    if (!this.children)
      return [];

    children.forEach(function(c) {
        if (!f.call(void 0, c.rect)) return;
        merged = merged.concat(c.rtree.query(f, remove));
        });

    return merged;
  };

  RTree.prototype.search = function(rect, remove) {
    var f = function(r) {
      return meta.math.rect.intersect(r, rect);
    };
    return this.query(f, remove);
  };

  RTree.prototype.searchAndRemove = function(rect) {
    return this.search(rect, true);
  };

  RTree.prototype.find = function(rect, remove) {
    var f = function(r) {
      return meta.math.rect.equal(r, rect);
    };
    return this.query(f, remove);
  };

  RTree.prototype.findAndRemove = function(rect) {
    return this.find(rect, true);
  };

  RTree.prototype.searchInside = function(rect, remove) {
    var f = function(r) {
      return meta.math.rect.containedBy(r, rect);
    };
    return this.query(f, remove);
  };

  RTree.prototype.searchInsideAndRemove = function(rect) {
    return this.searchInside(rect, true);
  };

  RTree.prototype.searchOutside = function(rect, remove) {
    var f = function(r) {
      return !meta.math.rect.intersect(r, rect);
    };
    return this.query(f, remove);
  };

  RTree.prototype.searchOutsideAndRemove = function(rect) {
    return this.searchOutside(rect, true);
  };

  /**
   * If child nodes do not exist:
   *   If capacity is reached, creates capacity # child nodes and inserts
   *   each child into a separate node.
   *   Else: adds key,val into children array
   * Child nodes exist:
   *   Chooses a child to receive {key, object}, expanding its bounds, and
   *   recursively inserting.
   */
  RTree.prototype.insert = function(rect, object) {
    // Defer to child that needs least expansion of its bounds.
    if (this.children) {
      var best = least_expansion(this.children, rect);
      best.child.rect = best.rect;
      return best.child.rtree.insert(rect, object);
    }

    // Add new data.
    this.data = this.data || [];
    this.data.push({
        rect: rect,
        object: object
        });

    // Expand if capacity reached, and distribute data among children.
    if (this.data.length >= this.capacity) {
      var rtree = this,
          move_datum = function (i) {
            var child = {
              rtree: new meta.RTree(rtree.capacity),
              rect: rtree.data[i].rect
            };

            child.rtree.insert(rtree.data[i].rect, rtree.data[i].object);
            rtree.children = rtree.children || [];
            rtree.children.push(child);
          };

      this.data.forEach(function(d, i) {
          move_datum(i);
          });
      this.data = undefined;

      return true;
    }

    // Tree was unchanged.
    return false;
  };

  meta.mixSafely(meta, {RTree: RTree});

}).call(this);
