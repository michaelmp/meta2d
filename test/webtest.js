(function() {
  var root = this;

  var output = document.getElementById('results'),
      summary = document.getElementById('summary'),
      passed = failed = 0;

  this.print = function(msg) {
    output.innerHTML += msg;
    setTimeout(function(){}, 0);
  };

  this.println = function(msg) {
    this.print(msg + '<br />');
  };

  this.printheader = function(msg) {
    this.println('');
    this.print('<h1>' + msg + '</h1>');
  };

  this.printsection = function(msg) {
    this.print('<h2>' + msg + '</h2>');
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

}).call(this);
