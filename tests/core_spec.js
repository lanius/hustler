describe('core', function () {

  var namespace = hustler.namespaces;
  var on = hustler.on;
  var emit = hustler.emit;
  var emitImmediately = hustler.emitImmediately;

  var namespaces = hustler._.namespaces;
  var util = hustler._.util;

  var actions;
  var patterns;
  var groups;

  beforeEach(function () {
    var env = namespaces.currentEnv();
    actions = env.actions;
    patterns = env.patterns;
    groups = env.groups;
  });

  afterEach(function () {
    namespaces.clear();
  });

  describe('on', function () {

    it('registers an action', function () {
      var action = function () {};
      on('step', action);
      expect(actions.lookup('step')).toBe(action);
    });

    it('registers a pattern', function () {
      var pattern = {};
      on('step', pattern);
      expect(patterns.lookup('step')).toBe(pattern);
    });

    it('registers an action with a pattern', function () {
      var pattern = {};
      on('step', function () {}, pattern);
      expect(patterns.lookup('step')).toBe(pattern);
    });

    it('register grouped actions', function () {
      var stepA = function () {};
      on('step.A', stepA);
      expect(actions.lookup('step.A')).toBe(stepA);

      var stepB = function () {};
      on('step.B', stepB);
      expect(actions.lookup('step.B')).toBe(stepB);

      var registered = groups.lookup('step');
      expect(registered.length).toEqual(2);
      expect(registered).toContain(stepA);
      expect(registered).toContain(stepB);
    });

  });

  describe('emit', function () {

    it('emits a specified action', function () {
      var isCalled = false;
      actions.register('step', function () {
        isCalled = true;
      });

      emit('step')();
      expect(isCalled).toBe(true);
    });

    it('emits a specified action in select-block', function () {
      var isCalled = false;
      actions.register('step', function () {
        isCalled = true;
      });

      emit('{ step }')();
      expect(isCalled).toBe(true);
    });

    it('emits sequential actions', function () {
      var result = 0;
      actions.register('stepA', function () {
        return { count: 1 };
      });
      actions.register('stepB', function (data) {
        if (data.count === 1) {
          data.count++;
        }
        return data;
      });
      actions.register('stepC', function (data) {
        if (data.count === 2) {
          data.count++;
        }
        result = data.count;
      });

      emit('stepA -> stepB -> stepC')();
      expect(result).toEqual(3);
    });

    it('emits sequential actions in select-block', function () {
      var result = 0;
      actions.register('stepA', function () {
        return { count: 1 };
      });
      actions.register('stepB', function (data) {
        if (data.count === 1) {
          data.count++;
        }
        return data;
      });
      actions.register('stepC', function (data) {
        if (data.count === 2) {
          data.count++;
        }
        result = data.count;
      });

      emit('{ stepA -> stepB -> stepC }')();
      expect(result).toEqual(3);
    });

    it('emits with a specified pattern', function () {
      actions.register('entry', function () {
        return { target: true };
      });

      var targetIsCalled = false;
      actions.register('target', function () {
        targetIsCalled = true;
      });
      patterns.register('target', { target: true });

      var dummyIsCalled = false;
      actions.register('dummy', function () {
        dummyIsCalled = true;
      });
      patterns.register('dummy', { target: false });

      emit('entry -> { dummy | target }')();
      expect(targetIsCalled).toBe(true);
      expect(dummyIsCalled).toBe(false);
    });

    it('emits immediately branched actions', function () {
      var targetIsCalled = false;
      actions.register('target', function () {
        targetIsCalled = true;
      });
      patterns.register('target', { target: true });

      var dummyIsCalled = false;
      actions.register('dummy', function () {
        dummyIsCalled = true;
      });
      patterns.register('dummy', { target: false });

      emit('{ dummy | target }', { target: true })();
      expect(targetIsCalled).toBe(true);
      expect(dummyIsCalled).toBe(false);
    });

    it('emits a wildcard action', function () {
      var stepAIsCalled = false;
      groups.register('step', function () {
        stepAIsCalled = true;
      });

      var stepBIsCalled = false;
      groups.register('step', function () {
        stepBIsCalled = true;
      });

      emit('step.*')();
      expect(stepAIsCalled).toBe(true);
      expect(stepBIsCalled).toBe(true);
    });

  });

  describe('emitImmediately', function () {

    it('emits a specified action immediately', function () {
      var isCalled = false;
      var action = function () {
        isCalled = true;
      };
      actions.register('step', action);

      emitImmediately('step');
      expect(isCalled).toBe(true);
    });

  });

  describe('exception', function () {

    it('is thrown when an action is not found', function () {
      var getAction = function (arg) {
        // I want to use Fundction.bind, but PhantomJS does not have it.
        return function () {
          actions.lookup(arg);
        };
      };
      actions.register('stepA', function () {});
      expect(getAction('stepA')).not.toThrow();
      expect(getAction('stepB')).toThrow();
    });

    it('is thrown when an action is already registered', function () {
      var setAction = function (arg) {
        return function () {
          actions.register(arg, function () {});
        };
      };
      expect(setAction('stepA')).not.toThrow();
      expect(setAction('stepA')).toThrow();
      expect(setAction('stepB')).not.toThrow();
    });

    it('is thrown when a pattern is already registered', function () {
      var setPattern = function (arg) {
        return function () {
          patterns.register(arg, {});
        };
      };
      expect(setPattern('patternA')).not.toThrow();
      expect(setPattern('patternA')).toThrow();
      expect(setPattern('patternB')).not.toThrow();
    });

    it('is thrown when invalid argument registered', function () {
      var count = 0; // number for generating different action names
      var register = function (arg) {
        return function () {
          on('path' + (count++), arg);
        };
      };
      expect(register(function () {})).not.toThrow();
      expect(register({})).not.toThrow();
      expect(register('string')).toThrow();
      expect(register(123)).toThrow();
    });

    it('is thrown when more than 2 default patterns exist', function () {
      actions.register('actionA', function () {});
      actions.register('actionB', function () {});
      patterns.register('actionB', { patternExists: true });
      expect(function () {
        emit('{ actionA | actionB }')();
      }).not.toThrow();

      actions.register('actionC', function () {});
      actions.register('actionD', function () {});
      expect(function () {
        emit('{ actionC | actionD }')();
      }).toThrow();
    });

  });

  describe('util', function () {

    it('tests whether object type is function or not', function () {
      expect(util.isFunction(function () {})).toBe(true);
      expect(util.isFunction({})).toBe(false);
      expect(util.isFunction('string')).toBe(false);
      expect(util.isFunction(123)).toBe(false);
    });

    it('tests whether object type is object or not', function () {
      expect(util.isObject({})).toBe(true);
      expect(util.isObject(function () {})).toBe(false);
      expect(util.isObject('string')).toBe(false);
      expect(util.isObject(123)).toBe(false);
    });

  });

});
