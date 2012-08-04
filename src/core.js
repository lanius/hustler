var hustler = (function () {
  'use strict';

  var module = {}; // external scripts are concatenated to this object

  var actions = {
    _content : {},
    get: function (name) {
      var action = this._content[name];
      if (action === undefined) {
        throw new Error('action not found: ' + name);
      }
      return this._content[name];
    },
    set: function (name, action) {
      this._content[name] = action;
    },
    clear: function () {
      this._content = {};
    }
  };

  var patterns = {
    _content : {},
    get: function (name) {
      return this._content[name];
    },
    set: function (name, pattern) {
      this._content[name] = pattern;
    },
    clear: function () {
      this._content = {};
    }
  };

  var groups = {
    _content : {},
    get: function (name) {
      return this._content[name];
    },
    set: function (name, action) {
      if (this._content[name] === undefined) {
        this._content[name] = [];
      }
      this._content[name].push(action);
    },
    clear: function () {
      this._content = {};
    }
  };

  function on(path, action, pattern) {
    actions.set(path, action);
    patterns.set(path, pattern);
    if (hasGroup(path)) {
      parseToGroupNames(path).forEach(function (name) {
        groups.set(name, action);
      });
    }
  }

  function hasGroup(path) {
    return (path.split('.').length > 1);
  }

  function parseToGroupNames(path) {
    // 'x.y.z -> set x and x.y'
    var groupNames = [];
    var names = path.split('.');
    for (var i = 1, length = names.length; i < length; i++) {
      groupNames.push(names.slice(0, i).join('.'));
    }
    return groupNames;
  }

  function emit(path, arg) {
    return function (callbackArgs) {
      if (callbackArgs !== undefined) {
        handleCallbackArgs(callbackArgs);
      }
      var balls = module.parser.parse(path);
      shot(balls, arg);
    };
  }

  function handleCallbackArgs(args) {
    if (args.hasOwnProperty('preventDefault')) {
    // situation:
    // - addEventListener('click', emit(path))
    // - on('click', emit(path))
      args.preventDefault(); // TODO: switch enable/disable with option
    }

    // TODO: args.stopPropagation() with enable/disable option

    // TODO: consider xhr or $.ajax
    // situation:
    // - $.ajax(...).then(emit(path))
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
          var pattern = patterns.get(ball.name);
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
      var groupedActions = groups.get(groupName);
      var cargo = arg;
      for (var i = 0, length = groupedActions.length; i < length; i++) {
        cargo = groupedActions[i](cargo);
      }
      return cargo;
    } else {
      return actions.get(name)(arg);
    }
  }

  var privates = { // an object for exporting private apis
    module: module,
    actions: actions,
    patterns: patterns,
    groups: groups
  };

  return {
    on: on,
    emit: emit,
    emitImmediately: emitImmediately,
    _: privates
  };

}());