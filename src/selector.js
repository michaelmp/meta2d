// provides:
//  meta2d.Selector -- class
(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * Sets up a function to register event callbacks.
   */
  var on = function(event) {
    return function(f) {
      //if (!f) f = null;
      this.items.forEach(function(item) {
          item[event] = f;
          });
      return this;
    };
  };

  /**
   * @class Selector
   *
   * A Selector performs aggregate operations on a set of objects.
   * By convention, a Selector method typically returns another Selector.
   *
   * @param items {Array}
   */
  var Selector = function(items) {
    if (!items) throw 'Invalid parameters.';
    this.items = items;
  };

  /**
   * Applies the function to each item.
   *
   * @param f(item) -- function to apply to items
   * @return Selector
   */
  Selector.prototype.forEach = function(f) {
    this.items.forEach(f);
    return this;
  };

  /**
   * Removes unwanted elements from the selection.
   * 
   * @param f(item) -- returns true for retained items
   * @return Selector
   */
  Selector.prototype.filter = function(f) {
    return new Selector(this.items.filter(f));
  };

  /**
   * Manipulate object data aggregately. Set the value at key, or fetch value
   * at key if specified in arguments.
   * 
   * @param key -- key in data store
   * @param val -- (optional) associate key with value
   * @return Selector
   */
  Selector.prototype.data = function(key, val) {
    if (!key) return this;
    if (!val) {
      var output = [];
      this.items.forEach(function(item){
          output.push(item.data[key]);
          });
      return output;
    }
    this.items.forEach(function(item){
        item.data[key] = val;
        });
    return this;
  };

  /**
   * a projection maps data.pos --> {dx,dy} and the transformation is
   * applied before each call to the objects draw method.
   */
  Selector.prototype.project = function(projection) {
    this.items.forEach(function(item){
        item.projection = projection;
        });
    return this;
  };

  /**
   */
  Selector.prototype.reindex = function(surface) {
    this.items.forEach(function(item) {
        if (!item.data || !item.data.layer) return;
        var layer = surface.getLayerByName(item.data.layer);
        if (!layer) return;
        if (!item.data.bound) return;
        layer.reindex(surface, item.data.bound);
        }); 
  };

  /**
   * Assign a masking function for mouse events. Some basic functions are
   * provided in Collide for convenience.
   *
   * @param String f -- use mask defined in Collide
   * @param f(surface, data, test) -- returns true when test object satisfies
   *                                data's mask.
   * @return Selector
   */
  Selector.prototype.clickmask = function(f_array) {
    f_array = Array.apply([], f_array);
    this.items.forEach(function(item){
        item.clickmask = [];
        f_array.forEach(function(f){
            item.clickmask.push(f);
            });
        });
    return this;
  };

  /**
   * Dump the items array.
   *
   * @return Selector
   */
  Selector.prototype.getItems = function() {
    return this.items;
  };

  // Surface events
  Selector.prototype.ondraw = on.call(this, 'draw');
  Selector.prototype.onbound = on.call(this, 'bound');

  // HTML events
  Selector.prototype.onclick = on.call(this, 'click');
  Selector.prototype.onmouseover = on.call(this, 'mouseover');
  Selector.prototype.onmouseout = on.call(this, 'mouseout');
  Selector.prototype.onmousemove = on.call(this, 'mousemove');

  // User-defined events
  Selector.prototype.on = function(event, f) {
    on.call(this, event).call(this, f);
    return this;
  };

  // trigger user-defined events
  Selector.prototype.trigger = function(name) {
    this.items.forEach(function(item){
        if (item[name]) item[name].call(item, item.data);
        });
    return this;
  };

  meta.Selector = Selector;

}).call(this);

