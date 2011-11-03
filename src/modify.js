(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';
  
  /**
   * @mixin Modifiable
   */
  var Modifiable = function(type) {
    this.modify = function(modifier) {
        if (!(type instanceof modifier.substrate))
          throw new meta.exception.InvalidTemplateException();
        modifier.modify(this);
        return this;
        };
  };

  /**
   * @mixin Modifier
   */
  var Modifier = function(substrate) {
    this.substrate = substrate;
    // @abstract
    this.modify = function() {
      throw new meta.exception.InvokedAbstractMethodException();
    };
  };

  meta.mixSafely(meta, {
    Modifiable: Modifiable,
    Modifier: Modifier
  });

}).call(this);
