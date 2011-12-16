/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/modify.js
 * -----------------------------------------------------------------------------
 * Copyright 2011 Michael Morris-Pearce
 * 
 * This file is part of Meta2D.
 *
 * Meta2D is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Meta2D is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Meta2D.  If not, see <http://www.gnu.org/licenses/>.
 *----------------------------------------------------------------------------*/

!function(meta) {

  'use strict'

  /**
   * @mixin Modifiable
   */

  /**
   * @constructor
   *  <p>
   *  Adds the <i>modify</i> method to the contextual object.
   *  </p>
   *
   * @param type
   *  A class indicating the acceptable type of Modifiers on this object.
   */
  var Modifiable = function(type) {
    /**
     * @method modify
     *  <p>
     *  Applies a Modifier to the object. Throws an exception if the modifier
     *  is not an acceptable type.
     *  </p>
     *
     * @param modifier
     *  A Modifier to alter this object.
     *
     * @return Object
     */
    this.modify = function(modifier) {
      if (!(type instanceof modifier.substrate))
        throw new meta.exception.InvalidTemplateException()
      modifier.modify(this)
      return this
    }
  }

  /**
   * @mixin Modifier
   */

  /**
   * @constructor
   *  <p>
   *  Adds the abstract <i>modify</i> method to the contextual object.
   *  </p>
   *
   * @param substrate
   *  A class indicating the acceptable type of Modifiable objects this can
   *  modify.
   */
  var Modifier = function(substrate) {
    this.substrate = substrate

    /**
     * @method modify
     *  <p><i>Abstract</i>.</p>
     *
     *  <p>
     *  Modify takes a Modifiable object and overwrites any number of methods
     *  as composed functions.
     *  </p>
     *
     * @param modifiable
     *  A Modifiable object to alter.
     */
    this.modify = function(modifiable) {
      throw new meta.exception.InvokedAbstractMethodException()
    }
  }

  meta.mixSafely(meta, {
    Modifiable: Modifiable,
    Modifier: Modifier
  })

}(this.meta2d);
