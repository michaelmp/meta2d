/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/rtree.js
 * -----------------------------------------------------------------------------
 * Copyright 2011 Michael Morris-Pearce
 * 
 * This file is part of Meta2D.
 *
 * Meta2D is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Meta2D is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Meta2D.  If not, see <http://www.gnu.org/licenses/>.
 *----------------------------------------------------------------------------*/

!function(meta) {

  'use strict'

  var rect = meta.math.rect

  var expand = function(rect1, rect2) {
    var l1 = rect1[0], l2 = rect2[0],
        t1 = rect1[1], t2 = rect2[1],
        r1 = rect1[0] + rect1[2], r2 = rect2[0] + rect2[2],
        b1 = rect1[1] + rect1[3], b2 = rect2[1] + rect2[3]
    var top = Math.min(t1, t2),
        bottom = Math.max(b1, b2),
        right = Math.max(r1, r2),
        left = Math.min(l1, l2)
    return [
      left,
      top,
      right - left,
      bottom - top
    ]
  }

  var least_expansion = function(children, rect) {
    var expanded = children.map(function(node) {
        return {
          newrect: expand(node.rect, rect),
          noderef: node
        }
        })
    var bestnode = expanded.sort(function(n1 ,n2) {
        return meta.math.rect.area(n1.newrect) -
               meta.math.rect.area(n2.newrect)
        })[0]
    return {
      child: bestnode.noderef,
      rect: bestnode.newrect
    }
  }

  /**
   * @class RTree
   *  <p>
   *  A rectangular spatial index. All operations are <i>O</i>(logN) expected
   *  runtime and worst-case <i>O</i>(N) unless otherwise specified.
   *  </p>
   *
   *  <p>
   *  [1]
   *  <a href="http://en.wikipedia.org/wiki/Rtree">
   *  http://en.wikipedia.org/wiki/Rtree</a>
   *  </p>
   */
  var RTree = function (capacity) {
    this.children // [{rtree, rect}], not kept by leaf nodes
    this.data // [{object, rect}], only kept by leaf nodes
    this.capacity = capacity || 3
  }

  /**
   * @method query
   *  <p>
   *  Query walks through the tree for all nodes that filter true through a
   *  function <i>f</i>.
   *  </p>
   *
   *  <p>
   *  Returns a flattened array of all filtered values.
   *  </p>
   *
   * @param f
   *  A filtering Function that returns a Boolean given a node value.
   *
   * @param remove
   *  <i>Optional</i>. A Boolean indicating whether filtered nodes should be
   *  removed from the tree.
   *
   * @return Array
   */
  RTree.prototype.query = function(f, remove) {
    var hits = [],
        merged = []

    if (this.data) {
      this.data.forEach(function(d, idx, array) {
          if (!f.call(void 0, d.rect)) {
            return null
          }
          hits.push(d.object)
          if (remove) array[idx] = void 0
          })
      if (remove) this.data = this.data.filter(meta.def)
      return hits
    }

    if (!this.children)
      return []

    this.children.forEach(function(c) {
        if (!f.call(void 0, c.rect)) {
          return null
        }
        merged = merged.concat(c.rtree.query(f, remove))
        })

    return merged
  }

  /**
   * @method search
   *  <p>
   *  Returns a flattened array of all node values in the tree that are indexed
   *  by rectangles intersecting with <i>rect</i>.
   *  </p>
   *
   * @param rect
   *  An Array<<Number>>[4] of [x, y, w, h] values to search over.
   *
   * @param remove
   *  <i>Optional</i>. If true, will remove any nodes within <i>rect</i>.
   *
   * @return Array
   */
  RTree.prototype.search = function(rect, remove) {
    var f = function(r) {
      return meta.math.rect.intersect(r, rect)
    }
    return this.query(f, remove)
  }

  /**
   * @method find
   *  <p>
   *  Returns a flattened array of all node values in the tree that are indexed
   *  by <i>rect</i>.
   *  </p>
   *
   * @param rect
   *  An Array<<Number>>[4] of [x, y, w, h] values to search over.
   *
   * @param remove
   *  <i>Optional</i>. If true, will remove any nodes indexed by <i>rect</i>.
   *
   * @return Array
   */
  RTree.prototype.find = function(rect, remove) {
    var f = function(r) {
      return meta.math.rect.equal(r, rect)
    }
    return this.query(f, remove)
  }

  /**
   * @method searchInside
   *  <p>
   *  Returns a flattened array of all node values in the tree that are indexed
   *  by rectangles strictly contained by <i>rect</i>.
   *  </p>
   *
   * @param rect
   *  An Array<<Number>>[4] of [x, y, w, h] values to search over.
   *
   * @param remove
   *  <i>Optional</i>. If true, will remove any nodes within <i>rect</i>.
   *
   * @return Array
   */
  RTree.prototype.searchInside = function(rect, remove) {
    var f = function(r) {
      return meta.math.rect.containedBy(r, rect)
    }
    return this.query(f, remove)
  }

  /**
   * @method searchOutside
   *  <p>
   *  Returns a flattened array of all node values in the tree that are indexed
   *  by rectangles non-intersecting with <i>rect</i>.
   *  </p>
   *
   * @param rect
   *  An Array<<Number>>[4] of [x, y, w, h] values to search over.
   *
   * @param remove
   *  <i>Optional</i>. If true, will remove any nodes outside of <i>rect</i>.
   *
   * @return Array
   */
  RTree.prototype.searchOutside = function(rect, remove) {
    var f = function(r) {
      return !meta.math.rect.intersect(r, rect)
    }
    return this.query(f, remove)
  }

  /**
   * @method insert
   *  <p>
   *  Add <i>object</i> to the tree at the index <i>rect</i>.
   *  </p>
   *
   * @param rect
   *  An Array<<Number>>[4] of [x, y, w, h] values to use as an index.
   *
   * @param object
   *  The value to associate (non-uniquely) with <i>rect</i>.
   */
  
  // Algorithm:
  //
  // If child nodes do not exist:
  //   If capacity is reached, creates capacity # child nodes and inserts
  //   each child into a separate node.
  //   Else: adds key,val into children array
  // Child nodes exist:
  //   Chooses a child to receive {key, object}, expanding its bounds, and
  //   recursively inserting.

  RTree.prototype.insert = function(rect, object) {
    // Defer to child that needs least expansion of its bounds.
    if (this.children) {
      var best = least_expansion(this.children, rect)
      best.child.rect = best.rect
      return best.child.rtree.insert(rect, object)
    }

    // Add new data.
    this.data = this.data || []
    this.data.push({
        rect: rect,
        object: object
        })

    // Expand if capacity reached, and distribute data among children.
    if (this.data.length >= this.capacity) {
      var rtree = this,
          move_datum = function (i) {
            var child = {
              rtree: new meta.RTree(rtree.capacity),
              rect: rtree.data[i].rect
            }

            child.rtree.insert(rtree.data[i].rect, rtree.data[i].object)
            rtree.children = rtree.children || []
            rtree.children.push(child)
          }

      this.data.forEach(function(d, i) {
          move_datum(i)
          })
      this.data = undefined
    }
  }

  meta.mixSafely(meta, {RTree: RTree})

}(this.meta2d);
