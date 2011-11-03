(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  // #[meta2d::Context]
  var render = function() {
    this.clearAll();
    this.accumulate();
    this.render();
  };

  var lock = function(tag) {
    // #[meta2d::Context]
    return function() {
      var obj = this.get(tag).getItems()[0];
      if (!obj) return;
      this.camera(obj.data.pos);
    };
  };

  var chase = function(tag, tension) {
    // #[meta2d::Context]
    return function() {
      var obj = this.get(tag).getItems()[0];
      if (!obj) return;
      var a = this.camera();
      var b = obj.data.pos;
      this.camera(a.add(a.subtract(b).multiply(-1 * tension)));
    };
  };

  meta.process = meta.declareSafely(meta.process, {
    FULL_RENDER: render,
    cameraLock: lock,
    cameraChase: chase
  });

}).call(this);
