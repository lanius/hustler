What is this?
=============
hustler is a control flow library which works in browser.


Getting started
===============
Load hustler (and jquery for convenience)::

  <script src="jquery.min.js"></script>
  <script src="hustler.min.js"></script>

Register actions::

  hustler.on('collect', function () {
    var arg1 = Number($('#arg1').val()), arg2 = Number($('#arg2').val());
    return { arg1: arg1, arg2: arg2 };
  });

  hustler.on('add', function (data) {
    return { result: (data.arg1 + data.arg2) };
  });

  hustler.on('output', function (data) {
    $('#result').val(data.result);
  });

And then, emit an event::

  $('#calc').on('click', hustler.emit('collect -> add -> output'));

To execute conditional sequence, register actions with a pattern::

  hustler.on('collect', function () {
    return { value: $('#code').val() };
  });

  hustler.on('validate', function (data) {
    var code = data.value;
    var checkdigit = code % 10;
    // validate code
    // ...
    return { valid: (checkdigit === result) };
  });

  hustler.on('valid', function (data) {
    $('#info').text('code is valid.');
  }, { valid: true });

  hustler.on('invalid', function (data) {
    $('#info').text('code is invalid.');
  }, { valid: false });

And emit a event with conditinal expression::

  $('#check').on('click', hustler.emit('collect -> validate -> { valid | invalid }'));

See examples for more details.


License
=======
hustler is licensed under the MIT Licence. See LICENSE for more details.