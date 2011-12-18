// Imperfect workaround for Safari & other browsers that do not provide
// Function.bind natively.

if (typeof Function.prototype.bind !== 'function') {
  Function.prototype.bind = function(thisArg) {
    var bound_args = Array.prototype.slice.call(arguments, 1)
      , f = this
    return function() {
      var fresh_args = Array.prototype.slice.call(arguments, 0)
      return f.apply(thisArg, bound_args.concat(fresh_args))
    }
  }
}
