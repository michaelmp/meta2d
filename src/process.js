// provides:
//  meta2d.process -- namespace
(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var process = meta.process = meta.redeclare(meta.process);

  // @context Surface
  process.FULL_RENDER = function() {
    this.clearAll();
    this.accumulate();
    this.render();
  };

  process.cameraLock = function(tag) {
    // @context Surface
    return function() {
      var obj = this.get(tag).getItems()[0];
      if (!obj) return;
      this.camera(obj.data.pos);
    };
  };

  process.cameraChase = function(tag, tension) {
    // @context Surface
    return function() {
      var obj = this.get(tag).getItems()[0];
      if (!obj) return;
      var a = this.camera();
      var b = obj.data.pos;
      this.camera(a.add(a.subtract(b).multiply(-1 * tension)));
    };
  };

}).call(this);

