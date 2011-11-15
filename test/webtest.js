(function() {
  var root = this;

  var output = document.getElementById('results'),
      summary = document.getElementById('summary'),
      passed = failed = 0;

  this.print = function(msg) {
    var e = document.createElement('div');
    e.innerHTML = msg;
    output.appendChild(e);
    setTimeout(void 0, 0);
  };

  this.printBitmap = function(ctx) {
    var cvs = ctx.canvas;
    cvs.setAttribute('style', '');
    output.appendChild(cvs);
  };

  this.println = function(msg) {
    root.print(msg + '<br />');
  };

  this.printheader = function(msg) {
    root.println('');
    root.print('<hr/><h1>' + msg + '</h1>');
  };

  this.printsection = function(msg) {
    root.print('<h2>' + msg + '</h2>');
  };

  this.assert = function(msg, cond) {
    if (cond) {
      passed += 1;
    } else {
      failed += 1;
    }
    println(msg + ': ' + (cond ?
          '<div class="pass">pass</div>' :
          '<div class="fail">fail</div>'));
  };

  this.summarize = function(msg) {
    var cls = failed === 0 ? 'pass' : 'fail';
    summary.innerHTML =
      '<div class="'+cls+'">' +
      passed + '</div>/' + (passed + failed) +
      ' total tests passed';
  };

  this.spin = function(sec) {
    var start = new Date().getTime();
    while (new Date().getTime() - start < sec * 1000) {
      setTimeout(void 0, 0);
    }
  };

  this.sameBitmap= function(ctx1, ctx2) {
    var d1 = ctx1.getImageData(0, 0, ctx1.canvas.width, ctx1.canvas.height),
        d2 = ctx2.getImageData(0, 0, ctx2.canvas.width, ctx2.canvas.height),
        same = true;
    
    if (d1.data.length !== d2.data.length) return false;

    meta2d.args(d1.data).forEach(function(val, i) {
        if (d2.data[i] !== val) same = false;
        });

    this.printBitmap(ctx1);
    this.printBitmap(ctx2);

    return same;
  };

}).call(this);
