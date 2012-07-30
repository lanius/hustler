describe('core', function () {

  var on = hustler.on;
  var emit = hustler.emit;
  var emitImmediately = hustler.emitImmediately;

  var actions = hustler._.actions;
  var patterns = hustler._.patterns;

  afterEach(function () {
    actions.clear();
    patterns.clear();
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

  });

  describe('emit', function () {

    it('emits a specified action', function () {
      var isCalled = false;
      var action = function () {
        isCalled = true;
      };
      actions.set('step', action);

      emit('step')();
      expect(isCalled).toBe(true);
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

});
