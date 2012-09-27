Meta2D
======

Meta2D is a Javascript framework for writing real-time graphical web
applications with the Canvas 2d Context.

The primary class is the MetaContext, which extends the CanvasRenderingContext2D
API with utilities for layers, entities, events, and cacheing.

A MetaContext does everything that Canvas 2d Context does and more.

How to Build
------------

Install python and the rake build utility and run:

    rake

This will generate a single Javascript source:

    meta2d.js

How to Use
----------

Copy meta2d.js to your web host and include it in your HTML page. You can find
example code in the 'examples' directory.

Documentation
-------------

You can build the documentation with:

    rake document

This will generate some html files, most notably:

    docs/api/index.html

License
-------

    Copyright (c) 2011-2012 Michael Morris-Pearce <mikemp@mit.edu>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

A copy of the GPLv3 can be found in the accompanying LICENSE file.
