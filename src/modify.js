/** modify.js
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
