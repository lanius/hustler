describe('parser', function () {

  var parser = hustler._module.parser;

  it('parses a simple path to an action', function () {
    var action = parser.parse('step');
    expect(action.name).toEqual('step');
    expect(action.next).toBeUndefined();
  });

  it('parses a long named path to actions', function () {
  	// todo: impl
  });

  it('parses a complex named path to actions', function () {
  	// todo: impl
  	// atmark, asterisk, tilde, hat, hyphen, underscore, comma, period, etc.
  });

  it('parses a path to straight actions', function () {
    var action = parser.parse('step1 -> step2 -> step3');
    expect(action.name).toEqual('step1');
    expect(action.next.name).toEqual('step2');
    expect(action.next.next.name).toEqual('step3');
  });

  it('parses a path to 2 way branched actions', function () {
    var action = parser.parse('step1 -> { step2a | step2b }');
    expect(action.name).toEqual('step1');
    expect(action.next.length).toEqual(2);
    var names = action.next.map(function (a) {
      return a.name;
    });
    expect(names).toContain('step2a');
    expect(names).toContain('step2b');
  });

  it('parses a path to 3 way branched actions', function () {
    var action = parser.parse('step1 -> { step2a | step2b | step2c }');
    expect(action.name).toEqual('step1');
    expect(action.next.length).toEqual(3);
    var names = action.next.map(function (a) {
      return a.name;
    });
    expect(names).toContain('step2a');
    expect(names).toContain('step2b');
    expect(names).toContain('step2c');
  });

  it('parses a path to branched and straight actions', function () {
    var action = parser.parse('step1 -> \
      { step2a1 -> step2a2 | step2b1 -> step2b2 }');
    expect(action.name).toEqual('step1');
    expect(action.next.length).toEqual(2);
    for (var i = 0, length = action.next.length; i < 0; i++) {
      var second = action.next[i];
      if (second.name === 'step2a1') {
        expect(second.next.name).toEqual('step2a2');
      } else if (second.name === 'step2b1') {
        expect(second.next.name).toEqual('step2b2');
      } else {
        throw new Error('unexpected action: ' + second.name);
      }
    }
  });

  it('parses a path to complex actions', function () {
    // todo: impl
  });

});
