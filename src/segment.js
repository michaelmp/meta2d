/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/segment.js
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

  var segment = function(start, end) {
    if (meta.undef(start))
      start = Number.NEGATIVE_INFINITY
    if (meta.undef(end))
      end = Number.POSITIVE_INFINITY
    return [start, end]
  }

  var start = function(seg) {
    return seg[0]
  }

  var end = function(seg) {
    return seg[1]
  }

  var is_forward = function(seg) {
    return start(seg) <= end(seg)
  }

  var reverse = function(seg) {
    return [seg[1], seg[0]]
  }

  // inclusive at start, exclusive at end
  var includes = function(seg) {
    var queries = meta.args(arguments).slice(1)

    return queries.every(function(q) {
        return is_forward(seg) ?
          q >= start(seg) && q < end(seg) :
          q <= start(seg) && q > end(seg)
          })
  }

  var intersects = function(seg) {
    var segs = meta.args(arguments).slice(1)

    return segs.every(function(s) {
        return includes(seg, start(s))
            || includes(seg, end(s))
        })
  }

  var always = function() {
    return segment()
  }

  meta.segment = meta.declareSafely(meta.segment, {
    segment: segment,
    always: always,
    start: start,
    end: end,
    isForward: is_forward,
    reverse: reverse,
    includes: includes,
    intersects: intersects
  })

}(this.meta2d);
