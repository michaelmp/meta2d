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

  var tblr = function(rect) {
    return {
      t: rect.y,
      b: rect.y + rect.h,
      l: rect.x,
      r: rect.x + rect.w
    };
  };

  // @constructor
  // @param (x, y, w ,h) | [{x, y, w, h}]
  var Rect = function() {
    if (arguments.length === 1) {
      this.x = arguments[0].x || 0;
      this.y = arguments[0].y || 0;
      this.w = arguments[0].w || 0;
      this.h = arguments[0].h || 0;
    } else {
      this.x = arguments[0] || 0;
      this.y = arguments[1] || 0;
      this.w = arguments[2] || 0;
      this.h = arguments[3] || 0;
    }
  };

  // @return [null | meta::math::Rect]
  Rect.prototype.intersect = function(r) {
    var tblr1 = tblr(this),
        tblr2 = tblr(r),
        t = Math.max(tblr1.t, tblr2.t),
        b = Math.min(tblr1.b, tblr2.b),
        l = Math.max(tblr1.l, tblr2.l),
        r = Math.min(tblr1.r, tblr2.r);

    if (b < t || r < l) return null;
    if (t === b) {
      if (t === tblr1.t && t >= tblr2.b) return null;
      if (t === tblr2.t && t >= tblr1.b) return null;
    }
    if (l === r) {
      if (l === tblr1.l && l >= tblr2.r) return null;
      if (l === tblr2.l && l >= tblr1.r) return null;
    }

    return new Rect(l, t, r - l, b - t);
  };

  // @return [Boolean]
  Rect.prototype.contains = function(r) {
    return r.x >= this.x &&
           r.y >= this.y &&
           r.x + r.w <= this.x + this.w &&
           r.y + r.h <= this.y + this.h;
  };

  // @return [Boolean]
  Rect.prototype.containedBy = function(r) {
    return r.contains(this);
  };

  // @return [Boolean]
  Rect.prototype.sameAs = function(r) {
    return r.x === this.x &&
           r.y === this.y &&
           r.w === this.w &&
           r.h === this.h;
  };

  // @return [Number]
  Rect.prototype.area = function() {
    return this.w * this.h;
  };

  meta.math = meta.declareSafely(meta.math, {Rect: Rect});

}).call(this);
