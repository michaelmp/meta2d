/* -----------------------------------------------------------------------------
 * <https://gitorious.org/meta2d/core/trees/master/>
 * src/ui/text.js
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

  var TextArea = function() {
    this.lines = ['']
    this.line = 0
    this.cursor = 0
    this.mode = 'insert'
    this.cols = 80
    this.maxlines = 0
  }

  TextArea.prototype.read = function() {
    // End of line.
    if (this.cursor >= this.lines[this.line].length) {
      // End of text.
      if (this.line === this.lines.length - 1) {
        return null
      } else {
        this.downline()
        this.home()
        return '\n'
      }
    }
    var c = this.lines[this.line][this.cursor]
    this.forwardspace()
    return c
  }

  TextArea.prototype.readLine = function() {
    var buffer = [],
        c

    while (c = this.read()) {
      if (c === '\n') {
        break
      }
      buffer.push(c)
    }

    return buffer.join('')
  }

  TextArea.prototype.write = function(str) {
    if (!str) return
    Array.prototype.slice.call(str, 0).reduce((function(_, c) {
      var before, after

      if (c === '\n') {
        before = this.lines[this.line].slice(0, this.cursor)
        after = this.lines[this.line].slice(this.cursor)
        if (this.lineafter()) {
          this.home()
          this.lines[this.line - 1] = before
          this.lines[this.line] = after
        }
        return 0
      }

      if (this.lines[this.line].length < this.cols) {
        // there is room on the line for one more character.
        before = this.lines[this.line].slice(0, this.cursor)
        after = this.lines[this.line].slice(this.cursor)
        this.lines[this.line] = before.concat(c).concat(after)
        this.cursor += 1
        return 1
      } else {
        // the line is full.
        if (this.cursor >= this.cols) {
          // we are end of line, so overflow to next line.
          if (!this.maxlines || this.lines.length < this.maxlines) {
            // just make a new line
            this.lineafter()
            this.home
            return this.write(c)
          } else {
            // no room for new line!
            return 0
          }
        } else {
          // there are characters after cursor.
          after = this.lines[this.line].slice(this.cursor)
        }
      }
    }).bind(this), 0)
  }

  TextArea.prototype.writeLine = function(str) {
    var num = this.write(str)
    num += this.write('\n')
    return num
  }

  TextArea.prototype.forwarddelete = function() {
    var before, after, i,
        oldline = this.line,
        oldcursor = this.cursor

    if (this.cursor >= this.lines[this.line].length) {
      if (this.line >= this.lines.length - 1) return false
      after = this.lines[this.line + 1].slice(0)
      this.downline()
      this.takeline() || this.upline()
      this.end()
      this.write(after)
      this.line = oldline
      this.cursor = oldcursor
      return after.length
    } else {
      before = this.lines[this.line].slice(0, Math.max(0, this.cursor))
      after = this.lines[this.line].slice(this.cursor + 1)
      this.lines[this.line] = before.concat(after)
    }
  }

  TextArea.prototype.backdelete = function() {
    var before, after, i, oldline, oldcursor

    if (this.cursor <= 0) {
      after = this.lines[this.line].slice(0)
      if (this.line && (this.takeline() || this.upline())) {
        this.end()
        oldline = this.line
        oldcursor = this.cursor
        this.write(after)
        this.line = oldline
        this.cursor = oldcursor
      }
      return after.length
    } else {
      before = this.lines[this.line].slice(0, this.cursor - 1)
      after = this.lines[this.line].slice(this.cursor)
      this.lines[this.line] = before.concat(after)
      this.backspace()
      return 1
    }
  }

  TextArea.prototype.backspace = function() {
    this.cursor -= 1
    if (this.cursor < 0) {
      this.home()
      return false
    }
    return true
  }

  TextArea.prototype.forwardspace = function() {
    this.cursor += 1
    if (this.cursor > this.lines[this.line].length - 1) {
      //if (this.line >= this.lines.length - 1) {
        this.end()
      //}
      return false
    }
    return true
  }

  TextArea.prototype.home = function() {
    this.cursor = 0
  }

  TextArea.prototype.end = function() {
    this.cursor = this.lines[this.line].length
  }

  TextArea.prototype.reset = function() {
    this.cursor = 0
    this.line = 0
  }

  TextArea.prototype.erase = function() {
    this.lines = ['']
    this.reset()
  }

  TextArea.prototype.upline = function() {
    if (!this.line) return false
    this.line -= 1
    this.cursor = Math.min(this.cursor, this.lines[this.line].length)
    this.cursor = Math.max(0, this.cursor)
    return true
  }

  TextArea.prototype.downline = function() {
    if (this.line >= this.lines.length - 1) return false
    this.line += 1
    this.cursor = Math.min(this.cursor, this.lines[this.line].length)
    this.cursor = Math.max(0, this.cursor)
    return true
  }

  TextArea.prototype.takeline = function() {
    if (this.lines.length <= 1) {
      this.lines = ['']
      return false
    }
    var before = this.lines.slice(0, this.line),
        after = this.lines.slice(this.line + 1)
    this.lines = before.concat(after)
    if (after.length < 1) {
      this.upline()
      return true
    }
    return false
  }

  TextArea.prototype.linebefore = function() {
    if (this.maxlines && this.lines.length >= this.maxlines) {
      //this.end()
      return false
    }
    this.line -= 1
    var before = this.lines.slice(0, this.line),
        after = this.lines.slice(this.line)
    this.lines = before.concat('').concat(after)
    return true
  }

  TextArea.prototype.lineafter = function() {
    if (this.maxlines &&
        (this.lines.length >= this.maxlines)) {
      //if (this.line >= this.lines.length - 1) this.end()
      return false
    }
    this.line += 1
    var before = this.lines.slice(0, this.line),
        after = this.lines.slice(this.line)
    this.lines = before.concat('').concat(after)
    return true
  }

  var proto = {
    fontfamily: 'monospace',
    fontsize: '14px',
    contentEditable: true
  }

  proto.onkeydown = function(event) {
    if (!this.contentEditable) return
    var key = event.keyIdentifier

    if (key === 'U+0008') {
      this.model.backdelete()
    } else if (key === 'U+0009') {
      this.model.write('  ')
      event.preventDefault()
    } else if (key === 'Enter') {
      this.model.write('\n')
    } else if (key === 'End') {
      this.model.end()
    } else if (key === 'Home') {
      this.model.home()
    } else if (key === 'Left') {
      this.model.backspace()
    } else if (key === 'Up') {
      this.model.upline()
    } else if (key === 'Right') {
      this.model.forwardspace()
    } else if (key === 'Down') {
      this.model.downline()
    } else if (key === 'U+007F') {
      this.model.forwarddelete()
    }

    this.layer.repaint(this)
    return
  }

  proto.ontextinput = function(event) {
    this.model.write(event.data)
    this.layer.repaint(this)
    return true
  }

  var keydown

  proto.onfocus = function() {
    this.focused = true
    document.removeEventListener('keydown', keydown)
    keydown = proto.onkeydown.bind(this)
    document.addEventListener('keydown', keydown, false)
    this.layer.repaint(this)
  }

  proto.onblur = function() {
    this.focused = false
    document.removeEventListener('keydown', keydown)
    this.layer.repaint(this)
  }

  proto.ondraw = function(cx, layer) {
    var w = (this.size && this.size[0]) || 400,
        h = (this.size && this.size[1]) || 300,
        cw = cx.measureText(' ').width,
        ch = cw * 2,
        ctx

    if (!this.size) {
      w = cw * (this.model.cols + 6)
    }

    ctx = new meta.Context(w, h)
    ctx.font = cx.font

    ctx.save()
    ctx.translate(0, 1)

    // highlight active line
    if (this.focused && this.highlight) {
      ctx.fillStyle = meta.hsla(240, 50, 80, 0.2)
      ctx.fillRect(0, ch + ch * this.model.line - ch, w, ch)
    }

    // show line numbers
    if (this.lines &&
       (this.focused ||
        (this.model.lines.length > 1 || this.model.lines[0].length))) {
      ctx.fillStyle = '#888'
      this.model.lines.forEach(function(line, i) {
        ctx.fillText(i + 1, cw * 0.5, 0.8 * ch + i * ch)
      })

      // indent
      ctx.translate(cw * (('' + this.model.lines.length).length + 1), 0)
    }


    // write the text & cursor
    ctx.fillStyle = 'black'
    this.model.lines.forEach(function(line, i) {
      ctx.fillText(line, cw * 0.5, 0.8 * ch + i * ch)

      if (this.focused &&
        (this.model.line === i)) {
        ctx.fillText('\u258f',
          cw * 0.5 + ctx.measureText(line.slice(0, this.model.cursor)).width,
          0.8 * ch + i * ch)
      }
    }, this)
    ctx.restore()

    ctx.strokeStyle = this.focused ? '#44f' : '#444'
    ctx.lineWidth = this.focused ? 2 : 1
    ctx.strokeRect(0, 0, w, h)

    this.draw = layer.makeDrawing(ctx)

    return this.draw
  }
  
  // TODO: drag over text to copy

  proto.onmask = function() {
    if (this.draw) return this.mask = meta.mask.bbox(this.draw)
  }

  proto.cursor = 'text'

  meta.ui = meta.declareSafely(meta.ui)

  meta.ui.proto = meta.declareSafely(meta.ui.proto, {
    text: proto
  })

  meta.ui = meta.declareSafely(meta.ui, {
    text: function(e) {
      var t = meta.mixSafely(e, meta.ui.proto.text)
      t.model = new TextArea()
      if (meta.def(e.cols)) t.model.cols = e.cols
      t.model.write(t.value)
      return t
    }
  })

}(this.meta2d);
