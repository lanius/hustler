var hustler = (function () {
  'use strict';

  var parser = {
    parse: function parse(path) {
      this.parse = hustler.parser.parse.bind(hustler);
      return this.parse(path);
    }
  };

  var actions = {};
  var patterns = {};

  function on(path, action, pattern) {
    actions[path] = action;
    patterns[path] = pattern;
  }

  function emit(path, arg) {
    return function (event) {
      // TODO: enable to use event.stopPropagation() with option
      event.preventDefault(); // TODO: switch enable/disable with option
      var balls = parser.parse(path);
      shot(balls, arg);
    };
  }

  function shot(balls, arg) {
    var cargo = arg;
    while (balls) {

      if (balls.length) { // selection
        var defaultBall;
        var matched = false;
        for (var i = 0, length = balls.length; i < length; i++) {
          var ball = balls[i];
          var pattern = patterns[ball.name];
          if (pattern === undefined) {
            defaultBall = ball;
            continue;
          }
          if (match(cargo, pattern)) { // pattern match
            matched = true;
            balls = ball;
            break;
          }
        }
        if (!matched) { // called when any pattern is not matched
          balls = defaultBall;
        }
      } else { // sequence
      }

      cargo = actions[balls.name](cargo);
      //console.log('action: ' + balls.name + ' is called.'); // DEBUG
      balls = balls.next;
    }
  }

  function match(target, pattern) {
    for (var prop in pattern) {
      if (pattern.hasOwnProperty(prop)) {
        if (target[prop] !== pattern[prop]) {
          return false; // any pattern is not matched
        }
      }
    }
    return true; // all patterns are matched
  }

  return {
    on: on,
    emit: emit
  };

}());