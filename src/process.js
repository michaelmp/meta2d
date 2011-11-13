(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  var processes = {};

  /** Start a new process running, or return an existing one. */
  var process = function(name, f, rate) {
    if (meta.undef(name))
      throw new meta.exception.InvalidParameterException();
    if (!f || meta.undef(rate))
      return processes[name];

    var fps_timeout_id,
        fps_time = meta.time(),
        fps_rate,
        fps_count;

    // The function to repeat
    // #process controller
    var recurrence = function (f, rate) {
      var ms = meta.time();

      fps_count++;
      if (ms - fps_time > 1000) {
        fps_rate = fps_count;
        fps_count = 0;
        fps_time = ms;
      }
      f.call(this);

      var t_pct = (ms - fps_time) / 1000,
          c_pct = fps_count / rate;

      if (c_pct < t_pct) {
        fps_timeout_id = setTimeout(this.start.bind(this), 0);
      } else {
        fps_timeout_id = setTimeout(this.start.bind(this), 1000 / rate);
      }
    };

    // Process controller
    var obj = {
      getTimeoutId: function() {
        return fps_timeout_id;
      },
      stop: function() {
        cleartimeout(fps_timeout_id);
      },
      start: function() {
        recurrence.call(this, params.f, params.rate);
        return this;
      },
      getRate: function() {
        return fps_rate;
      }
    };

    // store & return new obj
    if (processes[name]) processes[name].stop();
    processes[name] = obj;
    return obj.start.call(obj);
  };


  // #[meta2d::Context]
  var render = function() {
    this.clearAll();
    this.renderAll();
    this.flipAll();
  };

  meta.process = meta.declareSafely(meta.process, {
    process: process,
    render: render
  });

}).call(this);
