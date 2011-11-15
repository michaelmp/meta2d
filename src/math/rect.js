/** rect.js
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
  if (!meta) throw 'Could not find main namespace';

  var xywh_to_tblr = function(xywh) {
    return [
      xywh[1],
      xywh[1] + xywh[3],
      xywh[0],
      xywh[0] + xywh[2]
    ];
  };

  // return [x, y, w, h] from arguments
  var rect = function() {
    var args = meta.args(arguments);
    if (args.length === 4) {
      return args; 
    } else if (args.length === 3) {
      return [args[0], args[1], args[2], 0];
    } else if (args.length === 2) {
      return [args[0], args[1], 0, 0];
    } else if (args.length === 1) {
      if (meta.isObject(args[0])) {
        meta.mixSafely(args[0], {x: 0, y: 0, w: 0, h: 0});
        return [args[0].x, args[0].y, args[0].w, args[0].h];
      }
    }
    return [0, 0, 0, 0];
  }

  // @return [Rect | null]
  var intersect = function(r1, r2) {
    var tblr1 = xywh_to_tblr(r1),
        tblr2 = xywh_to_tblr(r2),
        t = Math.max(tblr1[0], tblr2[0]),
        b = Math.min(tblr1[1], tblr2[1]),
        l = Math.max(tblr1[2], tblr2[2]),
        r = Math.min(tblr1[3], tblr2[3]);

    if (b < t || r < l) return null;
    if (t === b) {
      if (t === tblr1[0] && t >= tblr2[1]) return null;
      if (t === tblr2[0] && t >= tblr1[1]) return null;
    }
    if (l === r) {
      if (l === tblr1[2] && l >= tblr2[3]) return null;
      if (l === tblr2[2] && l >= tblr1[3]) return null;
    }

    return [
      l,
      t,
      r - l,
      b - t
    ];
  };

  // @return [Boolean]
  var contains = function(r1, r2) {
    return r2[0] >= r1[0] &&
           r2[1] >= r1[1] &&
           r2[0] + r2[2] <= r1[0] + r1[2] &&
           r2[1] + r2[3] <= r1[1] + r1[3];
  };

  // @return [Boolean]
  var containedBy = function(r1, r2) {
    return contains(r2, r1);
  };

  // @return [Boolean]
  var equal = function(r1, r2) {
    return r1[0] === r2[0] &&
           r1[1] === r2[1] &&
           r1[2] === r2[2] &&
           r1[3] === r2[3];
  };

  // @return [Number]
  var area = function(r) {
    return r[2] * r[3];
  };

  meta.math.rect = meta.declareSafely(meta.math.rect, {
    rect: rect,
    intersect: intersect,
    contains: contains,
    containedBy: containedBy,
    equal: equal,
    area: area
  });

}).call(this);
