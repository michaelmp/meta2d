/** process.js
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
