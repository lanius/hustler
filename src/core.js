var hustler = (function () {
  'use strict';

  var module = {}; // external scripts are concatenated to this object

  // Actions
  function Actions() {
    this._content = {};
  }

  (function (p) {
    p.register = function (name, action) {
      if (this._content[name] !== undefined) {
        throw new Error('action is already registered: ' + name);
      }
      this._content[name] = action;
    };
    p.lookup = function (name) {
      var action = this._content[name];
      if (action === undefined) {
        throw new Error('action is not found: ' + name);
      }
      return this._content[name];
    };
    p.clear = function () {
      this._content = {};
    };
  }(Actions.prototype));

  // Patterns
  function Patterns() {
    this._content = {};
  }

  (function (p) {
    p.register = function (name, pattern) {
      if (this._content[name] !== undefined) {
        throw new Error('pattern is already registered: ' + name);
      }
      this._content[name] = pattern;
    };
    p.lookup = function (name) {
      return this._content[name];
    };
    p.clear = function () {
      this._content = {};
    };
  }(Patterns.prototype));

  // Groups
  function Groups() {
    this._content = {};
  }

  (function (p) {
    p.register = function (name, action) {
      if (this._content[name] === undefined) {
        this._content[name] = [];
      }
      this._content[name].push(action);
    };
    p.lookup = function (name) {
      return this._content[name];
    };
    p.clear = function () {
      this._content = {};
    };
  }(Groups.prototype));

  // Namespaces
  var namespaces = {
    _envs : {},
    _stack: [], 
    begin: function (name) {
      this._stack.push(name);
    },
    end: function () {
      this._stack.pop();
    },
    current: function () {
      var stack = this._stack;
      return stack[stack.length - 1]; // last is current namespace name
    },
    env: function (name) {
      var e = this._envs[name];
      if (e === undefined) {
        this._envs[name] = e = {
          actions: new Actions(),
          patterns: new Patterns(),
          groups: new Groups()
        };
      }
      return e;
    },
    currentEnv: function() {
      return this.env(this.current());
    },
    clear: function () {
      this._envs = {};
      this._stack = [];
    }
  };

  // Core APIs
  function namespace(name, func) {
    namespaces.begin(name);
    func();
    namespaces.end();
  }

  function on(path, actionOrPattern, pattern) {
    // consider the following cases
    // - on(path, action(function), pattern(object))
    // - on(path, pattern(object))
    var env = namespaces.currentEnv();
    var actions = env.actions;
    var patterns = env.patterns;
    var groups = env.groups;

    var action;
    if (util.isFunction(actionOrPattern)) {
      action = actionOrPattern;
    } else if (util.isObject(actionOrPattern)) {
      action = function (data) {
        return data;
      };
      pattern = actionOrPattern;
    } else {
      throw new Error('invalid argument: ' + actionOrPattern);
    }

    actions.register(path, action);
    patterns.register(path, pattern);

    if (hasGroup(path)) {
      parseToGroupNames(path).forEach(function (name) {
        groups.register(name, action);
      });
    }
  }

  function emit(path, arg) {
    var env = namespaces.currentEnv();

    return function (callbackArgs) {
      if (callbackArgs !== undefined) {
        handleCallbackArgs(callbackArgs);
      }
      var balls = module.parser.parse(path);
      return shot(balls, arg, env);
    };
  }

  function emitImmediately(path, arg) {
    return emit(path, arg)();
  }

  // Helpers
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

  function handleCallbackArgs(args) {
    if ('preventDefault' in args) {
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

  function shot(balls, arg, env) {
    var patterns = env.patterns;

    var cargo = arg;
    while (balls) {
      if (balls.length) { // selection
        var defaultBall;
        var matched = false;
        for (var i = 0, length = balls.length; i < length; i++) {
          var ball = balls[i];
          var pattern = patterns.lookup(ball.name);
          if (pattern === undefined) {
            // if pattern is not found, it is used as default
            if (defaultBall !== undefined) {
              throw new Error('more than 2 default patterns exist.');
            }
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

      cargo = execute(balls.name, cargo, env);
      //console.log('action: ' + balls.name + ' is called.'); // DEBUG
      balls = balls.next;
    }
    return cargo;
  }

  function match(target, pattern) {
    // so far, supports object only
    // TODO: support string and number
    if (!util.isObject(target)) {
      return false;
    }

    for (var prop in pattern) {
      if (pattern.hasOwnProperty(prop)) {
        if (target[prop] !== pattern[prop]) {
          return false; // unmatched pattern exists
        }
      }
    }
    return true; // all patterns are matched
  }

  function execute(name, arg, env) {
    var actions = env.actions;
    var groups = env.groups;

    if (name.substr(name.length-2) === '.*') { // ends with '.*'
      var groupName = name.substr(0, name.length-2);
      var groupedActions = groups.lookup(groupName);
      var cargo = arg;
      for (var i = 0, length = groupedActions.length; i < length; i++) {
        cargo = groupedActions[i](cargo);
      }
      return cargo;
    } else {
      return actions.lookup(name)(arg);
    }
  }

  var util = {
    toString: function(obj) {
      return Object.prototype.toString.call(obj);
    },
    isObject: function (obj) {
      return (this.toString(obj) === '[object Object]');
    },
    isFunction: function (obj) {
      return (this.toString(obj) === '[object Function]');
    }
  };

  var privates = { // an object for exporting private apis
    module: module,
    namespaces: namespaces,
    util: util
  };

  return {
    namespace: namespace,
    on: on,
    emit: emit,
    emitImmediately: emitImmediately,
    _: privates
  };

}());