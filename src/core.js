var hustler = (function () {
  'use strict';

  var module = {}; // external scripts are concatenated to this object

  var actions = {};
  var patterns = {};
  var groups = {};

  function on(path, action, pattern) {
    actions[path] = action;
    patterns[path] = pattern;
    registerGroupedAction(path, action);
  }

  function registerGroupedAction(path, action) {
    var groupNames = path.split('.');
    var length = groupNames.length;
    if (length > 1) { // if group exists
      var currentGroup = '';
      for (var i = 0; i < length; i++) {
        currentGroup = currentGroup + groupNames[i];
        if (groups[currentGroup] === undefined) {
          groups[currentGroup] = [];
        }
        groups[currentGroup].push(action);
        currentGroup += '.';
      }
    }
  }

  function emit(path, arg) {
    return function (event) {
      if (event !== undefined) {
        // TODO: enable to use event.stopPropagation() with option
        event.preventDefault(); // TODO: switch enable/disable with option
      }
      var balls = module.parser.parse(path);
      shot(balls, arg);
    };
  }

  function emitImmediately(path, arg) {
    emit(path, arg)();
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

      cargo = execute(balls.name, cargo);
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

  function execute(name, arg) {
    if (name.substr(name.length-2) === '.*') { // ends with '.*'
      var groupName = name.substr(0, name.length-2);
      var groupedActions = groups[groupName];
      var cargo = arg;
      for (var i = 0, length = groupedActions.length; i < length; i++) {
        cargo = groupedActions[i](cargo);
      }
      return cargo;
    } else {
      return actions[name](arg);
    }
  }

  var privates = { // an object for exporting private apis
    module: module,

    actions: {
      get: function (name) {
        return actions[name];
      },
      set: function (name, action) {
        actions[name] = action;
      },
      clear: function () {
        actions = {};
      }
    },

    patterns: {
      get: function (name) {
        return patterns[name];
      },
      set: function (name, pattern) {
        patterns[name] = pattern;
      },
      clear: function () {
        patterns = {};
      }
    },

    groups: {
      get: function (name) {
        return groups[name];
      },
      set: function (name, action) {
        if (groups[name] === undefined) {
          groups[name] = [];
        }
        groups[name].push(action);
      },
      clear: function () {
        groups = {};
      }
    }
  };

  return {
    on: on,
    emit: emit,
    emitImmediately: emitImmediately,
    _: privates
  };

}());