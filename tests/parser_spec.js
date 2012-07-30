describe('parser', function () {

  var parser = hustler._.module.parser;

  var helper = {
    expectParsedActionNameToEqualPath : function (path) {
      var action = parser.parse(path);
      expect(action.name).toEqual(path);
    }
  };

  it('parses a simple path to an action', function () {
    helper.expectParsedActionNameToEqualPath('step');
  });

  it('parses a long named path to actions', function () {
    helper.expectParsedActionNameToEqualPath('This is a long named step');
  });

  describe('complex named path', function () {

    it('parses a path that contains atmark to actions', function () {
      helper.expectParsedActionNameToEqualPath('@action@name@');
    });

    it('parses a path that contains tilde to actions', function () {
      helper.expectParsedActionNameToEqualPath('~action~name~');
    });

    it('parses a path that contains hat to actions', function () {
      helper.expectParsedActionNameToEqualPath('^action^name^');
    });

    it('parses a path that contains comma to actions', function () {
      helper.expectParsedActionNameToEqualPath(',action,name,');
    });

    it('parses a path that contains period to actions', function () {
      helper.expectParsedActionNameToEqualPath('.action.name.');
    });

    it('parses a path that contains underscore to actions', function () {
      helper.expectParsedActionNameToEqualPath('_action_name_');
    });

    // todo: test hyphen

    it('parses a path that contains equal to actions', function () {
      helper.expectParsedActionNameToEqualPath('=action=name=');
    });

    it('parses a path that contains slash to actions', function () {
      helper.expectParsedActionNameToEqualPath('/action/name/');
    });

    it('parses a path that contains question to actions', function () {
      helper.expectParsedActionNameToEqualPath('?action?name?');
    });

    it('parses a path that contains exclamation to actions', function () {
      helper.expectParsedActionNameToEqualPath('!action!name!');
    });

    it('parses a path that contains asterisk to actions', function () {
      helper.expectParsedActionNameToEqualPath('*action*name*');
    });

    it('parses a path that contains dollar to actions', function () {
      helper.expectParsedActionNameToEqualPath('$action$name$');
    });

    it('parses a path that contains percent to actions', function () {
      helper.expectParsedActionNameToEqualPath('%action%name%');
    });

    it('parses a path that contains ampersand to actions', function () {
      helper.expectParsedActionNameToEqualPath('&action&name&');
    });

    it('parses a path that contains hash to actions', function () {
      helper.expectParsedActionNameToEqualPath('#action#name#');
    });

    it('parses a path that contains square brackets to actions', function () {
      helper.expectParsedActionNameToEqualPath('[action][name]');
    });

    it('parses a path that contains round bracket to actions', function () {
      helper.expectParsedActionNameToEqualPath('(action)(name)');
    });

    it('parses a path that contains new lines to actions', function () {
      helper.expectParsedActionNameToEqualPath('this is \
        action name \
        that contain \
        new lines'
      );
    });

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
    var path = 'step1 -> { step2a1 -> step2a2 | step2b1 -> step2b2 }';
    var action = parser.parse(path);
    expect(action.name).toEqual('step1');
    expect(action.next.length).toEqual(2);
    for (var i = 0, length = action.next.length; i < 0; i++) {
      var second = action.next[i];
      if (second.name === 'step2a1') {
        expect(second.next.name).toEqual('step2a2');
      } else if (second.name === 'step2b1') {
        expect(second.next.name).toEqual('step2b2');
      } else {
        throw new Error('unexpected action name: ' + second.name);
      }
    }
  });

  it('parses a path to complex actions', function () {
    var path = 'Step1 -> \
      { Step2-A -> Step2-2 | Step2-B -> { Step3-A | Step3-B -> Step4 } }';
    // todo: impl
  });

});
