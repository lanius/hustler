describe('core', function () {

  var on = hustler.on;
  var emit = hustler.emit;
  var actions = hustler._actions;
  var patterns = hustler._patterns;

  describe('on', function () {

    it('register an action', function () {
      var action = function () {};
      on('step', action);
      expect(actions['step']).toBe(action);
    });

    it('register a pattern', function () {
      var pattern = {};
      on('step', function () {}, pattern);
      expect(patterns['step']).toBe(pattern);
    });

  });

  describe('emit', function () {
    // todo: impl
  });

});
