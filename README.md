Meta2D
======

meta2d.js provides the MetaContext, an enhanced implementation of the
CanvasRenderingContext2D API as drafted by the World Wide Web Consortium
in HTML5.

A MetaContext does everything that a native Context2D can do in the browser and
much more:
-  Layers
-  Entities
-  Cacheing
-  Mouse Interaction

This project is hosted at <https://gitorious.org/meta2d>. Check there for
updates and other information not found in this readme file.

Where to Start
--------------

The demo files are a great place to start. You may want to read them in the
following order:
1  layer.html - How a MetaContext uses multiple canvases.
2  entity.html - The scene model & tags.
3  drawing.html - Introduction to Drawings and the double-buffer.
4  cache1.html - Do not repeat yourself.

How to Build
------------

Install the rake build program and run:

    rake

You should have a large Javascript source in the build/ directory, along with a
minified version, and gzipped versions of both (you will need to install gzip).

You can build HTML documentation files by running:

    rake document

This will output a single html file to the doc/ directory.

Development
-----------

### Main Branch ###

    git clone git://gitorious.org/meta2d/meta2d.git meta2d

### Testing ###

The test/ directory contains scripts you can run in your browser to perform
a battery of unit tests.

If you get a SECURITY_ERR exception loading images it probably means that
you're serving the tests from a local origin and your browser doesn't allow you
to read local files where the same-origin policy applies (here, getImageData).

In chromium, run with --allow-file-access-from-files.

In firefox, go to about:config and change security.fileuri.strict_origin_policy
to false.

### Contact ###

Please share feedback, bugs, patches, feature requests, and success stories
by contacting the project owner(s) on the gitorious project page.

    https://gitorious.org/meta2d

License
-------

    Copyright (c) 2011 Michael Morris-Pearce <mikemp@mit.edu>

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

A copy of the GPLv3 can be found in the accompanying COPYING file.
