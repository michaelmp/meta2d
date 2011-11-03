(function() {
  'use strict';
  var root = this;
  var meta = root.meta2d;
  if (!meta) throw 'Could not find main namespace.';

  /**
   * @class Drawing
   * @param [meta::math::Rect] rect
   * @constructor
   */
  var Drawing = function(rect) {
    this.rect = rect;
    this.canvas = document.createElement('canvas');
    this.canvas.width = rect.w;
    this.canvas.height = rect.h;
    this.context = this.canvas.getContext('2d');
  };
  
  /**
   * @method draw
   * Draws the intersecting portion of the argument image onto this image.
   * @param [meta::Drawing] drawing
   */
  Drawing.prototype.draw = function(drawing) {
    this.context.drawImage(
        drawing.canvas,
        0,
        0,
        meta.round(drawing.rect.w),
        meta.round(drawing.rect.h),
        meta.round(this.rect.x - drawing.rect.x),
        meta.round(this.rect.y - drawing.rect.y),
        meta.round(drawing.rect.w % this.rect.w),
        meta.round(drawing.rect.h % this.rect.h)
        );
  };

  meta.Drawing = Drawing;

}).call(this);
