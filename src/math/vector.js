(function() {
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * @class Vector
   *  : Array
   */
  var Vector = Array;

  /** and 2 values */
  var ander = function(a, b) {
    if (meta.undef(a)) a = false;
    if (meta.undef(b)) b = false;
    return !!a && !!b;
  };

  /** add 2 values */
  var adder = function(a, b) {
    a = a || 0;
    b = b || 0;
    return a + b;
  };

  /** multiply 2 values */
  var multiplier = function(a, b) {
    if (meta.undef(a) || meta.isNull(a)) a = 1;
    if (meta.undef(b) || meta.isNull(b)) b = 1;
    return a * b;
  };

  /** return true if two values are equivalent */
  var equality = function(a, b) {
    return a === b;
  };

  var max2 = function(a, b) {
    return meta.max(a, b);
  };

  /** all vectors are equivalent */
  var equal = function() {
    if (arguments.length < 1)
      return new meta.exception.InvalidParameterException();
    var arguments = meta.args(arguments),
        max = arguments.map(meta.len).reduce(max2),
        ref, i, brk;
    if (max === 0) return true;

    for (i = 0; i < max; i++) {
      ref = meta.idx(i, arguments[0]);
      arguments.forEach(function(array) {
          if (!equality(meta.idx(i, array), ref)) brk = true;
          });
      if (brk) return false;
    }

    return true;
  };

  /** sum any number of vectors */
  var plus = function() {
    return meta.args(arguments).reduce(meta.zip.bind(void 0, adder));
  };

  /** scale a vector */
  var scale = function(v, val) {
    return v.map(function(e) {
        return e * val;
        });
  };

  /** subtract one vector from another */
  var minus = function(v1, v2) {
    return meta.zip(adder, v1, scale(v2, -1));
  };

  /** multiply corresponding elements in any number of vectors */
  var mult = function() {
    return meta.args(arguments).reduce(meta.zip.bind(void 0, multiplier));
  };

  meta.math = meta.declareSafely(meta.math, {
    Vector: Vector});
  meta.math.vector = meta.declareSafely(meta.math.vector, {
    equal: equal,
    plus: plus,
    minus: minus,
    scale: scale,
    mult: mult
  });

}).call(this);
