document.addEventListener('DOMContentLoaded',
(function() {

  var image;

  var loadfail = function() {
    this.printheader('meta2d::Context');
    assert('Could not load images.');
    summarize();
  };

  var f = function() {
    this.printheader('meta2d::Context');

    var ctx1, ctx2;

    var reset = function() {
      ctx1 = new meta2d.Context(100, 100);
      var cvs = document.createElement('canvas');
      cvs.width = 100;
      cvs.height = 100;
      ctx2 = cvs.getContext('2d');
    };

    printsection('Native context equivalence.');

    reset();
    [ctx1, ctx2].forEach(function(ctx) {
      ctx.translate(50, 50);
      for (var i = 0; i < 100; i++) {
      ctx.strokeStyle = 'rgba(200,200,255,0.5)';
      ctx.strokeRect(-5, -5, 10, 10);
      ctx.scale(1.2, 1);
      ctx.rotate(Math.PI / 6);
      }
      });
    assert('drawing#1', sameBitmap(ctx1, ctx2));

    reset();
    [ctx1, ctx2].forEach(function(ctx) {
        var grad = ctx.createLinearGradient(0, 0, 10, 10);
        grad.addColorStop(0.0, 'rgba(0,255,0,1)');
        grad.addColorStop(1.0, 'rgba(0,0,255,0.5)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.translate(50, 50);
        ctx.moveTo(0, 0);
        for (var i = 0; i < 20; i++) {
        ctx.lineTo(i, i);
        ctx.scale(1.05, 1);
        ctx.rotate(Math.PI/3);
        }
        ctx.stroke();
        ctx.closePath();
        });
    assert('drawing#2', sameBitmap(ctx1, ctx2));

    reset();
    [ctx1, ctx2].forEach(function(ctx) {
        for (var i = 0; i < 100; i++) {
        ctx.save();
        ctx.translate((i % 4) * 25, 25 * (i / 4));
        ctx.shadowOffsetX = ctx.shadowOffsetY = i/5;
        ctx.shadowBlur = i/50;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.strokeText('hello world', 0, 0);
        ctx.restore();
        }
        });
    assert('drawing#3', sameBitmap(ctx1, ctx2));

    reset();
    [ctx1, ctx2].forEach(function(ctx) {
        ctx.translate(50, 50);
        ctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < 10; i ++) {
        ctx.fillStyle = 'rgba('+100+10*i+',150,250,0.2)';
        ctx.scale(1.2, 1.2);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-5, -5, 10, 10);
        }
        });
    assert('drawing#4', sameBitmap(ctx1, ctx2));

    reset();
    [ctx1, ctx2].forEach(function(ctx) {
        ctx.setTransform(-1, 0, 0, -1, 50, 50);
        ctx.drawImage(image.getHTMLImage(), -50, -50, 100, 100);
        });
    assert('drawing#5', sameBitmap(ctx1, ctx2));

    summarize();
  };

  image = new meta2d.Image('html5.png', false, f.bind(this), loadfail.bind(this));

}).bind(this));
