/** tween.js
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
  var root = this,
      meta = root.meta2d,
      segment = meta.segment;

  var no_frame = function() {return {};};

  /**
   * @class Tween
   *  <p>
   *  A base class for interpolation rules. A Tween uses keyframes in an
   *  animation to determine intermediate frames.
   *  </p>
   *  
   * @extends Modifiable<<TweenType>>
   */

  /**
   * @constructor
   *  <p>
   *  Instantiates a base class with an abstract <i>fix</i> method.
   *  </p>
   */
  var Tween = function() {
    meta.Modifiable.call(this, new meta.TweenType());
  };

  /**
   * @method fix
   *  <p><i>Abstract</i>.</p>
   *  
   *  <p>
   *  Fix takes a timeframe and potentially keyframe data and returns a
   *  function that given a time <i>t</i> returns an interpolated frame.
   *  </p>
   *
   *  <p>
   *  For example, smooth linear interpolation requires two keyframes, while
   *  a bezier curve interpolates between two keyframes, but may require
   *  additional frames as control points.
   *  </p>
   *
   * @param seg
   *  An Array<<Number>>[2] of starting and ending times.
   *
   * @param keyframes...
   *  A variable number of Object arguments.
   *
   * @return Function
   */
  Tween.prototype.fix = function() {
    throw new meta.exception.InvokedAbstractMethodException();
  };

  meta.mixSafely(meta, {Tween: Tween});

  // @return [meta2d::Tween]
  var constant = function(attr, value) {
    var o = function() {};

    o.prototype = new Tween();
    o.prototype.fix = function(seg, f1, f2) {
      var args = arguments;

      return function(t) {
        if (!segment.includes(seg, t)) return no_frame();
        var f = {};

        if (meta.def(value)) {
          f[attr] = value;
        } else {
          if (args.length < 3) return no_frame();
          f[attr] = segment.isForward(seg) ? f1[attr] : f2[attr];
        }

        return f;
      };
    };

    return new o();
  };

  // @return [meta2d::Tween]
  var linear = function(attr) {
    var o = function() {};

    o.prototype = new Tween();
    o.prototype.fix = function(seg, f1, f2) {
      if (arguments.length < 3) return no_frame;
      return function(t) {
        if (!segment.includes(seg, t)) return no_frame();
        var f = {},
            sv = f1[attr],
            ev = f2[attr],
            p = (t - segment.start(seg))
              / (segment.end(seg) - segment.start(seg));

        f[attr] = ((1 - p) * sv) + (p * ev);

        return f;
      };
    };

    return new o();
  };

  // @return [meta2d::Tween]
  var variant = function(attr, func) {
    var o = function() {};

    o.prototype = new Tween();
    o.prototype.fix = function() {
      return function(t) {
        var f = {};

        f[attr] = func(t);

        return f;
      };
    };

    return new o();
  };

  // @return [meta2d::Tween]
  var invariant = function(attr, func) {
    var o = function() {};
    
    o.prototype = new Tween();
    o.prototype.fix = function() {
      return function() {
        var f = {};

        f[attr] = func();

        return f;
      };
    };

    return new o();
  };

  var step = function(t) {
    return t >= 0 ? 1: 0;
  };

  var sine = function(t) {
    return Math.sin(t);
  };

  var square = function(t) {
    return Math.sin(t) >= 0 ? 1 : -1;
  };

  // @return [meta2d::Modifier<meta2d.TweenType>]
  var shift = function(val) {
    var o = function() {
      meta.Modifier.call(this, meta.TweenType);
      this.modify = function(tween) {
        tween.fix = this.wrap(tween.fix);
      };
    };

    o.prototype.wrap = function(f) {
      // #[meta2d::Context]
      return function() {
        var fixed = f.apply(this, arguments);
        return function(t) {
          return fixed(t + val);
        };
      };
    };

    return new o();
  };

  // @return [meta2d::Modifier<meta2d.TweenType>]
  var reverse = function() {
    var o = function() {
      meta.Modifier.call(this, meta.TweenType);
      this.modify = function(tween) {
        tween.fix = this.wrap(tween.fix);
      };
    };

    o.prototype.wrap = function(f) {
      // #[meta2d::Context]
      return function() {
        var fixed = f.apply(this, arguments);
        return function(t) {
          return fixed(-t);
        };
      };
    };

    return new o();
  };

  // @return [meta2d::Modifier<meta2d.TweenType>]
  var offset = function(attr, val) {
    var o = function() {
      meta.Modifier.call(this, meta.TweenType);
      this.modify = function(tween) {
        tween.fix = this.wrap(tween.fix);
      };
    };

    o.prototype.wrap = function(f) {
      // #[meta2d::Context]
      return function() {
        var fixed = f.apply(this, arguments);
        return function(t) {
          var frame = fixed(t);

          frame[attr] += val;

          return frame;
        };
      };
    };

    return new o();
  };

  // @return [meta2d::Modifier<meta2d.TweenType>]
  var scale = function(attr, val) {
    var o = function() {
      meta.Modifier.call(this, meta.TweenType);
      this.modify = function(tween) {
        tween.fix = this.wrap(tween.fix);
      };
    };

    o.prototype.wrap = function(f) {
      // #[meta2d::Context]
      return function() {
        var fixed = f.apply(this, arguments);
        return function(t) {
          var frame = fixed(t);

          frame[attr] *= val;

          return frame;
        };
      };
    };

    return new o();
  };

  // @return [meta2d::Modifier<meta2d.TweenType>]
  var limit = function(attr, lower, upper) {
    if (upper < lower) throw new meta.exception.InvalidParameterException();
    var o = function() {
      meta.Modifier.call(this, meta.TweenType);
      this.modify = function(tween) {
        tween.fix = this.wrap(tween.fix);
      };
    };

    o.prototype.wrap = function(f) {
      // #[meta2d::Context]
      return function() {
        var fixed = f.apply(this, arguments);
        return function(t) {
          var frame = fixed(t);

          if (meta.def(lower)) frame[attr] = Math.max(lower, frame[attr]);
          if (meta.def(upper)) frame[attr] = Math.min(upper, frame[attr]);

          return frame;
        };
      };
    };

    return new o();
  };

  meta.tween = meta.declareSafely(meta.tween, {
    constant: constant,
    linear: linear,
    variant: variant,
    invariant: invariant,
    step: step,
    sine: sine,
    square: square
  });
  
  meta.modifier = meta.declareSafely(meta.modifier, {
    shift: shift,
    reverse: reverse,
    offset: offset,
    scale: scale,
    limit: limit
  });

}).call(this);
