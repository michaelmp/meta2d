// provides:
//   meta2d.Modifiable -- mixin
//   meta2d.Modifier -- mixin
//   meta2d.modifier -- namespace
(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';
  var modifier = meta.modifier = meta.redeclare(meta.modifier);
  
  /**
   * @mixin Modifiable
   */
  var Modifiable = (function() {
    var typed_modify = function(type) {
      var modify = function(modifier) {
        if (!(type instanceof modifier.substrate))
          throw 'Wrong modifier type.';
        modifier.modify(this);
        return this;
      };
      return modify;
    };
    return function(type) {
      this.modify = typed_modify(type);
    };
  })();
  meta.Modifiable = meta.redeclare(meta.Modifiable, Modifiable);

  /**
   * @mixin Modifier
   */
  var Modifier = function(substrate) {
    this.substrate = substrate;
    this.modify = function() {throw 'Unimplemented modifier.'};
  };
  meta.Modifier = meta.redeclare(meta.Modifier, Modifier);

  // {Modifier} CENTER
  var Center = function() {
    Modifier.call(this, meta.ProjectionType);

    // @override
    this.modify = function(projection) {
      projection.forward = this.wrap(projection.forward);
      projection.reverse = this.wrap(projection.reverse);
    };
  };
  Center.prototype.wrap = function(f) {
    // @context Surface
    return function() {
      var pos = f.apply(this, arguments);
      return pos.add(meta.V([this.params.w * 0.5, this.params.h * 0.5]));
    }
  };
  modifier.CENTER = new Center();

  // so we get type-wise templates...
  //
  // ISOMETRIC : Projection +Modifiable<Projection>
  // CENTER +Modifier<Projection>
  // SLERP : Tween -- Modifiable<Tween>
  // NOISE +Modifier<Tween>
  // <code>
  //  project(ISOMETRIC.modify(CENTER))
  //  interpolate(SLERP.modify(NOISE))
  //  project(ISOMETRIC.modify(NOISE)) // exception!
  // </code>

}).call(this);

