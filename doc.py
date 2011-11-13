#!/usr/bin/env python

# Copyright (c) 2011 Michael Morris-Pearce <mikemp@mit.edu>
#
# A quick & dirty script for parsing annotated Javascript comments and building
# a representation of Objects and Mixins for output as documentation in any
# target format.
#
# How to use this script:
#
# (1) Install the python interpreter for your system.
# (2) Write a visitor (see HTMLVisitor below) for your output format.
#     The script comes with an HTML generator. Change __main__ to output your
#     new visitor's output instead of HTML.
# (3) Input your source through standard input.
# (4) Redirect standard output to a file.
#
# Example (UNIXish systems):
#  cat source.js | ./doc.py > doc.html
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import sys

############ Begin HTML generator ############

DOC_HTML = {
    'object': '<article> <h1> %(label) </h1> <p> %(description) </p> <p> %(contained) </p> </article>',
    'constructor': '<section> <h2> Constructor </h2> %(contained) <div class="method_desc"> %(description) </div> </section>',
    'method': '<section> <h2> %(label) </h2> %(contained) <div class="method_desc"> %(description) </div> </section>',
    'param': '<div class="param"> <div class="param_type"> &larr; %(label) </div> <div class="param_desc"> %(description) </div> </div>',
    'return': '<div class="return"> div class="return_type"> &rarr; %(label) </div> <div class="return_desc"> %(description) </div> </div>',
    'everything': """
<html>
<head>
<link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
%(contained)
</body>
</html>
"""
}

DOC_HTML_TAGS = {
    '--&#62;': '&rarr;',
    '[code]': '<code>',
    '[/code]': '</code>',
    '[p]': '<p>',
    '[/p]': '</p>',
    '[url]': '<a href="">',
    '[/url]': '</a>'
}

class HTMLVisitor:
  def visit(self, o):
    if o.getType() not in DOC_HTML:
      return ''
    l = o.getLabel().replace('<', '&#60;').replace('>',  '&#62;')
    d = o.getDescription().replace('<', '&#60;').replace('>',  '&#62;')
    c = ' '.join([self.visit(c) for c in o.getContained()])
    sanitized = DOC_HTML[o.getType()] \
      .replace('%(label)', l) \
      .replace('%(description)', d) \
      .replace('%(contained)', c)
    for t in DOC_HTML_TAGS:
      sanitized = sanitized.replace(t, DOC_HTML_TAGS[t])
    return sanitized

############ End HTML generator ############

METHOD_ANNOTATIONS = ['param', 'return']
OBJECT_ANNOTATIONS = ['method', 'constructor']
namespace = {'class': {}, 'mixin': {}}
focus = None
method_focus = None

class Visited:
  def __init__(self):
    self.label = ''
    self.description = ''
    self.contained = {}

  def getType(self):
    return ''

  def getLabel(self):
    return self.label

  def getDescription(self):
    return self.description

  def getContained(self):
    return self.contained.values()

class Everything(Visited):
  def getType(self):
    return 'everything'

  def getContained(self):
    all = []
    for o in namespace.values():
      all += o.values()
    return sorted(all,
        lambda a,b: cmp(a.getLabel().lower(), b.getLabel().lower()))

class Param(Visited):
  def incorporate_annotation(self, a):
    if a[0] == 'param':
      self.label = a[1]
      self.description = a[2]

  def getType(self):
    return 'param'

  def getContained(self):
    return []

class Return(Param):
  def incorporate_annotation(self, a):
    if a[0] == 'return':
      self.label = a[1]
      self.description = a[2]

    def getType(self):
      return 'return'

    def getContained(self):
      return []

class Method(Visited):
  def __init__(self):
    Visited.__init__(self)
    self.params = []
    self.ret = None

  def incorporate_annotation(self, a):
    if a[0] == 'method':
      self.label = a[1]
      self.description = a[2]
    elif a[0] == 'param':
      p = Param()
      p.incorporate_annotation(a)
      self.params.append(p)
    elif a[0] == 'return':
      r = Return()
      r.incorporate_annotation(a)
      self.ret = r

  def getType(self):
    return 'method'

  def getLabel(self):
    output = self.label + '(' + ', '.join( \
        [p.getLabel() for p in self.params]) + ')'
    if self.ret:
      output += ' --> ' + \
          self.ret.getLabel() if self.ret.getLabel() else 'void'
    return output

  def getContained(self):
    return self.params

class Constructor(Method):
  def getType(self):
    return 'constructor'

  def incorporate_annotation(self, a):
    if a[0] == 'constructor':
      self.description = a[1] + a[2]
    elif a[0] == 'param':
      p = Param()
      p.incorporate_annotation(a)
      self.params.append(p)

class Object(Visited):
  def __init__(self):
    Visited.__init__(self)
    self.constructor = None

  def incorporate_annotation(self, a):
    global method_focus
    if a[0] == 'class':
      self.label = a[1]
      self.description = a[2]
    elif a[0] == 'method':
      m = Method()
      m.incorporate_annotation(a)
      self.contained[a[1]] = m
      method_focus = m
    elif a[0] == 'constructor':
      c = Constructor()
      c.incorporate_annotation(a)
      self.constructor = c
      method_focus = c

  def getType(self):
    return 'object'

  def getContained(self):
    methods = sorted(self.contained.values(), \
        lambda a,b: cmp(a.getLabel().lower(), b.getLabel().lower()))
    return [self.constructor] + methods if self.constructor else methods

def read_annotations(comment):
  annots = [['preamble', '', '']]
  for line in comment.splitlines():
    line = line.strip()
    if len(line) == 0:
      continue
    if line[0] == '@':
      rl = line.partition('@')[2].split(' ')
      if len(rl) < 2:
        rl.append('')
      if len(rl) < 3:
        rl.append('')
      annots.append([rl[0], rl[1], ' '.join(rl[2:])])
    else:
      annots[-1][2] += line + '\n'
  return annots

def parse(input):
  comments = []
  for chunk in input.read().split('/**'):
    chunk = chunk.partition('*/')[0]
    c = ''
    for line in chunk.splitlines():
      l = line.lstrip()
      if not l or l[0] != '*':
        continue
      c += l.lstrip().partition('*')[2] + '\n'
    comments.append(c)
  return comments

def annotation_to_representation(a):
  global focus, method_focus, METHOD_ANNOTATIONS, OBJECT_ANNOTATIONS
  if not a[0]:
    return

  if a[0] == 'class':
    if a[1] not in namespace[a[0]]:
      namespace[a[0]][a[1]] = Object()
    focus = namespace[a[0]][a[1]]
    method_focus = None
    focus.incorporate_annotation(a)
  elif a[0] in OBJECT_ANNOTATIONS:
    if not focus:
      return
    focus.incorporate_annotation(a)
  elif a[0] in METHOD_ANNOTATIONS:
    if not method_focus:
      return
    method_focus.incorporate_annotation(a)

if __name__ == "__main__":
  # Scan and parse comments.
  for c in parse(sys.stdin):
    for a in read_annotations(c):
      annotation_to_representation(a)

  # Generate HTML on standard output.
  print HTMLVisitor().visit(Everything())
