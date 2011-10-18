// provides:
//  meta2d.RTree -- class
(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var expand = function(rect1, rect2) {
    var l1 = rect1.x, l2 = rect2.x,
        t1 = rect1.y, t2 = rect2.y,
        r1 = rect1.x + rect1.w, r2 = rect2.x + rect2.w,
        b1 = rect1.y + rect1.h, b2 = rect2.y + rect2.h;
    var top = Math.min(t1, t2),
        bottom = Math.max(b1, b2),
        right = Math.max(r1, r2),
        left = Math.min(l1, l2);
    return {
      x: left,
      y: top,
      w: right - left,
      h: bottom - top
    };
  };

  var least_expansion = function(children, rect) {
    var expanded = children.map(function(node) {
        return {
          newrect: expand(node.rect, rect),
          noderef: node
        };
        });
    var bestnode = expanded.sortBy(function(node) {
        return node.newrect.w * node.newrect.h;
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
  RTree.prototype.debug = function(w, h, layer, scale) {
    var top = !layer;
    layer = layer || new meta.Layer(void 0, {w: w, h: h});
    if (scale) layer.context.scale(scale, scale);
    if (this.children) {
      this.children.each(function(child) {
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
      this.data.each(function(datum) {
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

  /**
   * @param remove [optional] if true-evaluating will remove all hit objects
   *   from the data structure before returning them.
   * @return {array} objects that collide with rectangle key.
   */
  RTree.prototype.search = function(rect, remove) {
    if (meta.def(this.data)) {
      var intersect = new Array();
      for (var i = 0; i < this.data.length; i++) {
        if (meta.collision.BBOX.collides(
              void 0,
              this.data[i].rect,
              rect)) {
          intersect.push(this.data[i].object);
          if (remove) this.data[i] = undefined;
        }
      }
      if (remove) this.data = this.data.compact();
      return intersect;
    }
    if (meta.undef(this.children))
      return [];
    var merge = new Array();
    for (var i = 0; i < this.children.length; i++) {
      if (!meta.collision.BBOX.collides(
            void 0,
            this.children[i].rect,
            rect))
        continue;
      var subdata = this.children[i].rtree.search(rect, remove);
      merge = merge.concat(subdata);
    }
    return merge;
  };

  /**
   * If child nodes do not exist:
   *   If capacity is reached, creates capacity # child nodes and inserts
   *   each child into a separate node.
   *   Else: adds key,val into children array
   * Child nodes exist:
   *   Chooses a child to receive {key, object}, expanding its bounds, and
   *   recursively inserting.
   * @return the node that the object was placed in.
   */
  RTree.prototype.insert = function(rect, object) {
    // Defer to child that needs least expansion of its bounds.
    if (this.children) {
      var best = least_expansion(this.children, rect);
      best.child.rect = best.rect;
      return best.child.rtree.insert(rect, object);
    }

    // Add new data.
    this.data = this.data || new Array();
    this.data.push({
      rect: rect,
      object:object
      });

    // Expand if capacity reached, and distribute data among children.
    if (this.data.length >= this.capacity) {
      var rtree = this;
      var move_datum = function (i) {
        var child = {
          rtree: new meta.RTree(rtree.capacity),
          rect: rtree.data[i].rect
        };
        child.rtree.insert(rtree.data[i].rect, rtree.data[i].object);
        rtree.children = rtree.children || new Array();
        rtree.children.push(child);
      }
      for (var i = 0; i < this.data.length; i++) {
        move_datum(i);
      }
      this.data = undefined;
      return true;
    }

    // Tree was unchanged.
    return false;
  };

  /**
   * Retrieve all children inside the key, pruning from nodes.
   * @return {array}
   */
  RTree.prototype.remove = function(rect) {
    var ret = this.search(rect, true);
    return ret;
  };

  meta.RTree = RTree;

}).call(this);

