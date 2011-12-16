/** drawing.js
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

  var Drawing = function(){
    if (arguments[0] && arguments[1]) {
      this.ctx = new meta.Context(arguments[0], arguments[1]);
    } else if (arguments[0]) {
      this.ctx = arguments[0];
    } else {
      throw new meta.exception.InvalidParameterException();
    }
    this.transform = meta.math.affine.identity();
  };

  Drawing.prototype.getBounds = function() {
    var t,
        x1, x2, x3, x4,
        y1, y2, y3, y4,
        x1T, x2T, x3T, x4T,
        y1T, y2T, y3T, y4T,
        top, bottom, left, right;

    t = this.transform;
    x1 = y1 = x2 = y4 = 0;
    y2 = y3 = this.ctx.canvas.height;
    x3 = x4 = this.ctx.canvas.width;

    x1T = t[0] * x1 + t[2] * y1 + t[4];
    y1T = t[1] * x1 + t[3] * y1 + t[5];
    x2T = t[0] * x2 + t[2] * y2 + t[4];
    y2T = t[1] * x2 + t[3] * y2 + t[5];
    x3T = t[0] * x3 + t[2] * y3 + t[4];
    y3T = t[1] * x3 + t[3] * y3 + t[5];
    x4T = t[0] * x4 + t[2] * y4 + t[4];
    y4T = t[1] * x4 + t[3] * y4 + t[5];

    top = Math.min(Math.min(Math.min(y1T, y2T), y3T), y4T);
    bottom = Math.max(Math.max(Math.max(y1T, y2T), y3T), y4T);
    left = Math.min(Math.min(Math.min(x1T, x2T), x3T), x4T);
    right = Math.max(Math.max(Math.max(x1T, x2T), x3T), x4T);

    return [left, top, right - left, bottom - top];
  };
 
  meta.mixSafely(meta, {
    Drawing: Drawing
  });

}).call(this);
