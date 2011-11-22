/** affine.js
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

  // We are concerned with square NxN matrices in which the upper-left N-1 x
  // N-1 submatrix represents a linear transformation (scale & rotate) and the
  // upper-right (N-1)-row column vector is a translation.
  //
  // Standard 3x3 affine transformation matrix:
  //
  //   | a c e |
  //   | b d f |
  //   | 0 0 1 |
  //
  // For any draw operation, the translation column vector [e, f] is added to
  // the final coordinates before the scale-rotation matrix [[a, b], [c, d]] is
  // applied.
  //
  // A translation transformation takes into account scale-rotation before
  // adding to [e, f]. So scale(2, 1) before translate (10, 10) sets e to 20
  // and f to 10.
  //
  // A scale/rotation transformation applies directly to [[a, b], [c, d]]
  // without affecting [e, f]. So translate(10, 10) before scale(2, 1) sets
  // both e and f to 10.
  //
  // Assuming that the Nth row is unaffected by any transformations, represent
  // a 'transform' matrix simply as its [a .. f] values.

  // Do 3x3 matrix multiplication for m1 x m2 and return [a .. f]
  var transform = function(m1, m2) {
    return [
      m1[0]*m2[0] + m1[2]*m2[1],
      m1[1]*m2[0] + m1[3]*m2[1],
      m1[0]*m2[2] + m1[2]*m2[3],
      m1[1]*m2[2] + m1[3]*m2[3],
      m1[0]*m2[4] + m1[2]*m2[5] + m1[4],
      m1[1]*m2[4] + m1[3]*m2[5] + m1[5],
    ];
  };

  // Add [e, f] values after scale-rotation.
  var translate = function(t, x, y) {
    return transform(t, [1, 0, 0, 1, x, y]);
  };

  // Scale columns respectively.
  var scale = function(t, x, y) {
    return transform(t, [x, 0, 0, y, 0, 0]);
  };

  // Rotate without affecting translation column.
  var rotate = function(t, rad) {
    var cos = Math.cos(rad),
        sin = Math.sin(rad);
    return transform(t, [cos, sin, -sin, cos, 0, 0]);
  };

  // Return the identity matrix.
  var identity = function() {
    return [1, 0, 0, 1, 0, 0];
  };

  // Return determinant of linear submatrix.
  var det = function(t) {
    return t[0] * t[3] - t[1] * t[2];
  };

  // Is the linear submatrix singular? That is, is it non-invertible?
  var singular = function(t) {
    return det(t) === 0;
  };

  // If singular, return identity.
  var invert = function(t) {
    if (singular(t)) return identity();
    var d = det(t),
        inv = [t[3], -t[1], -t[2], t[0]].map(function(a) {return a / d;}),
        neg_inv = inv.map(function(a) {return -a;});
    return inv.concat([
        neg_inv[0] * t[4] + neg_inv[2] * t[5],
        neg_inv[1] * t[4] + neg_inv[3] * t[5]
        ]);
  };

  // Apply transformation to a vector.
  var applyToVector = function(t, v) {
    return [
      t[0] * v[0] + t[2] * v[1] + t[4],
      t[1] * v[0] + t[3] * v[1] + t[5]
    ];
  };

  meta.math = meta.declareSafely(meta.math);
  meta.math.affine = meta.declareSafely(meta.math.affine, {
    translate: translate,
    scale: scale,
    rotate: rotate,
    transform: transform,
    identity: identity,
    det: det,
    isSingular: singular,
    invert: invert,
    applyToVector: applyToVector
  });

}).call(this);
