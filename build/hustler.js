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

  function on(path, actionOrPattern, pattern) {
    var action;
    if (helper.isFunction(actionOrPattern)) {
      action = actionOrPattern;
    } else if (helper.isObject(actionOrPattern)) {
      action = function (data) {
        return data;
      };
      pattern = actionOrPattern;
    } else {
      throw new Error('invalid argument: ' + actionOrPattern);
    }

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

  var helper = {
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
    actions: actions,
    patterns: patterns,
    groups: groups,
    helper: helper
  };

  return {
    on: on,
    emit: emit,
    emitImmediately: emitImmediately,
    _: privates
  };

}());
hustler._.module.parser = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "actions": parse_actions,
        "selection": parse_selection,
        "branch": parse_branch,
        "others": parse_others,
        "sequence": parse_sequence,
        "action": parse_action,
        "name": parse_name,
        "chars": parse_chars,
        "char": parse_char,
        "_": parse__,
        "whitespace": parse_whitespace
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "actions";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_actions() {
        var result0;
        
        result0 = parse_sequence();
        if (result0 === null) {
          result0 = parse_selection();
          if (result0 === null) {
            result0 = parse_action();
          }
        }
        return result0;
      }
      
      function parse_selection() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 123) {
            result1 = "{";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"{\"");
            }
          }
          if (result1 !== null) {
            result2 = parse__();
            if (result2 !== null) {
              result3 = parse_branch();
              if (result3 !== null) {
                result4 = parse__();
                if (result4 !== null) {
                  if (input.charCodeAt(pos) === 125) {
                    result5 = "}";
                    pos++;
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"}\"");
                    }
                  }
                  if (result5 !== null) {
                    result6 = parse__();
                    if (result6 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5, result6];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, branch) { return branch; })(pos0, result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_branch() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_actions();
        if (result0 !== null) {
          result2 = parse_others();
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_others();
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, first, others) { return [first].concat(others); })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_actions();
        }
        return result0;
      }
      
      function parse_others() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 124) {
          result0 = "|";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"|\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_actions();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, actions) { return actions; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_sequence() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_action();
        if (result0 !== null) {
          if (input.substr(pos, 2) === "->") {
            result1 = "->";
            pos += 2;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"->\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_actions();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, action, actions) { action.next = actions; return action; })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          result0 = parse_action();
          if (result0 !== null) {
            result0 = (function(offset, action) { return action; })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_action() {
        var result0;
        var pos0;
        
        pos0 = pos;
        result0 = parse_name();
        if (result0 !== null) {
          result0 = (function(offset, name) { return { name: name }; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_name() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          result1 = parse_chars();
          if (result1 !== null) {
            result2 = parse__();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return chars.trim(); })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_chars() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_char();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_char();
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return chars.join(""); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_char() {
        var result0;
        
        if (/^[^\->{}|]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[^\\->{}|]");
          }
        }
        return result0;
      }
      
      function parse__() {
        var result0, result1;
        
        reportFailures++;
        result0 = [];
        result1 = parse_whitespace();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_whitespace();
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("whitespace");
        }
        return result0;
      }
      
      function parse_whitespace() {
        var result0;
        
        if (/^[\t\n\r ]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\t\\n\\r ]");
          }
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
