(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var serialize = function(obj) {
    return JSON.stringify(obj);
  };
  meta.serialize = meta.redeclare(meta.serialize, serialize);

  var deserialize = function(string) {
    return JSON.parse(string);
  };
  meta.deserialize = meta.redeclare(meta.deserialize, deserialize);

  var make_key = function(arg) {
    return serialize(arg);
  };

  var DrawCache = function() {
    var lru_ = new meta.LRU(100);

  };

  DrawCache.prototype.draw = function() {
    
  };

  meta.DrawCache = DrawCache;

}).call(this);
