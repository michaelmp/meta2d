(function() {
  var root = this;

  var output = document.getElementById('results'),
      summary = document.getElementById('summary'),
      passed = failed = 0;

  this.print = function(msg) {
    output.innerHTML += msg;
    setTimeout(void 0, 0);
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

}).call(this);
