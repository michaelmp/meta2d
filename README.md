MetaContext2D
=============

MetaContext2D,  _meta2d.js_, is a Javascript library for getting the most out
of the HTML5 Canvas Context2D. meta2d.js provides support for layers, entities,
per-entity mouse events, keyframe animation & interpolation, and cache
optimization. These features are provided in an API that closely resembles the
W3C's Context2D API, so legacy code can be easily ported.

This project is hosted at <https://gitorious.org/meta2d>. Check there for
updates and other information not found in this readme file.

---

## Sections ##
1  Documentation
    - Getting Started
    - Full API
2  Features
    - Layers
    - Entities
    - Animations
    - Cacheing
    - Mouse Events
3  How to Build
    - Simple
    - Detailed
4  Development
    - Main Repo
    - Bugs
    - Suggestions
    - Mailing List
    - Code Style
5  Contributors
6  License

---

Documentation
-------------

### Getting Started ###

If you just want to use the library, simply copy /build/meta2d.js to your web
host and link to it in your HTML.

This package contains the following files and directories:
- /src : All of the code necessary to build the library.
- /doc : API documentation generated from source comments.
- /jsmin : A copy of Douglas Crockford's Javascript minifier.
- /build : Output for build targets.
- /test : Unit tests for library components.
- /demo : Example applications.
- rakefile : The build program.
- COPYING : A copy of GPLv3.
- README.md : The file you are reading now.

### Examples ###

The /demo directory contains sample applications to demonstrate the different
features offered.

### Full API ###

If examples are not enough, or you want to learn more, you should refer to the
API documentation for comprehensive information. A copy can be found in the
/doc directory or online at <?>.

Features
--------

### Layers ###

You can use a MetaContext to multiplex your standard Context2D instructions
over a stack of z-index-sorted canvases, automatically inserted into the page
as needed.

### Entities ###

A plain Context2D simply follows drawing instructions, but often we want to
associate those instructions with specific components in the drawing. When a
drawing is repeated many times, we can prepare it once and reuse it. We can
associate a bounding region with a drawing and avoid work when it is offscreen
or cached elsewhere. We can associate mouse-collision rules with the drawing
after z-index sorting to get mouse interaction.

### Animations ###

This library includes support for keyframe animation, interpolation,
smoothing (aka easing), and noise.

### Cacheing ###

Most browsers use software rendering to draw Context2D graphics. This creates
a tight CPU bottleneck in the preparation and blitting of pixel data, typically
on the order of the number of pixels read from one canvas and written into 
another. Fortunately, there are opportunities to shift that CPU burden into RAM
when pixel data are used repetitively.

### Mouse Events ###

Mouse events such as moveover, mousemove, & click can be triggered per entity
based on its image representation (alpha-masked) after all transformations by
the context have been applied.

How to Build
------------

### Simple ###

Install the rake build program and run:

    rake



### Detailed ###


## Components ##
-  Source
-  Documentation
-  Tests

## Targets ##
-  Minification
-  GZip Compression

Development
-----------

### Main Repo ###

    git clone git://gitorious.org/meta2d/meta2d.git meta2d

### Bugs ###

Bug tracker is at <?>.

### Suggestions ###

Suggestions & feature requests are welcome. Please send to <?>.

### Mailing List ###

Announcements:
Development:

### Coding Style ###

Please fork this project. If you have a patch that you want merged into the
main branch, please write code consistent with the coding style used here.

-  Always spaces, never tabs.
-  80 character limit. Aggressively break up long lines, especially with
   many-argument functions and many-attribute object literals.
-  Use creative whitespace sparingly. Do not align object literal fields
   around the colon. Comma-separated var declarations and argument lists may
   be aligned by their indentation on a new line., but do not align about the
   = in a var declaration.
-  Use newlines to break up dissimilar code blocks, var blocks, and return
   statements.
-  2x indentation, except for comma-separated statements & arguments, which
   are 4x. Inline function declarations also get 4x indentation for the code
   block.
-  Always use semicolons where expected, even if Javascript doesn't care.
-  Always use curly brace blocks where expected, with exception for one-liner
   if statements that may take a newline (C-familiarity should override
   Python-ish indentation gotchas).
-  Always delimit function blocks with curly braces, even for one-liners.
-  Avoid excessive var statements (use commas where appropriate).
-  All functions must be declared with var (strict mode only allows non-var
   function declarations in the global context anyway).
-  Only manipulate the primary namespace; do not create global variables.
-  camelCase for all public class/mixin members.
-  camelCaseWithTrailingUnderscore_ for all private/protected class/mixin
   members.
-  underscored\_lower\_case otherwise.
-  ALL\_CAPS\_WITH\_UNDERSCORE for constants & static objects.
-  Always use strict mode.
-  Try to avoid next-generation EcmaScript features that alienate recent
   versions of popular browsers.
-  Prefer next-generation EcmaScript features that obviate the need for
   3rd-party code or frameworks.
-  Be framework neutral: all code must work without requiring any specific
   framework.
-  Never use eval.
-  Never use with.
-  Comment all non-trivial functions. // or /** */ as appropriate.
-  Use function names that best suggest what they do. Use names like
   getAttributeByAccessorType.
-  Use @ annotations such as @class @mixin @method @override @return @param
   @throw. @public, @private, @privileged are not necessary, but do not hurt.
-  Indicate type with [], namespace with ::, inheritance with :, templating
   with <>, and function context (thisArg) with #.

A pedantic example:

    (function() {
      'use strict';

      var foo = 'a',
          bar = 'b',
          baz = 'c';

      // #[Object : Namespace::SomeMixin]
      var helper_function = function(arg) {
        return this.mixedInFunction(arg);
      };

      /**
       * @mixin Namespace::SomeMixin<T>
       * 
       * A description of the mixin.
       */
      var SomeMixin = function(T) {
        /**
         * @method mixedInFunction
         *
         * A description of the method.
         *
         * @param [ArgType] arg
         * @return [T]
         */
        this.mixedInFunction = function(arg) {
          return new T(arg);
        };
      };

      this.Namespace.SomeMixin = SomeMixin;

      /**
       * @class Namespace::SomeModule::MyClass<T>
       *   : Namespace::ParentClass
       *   : Namespace::SomeMixin<T>
       * @param [T] t
       *
       * A description of the class.
       */
      var MyClass = function(t) {
        this.Namespace.SomeMixin.call(this, t);
      };
      MyClass.prototype = new this.Namespace.ParentClass();

      /**
       * @method memberName
       * @param [ArgType] argName
       *
       * A description of what the method does.
       *
       * @return [T]
       */
      MyClass.prototype.memberName = function(argName) {
        return helper_function.call(this, argName);
      };

      this.Namespace.SomeModule.MyClass = MyClass;

    }).call(this);

Note that using the template notation <T> obviously does nothing in here
besides indicate the type of a Javascript argument: Javascript does not care.
This is helpful notation however when memberName wants to indicate that its
return type is identical to the type provided in the MyClass constructor.

Any Javascript coding practices not explicitly mentioned here should make
Douglas Crockford or Google happy. See:
-  <http://javascript.crockford.com/code.html>
-  <http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml>

It would also be great to pass a JSLint test eventually, although there are
so many disputable criteria in JSLint that this doesn't mean much.

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

If you are interested in acquiring a proprietary (non copy-left) license of
this project, please contact the copyright-holder for more information.

