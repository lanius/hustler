describe('core', function () {

  var on = hustler.on;
  var emit = hustler.emit;
  var emitImmediately = hustler.emitImmediately;

  var actions = hustler._.actions;
  var patterns = hustler._.patterns;
  var groups = hustler._.groups;

  afterEach(function () {
    actions.clear();
    patterns.clear();
    groups.clear();
  });

  describe('on', function () {

    it('register an action', function () {
      var action = function () {};
      on('step', action);
      expect(actions.get('step')).toBe(action);
    });

    it('register a pattern', function () {
      var pattern = {};
      on('step', function () {}, pattern);
      expect(patterns.get('step')).toBe(pattern);
    });

    it('register grouped actions', function () {
      var stepA = function () {};
      on('step.A', stepA);
      expect(actions.get('step.A')).toBe(stepA);

      var stepB = function () {};
      on('step.B', stepB);
      expect(actions.get('step.B')).toBe(stepB);

      var registered = groups.get('step');
      expect(registered.length).toEqual(2);
      expect(registered).toContain(stepA);
      expect(registered).toContain(stepB);
    });

  });

  describe('emit', function () {

    it('emits a specified action', function () {
      var isCalled = false;
      actions.set('step', function () {
        isCalled = true;
      });

      emit('step')();
      expect(isCalled).toBe(true);
    });

    it('emits a specified action in select-block', function () {
      var isCalled = false;
      actions.set('step', function () {
        isCalled = true;
      });

      emit('{ step }')();
      expect(isCalled).toBe(true);
    });

    it('emits sequential actions', function () {
      var result = 0;
      actions.set('stepA', function () {
        return { count: 1 };
      });
      actions.set('stepB', function (data) {
        if (data.count === 1) {
          data.count++;
        }
        return data;
      });
      actions.set('stepC', function (data) {
        if (data.count === 2) {
          data.count++;
        }
        result = data.count;
      });

      emit('stepA -> stepB -> stepC')();
      expect(result).toEqual(3);
    });

    it('emits sequential actions  in select-block', function () {
      var result = 0;
      actions.set('stepA', function () {
        return { count: 1 };
      });
      actions.set('stepB', function (data) {
        if (data.count === 1) {
          data.count++;
        }
        return data;
      });
      actions.set('stepC', function (data) {
        if (data.count === 2) {
          data.count++;
        }
        result = data.count;
      });

      emit('{ stepA -> stepB -> stepC }')();
      expect(result).toEqual(3);
    });

    it('emits an action on a specified pattern', function () {
      actions.set('entry', function () {
        return { target: true };
      });

      var isCalled = false;
      actions.set('target', function () {
        isCalled = true;
      });
      patterns.set('target', { target: true });

      actions.set('dummy', function () {});
      patterns.set('dummy', { target: false });

      emit('entry -> { dummy | target }')();
      expect(isCalled).toBe(true);
    });

    it('emit a wildcard action', function () {
      var stepAIsCalled = false;
      groups.set('step', function () {
        stepAIsCalled = true;
      });

      var stepBIsCalled = false;
      groups.set('step', function () {
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
      actions.set('step', action);

      emitImmediately('step');
      expect(isCalled).toBe(true);
    });

  });

  describe('exception', function () {

    it('throws exception when an action is not found', function () {
      var getAction = function (arg) {
        // I want to use Fundction.bind, but PhantomJS does not have it.
        return function () {
          actions.get(arg);
        };
      };
      actions.set('stepA', function () {});
      expect(getAction('stepA')).not.toThrow();

      expect(getAction('stepB')).toThrow();
    });

  });

});
